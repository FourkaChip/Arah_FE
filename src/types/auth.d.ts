// 사용자 인증 관련 타입 정의입니다.

export interface UserDetailResponse {
    userId: number;
    email: string;
    name: string;
    position?: string;
    role: string;
    companyId?: number;
    companyName?: string;
    departmentId?: number;
    department?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserInfoResponse {
    userId: number;
    name: string;
    AdminDepartments?: string[];
    department?: string;
    role: string;
    companyId?: number;
    companyName?: string;
}

export interface ProtectedRouteProps {
    allowedRoles: string[];
    children: React.ReactNode;
}

export interface LoginButtonProps {
    label: string;
    type: 'submit' | 'button';
    onClick?: () => void;
    disabled?: boolean;
}