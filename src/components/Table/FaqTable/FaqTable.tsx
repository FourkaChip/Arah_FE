// FAQ 페이지에 적용되는 테이블 컴포넌트입니다.
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
import CustomDropDownForTag from "@/components/CustomDropdown/CustomDropDownForTag";
import {RowData} from "@/types/tables";
import Pagination from "@/components/CustomPagination/Pagination";
import {
    fetchAdminFaqList,
    fetchDeleteAdminFaq,
    fetchUpdateAdminFaq,
    fetchAdminFaqTagList
} from "@/api/admin/faq/faqFetch";
import {fetchCurrentUserInfo} from "@/api/auth/master";

export default function FaqAdminTable() {
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [openFaqModal, setOpenFaqModal] = useState(false);
    const [editRow, setEditRow] = useState<RowData | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    const checkboxRef = useRef<HTMLInputElement>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [faqData, setFaqData] = useState<RowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedTag, setSelectedTag] = useState('all');

    const [companyId, setCompanyId] = useState<number>(1);

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
        setLoading(true);
        fetchAdminFaqList(companyId)
            .then((data) => {
                setFaqData(data.map((faq: any, idx: number) => ({
                    id: faq.faq_id,
                    no: idx + 1,
                    tag: faq.tag_name || "",
                    registeredAt: faq.created_at?.slice(0, 10) || "",
                    question: faq.question,
                    answer: faq.answer,
                })));
            })
            .finally(() => setLoading(false));
    }, [companyId]);

    const handleSearch = (search: string) => {
        setSearchValue(search);
    };

    const filteredData = useMemo(() => {
        return faqData.filter(row => {
            const isTagAll = selectedTag === 'all';
            const tagMatch = isTagAll || row.tag === selectedTag;
            const matches =
                searchValue === "" ||
                row.question.includes(searchValue) ||
                row.answer.includes(searchValue);

            const registered = row.registeredAt.replace(/\//g, "-");
            const afterStart = !startDate || registered >= startDate;
            const beforeEnd = !endDate || registered <= endDate;

            return tagMatch && matches && afterStart && beforeEnd;
        });
    }, [faqData, selectedTag, searchValue, startDate, endDate]);

    const paginatedData = useMemo(
        () => filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
        [filteredData, currentPage]
    );

    const [selectedRowIds, setSelectedRowIds] = useState<Record<number, boolean>>({});

    const columns = useMemo<ColumnDef<RowData>[]>(() => [
        // {
        //     id: "select",
        //     header: () => (
        //         <input
        //             type="checkbox"
        //             ref={checkboxRef}
        //             onChange={(e) => {
        //                 const checked = e.target.checked;
        //                 const newSelections: Record<number, boolean> = {};
        //                 paginatedData.forEach((row) => {
        //                     newSelections[row.id] = checked;
        //                 });
        //                 setSelectedRowIds(newSelections);
        //             }}
        //             checked={
        //                 paginatedData.length > 0 &&
        //                 paginatedData.every((row) => selectedRowIds[row.id])
        //             }
        //         />
        //     ),
        //     cell: ({row}) => (
        //         <input
        //             type="checkbox"
        //             checked={selectedRowIds[row.original.id]}
        //             onChange={(e) =>
        //                 setSelectedRowIds((prev) => ({
        //                     ...prev,
        //                     [row.original.id]: e.target.checked,
        //                 }))
        //             }
        //         />
        //     ),
        // },
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
                                     onClick={() => {
                                         setEditRow(row.original);
                                         setOpenFaqModal(true);
                                     }}
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
            cell: ({row}) => (
                <button className="delete-icon">
                    <FontAwesomeIcon icon={faTrash}
                                     onClick={() => {
                                         setDeleteTargetId(row.original.id);
                                         setOpenDeleteModal(true);
                                     }}
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


    const pageCount = Math.ceil(filteredData.length / pageSize);

    // FAQ 삭제 핸들러
    const handleDeleteFaq = async () => {
        if (deleteTargetId == null) return;
        setLoading(true);
        try {
            await fetchDeleteAdminFaq(deleteTargetId);
            // 삭제 후 목록 새로고침
            const data = await fetchAdminFaqList(companyId);
            setFaqData(data.map((faq: any, idx: number) => ({
                id: faq.faq_id,
                no: idx + 1,
                tag: faq.tag_name || "",
                registeredAt: faq.created_at?.slice(0, 10) || "",
                question: faq.question,
                answer: faq.answer,
            })));
        } catch (e) {
            alert("FAQ 삭제에 실패했습니다.");
        } finally {
            setLoading(false);
            setOpenDeleteModal(false);
            setDeleteTargetId(null);
        }
    };

    // FAQ 수정 핸들러
    const handleUpdateFaq = async (data: { category: string; question: string; answer: string }) => {
        if (!editRow) return;
        setLoading(true);
        try {
            const tags = await fetchAdminFaqTagList(companyId);
            const tagObj = tags.find((tag: any) => tag.name === data.category);
            const tag_id = tagObj ? tagObj.tag_id : null;
            if (!tag_id) {
                alert("선택한 태그가 존재하지 않습니다.");
                return;
            }
            // fetchUpdateAdminFaq가 body로 데이터를 보내므로 FastAPI에서 DTO를 Body로 받아야 함!
            await fetchUpdateAdminFaq(editRow.id, data.question, data.answer, tag_id);
            const faqList = await fetchAdminFaqList(companyId);
            setFaqData(faqList.map((faq: any, idx: number) => ({
                id: faq.faq_id,
                no: idx + 1,
                tag: faq.tag_name || "",
                registeredAt: faq.created_at?.slice(0, 10) || "",
                question: faq.question,
                answer: faq.answer,
            })));
        } catch (e) {
            alert("FAQ 수정에 실패했습니다.");
        } finally {
            setLoading(false);
            setOpenFaqModal(false);
            setEditRow(null);
        }
    };

    return (
        <>
            <div className="admin-dataset-header">
                <div className="tag-search-section">
                    <CustomDropDownForTag onChange={setSelectedTag} companyId={companyId}/>
                    <CustomSearch
                        onSearch={handleSearch}
                    />
                </div>
                <div className="action-buttons">
                    <ModalFAQTrigger/>
                </div>
            </div>
            <div id="master-admin-table" className="master-admin-table" style={{width: "100%"}}>
                {loading ? (
                    <div style={{textAlign: "center", padding: "40px"}}>FAQ 데이터를 불러오는 중...</div>
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
                                                    <p className="faq-detail-view question">
                                                        <strong>Q.</strong> {row.original.question}</p>
                                                    <p className="faq-detail-view answer">
                                                        <strong>A.</strong> {row.original.answer}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            )))}
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
            {openDeleteModal &&
                <ModalDefault
                    type="delete-data"
                    label="삭제하시겠습니까?"
                    onClose={() => {
                        setOpenDeleteModal(false);
                        setDeleteTargetId(null);
                    }}
                    onSubmit={handleDeleteFaq}
                />
            }
            {openFaqModal &&
                <ModalFAQ
                    onClose={() => {
                        setOpenFaqModal(false);
                        setEditRow(null);
                    }}
                    onSubmit={handleUpdateFaq}
                    category={editRow?.tag}
                    question={editRow?.question}
                    answer={editRow?.answer}
                />}
        </>
    );
}