import type { Metadata, Viewport } from 'next'
import { Inter, Bungee } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const bungee = Bungee({ 
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-bungee',
})

export const metadata: Metadata = {
  title: 'TaskFlow - Your Personal Task Manager',
  description: 'Manage your tasks efficiently with TaskFlow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${bungee.variable}`}>
      <body>{children}</body>
    </html>
  )
}
