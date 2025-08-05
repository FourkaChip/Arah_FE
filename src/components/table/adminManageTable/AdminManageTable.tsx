// 관리자 관리 및 기업 설정 테이블 컴포넌트입니다.
"use client";
import React, {useState, useMemo, useCallback, useEffect} from "react";
import CustomSearch from "@/components/customSearch/CustomSearch";
import ModalDepartment from "@/components/modal/ModalDepartment/ModalDepartment";
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import Pagination from "@/components/customPagination/Pagination";
import './AdminManageTable.scss';
import '@/app/(Master)/master/(after-login)/manage/ManageAdmin.scss';
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchAdminList, fetchDepartmentList, removeAdminRole, fetchCompanyToken} from "@/api/auth/master";
import {AdminListResponseDto, CompanyAdminListResponse, CombinedAdminInfo} from "@/types/tables";
import CustomDropDownForDept from "@/components/customDropdown/CustomDropDownForDept";
import ModalDeptTrigger from "@/components/utils/ModalTrigger/ModalDeptTrigger";
import {usePathname} from "next/navigation";
import ModalNewDeptTrigger from "@/components/utils/ModalTrigger/ModalNewDeptTrigger";
import ModalInputFilled from "@/components/modal/ModalInput/ModalInputFilled";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef
} from "@tanstack/react-table";

type RowType = AdminListResponseDto | CompanyAdminListResponse;

type AdminRowType = CombinedAdminInfo;

export default function MasterAdminTable() {
    const [openDeptModal, setOpenDeptModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminRowType | null>(null); // 추가
    const [selectedDept, setSelectedDept] = useState('all');
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openEditModal] = useState(false);
    const [openTokenModal, setOpenTokenModal] = useState(false);
    const [companyToken, setCompanyToken] = useState<string>(''); // 추가

    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;
    const pathName = usePathname();
    const queryClient = useQueryClient();
    const [deletingEmail, setDeletingEmail] = useState<string | null>(null);

    const {data: adminRows = [], isLoading, error} = useQuery<AdminRowType[]>({
        queryKey: ['adminList'],
        queryFn: fetchAdminList
    });

    useEffect(() => {
        setCurrentPage(0);
    }, [adminRows]);

    const {data: deptRows = [], isLoading: deptLoading, error: deptError} = useQuery<any[]>({
        queryKey: ['departmentList'],
        queryFn: fetchDepartmentList,
        enabled: pathName === '/master/dept',
    });

    const filteredRows = useMemo(() => {
        if (pathName === '/master/dept') {
            return deptRows.filter(row => {
                const isSearchEmpty = !searchValue;
                if (isSearchEmpty) return true;
                return (row.name ?? '').toLowerCase().includes(searchValue.toLowerCase());
            });
        }
        if (pathName === '/master/manage') {
            return adminRows.filter(row => {
                const isDeptAll = selectedDept === 'all';
                const isSearchEmpty = !searchValue;
                if (isDeptAll && isSearchEmpty) return true;

                const hasSelectedDept = row.adminDepartments &&
                    Array.isArray(row.adminDepartments) &&
                    row.adminDepartments.includes(selectedDept);

                if (!isDeptAll && isSearchEmpty) return hasSelectedDept;
                if (isDeptAll && !isSearchEmpty) {
                    const searchTarget = [
                        row.name,
                        row.email,
                        row.position
                    ].filter(Boolean).join(' ').toLowerCase();

                    return searchTarget.includes(searchValue.toLowerCase());
                }
                return hasSelectedDept && row.name.toLowerCase().includes(searchValue.toLowerCase());
            });
        }
        return adminRows;
    }, [selectedDept, searchValue, pathName, adminRows, deptRows]);

    const paginatedData = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredRows.slice(startIndex, endIndex);
    }, [filteredRows, currentPage, pageSize]);

    const pageCount = useMemo(() => Math.ceil(filteredRows.length / pageSize), [filteredRows, pageSize]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page - 1);
    }, []);

    // tanstack-table 컬럼 정의 - AdminRowType 타입에 맞게 조정
    const columns: ColumnDef<AdminRowType>[] = useMemo(() => {
        if (pathName === '/master/dept') {
            return [
                {
                    accessorKey: "name",
                    header: "부서명",
                },
                {
                    id: "edit",
                    header: "편집",
                    cell: ({row}) => (
                        <FontAwesomeIcon
                            icon={faTrash}
                            onClick={() => handleOpenDeleteModal(row.original.departmentId as unknown as string)}
                            style={{color: 'red', cursor: 'pointer'}}
                        />
                    ),
                }
            ];
        }
        if (pathName === '/master/manage') {
            return [
                {
                    accessorKey: "adminDepartments",
                    header: "담당 부서",
                    cell: ({row}) => {
                        const depts = row.original.adminDepartments;
                        if (Array.isArray(depts)) {
                            return depts.join(', ');
                        }
                        return row.original.departmentName || '';
                    }
                },
                {
                    accessorKey: "createdAt",
                    header: "가입일",
                    cell: ({getValue}) => {
                        const raw = getValue() as string;
                        if (!raw) return '';
                        const date = new Date(raw);
                        return date.toLocaleDateString("ko-KR", {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
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
                    cell: ({row}) => row.original.email || '',
                },
                {
                    id: "departmentSetting",
                    header: "부서 설정",
                    cell: ({row}) => (
                        <button className="text-blue-600 underline"
                                onClick={() => {
                                    setSelectedAdmin(row.original); // 선택된 사용자 정보 저장
                                    setOpenDeptModal(true);
                                }}>부서 설정</button>
                    ),
                },
                {
                    id: "delete",
                    header: "삭제",
                    cell: ({row}) => (
                        <img
                            src="/delete.svg"
                            alt="삭제"
                            className="icon-delete-button"
                            style={{opacity: deletingEmail === (row.original.email || '') ? 0.5 : 1, cursor: 'pointer'}}
                            onClick={() => handleOpenDeleteModal(row.original.email || '')}
                        />
                    ),
                }
            ];
        }
        // 타입 에러 방지를 위해, 기본적으로 빈 배열을 반환합니다.
        return [];
    }, [pathName, deletingEmail]);

    // tanstack-table 초기화
    const table = useReactTable<AdminRowType>({
        data: paginatedData as AdminRowType[],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // 삭제 로직 핸들러입니다.
    const handleDelete = async (email: string) => {
        if (!email) {
            alert("이메일이 유효하지 않습니다.");
            setOpenDeleteModal(false);
            return;
        }

        setDeletingEmail(email);
        try {
            await removeAdminRole(email);
            await queryClient.invalidateQueries({queryKey: ['adminList']});
        } catch (e) {
            alert("삭제에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setDeletingEmail(null);
            setOpenDeleteModal(false);
        }
    };

    const handleOpenDeleteModal = (email: string | number) => {
        setDeletingEmail(typeof email === 'string' ? email : String(email));
        setOpenDeleteModal(true);
    };

    const handleOpenTokenModal = async () => {
        try {
            const token = await fetchCompanyToken();
            setCompanyToken(token);
            setOpenTokenModal(true);
        } catch (e) {
            alert("토큰이 존재하지 않습니다.");
        }
    };

    if (pathName === '/master/dept' && deptLoading) return <div>로딩 중...</div>;
    if (pathName === '/master/dept' && deptError) return <div>에러 발생: {deptError.message}</div>;

    if (isLoading) return <div>로딩 중...</div>;
    if (error) return <div>에러 발생: {error.message}</div>;

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
                <div style={{display: "flex", justifyContent: "center", margin: "24px 0"}}>
                    <Pagination
                        currentPage={currentPage + 1}
                        totalPages={pageCount}
                        onPageChange={handlePageChange}
                    />
                </div>
                {openDeptModal && selectedAdmin &&
                    <ModalDepartment
                        onClose={() => {
                            setOpenDeptModal(false);
                            setSelectedAdmin(null);
                        }}
                        defaultStep="select"
                        defaultUser={selectedAdmin}
                    />
                }
                {openDeleteModal &&
                    <ModalDefault
                        type="delete-data"
                        label="삭제하시겠습니까?"
                        onClose={() => setOpenDeleteModal(false)}
                        onSubmit={() => deletingEmail && handleDelete(deletingEmail)}
                    />}
                {openEditModal &&
                    <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
                {openTokenModal &&
                    <ModalInputFilled
                        type="token-check"
                        value={companyToken}
                        onClose={() => setOpenTokenModal(false)}
                    />}
            </div>
            {pathName === '/master/dept' && (
                <div className="corp-token-section">
                    <p className="title is-3" onClick={handleOpenTokenModal} style={{cursor: 'pointer'}}>기업 토큰 조회</p>
                    <p className="subtitle is-7">카카오워크 내 그룹 채팅방을 생성할 수 있는 토큰을 확인합니다.</p>
                </div>
            )}
        </>
    );
}