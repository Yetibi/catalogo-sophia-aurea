import './globals.css';

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
      </head>
      <body>{children}</body>
    </html>
  );
}
