'use client';

import dynamic from 'next/dynamic';
import './Analyze.scss';
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from 'react';
import { getCompanyIdFromToken } from '@/api/admin/analyze/analyzeFetch';

const FeedbackLineChart = dynamic(() => import('@/components/analyze/FeedbackLineChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const FeedbackTypeChart = dynamic(() => import('@/components/analyze/FeedbackTypeChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const KeywordChart = dynamic(() => import('@/components/analyze/KeywordChart'), { ssr: false, loading: () => <p>Loading chart...</p> });
const SatisfactionChart = dynamic(() => import('@/components/analyze/SatisfactionChart'), { ssr: false, loading: () => <p>Loading chart...</p> });

export default function AnalysisPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    // 토큰이 유효한지 확인
    getCompanyIdFromToken().then(id => {
      setIsAuthenticated(id != null);
    });
  }, []);

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="analyze-page">
        <div className="analyze-header">
          <h1 className="title">통계</h1>
        </div>

        <div className="analyze-grid">
          <section className="grid-item line-full">
            {isAuthenticated ? (
              <FeedbackLineChart />
            ) : (
              <p>인증 정보를 확인하는 중...</p>
            )}
          </section>

          <section className="grid-item donut-left">
            {isAuthenticated ? (
              <FeedbackTypeChart />
            ) : (
              <p>인증 정보를 확인하는 중...</p>
            )}
          </section>

          <section className="grid-item donut-right">
            {isAuthenticated ? (
              <SatisfactionChart />
            ) : (
              <p>인증 정보를 확인하는 중...</p>
            )}
          </section>

          <section className="grid-item keyword-full">
            {isAuthenticated ? (
              <KeywordChart />
            ) : (
              <p>인증 정보를 확인하는 중...</p>
            )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}