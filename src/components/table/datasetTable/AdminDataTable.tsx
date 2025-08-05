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
import ModalDataTrigger from "@/components/utils/ModalTrigger/ModalDataTrigger";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus, faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import {dummySubRows} from "@/constants/dummydata/DummySubRows";
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";
import ModalUpload from "@/components/modal/DataSet/ModalUpload/ModalUpload";
import Pagination from "@/components/customPagination/Pagination";
import {
    AdminDataTableRowData as RowData,
    AdminDataTableSubRowData as SubRowData
} from "@/types/tables";

const defaultData: RowData[] = Array.from({length: 25}, (_, i) => ({
    id: i + 1,
    no: i + 1,
    registeredAt: `2025/07/${(i % 30 + 1).toString().padStart(2, '0')}`,
    updatedAt: `2025/07/${((i + 3) % 30 + 1).toString().padStart(2, '0')}`,
    folderName: `폴더명 ${i + 1}`,
    subRows: i % 2 === 0 ? [
        {
            versionId: 112 + i,
            date: `2025/04/${(i % 30 + 1).toString().padStart(2, '0')}`,
            name: `사용자명 정의방식 ${i + 1}`,
            version: "1.0.2"
        }
    ] : undefined
}));

export default function AdminDataTable() {

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openTopRowDeleteModal, setOpenTopRowDeleteModal] = useState(false);
    const [openCommitModal, setOpenCommitModal] = useState(false);

    const checkboxRef = useRef<HTMLInputElement>(null);
    const subTableRefs = useRef<Record<number, HTMLDivElement | null>>({});

    // const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");

    const [data] = useState(() => defaultData);

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
            cell: ({row}) =>
                row.getCanExpand() ? (
                    <button
                        onClick={() =>
                            setExpandedRowId(expandedRowId === row.id ? null : row.id)
                        }
                    >
                        {expandedRowId === row.id ? "▲" : "▼"}
                    </button>
                ) : null,
        },
    ], [expandedRowId, paginatedData, selectedRowIds]);

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

    return (
        <>
            <div className="admin-dataset-header">
                <div className="date-search-section">
                    <input type="date" className="date-picker" value={startDate}
                           onChange={e => setStartDate(e.target.value)}/>
                    <span>~</span>
                    <input type="date" className="date-picker" value={endDate}
                           onChange={e => setEndDate(e.target.value)}/>
                    {/*<input type="text" className="search-input" placeholder="폴더 검색 input" />*/}
                    {/*<customSearch*/}
                    {/*    onSearch={setSearchValue}*/}
                    {/*    // className={pathName === '/master/dept' ? 'wide-search' : ''}*/}
                    {/*/>*/}
                    <CustomSearch
                        onSearch={handleSearch}
                    />
                    {/*<button className="search-button">검색</button>*/}
                    {/*<button className="button is-link" onClick={() => setOpen(true)}>*/}
                    {/*    <img src="/AddAdmin.svg" alt="icon" className="icon-left" />*/}
                    {/*    검색*/}
                    {/*</button>*/}
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
                            <React.Fragment key={row.id}>
                                <tr className={expandedRowId === row.id ? "expanded active-row" : ""}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                                <tr className="sub-table-row">
                                    <td colSpan={table.getAllLeafColumns().length}>
                                        <div
                                            className={`sub-table-wrapper animated-wrapper ${expandedRowId === row.id ? 'open' : ''}`}
                                            ref={(el) => {
                                                subTableRefs.current[Number(row.id)] = el;
                                            }}
                                        >
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
                                                {dummySubRows.map((sub, idx) => (
                                                    <tr key={sub.versionId}>
                                                        <td><input type="radio" name={`use-${row.id}`}
                                                                   defaultChecked={idx === 0}/></td>
                                                        <td>{sub.versionId}</td>
                                                        <td>{sub.date}</td>
                                                        <td>{sub.name}</td>
                                                        <td>{sub.version}</td>
                                                        <td>
                                                            {/*<button className="sub-btn">보기</button>*/}
                                                            <ModalCommitTrigger/>
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
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        )))}
                    </tbody>
                </table>
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