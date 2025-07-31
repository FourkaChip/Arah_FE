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
    docFaq: string;
    registeredAt: string;
    question: string;
    answer: string;
    feedback: string;
};

// AdminDataTable용 타입
export type AdminDataTableRowData = {
    id: number;
    no: number;
    registeredAt: string;
    updatedAt: string;
    folderName: string;
    subRows?: AdminDataTableSubRowData[];
};

export type AdminDataTableSubRowData = {
    versionId: number;
    date: string;
    name: string;
    version: string;
};

// 관리자 관리용 타입
export interface AdminListResponseDto {
    userId: number;
    email: string;
    name: string;
    position: string;
    companyName: string | null;
    departmentName: string | null;
    createdAt: string;
}