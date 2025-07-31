'use client';

import dynamic from 'next/dynamic';
import './Analyze.scss';

const FeedbackLineChart = dynamic(() => import('@/components/analyze/FeedbackLineChart'), { 
    ssr: false,
    loading: () => <p>Loading chart...</p> 
});
const KeywordDonutChart = dynamic(() => import('@/components/analyze/KeywordDonutChart'), { 
    ssr: false,
    loading: () => <p>Loading chart...</p> 
});
const FeedbackTypeBarChart = dynamic(() => import('@/components/analyze/FeedbackTypeBarChart'), { 
    ssr: false,
    loading: () => <p>Loading chart...</p> 
});
const SatisfactionDonutChart = dynamic(() => import('@/components/analyze/SatisfactionDonutChart'), { 
    ssr: false,
    loading: () => <p>Loading chart...</p> 
});


export default function AnalysisPage() {
    return (
        <div className="analyze-page">
            <div className="analyze-header">
                <h1 className="title">통계</h1>
            </div>
            
            <div className="analyze-grid">
                <div className="grid-item">
                    <FeedbackLineChart />
                </div>
                <div className="grid-item">
                    <KeywordDonutChart />
                </div>
                <div className="grid-item">
                    <FeedbackTypeBarChart />
                </div>
                <div className="grid-item">
                    <SatisfactionDonutChart />
                </div>
            </div>
        </div>
    );
}
