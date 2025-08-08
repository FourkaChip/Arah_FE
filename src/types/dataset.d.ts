// 데이터셋 관리에 사용되는 interface와 타입 정의입니다.
export interface ModalCommitTriggerProps {
    docId?: number;
    folderId?: number;
}

// 피드백 데이터의 타입 정의입니다.
export interface FeedbackRowData {
    id?: number;
    feedback_id: number;
    chat_id: number;
    feedback_type: string;
    answer: string;
    feedback_content: string | null;
    feedback_reason: string | null;
    created_at: string;
    company_id: number;
    question: string;
    chat_type: string;
}