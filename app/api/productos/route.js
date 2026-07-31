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

    // Look up real photo download URLs from the OneDrive photos folder
    const photosFolder = process.env.PHOTOS_FOLDER;
    let photosByName = {};
    try {
      const photosResponse = await client
        .api(`/users/${userEmail}/drive/root:${photosFolder}:/children`)
        .get();
      photosByName = Object.fromEntries(
        photosResponse.value.map((file) => [file.name, file['@microsoft.graph.downloadUrl']])
      );
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
        tamano: row.tamano || '',
        dimensiones: row.dimensiones || '',
        peso_gramos: row.peso_gramos || '',
        frase_ancla: row.frase_ancla || '',
        simboliza: row.simboliza || '',
        mensaje: row.mensaje || '',
        ruta_foto: row.ruta_foto || '',
        url_foto: photosByName[row.url_foto] || '',
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
