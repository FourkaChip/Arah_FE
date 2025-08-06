import './DataSetPage.scss';
import AdminDataTable from "@/components/table/datasetTable/AdminDataTable";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminMainPage() {
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
        <div id="admin-main-page" className="admin-main-page">
            <div className="admin-main-page-wrapper">
                <h1 className="admin-main-title">데이터셋 관리</h1>
                <p className="admin-main-description">챗봇이 학습할 데이터셋을 관리합니다. 30일간 사용하지 않는 파일의 경우, 자동으로 삭제됩니다.</p>
            </div>
            <div className="admin-dataset-table">
                <AdminDataTable/>
            </div>
        </div>
        </ProtectedRoute>
    );
}