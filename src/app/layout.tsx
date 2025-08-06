import "@/styles/globals.scss";

export const metadata = {
  title: 'Fourka',
  description: '',
};

import type { ReactNode } from 'react';
import ClientProviders from "@/utils/QueryClientProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
      <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body>
      <ClientProviders>
          {children}
      </ClientProviders>
      </body>
    </html>
  );
}