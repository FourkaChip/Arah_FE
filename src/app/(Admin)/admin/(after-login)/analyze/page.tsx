import './Analyze.scss';
import FeedbackLineChart from '@/components/analyze/FeedbackLineChart';
import KeywordDonutChart from '@/components/analyze/KeywordDonutChart';
import FeedbackTypeBarChart from '@/components/analyze/FeedbackTypeBarChart';
import SatisfactionDonutChart from '@/components/analyze/SatisfactionDonutChart';

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