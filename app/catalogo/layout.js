export const metadata = {
  title: 'Catálogo de Joyas en Oro 18K y Piedras Naturales | Sophia Auréa',
  description:
    'Dijes, topos y puntos de luz en oro 18K con zafiros, esmeraldas, rubíes, amatistas y moissanitas. Joyería con alma hecha en Medellín, Colombia. Pide la tuya por WhatsApp.',
  alternates: {
    canonical: '/catalogo',
  },
  openGraph: {
    title: 'Catálogo Sophia Auréa — Joyería con Alma',
    description:
      'Joyas en oro 18K y piedras naturales. Cada pieza guarda una historia, una luz, un alma.',
    url: '/catalogo',
    siteName: 'Sophia Auréa',
    locale: 'es_CO',
    type: 'website',
    images: ['/lockup-completo-fondo-marfil.png'],
  },
};

export default function CatalogoLayout({ children }) {
  return children;
}
