// Datagrid와의 연동을 통해 검색 기능을 구현하기 위한 커스텀 검색 input 컴포넌트입니다.
// import "@/styles/globals.scss";
import "./CustomSearch.scss";
import { useState } from "react";

interface CustomSearchProps {
    onSearch: (value: string) => void;
}

export default function CustomSearch({ onSearch }: CustomSearchProps) {
    const [input, setInput] = useState("");

    const handleSearch = () => {
        onSearch(input);
    };

    return (
        <div className="admin-search-input-wrapper">
            <input
                className="admin-search-input"
                placeholder="검색할 관리자를 입력해 주세요."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                }}
            />
            {/*<i*/}
            {/*    className="fas fa-search search-icon"*/}
            {/*    role="button"*/}
            {/*    onClick={handleSearch}*/}
            {/*/>*/}
            <button
                className="search-icon"
                onClick={handleSearch}
                aria-label="검색"
            >
                <i className="fas fa-search" />
            </button>
            {/*<i*/}
            {/*    className="fas fa-search search-icon"*/}
            {/*    role="button"*/}
            {/*    onClick={handleSearch}*/}
            {/*    style={{*/}
            {/*        position: "absolute",*/}
            {/*        right: "12px",*/}
            {/*        top: "50%",*/}
            {/*        transform: "translateY(-50%)",*/}
            {/*        cursor: "pointer",*/}
            {/*        color: "#232D64",*/}
            {/*        fontSize: "20px",*/}
            {/*    }}*/}
            {/*/>*/}
        </div>
    );
}