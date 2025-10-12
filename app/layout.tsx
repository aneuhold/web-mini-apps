import { Metadata } from 'next';
import { ReactNode } from 'react';
import './global-styles/global.css';

export const metadata: Metadata = {
  title: 'Simple Web Utilities',
  description: 'Little web utilities from the developer Anton G Neuhold Jr.',
  icons: {
    icon: '/favicon.ico'
  }
};

/**
 * Root layout component that wraps the entire application.
 * Sets up fonts, metadata, and provides the HTML structure for all pages.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
