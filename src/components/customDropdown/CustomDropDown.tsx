import React, {useEffect, useState} from "react";
import Select, {SingleValue} from "react-select";
import {fetchAdminFaqTagList, fetchAddAdminFaqTag, fetchDeleteAdminFaqTag} from "@/api/admin/faq/faqFetch";
import ModalInput from "@/components/modal/ModalInput/ModalInput";
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
    onSuccess,
    onError,
}: CustomDropDownTagProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [showInputModal, setShowInputModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [dropdownKey] = useState(0);

    useEffect(() => {
        fetchAdminFaqTagList()
            .then((tagList) => {
                setTags(tagList);
            })
            .catch((error) => {
                console.error("태그 목록 조회 실패:", error);
                onError?.(MODAL_MESSAGES.TAG_FETCH_ERROR.title, MODAL_MESSAGES.TAG_FETCH_ERROR.description);
            });
    }, [companyId, onError]);

    const formatOptionLabel = (option: DropdownOption) => {
        if (isEditMode && option.value !== DROPDOWN_ACTIONS.ADD && option.value !== DROPDOWN_ACTIONS.EDIT) {
            const tag = tags.find(t => t.name === option.value);
            
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
            onSuccess?.("추가 성공", "태그가 성공적으로 추가되었습니다.");
        } catch {
            onError?.(MODAL_MESSAGES.TAG_ADD_ERROR.title, MODAL_MESSAGES.TAG_ADD_ERROR.description);
        } finally {
            setShowInputModal(false);
        }
    };

    const handleDeleteTag = async (tagId: number) => {
        try {
            await fetchDeleteAdminFaqTag(tagId);
            const tagList = await fetchAdminFaqTagList();
            setTags(tagList);
            const deletedTag = tags.find(tag => tag.tag_id === tagId);
            if (deletedTag && value === deletedTag.name) {
                onChange("");
            }
            onSuccess?.("삭제 완료", "태그가 성공적으로 삭제되었습니다.");
        } catch (error) {
            console.error("태그 삭제 실패:", error);
            const errorMessage = error instanceof Error ? error.message : MODAL_MESSAGES.TAG_DELETE_ERROR.description;
            onError?.(MODAL_MESSAGES.TAG_DELETE_ERROR.title, errorMessage);
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
        </div>
    );
}