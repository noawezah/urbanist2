import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
const brandon = localFont({
 src: [
  { path: './fonts/BrandonGrotesque-Medium.otf', weight: '500', style: 'normal' },
  { path: './fonts/BrandonGrotesque-Bold.otf', weight: '700', style: 'normal' },
 ],
 variable: '--font-brandon', display: 'swap',
});
export const metadata: Metadata = { title: 'The Urbanist — Sound House, Bucharest', description: 'Specialty coffee, food for the soul, music and urban culture. Find The Urbanist at Str. George Enescu 25, Bucharest.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={brandon.variable}>{children}</body></html>;
}
