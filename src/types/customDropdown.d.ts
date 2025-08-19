export interface Tag {
    tag_id: number;
    name: string;
    company_id: number;
    created_at: string;
}

export interface DropdownOption {
    value: string;
    label: string;
}

export interface CustomDropDownTagProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
    companyId: number;
}

export interface TagDropdownState {
    tags: Tag[];
    showInputModal: boolean;
    isEditMode: boolean;
    dropdownKey: number;
}

// 드롭다운 액션 타입
export type DropdownActionType = 'add' | 'edit';

// 모달 메시지 타입
export interface ModalMessage {
    title: string;
    description: string;
}
