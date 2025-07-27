import './Feedback.scss';
import FeedbackTable from "@/components/Table/FeedbackTable/FeedbackTable";

export default function FeedbackPage() {
    return (
        <div id="admin-feedback-page" className="admin-feedback-page">
            <div className="admin-feedback-page-wrapper">
                <h1 className="feedback-title">피드백</h1>
                <p className="feedback-description">사용자의 질문에 제대로 대답하지 못한 챗봇 문답과, 그에 대한 사용자 피드백을 확인합니다.</p>
            </div>
            <div className="admin-faq-table">
                <FeedbackTable/>
            </div>
        </div>
    );
}