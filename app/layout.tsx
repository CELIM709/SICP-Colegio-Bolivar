import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SICP - Sistema Integral de Control de Pagos e Inscripciones',
  description: 'Control bimonetario de aranceles, cálculo automático de cédula escolar y gestión de inscripciones.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}