import './DataSetPage.scss';
import AdminDataTable from "@/components/Table/DatasetTable/AdminDataTable";

export default function AdminMainPage() {
    return (
        <div id="admin-main-page" className="admin-main-page">
            <div className="admin-main-page-wrapper">
                <h1 className="admin-main-title">데이터셋 관리</h1>
                <p className="admin-main-description">챗봇이 학습할 데이터셋을 관리합니다.</p>
            </div>
            <div className="admin-dataset-table">
                <AdminDataTable/>
            </div>
        </div>
    );
}