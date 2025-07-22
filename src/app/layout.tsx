import type {Metadata} from "next";
import "../styles/globals.scss";
import "./layout.scss"; // 레이아웃 전역 스타일로, 다른 모든 페이지 레이아웃을 보여주기 위해 필요합니다!
import "../components/Modal/Buttons/ModalButton.scss";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";

// ===== 메타데이터 설정 =====
export const metadata: Metadata = {
    title: 'FourKa',
    description: 'FourKa Application',
};

// ===== RootLayout 컴포넌트 =====
export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko" suppressHydrationWarning>
        <body>
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        <div className="header-wrapper">
            <Header/>
        </div>
        <div className="layout-container">
            <div className="sidebar-wrapper">
                <Sidebar/>
            </div>
            <div className="main-content">
                {children}
            </div>
        </div>
        </body>
        </html>
    );
}