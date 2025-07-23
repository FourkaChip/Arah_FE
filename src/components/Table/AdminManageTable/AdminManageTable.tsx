"use client";
import {DataGrid, GridColDef, GridPaginationModel} from "@mui/x-data-grid";
import {useState, useEffect} from "react";
import CustomSearch from "@/components/CustomSearch/CustomSearch";
import ModalDepartment from "@/components/Modal/ModalDepartment/ModalDepartment";
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import './AdminManageTable.scss';
import '@/app/(Master)/master/(after-login)/manage/ManageAdmin.scss';
import {rows} from "@/constants/dummydata/AdminList";
import CustomDropDownForDept from "@/components/CustomDropdown/CustomDropDownForDept";
import ModalDeptTrigger from "@/components/utils/ModalTrigger/ModalDeptTrigger";

export default function MasterAdminTable() {
    const [openDeptModal, setOpenDeptModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState('all');
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 8,
    });

    const [searchValue, setSearchValue] = useState("");
    const [filteredRows, setFilteredRows] = useState(rows);

    useEffect(() => {
        setFilteredRows(
            rows.filter(row => {
                const isDeptAll = selectedDept === 'all';
                const isSearchEmpty = !searchValue;

                // 둘 다 기본값이면 전체 데이터를 반환
                if (isDeptAll && isSearchEmpty) return true;

                // 부서만 선택하는 경우
                if (!isDeptAll && isSearchEmpty) return row.department === selectedDept;

                // 검색어만 입력하는 경우
                if (isDeptAll && !isSearchEmpty) return row.name.toLowerCase().includes(searchValue.toLowerCase());

                // 둘 다 입력하는 경우, AND 조건이 적용됩니다.
                return row.department === selectedDept && row.name.toLowerCase().includes(searchValue.toLowerCase());
            })
        );
    }, [selectedDept, searchValue]);

    const columns: GridColDef[] = [
        {field: "department", headerName: "부서", flex: 0.8, resizable: false},
        {field: "joinDate", headerName: "가입일", flex: 1, resizable: false},
        {field: "position", headerName: "직급", flex: 1, resizable: false},
        {field: "userId", headerName: "사용자ID", flex: 1, resizable: false},
        {field: "name", headerName: "사용자명", flex: 1, resizable: false},
        {field: "email", headerName: "이메일", flex: 1, resizable: false},
        {
            field: "departmentSetting",
            headerName: "부서 설정",
            sortable: false,
            flex: 1,
            resizable: false,
            renderCell: () => (
                <button className="text-blue-600 underline" onClick={() => setOpenDeptModal(true)}>부서 설정</button>
            ),
        },
        {
            field: "delete",
            headerName: "삭제",
            sortable: false,
            flex: 0.5,
            resizable: false,
            renderCell: () => (
                <img
                    src="/delete.svg"
                    alt="삭제"
                    className="icon-delete-button"
                    onClick={() => setOpenDeleteModal(true)}
                />
            ),
        }
    ];

    return (
        <>
            <div className="admin-manage-input-wrapper">
                <div className="admin-manage-input">
                    <CustomDropDownForDept onChange={setSelectedDept}/>
                    <CustomSearch onSearch={setSearchValue}/>
                </div>
                <ModalDeptTrigger buttonText="관리자 추가"/>
            </div>
            <div id="master-admin-table" className="master-admin-table" style={{height: 526, width: "100%"}}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    disableColumnResize
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[8]}
                    rowCount={filteredRows.length}
                    slots={{pagination: CustomPagination}}
                />
                {openDeptModal && <ModalDepartment onClose={() => setOpenDeptModal(false)}/>}
                {openDeleteModal &&
                    <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
            </div>
        </>
    );
}