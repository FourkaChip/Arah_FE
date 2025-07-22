"use client";
import {DataGrid, GridColDef, GridPaginationModel} from "@mui/x-data-grid";
import {useState} from "react";
import ModalDepartment from "@/components/Modal/ModalDepartment/ModalDepartment";
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import './AdminManageTable.scss';
import {rows} from "@/constants/dummydata/AdminList";

export default function MasterAdminTable() {
    const [openDeptModal, setOpenDeptModal] = useState(false);
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 8,
    });

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
        <div id="master-admin-table" className="master-admin-table" style={{height: 526, width: "100%"}}>
            <DataGrid
                rows={rows}
                columns={columns}
                disableColumnResize
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[8]}
                rowCount={rows.length}
                slots={{pagination: CustomPagination }}
            />
            {openDeptModal && <ModalDepartment onClose={() => setOpenDeptModal(false)}/>}
            {openDeleteModal && <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
        </div>
    );
}