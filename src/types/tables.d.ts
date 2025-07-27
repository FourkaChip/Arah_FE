// 테이블에 사용되는 타입을 정의해놓은 파일입니다.
export type RowData = {
    id: number;
    no: number;
    tag: string;
    registeredAt: string;
    question: string;
    answer: string;
};

export type FeedbackRowData = {
    id: number;
    no: number;
    tag: string;
    registeredAt: string;
    question: string;
    answer: string;
    feedback: string;
};