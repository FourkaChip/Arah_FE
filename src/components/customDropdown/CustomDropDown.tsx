"use client";
import React, {useEffect, useState} from "react";
import Select, {SingleValue} from "react-select";
import {CustomDropDownProps} from "@/types/modals";
import {fetchAdminFaqTagList, fetchAddAdminFaqTag, clearFaqTagListCache} from "@/api/admin/faq/faqFetch";
import ModalInput from "@/components/modal/ModalInput/ModalInput";
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import {useModalMessage} from "@/hooks/useModalMessage";

export default function CustomDropDown({
    value,
    options: _options,
    onChange,
    onAddOption,
    companyId,
}: CustomDropDownProps & { companyId: number }) {
    const [options, setOptions] = useState<string[]>(_options);
    const [showInputModal, setShowInputModal] = useState(false);
    const {
        openErrorModal,
        errorMessage,
        showError,
        closeError,
    } = useModalMessage();

    useEffect(() => {
        fetchAdminFaqTagList()
            .then((tags) => {
                const tagNames = tags.map((tag: any) => tag.name);
                setOptions(tagNames);
            });
    }, [companyId]);

    const categoryOptions = [
        ...options.map((cat) => ({value: cat, label: cat})),
        {value: "add", label: "➕ 태그 추가"}
    ];

    const selectedOption = value ? {value, label: value} : null;

    const handleCategoryChange = (selected: SingleValue<{ value: string; label: string }>) => {
        if (selected?.value === "add") {
            setShowInputModal(true);
        } else {
            onChange(selected?.value ?? "");
        }
    };

    const handleAddTag = async (tagName: string) => {
        try {
            await fetchAddAdminFaqTag(companyId, tagName);
            const tags = await fetchAdminFaqTagList();
            const tagNames = tags.map((tag: any) => tag.name);
            setOptions(tagNames);
            onChange(tagName);
        } catch {
            showError("태그 등록에 실패했습니다.");
        } finally {
            setShowInputModal(false);
        }
    };

    return (
        <div style={{width: "30%"}}>
            <Select
                options={categoryOptions}
                value={selectedOption}
                onChange={handleCategoryChange}
                placeholder="태그 선택"
                isSearchable={false}
                styles={{
                    control: (base) => ({
                        ...base,
                        borderRadius: "6px",
                        borderColor: "#ccc",
                        minHeight: "38px"
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#f0f0f0" : "white",
                        color: "#333",
                        cursor: "pointer"
                    })
                }}
            />
            {showInputModal && (
                <ModalInput
                    modalType="tag"
                    title="태그 추가"
                    description="새로운 태그 이름을 입력해 주세요."
                    onClose={() => setShowInputModal(false)}
                    onSubmit={handleAddTag}
                />
            )}
            {openErrorModal && (
                <ModalDefault
                    type="default"
                    label={errorMessage}
                    onClose={closeError}
                />
            )}
        </div>
    );
}