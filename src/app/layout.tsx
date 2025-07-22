import type { Metadata } from "next";
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
    // ===== HTML 문서 구조 =====
    <html lang="ko" suppressHydrationWarning> {/* 한국어로 설정 */}
      {/* ===== 바디 영역 ===== */}
      <body>
        {/* Font Awesome CSS를 link 태그로 추가 */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
        {/* ===== 헤더 영역 ===== */}
        <div className="header-wrapper">
          <Header/>
        </div>

        {/* ===== 메인 레이아웃 컨테이너 ===== */}
        {/* 고정 사이드바 레이아웃 - 사이드바는 항상 왼쪽에 고정 */}
        <div className="layout-container">
          
          {/* ===== 사이드바 영역 ===== */}
          {/* 왼쪽에 고정된 사이드바 - 높이 100vh, 너비 250px 고정 */}
          <div className="sidebar-wrapper">
            {/* 사이드바 컴포넌트 렌더링 */}
            <Sidebar />
          </div>
          
          {/* ===== 메인 콘텐츠 영역 ===== */}
          {/* 사이드바 옆의 메인 콘텐츠 영역 - 나머지 공간 차지 */}
          <div className="main-content">
            {/* 각 페이지의 실제 콘텐츠가 여기에 렌더링됨 */}
            {/* 예: page.tsx, about/page.tsx 등의 내용 */}
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}