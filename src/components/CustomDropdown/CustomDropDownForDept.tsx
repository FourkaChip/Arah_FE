// 관리 페이지에서 사용되는 커스텀 드롭다운 컴포넌트입니다.
"use client";
import Select from 'react-select';
import "./CustomDropDownForDept.scss";

interface OptionType {
    value: string;
    label: string;
}

interface Props {
    onChange: (value: string) => void;
}

export default function CustomDropDownForDept({onChange}: Props) {
    const options: OptionType[] = [
        {value: 'all', label: '전체'},
        {value: '인사담당부', label: '인사담당부'},
        {value: '재정기획부', label: '재정기획부'},
        {value: '사업기획부', label: '사업기획부'},
        {value: '행정안전부', label: '행정안전부'}
    ];

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