"use client";
import {DataGrid, GridColDef, GridPaginationModel} from "@mui/x-data-grid";
import React, {useState, useEffect} from "react";
import CustomSearch from "@/components/CustomSearch/CustomSearch";
import ModalDepartment from "@/components/Modal/ModalDepartment/ModalDepartment";
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import CustomPagination from "@/components/CustomPagination/CustomPagination";
import './AdminManageTable.scss';
import '@/app/(Master)/master/(after-login)/manage/ManageAdmin.scss';
import {rows} from "@/constants/dummydata/AdminList";
import CustomDropDownForDept from "@/components/CustomDropdown/CustomDropDownForDept";
import ModalDeptTrigger from "@/components/utils/ModalTrigger/ModalDeptTrigger";
import {usePathname} from "next/navigation";
import ModalNewDeptTrigger from "@/components/utils/ModalTrigger/ModalNewDeptTrigger";
import ModalInputFilled from "@/components/Modal/ModalInput/ModalInputFilled";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function MasterAdminTable() {
    const [openDeptModal, setOpenDeptModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState('all');
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openTokenModal, setOpenTokenModal] = useState(false);

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 8,
    });
    const pathName = usePathname();

    const [searchValue, setSearchValue] = useState("");
    const [filteredRows, setFilteredRows] = useState(rows);

    // 관리자 관리 페이지에서의 검색 useEffect
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

    // 기업 설정 페이지에서의 검색 useEffect
    useEffect(() => {
        if (pathName === '/master/dept') {
            setFilteredRows(
                rows.filter(row => {
                    const isSearchEmpty = !searchValue;
                    // 검색어만 입력하는 경우
                    if (isSearchEmpty) return true;
                    // 검색어가 입력된 경우, 부서명에 포함되는지 확인
                    return row.department.toLowerCase().includes(searchValue.toLowerCase());
                })
            );
        }
    }, [searchValue, pathName]);

    const columns: GridColDef[] = pathName === '/master/manage'
        ? [
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
        ]
        : [
            {field: "department", headerName: "부서명", flex: 1, resizable: false},
            {
                field: "edit",
                headerName: "편집",
                sortable: false,
                flex: 0.3,
                resizable: false,
                renderCell: () => (
                    <i
                        className="fa fa-trash"
                        onClick={() => setOpenDeleteModal(true)}
                        style={{color: 'red', cursor: 'pointer'}}
                    />
                    // <FontAwesomeIcon icon={faTrash} />
                ),
            }
        ];

    const NoRowsOverlay = () => (
        <div className="empty-row">검색 결과가 없습니다</div>
    );


    return (
        <>
            <div className="admin-manage-input-wrapper">
                <div className="admin-manage-input">
                    {pathName === '/master/manage' && (
                        <CustomDropDownForDept onChange={setSelectedDept}/>
                    )}
                    {/*<CustomSearch onSearch={setSearchValue}/>*/}
                    <CustomSearch
                        onSearch={setSearchValue}
                        className={pathName === '/master/dept' ? 'wide-search' : ''}
                    />
                </div>
                {pathName === '/master/manage' && (
                    <ModalDeptTrigger buttonText="관리자 추가"/>
                )}
                {pathName === '/master/dept' && (
                    <ModalNewDeptTrigger buttonText={"부서 추가"}/>
                )}
            </div>
            <div id="master-admin-table" className="master-admin-table" style={{height: 526, width: "100%"}}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    disableColumnResize
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[8]}
                    // rowCount={filteredRows.length} // rowCount는 현재 클라이언트 사이드 페이지네이션에서는 비활성화해야 함. 만약 서버 사이드 페이지네이션을 사용한다면 활성화해야 함.
                    slots={{
                        pagination: CustomPagination,
                        noRowsOverlay: NoRowsOverlay,
                    }}
                />
                {openDeptModal && <ModalDepartment onClose={() => setOpenDeptModal(false)}/>}
                {openDeleteModal &&
                    <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
                {openEditModal &&
                    <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
                {openTokenModal &&
                    <ModalInputFilled type={"token-check"} onClose={()=>setOpenTokenModal(false)}/>}

            </div>
            {pathName === '/master/dept' && (
                <div className="corp-token-section">
                    <p className="title is-3" onClick={() => setOpenTokenModal(true)}>기업 토큰 조회</p>
                    <p className="subtitle is-7">카카오워크 내 그룹 채팅방을 생성할 수 있는 토큰을 확인합니다.</p>
                </div>
            )}
        </>
    );
}