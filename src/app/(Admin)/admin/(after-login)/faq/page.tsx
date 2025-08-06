import './Faq.scss';
import FaqTable from "@/components/table/faqTable/FaqTable";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function FaqPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
        <div id="admin-faq-page" className="admin-faq-page">
            <div className="admin-faq-page-wrapper">
                <h1 className="faq-title">FAQ</h1>
                <p className="faq-description">챗봇 사용자가 자주 묻는 질문과, 그에 대한 답변을 관리자가 직접 등록할 수 있습니다.</p>
            </div>
            <div className="admin-faq-table">
                <FaqTable/>
            </div>
        </div>
        </ProtectedRoute>
    );
}