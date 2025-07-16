// 로그인 페이지용 Form입니다.
'use client';

import React, {useState} from 'react';
import {usePathname} from 'next/navigation';
import LoginButton from '@/components/Login/Buttons/LoginButton';
import './LoginForm.scss';
import {dummyCompanies} from "@/constants/dummydata/DummyCompanyData";

export default function LoginForm() {
    const pathname = usePathname();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');

    // dummydata 기반 임시 기업명 검색용 변수
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    //
    const handleCompanyInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setCompanyName(input);

        if (input.trim() === '') {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = dummyCompanies.filter((company:string) => company.toLowerCase().includes(input.toLowerCase()));
        setSuggestions(filtered);
        setShowSuggestions(true);
    }

    const handleSelectSuggestion = (company: string) => {
        setCompanyName(company);
        setSuggestions([]);
        setShowSuggestions(false);
    }


    const handleLogin = () => {
        console.log('로그인 시도:', {companyName, email, password});
        // 여기에 실제 로그인 로직 추가하기
    };


    return (
        <>
            <form className="login-form">
                {pathname === '/master/login' && (
                    <label className="login-form-label">
                        <p className="login-form-description">기업명</p>
                        <input
                            id="companyName"
                            name="companyName"
                            type="companyName"
                            placeholder="이메일을 입력해 주세요."
                            value={companyName}
                            className="login-form-input"
                            // onChange={(e) => setCompanyName(e.target.value)}/>
                            onChange={handleCompanyInputChange}
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <ul className="company-suggestion-dropdown">
                                {suggestions.map((s, i) => (
                                    <li
                                        key={i}
                                        className="suggestion-item"
                                        onClick={() => handleSelectSuggestion(s)}
                                    >
                                        {s}
                                    </li>
                                ))}
                            </ul>
                            )}
                    </label>
                )}

                <label className="login-form-label">
                    <p className="login-form-description">E-Mail</p>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="이메일을 입력해 주세요."
                        value={email}
                        className="login-form-input"
                        onChange={(e) => setEmail(e.target.value)}/>
                </label>

                <label className="login-form-label">
                    <p className="login-form-description">비밀번호</p>
                    {/*비밀번호*/}
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="비밀번호를 입력해 주세요."
                        value={password}
                        className="login-form-input"
                        onChange={(e) => setPassword(e.target.value)}/>
                </label>
                <p className="login-form-missing">
                    비밀번호를 잊으셨다면? <a href="#">여기를 클릭하세요</a>
                </p>
                <LoginButton label="로그인" onClick={handleLogin}/>
            </form>
        </>
    );
}
