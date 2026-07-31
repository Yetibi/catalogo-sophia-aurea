# Catálogo Sophia Auréa

Catálogo en línea de joyería con alma, construido con Next.js y alimentado por Excel en OneDrive + fotos en SharePoint.

## Características

- 📱 **Responsive mobile-first** — diseño optimizado para Instagram y navegadores
- 🔐 **Autenticación segura** — Microsoft Graph API con Azure AD
- 📊 **Datos dinámicos** — lee Excel en OneDrive automáticamente
- 🖼️ **Fotos en SharePoint** — gestión centralizada de imágenes
- 🎨 **Marca Sophia Auréa** — paleta, tipografía y tono integrados
- 🔍 **Filtros** — por tipo de pieza, piedra, colección
- 💬 **WhatsApp CTA** — botón flotante para consultas

## Stack

- **Frontend:** Next.js 14, React 18, CSS Modules
- **API:** Microsoft Graph API, Azure AD
- **Hosting:** Vercel
- **Data:** OneDrive (Excel), SharePoint (fotos)

## Setup Local

### 1. Clonar repositorio
```bash
git clone https://github.com/tu-usuario/catalogo-sophia-aurea.git
cd catalogo-sophia-aurea
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Variables de entorno
Copia `.env.example` a `.env.local` y rellena con tus credenciales:

```bash
cp .env.example .env.local
```

Edita `.env.local`:
- `AZURE_CLIENT_ID` — de Azure AD
- `AZURE_CLIENT_SECRET` — de Azure AD
- `AZURE_TENANT_ID` — tu tenant (sophiaaurea.onmicrosoft.com)
- Los demás valores ya están configurados

### 4. Desarrollo local
```bash
npm run dev
```

Abre [http://localhost:3000/catalogo](http://localhost:3000/catalogo)

## Deploy en Vercel

### 1. Push a GitHub
```bash
git add .
git commit -m "Initial commit: Sophia Aurea catalog"
git push origin main
```

### 2. Conectar Vercel
- Ve a [vercel.com](https://vercel.com)
- Haz clic en "Add New Project"
- Selecciona tu repositorio `catalogo-sophia-aurea`
- En "Environment Variables", agrega los valores de `.env.local`
- Haz clic en "Deploy"

### 3. Configurar dominio
En Vercel → Project Settings → Domains:
- Agrega `sophiaaurea.co`
- Apunta el DNS desde Hostinger (Vercel te dará las instrucciones)
- Luego configura el redirect: `sophiaaurea.co` → `sophiaaurea.co/catalogo`

## Estructura del Proyecto

```
catalogo-sophia-aurea/
├── app/
│   ├── api/
│   │   └── productos/
│   │       └── route.js          # API que lee Excel + fotos
│   ├── page.js                   # Home (redirect a /catalogo)
│   ├── layout.js                 # Layout global
│   └── globals.css               # Estilos globales
├── components/
│   ├── Catalogo.js               # Componente principal
│   ├── Catalogo.module.css       # Estilos del catálogo
│   ├── PieceCard.js              # Tarjeta de pieza
│   ├── PieceCard.module.css      # Estilos de tarjeta
│   ├── PieceDetail.js            # Modal de detalle
│   └── PieceDetail.module.css    # Estilos del modal
├── .env.example                  # Variables de ejemplo
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## Cómo funciona

### 1. **Lectura de datos**
- `/api/productos` lee `TablaProductos_Sophia_Aurea.xlsx` desde OneDrive
- Filtra solo piezas donde `cargar_catalogo = SI`
- Devuelve JSON con nombre, descripción, atributos, foto

### 2. **Autenticación**
- Azure AD (Client ID + Secret) genera token OAuth
- Microsoft Graph API autentica y lee archivos
- Vercel almacena credenciales como secrets (nunca en el código)

### 3. **Renderizado**
- React renderiza el grid de piezas
- Filtros dinámicos por pieza, piedra, colección
- Modal de detalle con atributos y WhatsApp CTA

### 4. **Fotos**
- Las URLs públicas vienen del Excel (`url_foto`)
- SharePoint genera links automáticamente al compartir
- Next.js renderiza `<img>` con URLs públicas

## Troubleshooting

**Error: "Excel file not found"**
- Verifica que `TablaProductos_Sophia_Aurea.xlsx` esté en OneDrive de hola@sophiaaurea.co
- Revisa que el nombre del archivo sea exacto (mayúsculas/minúsculas)

**Error: "Unauthorized"**
- Verifica que Azure AD credentials estén correctas
- Confirma que los permisos de Graph API están otorgados en Azure

**Fotos no cargan**
- Verifica que `url_foto` en el Excel sea un link público válido
- Abre el link en navegador para confirmar que es accesible

## Variables de entorno (Vercel)

En Vercel → Project Settings → Environment Variables, agrega:

```
AZURE_CLIENT_ID=your_client_id_here
AZURE_CLIENT_SECRET=your_client_secret_here
AZURE_TENANT_ID=sophiaaurea.onmicrosoft.com
ONEDRIVE_FOLDER_ID=/personal/hola_sophiaaurea_co/
SHAREPOINT_SITE_ID=SophiaAurea
SHAREPOINT_DRIVE_ID=Documentos%20compartidos
EXCEL_FILE_NAME=TablaProductos_Sophia_Aurea.xlsx
PHOTOS_FOLDER=/Fotos%20producidas
```

Los valores reales de `AZURE_CLIENT_ID` y `AZURE_CLIENT_SECRET` deben tomarse de `.env.local` (no se suben a git) y cargarse manualmente en Vercel.

## Contacto & Soporte

Para cambios o mejoras: contact@sophiaaurea.co

---

Hecho con ✨ para Sophia Auréa — Joyería con Alma.
