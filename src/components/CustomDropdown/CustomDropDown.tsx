"use client";
import React from "react";
import Select, {SingleValue} from "react-select";
import {CustomDropDownProps} from "@/types/modals";

interface OptionType {
    value: string;
    label: string;
}

export default function CustomDropDown({
    value,
    options,
    onChange,
    onAddOption,
}: CustomDropDownProps) {
    const categoryOptions: OptionType[] = [
        ...options.map((cat) => ({value: cat, label: cat})),
        {value: "add", label: "➕ 태그 추가"}
    ];

    const selectedOption = value ? {value, label: value} : null;

    const handleCategoryChange = (selected: SingleValue<OptionType>) => {
        if (selected?.value === "add") {
            onAddOption?.();
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