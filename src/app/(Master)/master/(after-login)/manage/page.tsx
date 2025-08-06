// 관리자 관리 페이지입니다.
import './ManageAdmin.scss';
import MasterAdminTable from "@/components/table/adminManageTable/AdminManageTable";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ManageAdminPage() {
    return (
        <ProtectedRoute allowedRoles={['MASTER']}>
        <div id="master-manage-page" className="master-manage-page">
            <div className="admin-manage-page-wrapper">
                <h1 className="master-manage-title">관리자 관리</h1>
                <p className="master-manage-description">부서별로 봇을 관리할 사용자를 등록해 줍니다.</p>
            </div>
            <div className="master-admin-table">
                <MasterAdminTable/>
            </div>
        </div>
        </ProtectedRoute>
    );
}