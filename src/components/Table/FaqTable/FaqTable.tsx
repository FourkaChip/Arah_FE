"use client";
import {useState, useMemo, useRef, useEffect} from "react";
import CustomSearch from "@/components/CustomSearch/CustomSearch";
import './FaqTable.scss';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef
} from "@tanstack/react-table";
import React from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPen, faTrash} from '@fortawesome/free-solid-svg-icons';
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import ModalFAQTrigger from "@/components/utils/ModalTrigger/ModalFAQTrigger";
import ModalFAQ from "@/components/Modal/ModalFAQ/ModalFAQ";
import CustomDropDownForDept from "@/components/CustomDropdown/CustomDropDownForDept";
import CustomDropDownForTag from "@/components/CustomDropdown/CustomDropDownForTag";
import {RowData} from "@/types/tables";
import {defaultData} from "@/constants/dummydata/DummyFaq";
import {rows} from "@/constants/dummydata/AdminList";

export default function FaqAdminTable() {

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openFaqModal, setOpenFaqModal] = useState(false);

    const checkboxRef = useRef<HTMLInputElement>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [data] = useState(() => defaultData);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedTag, setSelectedTag] = useState('all');

    const handleSearch = (search: string) => {
        setSearchValue(search);
    };
    const filteredData = useMemo(() => {
        return data.filter(row => {
            // 태그 필터 추가
            const isTagAll = selectedTag === 'all';
            const tagMatch = isTagAll || row.tag === selectedTag;

            // 기존 검색어 필터
            const matches = searchValue === "" ||
                row.tag.includes(searchValue) ||
                row.question.includes(searchValue) ||
                row.answer.includes(searchValue);

            const registered = row.registeredAt.replace(/\//g, "-");
            const afterStart = !startDate || registered >= startDate;
            const beforeEnd = !endDate || registered <= endDate;

            // 태그, 검색어, 날짜 모두 만족해야 함
            return tagMatch && matches && afterStart && beforeEnd;
        });
    }, [data, selectedTag, searchValue, startDate, endDate]);

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
            accessorKey: "tag",
            header: "태그",
            cell: info => <strong className="faq-strong">{info.getValue() as string}</strong>,
        },
        {
            accessorKey: "registeredAt",
            header: "등록일",
            cell: info => (
                <span className="faq-date">{info.getValue() as string}</span>
            ),
        },
        {
            accessorKey: "question",
            header: "질문",
        },
        {
            accessorKey: "answer",
            header: "답변",
            cell: info => {
                const answer = info.getValue() as string;
                return answer.length > 30 ? `${answer.slice(0, 30)}...` : answer;
            },
        },
        {
            id: "edit",
            header: "수정",
            cell: ({row}) => (
                <button className="edit-icon">
                    <FontAwesomeIcon icon={faPen}
                                     onClick={() => setOpenFaqModal(true)}
                                     style={{
                                         color: expandedRowId === row.id ? '#FFFFFF' : '#232D64',
                                         cursor: 'pointer',
                                         width: '16px',
                                         height: '16px'
                                     }}/>
                </button>
            ),
        },
        {
            id: "delete",
            header: "삭제",
            cell: () => (
                <button className="delete-icon">
                    <FontAwesomeIcon icon={faTrash}
                                     onClick={() => setOpenDeleteModal(true)}
                                     style={{
                                         color: 'red',
                                         cursor: 'pointer',
                                         width: '16px',
                                         height: '16px'
                                     }}/>
                </button>
            ),
        },
        {
            id: "detail",
            header: "상세",
            cell: ({row}) => (
                <button className="detail-toggle" onClick={() =>
                    setExpandedRowId(expandedRowId === row.id ? null : row.id)
                }>
                    {expandedRowId === row.id ? "▲" : "▼"}
                </button>
            ),
        },
    ], [expandedRowId, paginatedData, selectedRowIds]);

    const table = useReactTable({
        data: paginatedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
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
                <div className="tag-search-section">
                    {/*<input type="date" className="date-picker" value={startDate}*/}
                    {/*       onChange={e => setStartDate(e.target.value)}/>*/}
                    {/*<span>~</span>*/}
                    {/*<input type="date" className="date-picker" value={endDate}*/}
                    {/*       onChange={e => setEndDate(e.target.value)}/>*/}
                    <CustomDropDownForTag onChange={setSelectedTag}/>
                    <CustomSearch
                        onSearch={handleSearch}
                    />
                </div>
                <div className="action-buttons">
                    <ModalFAQTrigger/>
                    {/*<button className="button is-danger is-outlined" onClick={() => setOpenTopRowDeleteModal(true)}>*/}
                    {/*    <span>삭제</span>*/}
                    {/*    <span className="icon is-small">*/}
                    {/*    <i className="fas fa-times"></i>*/}
                    {/*    </span>*/}
                    {/*</button>*/}
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
                                <tr className="faq-expanded-row">
                                    <td colSpan={table.getAllLeafColumns().length}>
                                        <div
                                            className={`faq-detail-wrapper animated-wrapper${expandedRowId === row.id ? " open" : ""}`}
                                        >
                                            <div className="faq-detail-view">
                                                <p><strong>Q.</strong> {row.original.question}</p>
                                                <p><strong>A.</strong> {row.original.answer}</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        )))}
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
            {openDeleteModal &&
                <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
            {openFaqModal &&
                <ModalFAQ
                    onClose={() => setOpenFaqModal(false)}
                    onSubmit={(data: { category: string; question: string; answer: string }) => {
                    }}
                />}
        </>
    );
}