import type { Metadata } from "next";
import "@/styles/globals.scss";
import "@/components/modal/Buttons/ModalButton.scss";
import "./layout.scss";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";
import ClientProviders from '@/utils/QueryClientProvider';

// ===== 메타데이터 설정 =====
export const metadata: Metadata = {
  title: '마스터 페이지',
  description: 'FourKa Application',
};

// ===== RootLayout 컴포넌트 =====
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <div className="header-wrapper">
        <Header/>
      </div>
      <div className="layout-container">
        <div className="sidebar-wrapper">
          <Sidebar />
        </div>
        <div className="main-content">
          {children}
        </div>
      </div>
    </ClientProviders>
  );
}