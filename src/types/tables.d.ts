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
    companyName: string;
    departmentName: string;
    createdAt: string;
}

// 회사별 관리자 목록 응답 타입
export interface CompanyAdminListResponse {
    userId: number;
    name: string;
    adminDepartments: string[]; // 부서명 리스트
}

// 관리자 상세 정보와 회사별 관리자 정보를 합친 통합 타입
export interface CombinedAdminInfo {
    userId: number;
    email?: string;
    name: string;
    position?: string;
    companyName?: string;
    departmentName?: string;
    createdAt?: string;
    adminDepartments: string[];
    departmentId?: number; // 부서 ID (부서 삭제할 때 필요)
}

// 테이블 컴포넌트에서 사용할 수 있는 통합 AdminRowType 타입
export type AdminRowType = CombinedAdminInfo;
