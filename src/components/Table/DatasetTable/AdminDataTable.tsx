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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { dummySubRows } from "@/constants/dummydata/DummySubRows";

type RowData = {
    id: number;
    no: number;
    registeredAt: string;
    updatedAt: string;
    folderName: string;
    subRows?: SubRowData[];
};

export type SubRowData = {
    versionId: number;
    date: string;
    name: string;
    version: string;
};

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

    const checkboxRef = useRef<HTMLInputElement>(null);

    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});

    const [searchValue, setSearchValue] = useState("");

    const [data] = useState(() => defaultData);

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;
    const paginatedData = useMemo(
        () => data.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
        [data, currentPage]
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
                <button className={`button add-dataset-button ${expandedMap[row.id] ? "is-inverted" : ""}`}>
                    <span className="icon is-small">
                        <FontAwesomeIcon icon={faPlus} />
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
                            setExpandedMap(prev => ({
                                ...prev,
                                [row.id]: !prev[row.id],
                            }))
                        }
                    >
                        {expandedMap[row.id] ? "▲" : "▼"}
                    </button>
                ) : null,
        },
    ], [expandedMap, paginatedData, selectedRowIds]);

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

    return (
        <>
            <div className="admin-dataset-header">
                <div className="date-search-section">
                    <input type="date" className="date-picker"/>
                    <span>~</span>
                    <input type="date" className="date-picker"/>
                    {/*<input type="text" className="search-input" placeholder="폴더 검색 input" />*/}
                    <CustomSearch
                        onSearch={setSearchValue}
                        // className={pathName === '/master/dept' ? 'wide-search' : ''}
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
                    <button className="button is-danger is-outlined">
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
                    {table.getRowModel().rows.map(row => (
                        <React.Fragment key={row.id}>
                            <tr className={expandedMap[row.id] ? "expanded active-row" : ""}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                            {expandedMap[row.id] && (
                                <tr>
                                    <td colSpan={table.getAllLeafColumns().length}>
                                        <div className="sub-table-wrapper open">
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
                                                    <td><input type="radio" name={`use-${row.id}`} defaultChecked={idx === 0} /></td>
                                                    <td>{sub.versionId}</td>
                                                    <td>{sub.date}</td>
                                                    <td>{sub.name}</td>
                                                    <td>{sub.version}</td>
                                                    <td>
                                                      <button className="sub-btn">보기</button>
                                                    </td>
                                                    <td>
                                                      <button className="sub-btn">다운로드</button>
                                                    </td>
                                                    <td>
                                                      <button className="edit-icon">
                                                        <FontAwesomeIcon icon={faPen} />
                                                      </button>
                                                    </td>
                                                    <td>
                                                      <button className="delete-icon">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                      </button>
                                                    </td>
                                                  </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                    </tbody>
                </table>
                <div className="pagination-footer">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 0))} disabled={currentPage === 0}>Prev
                    </button>
                    <span>{currentPage + 1} / {Math.ceil(data.length / pageSize)}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, Math.floor(data.length / pageSize - 1)))}
                            disabled={(currentPage + 1) * pageSize >= data.length}>Next
                    </button>
                </div>

            </div>
        </>
    );
}