"use client";
import React, {useState, useEffect, useMemo, useRef} from "react";
import CustomSearch from "@/components/CustomSearch/CustomSearch";
import ModalDepartment from "@/components/Modal/ModalDepartment/ModalDepartment";
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import Pagination from "@/components/CustomPagination/Pagination";
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
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef
} from "@tanstack/react-table";

type RowType = typeof rows[number];

export default function MasterAdminTable() {
    const [openDeptModal, setOpenDeptModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState('all');
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openTokenModal, setOpenTokenModal] = useState(false);

    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;
    const pathName = usePathname();

    // 필터링
    const filteredRows = useMemo(() => {
        if (pathName === '/master/manage') {
            return rows.filter(row => {
                const isDeptAll = selectedDept === 'all';
                const isSearchEmpty = !searchValue;
                if (isDeptAll && isSearchEmpty) return true;
                if (!isDeptAll && isSearchEmpty) return row.department === selectedDept;
                if (isDeptAll && !isSearchEmpty) return row.name.toLowerCase().includes(searchValue.toLowerCase());
                return row.department === selectedDept && row.name.toLowerCase().includes(searchValue.toLowerCase());
            });
        } else if (pathName === '/master/dept') {
            return rows.filter(row => {
                const isSearchEmpty = !searchValue;
                if (isSearchEmpty) return true;
                return row.department.toLowerCase().includes(searchValue.toLowerCase());
            });
        }
        return rows;
    }, [selectedDept, searchValue, pathName]);

    const paginatedData = useMemo(
        () => filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
        [filteredRows, currentPage]
    );

    // tanstack-table 컬럼 정의
    const columns: ColumnDef<RowType>[] = useMemo(() => {
        if (pathName === '/master/manage') {
            return [
                {
                    accessorKey: "department",
                    header: "부서",
                },
                {
                    accessorKey: "joinDate",
                    header: "가입일",
                },
                {
                    accessorKey: "position",
                    header: "직급",
                },
                {
                    accessorKey: "userId",
                    header: "사용자ID",
                },
                {
                    accessorKey: "name",
                    header: "사용자명",
                },
                {
                    accessorKey: "email",
                    header: "이메일",
                },
                {
                    id: "departmentSetting",
                    header: "부서 설정",
                    cell: () => (
                        <button className="text-blue-600 underline" onClick={() => setOpenDeptModal(true)}>부서 설정</button>
                    ),
                },
                {
                    id: "delete",
                    header: "삭제",
                    cell: () => (
                        <img
                            src="/delete.svg"
                            alt="삭제"
                            className="icon-delete-button"
                            onClick={() => setOpenDeleteModal(true)}
                        />
                    ),
                }
            ];
        } else {
            return [
                {
                    accessorKey: "department",
                    header: "부서명",
                },
                {
                    id: "edit",
                    header: "편집",
                    cell: () => (
                        <FontAwesomeIcon icon={faTrash}
                                         onClick={() => setOpenDeleteModal(true)}
                                         style={{color: 'red', cursor: 'pointer'}}
                        />
                    ),
                }
            ];
        }
    }, [pathName]);

    const table = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const pageCount = Math.ceil(filteredRows.length / pageSize);

    return (
        <>
            <div className="admin-manage-input-wrapper">
                <div className="admin-manage-input">
                    {pathName === '/master/manage' && (
                        <CustomDropDownForDept onChange={setSelectedDept}/>
                    )}
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
            <div id="master-admin-table" className="master-admin-table" style={{width: "100%"}}>
                <table className="tanstack-table">
                    <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <th key={header.id}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody>
                    {table.getRowModel().rows.length === 0 ? (
                        <tr>
                            <td className="empty-row" colSpan={table.getAllLeafColumns().length}>
                                검색 결과가 없습니다
                            </td>
                        </tr>
                    ) : (
                        table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
                <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
                    <Pagination
                        currentPage={currentPage + 1}
                        totalPages={pageCount}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </div>
                {openDeptModal && <ModalDepartment onClose={() => setOpenDeptModal(false)}/>}
                {openDeleteModal &&
                    <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
                {openEditModal &&
                    <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
                {openTokenModal &&
                    <ModalInputFilled type={"token-check"} onClose={() => setOpenTokenModal(false)}/>}

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