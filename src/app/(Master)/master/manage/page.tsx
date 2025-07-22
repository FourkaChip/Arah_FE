import './ManageAdmin.scss';
import ModalDeptTrigger from "@/components/utils/ModalTrigger/ModalDeptTrigger";
import MasterAdminTable from "@/components/Table/AdminManageTable/AdminManageTable";
import CustomDropDownForDept from "@/components/CustomDropdown/CustomDropDownForDept";

export default function ManageAdminPage() {
    return (
        <div id="master-manage-page" className="master-manage-page">
            <div className="admin-manage-page-wrapper">
                <h1 className="master-manage-title">관리자 관리</h1>
                <p className="master-manage-description">부서별로 봇을 관리할 사용자를 등록해 줍니다.</p>
            </div>
            <div className="admin-manage-input-wrapper">
                <div className="admin-manage-input">
                    <CustomDropDownForDept/>
                    <div className="admin-search-input-wrapper">
                      <input className="admin-search-input" placeholder="검색할 관리자를 입력해 주세요." />
                      <i className="fas fa-search search-icon" />
                    </div>
                </div>
                <ModalDeptTrigger buttonText="관리자 추가"/>
            </div>
            <div className="master-admin-table">
                <MasterAdminTable/>
            </div>
        </div>
    );
}