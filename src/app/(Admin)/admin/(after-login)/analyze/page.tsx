'use client';

import dynamic from 'next/dynamic';
import './Analyze.scss';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from '@/store/auth.store';

const FeedbackLineChart = dynamic(() => import('@/components/analyze/FeedbackLineChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const FeedbackTypeChart = dynamic(() => import('@/components/analyze/FeedbackTypeChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const KeywordChart = dynamic(() => import('@/components/analyze/KeywordChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const SatisfactionChart = dynamic(() => import('@/components/analyze/SatisfactionChart'), { ssr: false, loading: () => <p>Loading chart...</p> });

export default function AnalysisPage() {
  const rawCompanyId = useAuthStore(s =>
    s.user?.companyId ?? s.user?.company?.id ?? s.user?.company_id
  );

  // 디버깅용 콘솔 로그 추가
  console.log('rawCompanyId:', rawCompanyId);
  const companyId: number | null =
    typeof rawCompanyId === 'number'
      ? rawCompanyId
      : rawCompanyId != null && rawCompanyId !== ''
        ? Number(rawCompanyId)
        : null;
  console.log('companyId:', companyId);

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="analyze-page">
        <div className="analyze-header">
          <h1 className="title">통계</h1>
        </div>

        <div className="analyze-grid">
          <section className="grid-item line-full">
            <FeedbackLineChart />
          </section>

          <section className="grid-item donut-left">
            <FeedbackTypeChart />
          </section>

          <section className="grid-item donut-right">
            {companyId != null ? ( // ✅ 0 허용
              <SatisfactionChart companyId={companyId} />
            ) : (
              <p>회사 정보를 불러오는 중...</p>
            )}
          </section>

          <section className="grid-item keyword-full">
            <KeywordChart />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}