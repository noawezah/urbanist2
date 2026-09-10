import type { Metadata } from 'next';
import { Urbanist } from 'next/font/google';
import './globals.css';
const urbanist = Urbanist({ subsets: ['latin','latin-ext'], variable: '--font-urbanist', display: 'swap' });
export const metadata: Metadata = { title: 'The Urbanist — Sound House, Bucharest', description: 'Specialty coffee, food for the soul, music and urban culture. Find The Urbanist at Str. George Enescu 25, Bucharest.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={urbanist.variable}>{children}</body></html>;
}
