// FAQ 페이지에서 사용되는 커스텀 드롭다운 컴포넌트입니다.
import {useEffect, useState} from "react";
import Select from 'react-select';
import "./CustomDropDownForDept.scss";
import {fetchAdminFaqTagList} from "@/api/admin/faq/faqFetch";
import {OptionType, Props} from "@/types/dropdown";

export default function CustomDropDownForTag({onChange, companyId}: Props) {
    const [options, setOptions] = useState<OptionType[]>([
        {value: 'all', label: '태그'}
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchAdminFaqTagList()
            .then((tags) => {
                const tagOptions = tags.map((tag: any) => ({
                    value: tag.name,
                    label: tag.name
                }));
                setOptions([{value: 'all', label: '태그'}, ...tagOptions]);
            })
            .finally(() => setLoading(false));
    }, [companyId]);

    return (
        <div className="custom-dropdown">
            <Select
                className="basic-single"
                classNamePrefix="select"
                defaultValue={options[0]}
                name="department"
                options={options}
                placeholder={loading ? "태그 불러오는 중..." : "태그를 선택하세요"}
                isSearchable={false}
                onChange={(option) => onChange(option?.value ?? 'all')}
                isDisabled={loading}
            />
        </div>
    );
}