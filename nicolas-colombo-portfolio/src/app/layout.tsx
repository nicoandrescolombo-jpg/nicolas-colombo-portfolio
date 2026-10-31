import type { Metadata, Viewport } from 'next'
import { Alegreya, Alegreya_SC } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

// Una sola familia: Alegreya, una serif caligráfica de pluma ancha (como el logo),
// con sus versalitas reales (Alegreya SC) para menú, botones y créditos.
const alegreya = Alegreya({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-alegreya',
  display: 'swap',
})

const alegreyaSC = Alegreya_SC({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-alegreya-sc',
  display: 'swap',
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://nicolas-colombo-portfolio.nicoandres-colombo.workers.dev'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nicolás Colombo — 2D Animator',
    template: '%s — Nicolás Colombo',
  },
  description:
    'Portfolio and reel of Nicolás Colombo, 2D animator: character animation, timing, weight and body acting.',
  keywords: ['2D animator', 'character animation', 'animation reel', 'portfolio', 'Nicolás Colombo'],
  authors: [{ name: 'Nicolás Colombo' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Nicolás Colombo — 2D Animator',
    title: 'Nicolás Colombo — 2D Animator',
    description: 'Reel and selected work of Nicolás Colombo, 2D animator.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nicolás Colombo — 2D Animator',
    description: 'Reel and selected work of Nicolás Colombo, 2D animator.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${alegreya.variable} ${alegreyaSC.variable}`}>
      <body className="bg-ink text-paper type-body antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#141312',
              color: '#E8E2D6',
              border: '1px solid #2E2B27',
              borderRadius: '2px',
              fontFamily: 'var(--font-alegreya)',
              fontSize: '16px',
            },
            success: {
              iconTheme: { primary: '#E8E2D6', secondary: '#141312' },
            },
            error: {
              iconTheme: { primary: '#E5484D', secondary: '#141312' },
            },
          }}
        />
      </body>
    </html>
  )
}
