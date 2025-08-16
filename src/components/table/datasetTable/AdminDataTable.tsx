// 관리자 계정이 사용하는 데이터셋 관리 테이블 컴포넌트입니다.
"use client";
import {useState, useMemo, useRef, useEffect} from "react";
import CustomSearch from "@/components/customSearch/CustomSearch";
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
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";
import ModalUpload from "@/components/modal/DataSet/ModalUpload/ModalUpload";
import Pagination from "@/components/customPagination/Pagination";
import {
    AdminDataTableRowData as RowData,
} from "@/types/tables";
import {
    fetchFoldersByCompany,
    fetchVersionHistory,
    fetchDeletePdf,
    fetchCreateFolder,
    fetchUpdateFolder,
    fetchUploadPdf,
    fetchDeleteFolder,
    fetchChangeMainDocument,
    fetchUpdatePdf,
    clearFoldersCache
} from "@/api/admin/dataset/datasetFetch";
import {fetchCurrentUserInfo} from "@/api/auth/master";
import ModalInput from "@/components/modal/ModalInput/ModalInput";
import {faFile} from "@fortawesome/free-solid-svg-icons/faFile";
import {useModalMessage} from "@/hooks/useModalMessage";
import {faTimes} from "@fortawesome/free-solid-svg-icons/faTimes";

export default function AdminDataTable() {
    const modalMessage = useModalMessage();

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openTopRowDeleteModal, setOpenTopRowDeleteModal] = useState(false);
    // const [openCommitModal, setOpenCommitModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [openEditFolderModal, setOpenEditFolderModal] = useState(false);

    const checkboxRef = useRef<HTMLInputElement>(null);
    const subTableRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");

    const [data, setData] = useState<RowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyId] = useState<number>(1);

    const [folderDocuments, setFolderDocuments] = useState<Record<number, any[]>>({});
    const [loadingDocuments, setLoadingDocuments] = useState<Record<number, boolean>>({});

    const [deleteDocumentId, setDeleteDocumentId] = useState<number | null>(null);
    const [openFolderModal, setOpenFolderModal] = useState(false);
    const [openUploadModal, setOpenUploadModal] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);

    const [editingDocumentId, setEditingDocumentId] = useState<number | null>(null);
    const [editingDocumentTitle, setEditingDocumentTitle] = useState<string>('');
    const [editingFolderId, setEditingFolderId] = useState<number | null>(null);
    const [editingFolderTitle, setEditingFolderTitle] = useState<string>('');
    const [editingFolderRowId, setEditingFolderRowId] = useState<string | null>(null);

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

    useEffect(() => {
        const loadFolders = async () => {
            setLoading(true);
            try {
                const folders = await fetchFoldersByCompany();
                setData(
                    folders
                        .map((folder: any, idx: number) => ({
                            id: folder.folder_id.toString(),
                            no: idx + 1,
                            registeredAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                            updatedAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                            folderName: folder.name,
                            subRows: undefined
                        }))
                        .sort((a, b) => b.no - a.no)
                );
            } catch (error) {
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
        return data
            .sort((a, b) => b.no - a.no)
            .filter(row => {
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

    const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

    const columns = useMemo<ColumnDef<RowData>[]>(() => [
        {
            id: "select",
            header: () => (
                <input
                    type="checkbox"
                    ref={checkboxRef}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        const newSelections: Record<string, boolean> = {};
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
                    checked={selectedRowIds[row.original.id]}
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
            id: "edit-folder",
            header: "폴더명 수정",
            cell: ({row}) => (
                <button
                    className="edit-folder-btn"
                    onClick={() => {
                        setEditingFolderRowId(row.original.id.toString());
                        setEditingFolderTitle(row.original.folderName);
                        setOpenEditFolderModal(true);
                    }}
                >
                    <FontAwesomeIcon icon={faPen} style={{width: 14, height: 14}}/>
                </button>
            ),
        },
        {
            id: "add-dataset",
            header: "데이터셋 추가",
            cell: ({row}) => (
                <button
                    className={`button add-dataset-button ${expandedRowId === row.id ? "is-inverted" : ""}`}
                    onClick={() => handleAddDatasetClick(Number(row.original.id))}
                >
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

    const handleExpandFolder = async (folderId: string) => {
        const folderIdNum = Number(folderId);

        if (expandedRowId === folderId) {
            setExpandedRowId(null);
            return;
        }

        setExpandedRowId(folderId);

        if (folderDocuments[folderIdNum]) {
            return;
        }

        setLoadingDocuments(prev => ({...prev, [folderIdNum]: true}));

        try {
            const documents = await fetchVersionHistory(folderIdNum);
            setFolderDocuments(prev => ({
                ...prev,
                [folderIdNum]: documents || []
            }));
        } catch (error) {
            setFolderDocuments(prev => ({...prev, [folderIdNum]: []}));
        } finally {
            setLoadingDocuments(prev => ({...prev, [folderIdNum]: false}));
        }
    };

    const handleDeleteDocument = async () => {
        if (deleteDocumentId === null) return;

        setLoading(true);
        try {
            await fetchDeletePdf(deleteDocumentId);

            const folderId = Object.keys(folderDocuments).find(id =>
                folderDocuments[Number(id)].some(doc => doc.doc_id === deleteDocumentId)
            );

            if (folderId) {
                const folderIdNum = Number(folderId);
                const updatedDocuments = await fetchVersionHistory(folderIdNum);
                setFolderDocuments(prev => ({
                    ...prev,
                    [folderIdNum]: updatedDocuments || []
                }));
            }

            modalMessage.showSuccess('삭제 완료', '문서가 성공적으로 삭제되었습니다.');
        } catch (error) {
            modalMessage.showError('삭제 실패', '문서 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
            setOpenDeleteModal(false);
            setDeleteDocumentId(null);
        }
    };

    const handleCreateFolder = async (folderName: string) => {
        try {
            await fetchCreateFolder(folderName, companyId);

            clearFoldersCache();
            const folders = await fetchFoldersByCompany();
            setData(folders.map((folder: any, idx: number) => ({
                id: folder.folder_id.toString(),
                no: idx + 1,
                registeredAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                updatedAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                folderName: folder.name,
                subRows: undefined
            })));

            return true;
        } catch (error) {
            modalMessage.showError('폴더 생성 실패', '폴더 생성에 실패했습니다.');
            throw error;
        }
    };

    const handleUploadDataset = async (file: File, commitMessage: string, version: string) => {
        if (!selectedFolderId) {
            throw new Error('폴더가 선택되지 않았습니다.');
        }

        try {
            const title = file.name.replace('.pdf', '');

            const result = await fetchUploadPdf(
                file,
                title,
                version,
                selectedFolderId,
                commitMessage
            );

            const updatedDocuments = await fetchVersionHistory(selectedFolderId);
            setFolderDocuments(prev => ({
                ...prev,
                [selectedFolderId]: updatedDocuments || []
            }));

            modalMessage.showSuccess('업로드 완료', '데이터셋이 성공적으로 업로드되었습니다.');
            return result;
        } catch (error) {
            modalMessage.showError('업로드 실패', '데이터셋 업로드에 실패했습니다.');
            throw error;
        }
    };

    const handleAddDatasetClick = (folderId: number) => {
        const selectedFolder = data.find(folder => String(folder.id) === String(folderId));
        setSelectedFolderId(folderId);
        setSelectedFolderName(selectedFolder?.folderName || null);
        setOpenUploadModal(true);
    };

    const handleDeleteSelectedFolders = async () => {
        const selectedFolderIds = Object.keys(selectedRowIds)
            .filter(id => selectedRowIds[id])
            .map(id => Number(id));

        if (selectedFolderIds.length === 0) {
            alert('삭제할 폴더를 선택해주세요.');
            return;
        }

        setLoading(true);
        try {
            await Promise.all(
                selectedFolderIds.map(folderId => fetchDeleteFolder(folderId))
            );

            clearFoldersCache();
            const folders = await fetchFoldersByCompany();
            setData(folders.map((folder: any, idx: number) => ({
                id: folder.folder_id.toString(),
                no: idx + 1,
                registeredAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                updatedAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                folderName: folder.name,
                subRows: undefined
            })));

            setSelectedRowIds({});

            setFolderDocuments(prev => {
                const newFolderDocuments = {...prev};
                selectedFolderIds.forEach(id => {
                    delete newFolderDocuments[id];
                });
                return newFolderDocuments;
            });

            modalMessage.showSuccess('삭제 완료', `${selectedFolderIds.length}개의 폴더가 성공적으로 삭제되었습니다.`);
        } catch (error) {
            modalMessage.showError('삭제 실패', '폴더 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
            setOpenTopRowDeleteModal(false);
        }
    };

    const handleChangeMainDocument = async (docId: number, folderId: number) => {
        try {
            setLoading(true);
            await fetchChangeMainDocument(docId, folderId);

            const updatedDocuments = await fetchVersionHistory(folderId);
            setFolderDocuments(prev => ({
                ...prev,
                [folderId]: updatedDocuments || []
            }));

            modalMessage.showSuccess('변경 완료', '메인 데이터셋이 성공적으로 변경되었습니다.');
        } catch (error) {
            modalMessage.showError('변경 실패', '메인 데이터셋 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDocument = async (newTitle: string) => {
        if (!editingDocumentId) {
            throw new Error('수정할 문서가 선택되지 않았습니다.');
        }

        try {
            await fetchUpdatePdf(editingDocumentId, newTitle);

            if (editingFolderId) {
                const updatedDocuments = await fetchVersionHistory(editingFolderId);
                setFolderDocuments(prev => ({
                    ...prev,
                    [editingFolderId]: updatedDocuments || []
                }));
            }

            modalMessage.showSuccess('이름 변경 완료', '데이터셋 이름이 성공적으로 변경되었습니다.');
            return true;
        } catch (error) {
            modalMessage.showError('이름 변경 실패', '데이터셋 이름 변경에 실패했습니다.');
            throw error;
        }
    };

    const handleEditClick = (docId: number, currentTitle: string, folderId: number) => {
        setEditingDocumentId(docId);
        setEditingDocumentTitle(currentTitle);
        setEditingFolderId(folderId);
        setOpenEditModal(true);
    };

    const handleOpenFile = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
        if (field === 'startDate') {
            setStartDate(value);
            if (endDate && endDate < value) {
                setEndDate(value);
            }
        } else if (field === 'endDate') {
            if (value < startDate) {
                return;
            }
            setEndDate(value);
        }
    };

    const handleUpdateFolder = async (newTitle: string) => {
        if (!editingFolderRowId) return;
        try {
            setLoading(true);
            await fetchUpdateFolder(Number(editingFolderRowId), newTitle);
            clearFoldersCache();
            const folders = await fetchFoldersByCompany();
            setData(
                folders.map((folder: any, idx: number) => ({
                    id: folder.folder_id.toString(),
                    no: idx + 1,
                    registeredAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                    updatedAt: folder.created_at?.slice(0, 10).replace(/-/g, '/') || "",
                    folderName: folder.name,
                    subRows: undefined
                }))
            );
            modalMessage.showSuccess('폴더명 변경 완료', '폴더명이 성공적으로 변경되었습니다.');
            setOpenEditFolderModal(false);
            setEditingFolderRowId(null);
            setEditingFolderTitle('');
        } catch (error) {
            modalMessage.showError('폴더명 변경 실패', '폴더명 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="admin-dataset-header">
                <div className="date-search-section">
                    <input
                        type="date"
                        className="date-picker"
                        value={startDate}
                        onChange={e => handleDateChange('startDate', e.target.value)}
                    />
                    <span>~</span>
                    <input
                        type="date"
                        className="date-picker"
                        value={endDate}
                        onChange={e => handleDateChange('endDate', e.target.value)}
                        min={startDate}
                    />
                    <CustomSearch
                        onSearch={handleSearch}
                    />
                </div>
                <div className="action-buttons">
                    <button className="create-folder" onClick={() => setOpenFolderModal(true)}>
                        <FontAwesomeIcon icon={faFile} style={{width: 20, height: 20, marginRight: 10}}/>
                        폴더 생성
                    </button>
                    <button className="delete-folder" onClick={() => setOpenTopRowDeleteModal(true)}>
                        <FontAwesomeIcon icon={faTimes} style={{width: 20, height: 20, marginRight: 10}}/>
                        <span>폴더 삭제</span>
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
                                                                <th>파일명</th>
                                                                <th>파일명 수정</th>
                                                                <th>버전</th>
                                                                <th>변경사항</th>
                                                                <th>미리보기</th>
                                                                <th>삭제</th>
                                                            </tr>
                                                            </thead>
                                                            <tbody>
                                                            {documents.length === 0 ? (
                                                                <tr>
                                                                    <td colSpan={9}
                                                                        style={{textAlign: "center", padding: "20px"}}>
                                                                        등록된 문서가 없습니다
                                                                    </td>
                                                                </tr>
                                                            ) : (
                                                                documents.map((doc, idx) => (
                                                                    <tr key={doc.doc_id}>
                                                                        <td>
                                                                            <input
                                                                                type="radio"
                                                                                name={`use-${folderId}`}
                                                                                checked={doc.is_used || false}
                                                                                onChange={() => handleChangeMainDocument(doc.doc_id, folderId)}
                                                                            />
                                                                        </td>
                                                                        <td>{idx + 1}</td>
                                                                        <td>{doc.created_at?.slice(0, 10).replace(/-/g, '/') || ""}</td>
                                                                        <td>{doc.title}</td>
                                                                        <td>
                                                                            <button className="edit-icon">
                                                                                <FontAwesomeIcon icon={faPen}
                                                                                                 onClick={() => handleEditClick(doc.doc_id, doc.title, folderId)}
                                                                                                 style={{
                                                                                                     color: '#232D64',
                                                                                                     cursor: 'pointer',
                                                                                                     width: '14px',
                                                                                                     height: '14px'
                                                                                                 }}/>
                                                                            </button>
                                                                        </td>
                                                                        <td>{doc.version}</td>
                                                                        <td>
                                                                            <ModalCommitTrigger
                                                                                docId={doc.doc_id}
                                                                                folderId={folderId}
                                                                            />
                                                                        </td>
                                                                        <td>
                                                                            <button
                                                                                className="sub-btn"
                                                                                onClick={() => handleOpenFile(doc.url)}
                                                                            >
                                                                                미리보기
                                                                            </button>
                                                                        </td>
                                                                        <td>
                                                                            <button className="delete-icon">
                                                                                <FontAwesomeIcon icon={faTrash}
                                                                                                 onClick={() => {
                                                                                                     setDeleteDocumentId(doc.doc_id);
                                                                                                     setOpenDeleteModal(true);
                                                                                                 }}
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
                <div style={{display: "flex", justifyContent: "center", margin: "24px 0"}}>
                    <Pagination
                        currentPage={currentPage + 1}
                        totalPages={pageCount}
                        onPageChange={(page) => setCurrentPage(page - 1)}
                    />
                </div>
            </div>
            {modalMessage.openSuccessModal && (
                <ModalDefault
                    type="default"
                    label={
                        modalMessage.successTitle && modalMessage.successTitle !== "성공"
                            ? modalMessage.successTitle
                            : "작업 완료"
                    }
                    description={
                        modalMessage.successDescription
                            ? modalMessage.successDescription
                            : modalMessage.successTitle && modalMessage.successTitle !== "성공"
                                ? ""
                                : "작업이 성공적으로 처리되었습니다."
                    }
                    onClose={modalMessage.closeSuccess}
                />
            )}
            {modalMessage.openErrorModal && (
                <ModalDefault
                    type="default"
                    label={
                        modalMessage.errorTitle && modalMessage.errorTitle !== "오류"
                            ? modalMessage.errorTitle
                            : "오류"
                    }
                    description={
                        modalMessage.errorDescription
                            ? modalMessage.errorDescription
                            : modalMessage.errorTitle && modalMessage.errorTitle !== "오류"
                                ? ""
                                : "작업 처리 중 오류가 발생했습니다."
                    }
                    onClose={modalMessage.closeError}
                />
            )}
            {openDeleteModal &&
                <ModalDefault
                    type="delete-data"
                    label="선택한 문서를 삭제하시겠습니까?"
                    onClose={() => {
                        setOpenDeleteModal(false);
                        setDeleteDocumentId(null);
                    }}
                    onSubmit={handleDeleteDocument}
                />}
            {openTopRowDeleteModal &&
                <ModalDefault
                    type="delete-data"
                    label="선택한 폴더를 삭제하시겠습니까?"
                    onClose={() => setOpenTopRowDeleteModal(false)}
                    onSubmit={handleDeleteSelectedFolders}
                />}
            {openEditModal && (
                <ModalInput
                    modalType="edit-dataset"
                    onClose={() => {
                        setOpenEditModal(false);
                        setEditingDocumentId(null);
                        setEditingDocumentTitle('');
                        setEditingFolderId(null);
                    }}
                    onSubmit={handleUpdateDocument}
                    defaultValue={editingDocumentTitle}
                />
            )}
            {openFolderModal && (
                <ModalInput
                    modalType="folder"
                    onClose={() => setOpenFolderModal(false)}
                    onSubmit={handleCreateFolder}
                />
            )}
            {openUploadModal && (
                <ModalUpload
                    onClose={() => {
                        setOpenUploadModal(false);
                        setSelectedFolderId(null);
                        setSelectedFolderName(null);
                    }}
                    folderId={selectedFolderId}
                    folderName={selectedFolderName}
                    onSubmit={handleUploadDataset}
                />
            )}
            {openEditFolderModal && (
                <ModalInput
                    modalType="edit-folder"
                    onClose={() => {
                        setOpenEditFolderModal(false);
                        setEditingFolderRowId(null);
                        setEditingFolderTitle('');
                    }}
                    onSubmit={handleUpdateFolder}
                    defaultValue={editingFolderTitle}
                />
            )}
        </>
    );
}