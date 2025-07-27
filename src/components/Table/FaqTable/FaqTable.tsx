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

type RowData = {
    id: number;
    no: number;
    tag: string;
    registeredAt: string;
    question: string;
    answer: string;
};

const defaultData: RowData[] = [
    {
        id: 1,
        no: 1,
        tag: "일반",
        registeredAt: "2024/06/01",
        question: "서비스 이용 방법이 궁금해요.",
        answer: "서비스 이용 방법은 홈페이지 상단의 가이드를 참고해 주세요.",
    },
    {
        id: 2,
        no: 2,
        tag: "계정",
        registeredAt: "2024/06/03",
        question: "비밀번호를 잊어버렸어요.",
        answer: "로그인 화면에서 비밀번호 찾기를 통해 재설정할 수 있습니다.",
    },
    {
        id: 3,
        no: 3,
        tag: "결제",
        registeredAt: "2024/06/05",
        question: "결제 영수증은 어디서 확인하나요?",
        answer: "마이페이지 > 결제 내역에서 영수증을 확인하실 수 있습니다.",
    },
];

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
    const handleSearch = (search: string) => {
        setSearchValue(search);
    };
    const filteredData = useMemo(() => {
        return data.filter(row => {
            // For FAQ, let's just filter by tag or question
            const matches = searchValue === "" ||
                row.tag.includes(searchValue) ||
                row.question.includes(searchValue) ||
                row.answer.includes(searchValue);
            const registered = row.registeredAt.replace(/\//g, "-");
            const afterStart = !startDate || registered >= startDate;
            const beforeEnd = !endDate || registered <= endDate;
            return matches && afterStart && beforeEnd;
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
            cell: ({ row }) => (
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
            header: "상세보기",
            cell: ({ row }) => (
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