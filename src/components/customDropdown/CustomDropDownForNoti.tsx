// 알림 페이지에서 사용되는 커스텀 드롭다운 컴포넌트입니다.
import Select from 'react-select';
import "./CustomDropDownForDept.scss";
import {OptionType, Props} from "@/types/notification";

export default function CustomDropDownForNoti({onChange}: Props) {
    const options: OptionType[] = [
        {value: '전체', label: '전체'},
        {value: 'QnA', label: 'QnA'},
        {value: 'Feedback', label: 'Feedback'}
    ];

    return (
        <div className="custom-dropdown">
            <Select
                className="basic-single"
                classNamePrefix="select"
                defaultValue={options[0]}
                name="department"
                options={options}
                placeholder="카테고리"
                isSearchable={true}
                onChange={(option) => onChange(option?.value ?? '전체')}
            />
        </div>
    );
}