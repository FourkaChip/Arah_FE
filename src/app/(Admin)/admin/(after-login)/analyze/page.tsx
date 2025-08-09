// src/app/(Admin)/admin/(after-login)/analyze/page.tsx
'use client';

import dynamic from 'next/dynamic';
import './Analyze.scss';
import ProtectedRoute from "@/components/ProtectedRoute";

// 피드백 차트 (피드백 추이)
const FeedbackLineChart = dynamic(
  () => import('@/components/analyze/FeedbackLineChart'),
  { ssr: false, loading: () => <p>Loading chart...</p> }
);

// 피드백 유형
const FeedbackTypeChart = dynamic(
  () => import('@/components/analyze/FeedbackTypeChart'),
  { ssr: false, loading: () => <p>Loading chart...</p> }
);

// 키워드 차트 (10개 키워드)
const KeywordChart = dynamic(
  () => import('@/components/analyze/KeywordChart'),
  { ssr: false, loading: () => <p>Loading chart...</p> }
);

// 만족도 차트
const SatisfactionChart = dynamic(
  () => import('@/components/analyze/SatisfactionChart'),
  { ssr: false, loading: () => <p>Loading chart...</p> }
);

export default function AnalysisPage() {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="analyze-page">
        <div className="analyze-header">
          <h1 className="title">통계</h1>
        </div>

        {/* [FIX] 레이아웃: grid-area 기반으로 영역 배치 */}
        <div className="analyze-grid">
          {/* 1) 라인 그래프 — 전체 가로 */}
          <section className="grid-item line-full">
            <FeedbackLineChart />
          </section>

          {/* 2) 도넛 2개 — 가로 나란히 */}
          <section className="grid-item donut-left">
            <FeedbackTypeChart />
          </section>
          <section className="grid-item donut-right">
            <SatisfactionChart />
          </section>

          {/* 3) 키워드 — 전체 가로 */}
          <section className="grid-item keyword-full">
            <KeywordChart />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}