"use client";
import {useState, useMemo, useRef, useEffect} from "react";
import { useRouter } from "next/navigation";
import './FeedbackTable.scss';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef
} from "@tanstack/react-table";
import React from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import {FeedbackRowData} from "@/types/tables";
import {faUpRightFromSquare} from "@fortawesome/free-solid-svg-icons/faUpRightFromSquare";
import Pagination from "@/components/customPagination/Pagination";
import {fetchUnlikeFeedbackList} from "@/api/admin/feedback/feedbackFetch";
import {fetchCurrentUserInfo} from "@/api/auth/master";
import { useModalMessage } from "@/hooks/useModalMessage";

interface FeedbackApiData {
    feedback_id: number;
    chat_id: number;
    feedback_type: string;
    feedback_reason: string | null;
    feedback_content: string | null;
    answer: string;
    created_at: string;
    user_question: string;
    company_id: number;
}

export default function FeedbackTable() {
    const modalMessage = useModalMessage();
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const router = useRouter();

    const checkboxRef = useRef<HTMLInputElement>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [data, setData] = useState<FeedbackRowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [companyId, setCompanyId] = useState<number>(2); // 기본값 설정
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedTag, setSelectedTag] = useState('all');

    const [hasLoadedData, setHasLoadedData] = useState(false);

    useEffect(() => {
        const getCompanyId = async () => {
            try {
                const userInfo = await fetchCurrentUserInfo();
                if (userInfo.companyId || userInfo.company_id) {
                    setCompanyId(userInfo.companyId ?? userInfo.company_id);
                }
            } catch (error) {
                console.error('회사 정보 조회 실패:', error);
                setCompanyId(2);
            }
        };
        getCompanyId();
    }, []);

    useEffect(() => {
        if (!companyId || hasLoadedData) return;

        const loadFeedbackData = async () => {
            setLoading(true);
            try {
                const feedbackData: FeedbackApiData[] = await fetchUnlikeFeedbackList(companyId);

                const transformedData: FeedbackRowData[] = feedbackData.map((item, index) => ({
                    id: item.feedback_id,
                    no: index + 1,
                    docFaq: item.feedback_reason || "기타",
                    registeredAt: new Date(item.created_at).toLocaleDateString('ko-KR').replace(/\. /g, '/').replace('.', ''),
                    question: item.user_question || "질문 없음",
                    answer: item.answer,
                    feedback: item.feedback_content || item.feedback_reason || "피드백 없음"
                }));

                setData(transformedData);
                setHasLoadedData(true);
            } catch (error) {
                modalMessage.showError('피드백 데이터를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadFeedbackData();
    }, [companyId, hasLoadedData, modalMessage]);

    const handleSearch = (search: string) => {
        setSearchValue(search);
    };

    const filteredData = useMemo(() => {
        return data.filter(row => {
            const isTagAll = selectedTag === 'all';
            const tagMatch = isTagAll || row.docFaq === selectedTag;

            const matches = searchValue === "" ||
                row.docFaq.includes(searchValue) ||
                row.question.includes(searchValue) ||
                row.answer.includes(searchValue);

            const registered = row.registeredAt.replace(/\//g, "-");
            const afterStart = !startDate || registered >= startDate;
            const beforeEnd = !endDate || registered <= endDate;

            return tagMatch && matches && afterStart && beforeEnd;
        });
    }, [data, selectedTag, searchValue, startDate, endDate]);

    const paginatedData = useMemo(
        () => filteredData.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
        [filteredData, currentPage]
    );

    const [selectedRowIds, setSelectedRowIds] = useState<Record<number, boolean>>({});

    const columns = useMemo<ColumnDef<FeedbackRowData>[]>(() => [
        {
            accessorKey: "no",
            header: "No.",
        },
        {
            accessorKey: "docFaq",
            header: "피드백 사유",
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
            header: "FAQ 이동",
            cell: ({row}) => (
                row.original.docFaq === "FAQ" ? (
                    <button className="goto-faq-icon">
                        <FontAwesomeIcon
                            icon={faUpRightFromSquare}
                            onClick={() => router.push("/admin/faq")}
                            style={{
                                color: expandedRowId === row.id ? '#FFFFFF' : '#232D64',
                                cursor: 'pointer',
                                width: '16px',
                                height: '16px'
                            }}
                        />
                    </button>
                ) : null
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
    ], [expandedRowId, paginatedData, selectedRowIds, router]);

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

    return (
        <>
            <div className="admin-dataset-header">
            </div>
            <div id="master-admin-table" className="master-admin-table" style={{width: "100%"}}>
                {loading ? (
                    <div style={{textAlign: "center", padding: "40px"}}>피드백 데이터를 불러오는 중...</div>
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
                                    {loading ? "데이터를 불러오는 중입니다..." : "피드백 데이터가 없습니다"}
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
                                                    <p><strong>질문</strong> {row.original.question}</p>
                                                    <p className="answer"><strong>답변</strong> {row.original.answer}</p>
                                                    <p className="feedback"><strong>피드백 사유</strong> {row.original.feedback}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            )))}
                        </tbody>
                    </table>
                )}
                {/* pagination-footer 제거, Pagination 중앙 배치 */}
                <div style={{ display: "flex", justifyContent: "center", margin: "24px 0" }}>
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
                    label="완료"
                    onClose={modalMessage.closeSuccess}
                    errorMessages={[modalMessage.successMessage]}
                />
            )}
            {modalMessage.openErrorModal && (
                <ModalDefault
                    type="default"
                    label="오류"
                    onClose={modalMessage.closeError}
                    errorMessages={[modalMessage.errorMessage]}
                />
            )}
            {openDeleteModal &&
                <ModalDefault type="delete-data" label="삭제하시겠습니까?" onClose={() => setOpenDeleteModal(false)}/>}
        </>
    );
}