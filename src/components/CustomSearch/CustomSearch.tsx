// Datagrid와의 연동을 통해 검색 기능을 구현하기 위한 커스텀 검색 input 컴포넌트입니다.
"use client";
import "@/styles/globals.scss";
import "./CustomSearch.scss";
import {useEffect, useState} from "react";

export default function CustomSearch() {
    const [searchValue, setSearchValue] = useState("");
    useEffect(() => {
        setSearchValue(searchValue);
    });

    return (
        <div className="admin-search-input-wrapper">
            <input className="admin-search-input" placeholder="검색할 관리자를 입력해 주세요." />
            <i className="fas fa-search search-icon" />
        </div>
    )
}