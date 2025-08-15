// 피드백 페이지에 사용되는 테이블 컴포넌트입니다.
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
import { FeedbackRowData } from "@/types/dataset";
import {faUpRightFromSquare} from "@fortawesome/free-solid-svg-icons/faUpRightFromSquare";
import Pagination from "@/components/customPagination/Pagination";
import {fetchUnlikeFeedbackList, clearUnlikeFeedbackCache, deleteFeedback} from "@/api/admin/feedback/feedbackFetch";
import {fetchCurrentUserInfo} from "@/api/auth/master";
import {useModalMessage} from "@/hooks/useModalMessage";
import { FEEDBACK_REASON_MAPPING } from "@/utils/apiUtils";

// 피드백 사유 한국어로 변환
const getFeedbackReasonKorean = (feedbackReason: string | null | undefined): string => {
    if (!feedbackReason) return '사유 없음';
    return FEEDBACK_REASON_MAPPING[feedbackReason as keyof typeof FEEDBACK_REASON_MAPPING] || feedbackReason;
};

export default function FaqAdminTable() {
    const modalMessage = useModalMessage();
    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const router = useRouter();

    const checkboxRef = useRef<HTMLInputElement>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [data, setData] = useState<FeedbackRowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 8;
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedTag, setSelectedTag] = useState('all');

    useEffect(() => {
        const loadFeedbackData = async () => {
            try {
                setLoading(true);
                const userInfo = await fetchCurrentUserInfo();
                const feedbackList = await fetchUnlikeFeedbackList(userInfo.companyId);
                const dataWithId = feedbackList.map(item => ({
                    ...item,
                    id: item.feedback_id
                }));
                setData(dataWithId);
            } catch (error) {
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        loadFeedbackData();
    }, []);

    const handleSearch = (search: string) => {
        setSearchValue(search);
    };

    const filteredData = useMemo(() => {
        return data
            .sort((a, b) => b.feedback_id - a.feedback_id)
            .filter(row => {
                const isTagAll = selectedTag === 'all';
                const tagMatch = isTagAll || row.chat_type === selectedTag;

                const matches = searchValue === "" ||
                    row.chat_type.includes(searchValue) ||
                    row.question.includes(searchValue) ||
                    row.answer.includes(searchValue);

                const createdDate = new Date(row.created_at).toISOString().split('T')[0];
                const afterStart = !startDate || createdDate >= startDate;
                const beforeEnd = !endDate || createdDate <= endDate;

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
            accessorKey: "feedback_id",
            header: "No.",
        },
        {
            accessorKey: "chat_type",
            header: "태그",
            cell: info => <strong className="faq-strong">{info.getValue() as string}</strong>,
        },
        {
            accessorKey: "created_at",
            header: "등록일",
            cell: info => (
                <span className="faq-date">
                    {new Date(info.getValue() as string).toLocaleDateString('ko-KR')}
                </span>
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
                row.original.chat_type === "FAQ" ? (
                    <button className="goto-faq-icon">
                        <FontAwesomeIcon
                            icon={faUpRightFromSquare}
                            onClick={() => {
                                const faqId = row.original.faq_id;
                                const url = `/admin/faq?faqId=${faqId}&expanded=true`;
                                router.push(url);
                            }}
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
            cell: ({row}) => (
                <button className="delete-icon">
                    <FontAwesomeIcon icon={faTrash}
                                     onClick={() => {
                                         setDeleteTargetId(row.original.feedback_id);
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
                paginatedData.some((row) => selectedRowIds[row.feedback_id]) &&
                !paginatedData.every((row) => selectedRowIds[row.feedback_id]);
        }
    }, [paginatedData, selectedRowIds]);

    const pageCount = Math.ceil(filteredData.length / pageSize);

    const handleDeleteFeedback = async () => {
        if (deleteTargetId === null) return;

        setLoading(true);
        try {
            await deleteFeedback(deleteTargetId);

            const userInfo = await fetchCurrentUserInfo();
            clearUnlikeFeedbackCache(userInfo.companyId);
            const feedbackList = await fetchUnlikeFeedbackList(userInfo.companyId);
            const dataWithId = feedbackList.map(item => ({
                ...item,
                id: item.feedback_id
            }));
            setData(dataWithId);

            modalMessage.showSuccess('삭제 완료', '피드백이 성공적으로 삭제되었습니다.');
        } catch (error) {
            modalMessage.showError('삭제 실패', '피드백 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
            setOpenDeleteModal(false);
            setDeleteTargetId(null);
        }
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <>
            <div className="admin-dataset-header">
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
                                                <p><strong>질문</strong> {row.original.question}</p>
                                                <p className="answer"><strong>답변</strong> {row.original.answer}</p>
                                                <p className="feedback">
                                                    <strong>사유</strong> {getFeedbackReasonKorean(row.original.feedback_content || row.original.feedback_reason)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </React.Fragment>
                        )))}
                    </tbody>
                </table>
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
                    label={modalMessage.successTitle}
                    description={modalMessage.successDescription}
                    onClose={modalMessage.closeSuccess}
                />
            )}
            {modalMessage.openErrorModal && (
                <ModalDefault
                    type="default"
                    label={modalMessage.errorTitle}
                    description={modalMessage.errorDescription}
                    onClose={modalMessage.closeError}
                />
            )}
            {openDeleteModal &&
                <ModalDefault
                    type="delete-data"
                    label="삭제하시겠습니까?"
                    onClose={() => {
                        setOpenDeleteModal(false);
                        setDeleteTargetId(null);
                    }}
                    onSubmit={handleDeleteFeedback}
                />}
        </>
    );
}
