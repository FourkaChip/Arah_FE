// 통계 페이지에서 사용되는 기간 선택 커스텀 드롭다운 컴포넌트입니다.
"use client";
import Select from 'react-select';
import "./CustomDropDownForDept.scss";
import type { OptionType, CustomDropDownForPeriodProps } from '@/types/analyze';


export default function CustomDropDownForPeriod({value, onChange}: CustomDropDownForPeriodProps) {
    const options: OptionType[] = [
        {value: '시간별 보기', label: '시간별 보기'},
        {value: '주별 보기', label: '주별 보기'},
        {value: '일별 보기', label: '일별 보기'},
        {value: '월별 보기', label: '월별 보기'}
    ];

    const selectedOption = options.find(option => option.value === value) || options[2]; // 기본값: 일별 보기

    return (
        <div className="custom-dropdown">
            <Select
                className="basic-single"
                classNamePrefix="select"
                value={selectedOption}
                name="period"
                options={options}
                placeholder="기간을 선택하세요"
                isSearchable={false}
                onChange={(option) => onChange(option?.value ?? '일별 보기')}
            />
        </div>
    );
} 