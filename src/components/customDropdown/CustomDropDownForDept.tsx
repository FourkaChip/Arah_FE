// 관리 페이지에서 사용되는 커스텀 드롭다운 컴포넌트입니다.
"use client";
import Select from 'react-select';
import "./CustomDropDownForDept.scss";
import { useEffect, useState } from "react";
import { fetchDepartmentList } from "@/api/master/deptFetch";
import {OptionType, Props} from "@/types/dropdown";


export default function CustomDropDownForDept({onChange}: Props) {
    const [options, setOptions] = useState<OptionType[]>([{value: 'all', label: '전체'}]);

    useEffect(() => {
        // fetchDepartmentList는 JWT 기반으로 회사 부서만 반환
        fetchDepartmentList()
            .then((list) => {
                const deptOptions = list.map((dept: { departmentId: number; name: string }) => ({
                    value: dept.name,
                    label: dept.name
                }));
                setOptions([{value: 'all', label: '전체'}, ...deptOptions]);
            })
            .catch(() => {
                setOptions([{value: 'all', label: '전체'}]);
            });
    }, []);

    return (
        <div className="custom-dropdown">
            <Select
                className="basic-single"
                classNamePrefix="select"
                defaultValue={options[0]}
                name="department"
                options={options}
                placeholder="부서를 선택하세요"
                isSearchable={true}
                onChange={(option) => onChange(option?.value ?? 'all')}
            />
        </div>
    );
}