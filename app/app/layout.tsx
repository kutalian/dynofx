import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DynoFX | Professional Trading Simulator',
  description: 'Master the financial markets with our advanced trading simulator and educational platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
