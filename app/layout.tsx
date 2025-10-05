import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'La Chicane',
  description: 'Pronostics F1 entre amis',
  manifest: '/manifest.json'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-dvh bg-slate-50" style={{backgroundColor:'#f8fafc', color:'#0f172a'}}>
        {children}
        <script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`}} />
      </body>
    </html>
  );
}
