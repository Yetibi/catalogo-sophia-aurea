import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Sophia Auréa — Joyería con Alma',
  description: 'Cada joya guarda una historia. Cada piedra refleja una intención. Cada amuleto acompaña un camino.',
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-4PEDMYDDRS"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4PEDMYDDRS');
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
