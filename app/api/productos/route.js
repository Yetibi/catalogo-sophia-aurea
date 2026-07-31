import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import XLSX from 'xlsx';

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

// Fetch Excel file from SharePoint and parse products
async function getProductosFromExcel() {
  try {
    const client = await getGraphClient();

    // App-only auth can't use /me — resolve the SharePoint site and drive explicitly
    const tenantHostname = process.env.AZURE_TENANT_ID.replace('.onmicrosoft.com', '.sharepoint.com');
    const site = await client
      .api(`/sites/${tenantHostname}:/sites/${process.env.SHAREPOINT_SITE_ID}`)
      .get();

    const drivesRes = await client.api(`/sites/${site.id}/drives`).get();
    const targetDriveName = decodeURIComponent(process.env.SHAREPOINT_DRIVE_ID);
    const drive =
      drivesRes.value.find((d) => d.name === targetDriveName) || drivesRes.value[0];

    if (!drive) {
      throw new Error(
        `Drive "${targetDriveName}" not found. Available drives: ${drivesRes.value.map((d) => d.name).join(', ')}`
      );
    }

    // Get files from the drive root to find the Excel file
    const response = await client.api(`/drives/${drive.id}/root/children`).get();

    const excelFile = response.value.find(
      (file) => file.name === process.env.EXCEL_FILE_NAME
    );

    if (!excelFile) {
      throw new Error(`Excel file "${process.env.EXCEL_FILE_NAME}" not found in SharePoint drive`);
    }

    // Get the file content as buffer
    const fileContent = await client.api(`/drives/${drive.id}/items/${excelFile.id}/content`).get();

    // Parse Excel
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheet = workbook.Sheets['TablaProductos'];

    if (!sheet) {
      throw new Error('Sheet "TablaProductos" not found in Excel file');
    }

    const data = XLSX.utils.sheet_to_json(sheet);

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
        url_foto: row.url_foto || '',
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
