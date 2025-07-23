// 기업 설정 페이지입니다. 차후 layout.tsx에 레이아웃을 설정하여 manage/page와 합쳐 사용할 수 있습니다.
import './ManageDept.scss';
import MasterAdminTable from "@/components/Table/AdminManageTable/AdminManageTable";

export default function ManageDeptPage() {
    return (
        <div id="master-manage-page" className="master-manage-page">
            <div className="admin-manage-page-wrapper">
                <h1 className="master-manage-title">기업 설정</h1>
                <p className="master-manage-description">기업과 관련한 정보를 설정합니다.</p>
            </div>
            <div className="master-admin-table">
                <MasterAdminTable/>
            </div>
        </div>
    );
}