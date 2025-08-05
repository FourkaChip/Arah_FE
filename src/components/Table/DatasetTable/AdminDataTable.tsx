"use client";
import {useState, useMemo, useRef, useEffect} from "react";
import CustomSearch from "@/components/CustomSearch/CustomSearch";
import './AdminDataTable.scss';
import '@/app/(Master)/master/(after-login)/manage/ManageAdmin.scss';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getExpandedRowModel,
    ColumnDef
} from "@tanstack/react-table";
import React from "react";
import ModalDataTrigger from "@/components/utils/ModalTrigger/ModalDataTrigger";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";
import ModalUpload from "@/components/Modal/DataSet/ModalUpload/ModalUpload";
import Pagination from "@/components/CustomPagination/Pagination";
import {
    AdminDataTableRowData as RowData,
} from "@/types/tables";
import {fetchFoldersByCompany, fetchVersionHistory} from "@/api/admin/feedback/datasetFetch";
import {fetchCurrentUserInfo} from "@/api/auth/master";

export default function AdminDataTable() {

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openTopRowDeleteModal, setOpenTopRowDeleteModal] = useState(false);
    const [openCommitModal, setOpenCommitModal] = useState(false);

    const checkboxRef = useRef<HTMLInputElement>(null);
    const subTableRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");

    const [data, setData] = useState<RowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyId] = useState<number>(1);

    // 폴더별 문서 데이터를 저장하는 상태 추가
    const [folderDocuments, setFolderDocuments] = useState<Record<number, any[]>>({});
    const [loadingDocuments, setLoadingDocuments] = useState<Record<number, boolean>>({});

    // 회사 ID 가져오기
    useEffect(() => {
        const getCompanyId = async () => {
            try {
                const userInfo = await fetchCurrentUserInfo();
                if (userInfo.companyId || userInfo.company_id) {
                    setCompanyId(userInfo.companyId ?? userInfo.company_id);
                }
            } catch {
                setCompanyId(1);
            }
        };
        getCompanyId();
    }, []);

    // 폴더 데이터 가져오기
    useEffect(() => {
        const loadFolders = async () => {
            setLoading(true);
            try {
                const folders = await fetchFoldersByCompany();
                console.log('받아온 폴더 데이터:', folders); // 디버깅용
                setData(folders.map((folder: any, idx: number) => ({
                    id: folder.folder_id.toString(), // string으로 변환
                    no: idx + 1,
                    registeredAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                    updatedAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                    folderName: folder.name,
                    subRows: undefined
                })));
            } catch (error) {
                console.error('폴더 데이터 로딩 실패:', error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        if (companyId) {
            loadFolders();
        }
    }, [companyId]);

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const handleSearch = (search: string) => {
        setSearchValue(search);
    };
    const filteredData = useMemo(() => {
        return data.filter(row => {
            const matchesFolder = searchValue === "" || row.folderName.includes(searchValue);
            const updated = row.updatedAt.replace(/\//g, "-");
            const afterStart = !startDate || updated >= startDate;
            const beforeEnd = !endDate || updated <= endDate;
            return matchesFolder && afterStart && beforeEnd;
        });
    }, [data, searchValue, startDate, endDate]);

    const paginatedData = useMemo(
        () => filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
        [filteredData, currentPage]
    );

    const [selectedRowIds, setSelectedRowIds] = useState<Record<number, boolean>>({});

    const columns = useMemo<ColumnDef<RowData>[]>(() => [
        {
            id: "select",
            header: () => (
                <input
                    type="checkbox"
                    ref={checkboxRef}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        const newSelections: Record<number, boolean> = {};
                        paginatedData.forEach((row) => {
                            newSelections[row.id] = checked;
                        });
                        setSelectedRowIds(newSelections);
                    }}
                    checked={
                        paginatedData.length > 0 &&
                        paginatedData.every((row) => selectedRowIds[row.id])
                    }
                />
            ),
            cell: ({row}) => (
                <input
                    type="checkbox"
                    checked={!!selectedRowIds[row.original.id]}
                    onChange={(e) =>
                        setSelectedRowIds((prev) => ({
                            ...prev,
                            [row.original.id]: e.target.checked,
                        }))
                    }
                />
            ),
        },
        {
            accessorKey: "no",
            header: "No.",
        },
        {
            accessorKey: "registeredAt",
            header: "등록일",
        },
        {
            accessorKey: "updatedAt",
            header: "최종 수정일",
        },
        {
            accessorKey: "folderName",
            header: "폴더명",
            cell: info => info.getValue(),
        },
        {
            id: "add-dataset",
            header: "데이터셋 추가",
            cell: ({row}) => (
                <button className={`button add-dataset-button ${expandedRowId === row.id ? "is-inverted" : ""}`}>
                    <span className="icon is-small">
                        <FontAwesomeIcon icon={faPlus}/>
                    </span>
                </button>
            ),
        },
        {
            id: "expander",
            header: "상세보기",
            cell: ({row}) => {
                console.log('Expander cell, row.id:', row.id, 'row.original.id:', row.original.id); // 디버깅용
                return (
                    <button
                        onClick={() => handleExpandFolder(row.original.id.toString())}
                    >
                        {expandedRowId === row.original.id.toString() ? "▲" : "▼"}
                    </button>
                );
            },
        },
    ], [expandedRowId, paginatedData, selectedRowIds, folderDocuments, loadingDocuments]);

    const table = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getRowCanExpand: row => !!row.subRows
    });

    useEffect(() => {
        if (checkboxRef.current) {
            checkboxRef.current.indeterminate =
                paginatedData.some((row) => selectedRowIds[row.id]) &&
                !paginatedData.every((row) => selectedRowIds[row.id]);
        }
    }, [paginatedData, selectedRowIds]);


    const pageCount = Math.ceil(filteredData.length / pageSize);

    // 폴더 확장 시 문서 데이터 로드
    const handleExpandFolder = async (folderId: string) => {
        console.log('handleExpandFolder 호출됨, folderId:', folderId); // 디버깅용
        const folderIdNum = Number(folderId);
        console.log('변환된 folderIdNum:', folderIdNum); // 디버깅용

        if (expandedRowId === folderId) {
            setExpandedRowId(null);
            return;
        }

        setExpandedRowId(folderId);

        // 이미 로드된 데이터가 있으면 재로드하지 않음
        if (folderDocuments[folderIdNum]) {
            return;
        }

        setLoadingDocuments(prev => ({ ...prev, [folderIdNum]: true }));

        try {
            console.log('fetchVersionHistory 호출, folder_id:', folderIdNum); // 디버깅용
            const documents = await fetchVersionHistory(folderIdNum);
            setFolderDocuments(prev => ({
                ...prev,
                [folderIdNum]: documents || []
            }));
        } catch (error) {
            console.error(`폴더 ${folderIdNum} 문서 로딩 실패:`, error);
            setFolderDocuments(prev => ({ ...prev, [folderIdNum]: [] }));
        } finally {
            setLoadingDocuments(prev => ({ ...prev, [folderIdNum]: false }));
        }
    };

    return (
        <>
            <div className="admin-dataset-header">
                <div className="date-search-section">
                    <input type="date" className="date-picker" value={startDate}
                           onChange={e => setStartDate(e.target.value)}/>
                    <span>~</span>
                    <input type="date" className="date-picker" value={endDate}
                           onChange={e => setEndDate(e.target.value)}/>
                    <CustomSearch
                        onSearch={handleSearch}
                    />
                </div>
                <div className="action-buttons">
                    {/*<button className="create-folder">폴더 생성</button>*/}
                    <ModalDataTrigger buttonText="폴더 생성"/>
                    {/*<button className="delete-folder">삭제</button>*/}
                    <button className="button is-danger is-outlined" onClick={() => setOpenTopRowDeleteModal(true)}>
                        <span>삭제</span>
                        <span className="icon is-small">
                        <i className="fas fa-times"></i>
                        </span>
                    </button>
                </div>
            </div>
            <div id="master-admin-table" className="master-admin-table" style={{width: "100%"}}>
                {loading ? (
                    <div style={{textAlign: "center", padding: "40px"}}>폴더 데이터를 불러오는 중...</div>
                ) : (
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
                            table.getRowModel().rows.map(row => {
                                const folderId = Number(row.original.id);
                                console.log('테이블 렌더링, row.original.id:', row.original.id, 'folderId:', folderId); // 디버깅용
                                const documents = folderDocuments[folderId] || [];
                                const isLoadingDocs = loadingDocuments[folderId];

                                return (
                                    <React.Fragment key={row.id}>
                                        <tr className={expandedRowId === row.original.id.toString() ? "expanded active-row" : ""}>
                                            {row.getVisibleCells().map(cell => (
                                                <td key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr className="sub-table-row">
                                            <td colSpan={table.getAllLeafColumns().length}>
                                                <div
                                                    className={`sub-table-wrapper animated-wrapper ${expandedRowId === row.original.id.toString() ? 'open' : ''}`}
                                                    ref={(el) => {
                                                        subTableRefs.current[folderId] = el;
                                                    }}
                                                >
                                                    {isLoadingDocs ? (
                                                        <div style={{textAlign: "center", padding: "20px"}}>
                                                            문서 데이터를 불러오는 중...
                                                        </div>
                                                    ) : (
                                                        <table className="sub-table">
                                                            <thead>
                                                            <tr>
                                                                <th>사용현황</th>
                                                                <th>No.</th>
                                                                <th>버전 등록일</th>
                                                                <th>데이터셋명</th>
                                                                <th>버전</th>
                                                                <th>변경사항</th>
                                                                <th>다운로드</th>
                                                                <th>정보 수정</th>
                                                                <th>삭제</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {documents.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={9} style={{textAlign: "center", padding: "20px"}}>
                                                                        등록된 문서가 없습니다
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                documents.map((doc, idx) => (
                                                                    <tr key={doc.doc_id}>
                                                                        <td>
                                                                            <input
                                                                                type="radio"
                                                                                name={`use-${row.id}`}
                                                                                defaultChecked={doc.is_used || idx === 0}
                                                                            />
                                                                        </td>
                                                                        <td>{idx + 1}</td>
                                                                        <td>{doc.created_at?.slice(0, 10).replace(/-/g, '/') || ""}</td>
                                                                        <td>{doc.title}</td>
                                                                        <td>{doc.version}</td>
                                                                        <td>
                                                                            <ModalCommitTrigger docId={doc.doc_id} />
                                                                        </td>
                                                                        <td>
                                                                            <button className="sub-btn">다운로드</button>
                                                                        </td>
                                                                        <td>
                                                                            <button className="edit-icon">
                                                                                <FontAwesomeIcon icon={faPen}
                                                                                                 onClick={() => setOpenCommitModal(true)}
                                                                                                 style={{
                                                                                                     color: '#232D64',
                                                                                                     cursor: 'pointer',
                                                                                                     width: '14px',
                                                                                                     height: '14px'
                                                                                                 }}/>
                                                                            </button>
                                                                        </td>
                                                                        <td>
                                                                            <button className="delete-icon">
                                                                                <FontAwesomeIcon icon={faTrash}
                                                                                                 onClick={() => setOpenDeleteModal(true)}
                                                                                                 style={{
                                                                                                     color: 'red',
                                                                                                     cursor: 'pointer',
                                                                                                     width: '14px',
                                                                                                     height: '14px'
                                                                                                 }}/>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            )}
                                                            </tbody>
                                                        </table>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    </React.Fragment>
                                );
                            }))}
                        </tbody>
                    </table>
                )}
                {/* pagination-footer 제거, Pagination 중앙 배치 */}
                <div style={{display: "flex", justifyContent: "center", margin: "24px 0"}}>
                    <Pagination
                        currentPage={currentPage + 1}
                        totalPages={pageCount}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </div>
            </div>
            {openDeleteModal &&
                <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
            {openTopRowDeleteModal &&
                <ModalDefault type="delete-data" label="선택한 폴더를 삭제하시겠습니까?"
                              onClose={() => setOpenTopRowDeleteModal(false)}/>}
            {/* 현재는 따로 파일 props를 받는 로직이 없기 때문에, 차후 API 연결 후 DB 조회가 성립되면 ModalUpload와 연계하여 커밋 수정을 구현할 예정입니다. */}
            {openCommitModal &&
                <ModalUpload onClose={() => setOpenCommitModal(false)}/>}
        </>
    );
}