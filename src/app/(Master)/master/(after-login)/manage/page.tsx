import './ManageAdmin.scss';
import ModalDeptTrigger from "@/components/utils/ModalTrigger/ModalDeptTrigger";
import MasterAdminTable from "@/components/Table/AdminManageTable/AdminManageTable";
import CustomDropDownForDept from "@/components/CustomDropdown/CustomDropDownForDept";
import CustomSearch from "@/components/CustomSearch/CustomSearch";

export default function ManageAdminPage() {
    return (
        <div id="master-manage-page" className="master-manage-page">
            <div className="admin-manage-page-wrapper">
                <h1 className="master-manage-title">관리자 관리</h1>
                <p className="master-manage-description">부서별로 봇을 관리할 사용자를 등록해 줍니다.</p>
            </div>
            <div className="master-admin-table">
                <MasterAdminTable/>
            </div>
        </div>
    );
}