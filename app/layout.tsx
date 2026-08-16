import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { AssessmentProvider } from '@/contexts/AssessmentContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hệ thống đánh giá thể chất',
  description: 'Khảo sát thể chất Y học cổ truyền',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <Providers><AssessmentProvider>{children}</AssessmentProvider></Providers>
      </body>
    </html>
  );
}
