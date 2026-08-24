// /api stays crawlable: Google renders the catalog via /api/productos and
// serves product photos from /api/imagen — blocking it would blank the page.
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://sophiaaurea.co/sitemap.xml',
  };
}
