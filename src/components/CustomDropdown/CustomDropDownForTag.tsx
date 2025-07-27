// FAQ 페이지에서 사용되는 커스텀 드롭다운 컴포넌트입니다.
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

export default function CustomDropDownForTag({onChange}: Props) {
    const options: OptionType[] = [
        {value: 'all', label: '태그'},
        {value: '일반', label: '일반'},
        {value: '계정', label: '계정'},
        {value: '결제', label: '결제'},
    ];

    return (
        <div className="custom-dropdown">
            <Select
                className="basic-single"
                classNamePrefix="select"
                defaultValue={options[0]}
                name="department"
                options={options}
                placeholder="태그를 선택하세요"
                isSearchable={false}
                onChange={(option) => onChange(option?.value ?? 'all')}
            />
        </div>
    );
}