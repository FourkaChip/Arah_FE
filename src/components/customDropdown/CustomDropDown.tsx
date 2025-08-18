import React, {useEffect, useState} from "react";
import Select, {SingleValue} from "react-select";
import {fetchAdminFaqTagList, fetchAddAdminFaqTag, fetchDeleteAdminFaqTag} from "@/api/admin/faq/faqFetch";
import ModalInput from "@/components/modal/ModalInput/ModalInput";
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import {useModalMessage} from "@/hooks/useModalMessage";
import {Tag, DropdownOption, CustomDropDownTagProps} from "@/types/customDropdown";
import {
    DROPDOWN_ACTIONS,
    DROPDOWN_LABELS,
    MODAL_MESSAGES,
    DELETE_BUTTON_SYMBOL
} from "@/constants/customDropdownConfig";
import "./CustomDropDown.scss";

export default function CustomDropDown({
    value,
    onChange,
    companyId,
}: CustomDropDownTagProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [showInputModal, setShowInputModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [dropdownKey] = useState(0);
    const {
        openErrorModal,
        errorTitle,
        errorDescription,
        showError,
        closeError,
    } = useModalMessage();

    useEffect(() => {
        fetchAdminFaqTagList()
            .then((tagList) => {
                setTags(tagList);
            })
            .catch((error) => {
                console.error("태그 목록 조회 실패:", error);
                showError(MODAL_MESSAGES.TAG_FETCH_ERROR.title, MODAL_MESSAGES.TAG_FETCH_ERROR.description);
            });
    }, [companyId, showError]);

    const formatOptionLabel = (option: DropdownOption) => {
        // 편집 모드에서 태그 삭제 버튼 표시
        if (isEditMode && option.value !== DROPDOWN_ACTIONS.ADD && option.value !== DROPDOWN_ACTIONS.EDIT) {
            const tag = tags.find(t => t.name === option.value);
            
            // 태그 ID를 추출
            const tagId = tag?.tag_id;
            
            return (
                <div className="dropdown-option-container">
                    <span>{option.label}</span>
                    <button
                        className="delete-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (tag && tagId) {
                                handleDeleteTag(tagId);
                            } else {
                            }
                        }}
                    >
                        {DELETE_BUTTON_SYMBOL}
                    </button>
                </div>
            );
        }
        
        // 특별한 액션들에 아이콘 추가
        if (option.value === DROPDOWN_ACTIONS.ADD) {
            return (
                <span className="dropdown-option-add">
                    <span style={{ marginRight: '8px' }}>➕</span>
                    태그 추가
                </span>
            );
        }
        
        if (option.value === DROPDOWN_ACTIONS.EDIT) {
            return (
                <span className="dropdown-option-with-icon">
                    <span>태그 편집</span>
                    <i className="fa-solid fa-gear"></i>
                </span>
            );
        }
        
        return option.label;
    };

    const getCategoryOptions = (): DropdownOption[] => {
        if (isEditMode) {
            return [
                ...tags.map((tag) => ({value: tag.name, label: tag.name})),
                {value: DROPDOWN_ACTIONS.ADD, label: "태그 추가"}
            ];
        } else {
            return [
                ...tags.map((tag) => ({value: tag.name, label: tag.name})),
                {value: DROPDOWN_ACTIONS.EDIT, label: "태그 편집"}
            ];
        }
    };

    const selectedOption = value ? {value, label: value} : null;

    const handleCategoryChange = (selected: SingleValue<DropdownOption>) => {
        if (selected?.value === DROPDOWN_ACTIONS.ADD) {
            setShowInputModal(true);
        } else if (selected?.value === DROPDOWN_ACTIONS.EDIT) {
            setIsEditMode(true);
            // 드롭다운을 닫지 않고 편집 모드로 전환
        } else if (!isEditMode) {
            onChange(selected?.value ?? "");
        }
    };

    const handleAddTag = async (tagName: string) => {
        try {
            await fetchAddAdminFaqTag(companyId, tagName);
            const tagList = await fetchAdminFaqTagList();
            setTags(tagList);
            onChange(tagName);
            // 편집 모드는 유지하되 모달만 닫기
        } catch {
            showError(MODAL_MESSAGES.TAG_ADD_ERROR.title, MODAL_MESSAGES.TAG_ADD_ERROR.description);
        } finally {
            setShowInputModal(false);
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        try {
            await fetchDeleteAdminFaqTag(tagId);
            const tagList = await fetchAdminFaqTagList();
            setTags(tagList);
            // 현재 선택된 태그가 삭제된 경우 선택 해제
            const deletedTag = tags.find(tag => tag.tag_id === tagId);
            if (deletedTag && value === deletedTag.name) {
                onChange("");
            }
        } catch (error) {
            console.error("태그 삭제 실패:", error);
            // 에러 메시지가 있으면 그것을 사용하고, 없으면 기본 메시지 사용
            const errorMessage = error instanceof Error ? error.message : MODAL_MESSAGES.TAG_DELETE_ERROR.description;
            showError(MODAL_MESSAGES.TAG_DELETE_ERROR.title, errorMessage);
        }
    };

    return (
        <div className="custom-dropdown-container">
            <Select
                className="basic-single"
                classNamePrefix="select"
                key={dropdownKey}
                options={getCategoryOptions()}
                value={isEditMode ? null : selectedOption}
                onChange={handleCategoryChange}
                placeholder={DROPDOWN_LABELS.SELECT_TAG}
                isSearchable={false}
                formatOptionLabel={formatOptionLabel}
                menuIsOpen={isEditMode ? true : undefined}
                onMenuClose={() => {
                    if (isEditMode) {
                        setIsEditMode(false);
                    }
                }}
            />
            {showInputModal && (
                <ModalInput
                    modalType="tag"
                    title={MODAL_MESSAGES.TAG_INPUT_MODAL.title}
                    description={MODAL_MESSAGES.TAG_INPUT_MODAL.description}
                    onClose={() => setShowInputModal(false)}
                    onSubmit={handleAddTag}
                />
            )}
            {openErrorModal && (
                <ModalDefault
                    type="default"
                    label={errorTitle}
                    description={errorDescription}
                    onClose={closeError}
                />
            )}
        </div>
    );
}