"use client";
import React, {useEffect, useState} from "react";
import Select, {SingleValue} from "react-select";
import {CustomDropDownProps} from "@/types/modals";
import {fetchAdminFaqTagList, fetchAddAdminFaqTag} from "@/api/admin/faq/faqFetch";

export default function CustomDropDown({
    value,
    options: _options,
    onChange,
    onAddOption,
    companyId,
}: CustomDropDownProps & { companyId: number }) {
    const [options, setOptions] = useState<string[]>(_options);

    useEffect(() => {
        fetchAdminFaqTagList(companyId)
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

    const handleCategoryChange = async (selected: SingleValue<{ value: string; label: string }>) => {
        if (selected?.value === "add") {
            const newCategory = prompt("새로운 태그를 입력하세요.");
            if (newCategory) {
                try {
                    await fetchAddAdminFaqTag(companyId, newCategory);
                    const tags = await fetchAdminFaqTagList(companyId);
                    const tagNames = tags.map((tag: any) => tag.name);
                    setOptions(tagNames);
                    onChange(newCategory);
                } catch {
                    alert("태그 추가에 실패했습니다.");
                }
            }
        } else {
            onChange(selected?.value ?? "");
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
        </div>
    );
}