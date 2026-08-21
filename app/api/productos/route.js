import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import * as XLSX from 'xlsx';

// Without this, Next prerenders this GET route at build time and Vercel serves
// the frozen response — Excel edits would never show up until the next deploy.
export const dynamic = 'force-dynamic';

// Get access token from Azure AD
async function getAccessToken() {
  const credential = new ClientSecretCredential(
    process.env.AZURE_TENANT_ID,
    process.env.AZURE_CLIENT_ID,
    process.env.AZURE_CLIENT_SECRET
  );

  const token = await credential.getToken('https://graph.microsoft.com/.default');
  return token.token;
}

// Initialize Graph client
async function getGraphClient() {
  const accessToken = await getAccessToken();

  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  return client;
}

// Excel cells and OneDrive filenames rarely agree exactly: users type the name
// with/without extension (.jpg vs .jpeg), stray double spaces, or different
// casing/accent encodings. Match on a normalized key instead of the raw name.
function photoKey(name) {
  return String(name || '')
    .normalize('NFC')
    .replace(/\.(jpe?g|png|webp|heic)$/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Graph's fetch-based client returns binary content as a ReadableStream, not a Buffer
async function streamToBuffer(stream) {
  const reader = stream.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

// Fetch Excel file from OneDrive and parse products
async function getProductosFromExcel() {
  try {
    const client = await getGraphClient();

    // App-only auth can't use /me — access the user's OneDrive explicitly by UPN
    const userEmail = process.env.ONEDRIVE_USER_EMAIL;

    // Navigate to the specific folder in OneDrive. The whole tree was
    // reorganized under /SOI in Aug 2026; EXCEL_FOLDER_PATH overrides
    // without a code change if it moves again.
    const folderPath =
      process.env.EXCEL_FOLDER_PATH ||
      '/SOI/06-Financiero/movimientos financieros/datos/archivos gestión';
    const folderResponse = await client
      .api(`/users/${userEmail}/drive/root:${folderPath}:/children`)
      .get();

    const excelFile = folderResponse.value.find(
      (file) => file.name === process.env.EXCEL_FILE_NAME
    );

    if (!excelFile) {
      throw new Error(`Excel file "${process.env.EXCEL_FILE_NAME}" not found at ${folderPath}`);
    }

    // Get the file content and convert to a buffer xlsx can read
    const stream = await client
      .api(`/users/${userEmail}/drive/items/${excelFile.id}/content`)
      .get();
    const fileContent = await streamToBuffer(stream);

    // Parse Excel - read from the "TablaProductos" sheet
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheet = workbook.Sheets['TablaProductos'];

    if (!sheet) {
      throw new Error('Sheet "TablaProductos" not found in Excel file');
    }

    const data = XLSX.utils.sheet_to_json(sheet);

    // Look up photo item IDs from the OneDrive photos folders. We don't hand
    // out Microsoft's temporary download/thumbnail URLs to the browser —
    // those embed a tempauth token that expires in ~1 day and then 503s.
    // Instead we return our own stable proxy URL (/api/imagen/{itemId}),
    // which fetches a fresh Graph token server-side on every request.
    // PHOTOS_FOLDER accepts one or more folders separated by commas.
    const photoFolders = (process.env.PHOTOS_FOLDER || '')
      .split(',')
      .map((folder) => `/${folder.trim().replace(/^\/+/, '')}`)
      .filter((folder) => folder !== '/');

    const photoIdsByKey = {};
    for (const folder of photoFolders) {
      // If a configured folder no longer exists, retry under /SOI — the
      // OneDrive tree moved there and env values may lag behind.
      const candidates = folder.startsWith('/SOI/') ? [folder] : [folder, `/SOI${folder}`];
      let found = false;
      for (const candidate of candidates) {
        try {
          const photosResponse = await client
            .api(`/users/${userEmail}/drive/root:${candidate}:/children`)
            .top(500)
            .get();

          for (const file of photosResponse.value) {
            photoIdsByKey[photoKey(file.name)] = file.id;
          }
          found = true;
          break;
        } catch (error) {
          // try the next candidate path
        }
      }
      if (!found) {
        console.error(`Photos folder not found (tried ${candidates.join(', ')})`);
      }
    }

    // Map Excel rows to producto objects
    const productos = data
      .filter((row) => row.id_producto && row.cargar_catalogo === 'SI') // Only published
      .map((row) => ({
        id_producto: row.id_producto,
        // La columna del Excel se renombró de "nombre" a "producto" (ago 2026)
        nombre: row.producto || row.nombre || '',
        descripcion: row.descripcion || '',
        coleccion: row.coleccion || '',
        figura: row.figura || '',
        tipo_pieza: row.tipo_pieza || '',
        piedra: row.piedra || '',
        color_piedra: row.color_piedra || '',
        kilates_piedra: row.kilates_piedra || '',
        tamano_piedra_mm: row.tamano_piedra_mm || '',
        forma_piedra: row.forma_piedra || '',
        peso_gramos_oro: row.peso_gramos_oro || '',
        material: row.material || '',
        precio: row.precio_venta_cop || '',
        tamano: row.tamano || '',
        dimensiones: row.dimensiones || '',
        peso_gramos: row.peso_gramos || '',
        frase_ancla: row.frase_ancla || '',
        simboliza: row.simboliza || '',
        mensaje: row.mensaje || '',
        ruta_foto: row.ruta_foto || '',
        url_foto: photoIdsByKey[photoKey(row.url_foto)]
          ? `/api/imagen/${photoIdsByKey[photoKey(row.url_foto)]}`
          : '',
      }));

    return productos;
  } catch (error) {
    console.error('Error fetching productos:', error.message);
    throw error;
  }
}

// GET endpoint
export async function GET(request) {
  try {
    const productos = await getProductosFromExcel();

    return Response.json({
      success: true,
      count: productos.length,
      data: productos,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);

    return Response.json(
      {
        success: false,
        error: error.message || 'Error fetching products',
      },
      { status: 500 }
    );
  }
}
