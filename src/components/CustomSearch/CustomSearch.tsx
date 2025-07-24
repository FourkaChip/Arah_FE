// Datagrid와의 연동을 통해 검색 기능을 구현하기 위한 커스텀 검색 input 컴포넌트입니다.
// import "@/styles/globals.scss";
import "./CustomSearch.scss";
import {useState} from "react";
import {usePathname} from "next/navigation";

interface CustomSearchProps {
    onSearch: (value: string) => void;
}

export default function CustomSearch({onSearch, className = ""}: CustomSearchProps & { className?: string }) {
    const [input, setInput] = useState("");
    const pathname = usePathname();

    const getPlaceholder = () => {
        switch (pathname) {
            case '/master/managers':
                return "검색할 관리자를 입력해 주세요.";
            case '/master/dept':
                return "검색할 부서를 입력해 주세요.";
            default:
                return "검색어를 입력해 주세요.";
        }
    };

    const handleSearch = () => {
        onSearch(input);
    };

    return (
        <div className={`admin-search-input-wrapper ${className}`}>
            <input
                className="admin-search-input"
                placeholder={getPlaceholder()}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                }}
            />
            <button
                className="search-icon"
                onClick={handleSearch}
                aria-label="검색"
            >
                <i className="fas fa-search"/>
            </button>
        </div>
    );
}