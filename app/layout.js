import './globals.css';
import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://sophiaaurea.co'),
  title: 'Sophia Auréa — Joyería con Alma en Oro 18K y Piedras Naturales',
  description:
    'Joyería con alma hecha en Medellín: oro 18K y piedras naturales. Cada joya guarda una historia. Cada piedra refleja una intención. Cada amuleto acompaña un camino.',
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Sophia Auréa — Joyería con Alma',
    description:
      'Joyas en oro 18K y piedras naturales. Cada pieza guarda una historia, una luz, un alma.',
    siteName: 'Sophia Auréa',
    locale: 'es_CO',
    type: 'website',
    images: ['/lockup-completo-fondo-marfil.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-XXL1MN816Y"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XXL1MN816Y');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
