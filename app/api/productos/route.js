import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import * as XLSX from 'xlsx';

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

    // Navigate to the specific folder in OneDrive
    const folderPath = "/06-Financiero/movimientos financieros/datos/archivos gestión";
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

    // Look up real photo URLs from the OneDrive photos folder.
    // Use Microsoft's pre-generated thumbnail for the grid (KBs) instead of the
    // full-resolution camera file (several MB) — avoids the server having to
    // download and re-process a huge image just to show a small card preview.
    const photosFolder = `/${(process.env.PHOTOS_FOLDER || '').replace(/^\/+/, '')}`;
    let photosByName = {};
    try {
      const photosResponse = await client
        .api(`/users/${userEmail}/drive/root:${photosFolder}:/children`)
        .get();

      const withThumbnails = await Promise.all(
        photosResponse.value.map(async (file) => {
          try {
            const thumbs = await client
              .api(`/users/${userEmail}/drive/items/${file.id}/thumbnails`)
              .get();
            const large = thumbs.value?.[0]?.large?.url;
            return [file.name, { full: file['@microsoft.graph.downloadUrl'], thumb: large || file['@microsoft.graph.downloadUrl'] }];
          } catch (error) {
            return [file.name, { full: file['@microsoft.graph.downloadUrl'], thumb: file['@microsoft.graph.downloadUrl'] }];
          }
        })
      );

      photosByName = Object.fromEntries(withThumbnails);
    } catch (error) {
      console.error('Error fetching photos folder:', error.message);
    }

    // Map Excel rows to producto objects
    const productos = data
      .filter((row) => row.id_producto && row.cargar_catalogo === 'SI') // Only published
      .map((row) => ({
        id_producto: row.id_producto,
        nombre: row.nombre || '',
        coleccion: row.coleccion || '',
        figura: row.figura || '',
        tipo_pieza: row.tipo_pieza || '',
        piedra: row.piedra || '',
        color_piedra: row.color_piedra || '',
        material: row.material || '',
        precio: row.Precio || '',
        tamano: row.tamano || '',
        dimensiones: row.dimensiones || '',
        peso_gramos: row.peso_gramos || '',
        frase_ancla: row.frase_ancla || '',
        simboliza: row.simboliza || '',
        mensaje: row.mensaje || '',
        ruta_foto: row.ruta_foto || '',
        url_foto: photosByName[`${row.url_foto}.jpg`]?.full || '',
        url_foto_thumb: photosByName[`${row.url_foto}.jpg`]?.thumb || '',
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
