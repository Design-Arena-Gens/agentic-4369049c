import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Weekly Expense Review',
  description: 'Track weekly expenses with charts',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Weekly Expense Review</h1>
          </header>
          <main>{children}</main>
          <footer className="footer">Built for quick insights</footer>
        </div>
      </body>
    </html>
  );
}
