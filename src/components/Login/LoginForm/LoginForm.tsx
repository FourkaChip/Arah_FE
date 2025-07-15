// 로그인 페이지용 Form입니다.
'use client';

import {useState} from 'react';
import LoginButton from '@/components/Login/Buttons/LoginButton';
import './LoginForm.scss';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('로그인 시도:', {email, password});
        // 여기에 실제 로그인 로직 추가
    };

    return (
        <>
            <form className="login-form">
                <label className="login-form-label">
                    E-Mail
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
