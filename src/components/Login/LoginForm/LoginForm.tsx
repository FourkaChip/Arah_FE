// 로그인 페이지용 Form입니다.
'use client';

import React, {useState} from 'react';
import {usePathname} from 'next/navigation';
import LoginButton from '@/components/Login/Buttons/LoginButton';
import './LoginForm.scss';
import {dummyCompanies} from "@/constants/dummydata/DummyCompanyData";
import ModalInput from "@/components/Modal/ModalInput/ModalInput";
import ModalInputFilled from "@/components/Modal/ModalInput/ModalInputFilled";
import {masterLogin, confirmMasterVerifyCode, sendMasterVerifyCode, fetchCompanyToken, registerCompanyToken} from '@/api/auth/master';
import {adminLogin} from '@/api/auth/admin';
import {useAuthStore} from "@/store/auth.store";
import {saveAccessToken, saveRefreshToken} from "@/utils/tokenStorage";
import {useMutation} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';

export default function LoginForm() {
    const pathname = usePathname();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [verifyToken, setVerifyToken] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [showTokenModal, setShowTokenModal] = useState(false); // 추가

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleCompanyInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setCompanyName(input);

        if (input.trim() === '') {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const filtered = dummyCompanies.filter((company: string) => company.toLowerCase().includes(input.toLowerCase()));
        setSuggestions(filtered);
        setShowSuggestions(true);
    }

    const handleSelectSuggestion = (company: string) => {
        setCompanyName(company);
        setSuggestions([]);
        setShowSuggestions(false);
    }

    const masterLoginMutation = useMutation({
        mutationFn: () => masterLogin(email, password, companyName),
        onSuccess: async ({verifyToken}) => {
            setPasswordError(false);
            setVerifyToken(verifyToken);
            try {
                await sendMasterVerifyCode(verifyToken);
                setShowModal(true);
            } catch {
                alert('인증번호 전송 실패');
            }
        },
        onError: () => {
            setPasswordError(true);
        },
    });

    const adminLoginMutation = useMutation({
        mutationFn: () => adminLogin(email, password),
        onSuccess: ({accessToken, refreshToken}) => {
            setPasswordError(false);
            useAuthStore.getState().setAccessToken(accessToken);
            saveRefreshToken(refreshToken);
            router.push('/admin/manage');
        },
        onError: () => {
            setPasswordError(true);
        },
    });

    const handleLogin = () => {
        if (pathname === '/master/login') {
            masterLoginMutation.mutate();
        } else if (pathname === '/admin/login') {
            adminLoginMutation.mutate();
        }
    };

    const verifyMutation = useMutation({
        mutationFn: (code: string) =>
            confirmMasterVerifyCode({verifyToken, code}),
        onSuccess: async ({accessToken, refreshToken}) => {
            useAuthStore.getState().setAccessToken(accessToken);
            saveRefreshToken(refreshToken);
            setShowModal(false);
            try {
                const token = await fetchCompanyToken();
                if (!token) {
                    setTimeout(() => setShowTokenModal(true), 200);
                } else {
                    router.push('/master/manage');
                }
            } catch {
                setTimeout(() => setShowTokenModal(true), 200);
            }
        },
        onError: () => {
        },
    });

    const handleRegisterToken = async (inputToken: string) => {
        try {
            await registerCompanyToken(inputToken);
            setShowTokenModal(false);
            router.push('/master/manage');
            return true;
        } catch (e: any) {
            alert(e.message || '토큰 등록에 실패했습니다.');
            return false;
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleLogin();
    };

    return (
        <>
            <form className="login-form" onSubmit={handleFormSubmit}>
                {pathname === '/master/login' && (
                    <label className="login-form-label">
                        <p className="login-form-description">기업명</p>
                        <input
                            id="companyName"
                            name="companyName"
                            type="companyName"
                            placeholder="등록하신 기업명을 입력해 주세요."
                            value={companyName}
                            className="login-form-input"
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
                        className={`login-form-input ${passwordError ? 'is-error' : ''}`}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                        }}/>
                    {passwordError && (
                        <p className="login-form-error-text">비밀번호를 다시 입력해 주세요</p>
                    )}
                </label>
                <p className="login-form-missing">
                    비밀번호를 잊으셨다면?{' '}
                    {pathname === '/master/login' ? (
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setShowPassword(true);
                            }}
                        >
                            여기를 클릭하세요
                        </a>
                    ) : (
                        <a href="#">여기를 클릭하세요</a>
                    )}
                </p>
                {pathname === '/admin/login' && (
                    <div className="login-form-to-master">
                        <a href="/master/login">마스터 계정으로 로그인하기</a>
                    </div>
                )}
                {pathname === '/master/login' && (
                    <div className="login-form-to-master">
                        <a href="/admin/login">관리자 계정으로 로그인하기</a>
                    </div>
                )}
                <LoginButton label="로그인" onClick={handleLogin}/>
            </form>
            {showModal && (
                <ModalInput
                    modalType="auth"
                    title="마스터 2차 인증"
                    description="등록된 이메일로 전송된 인증코드를 입력해 주세요."
                    onClose={() => setShowModal(false)}
                    onSubmit={(code: string) => verifyMutation.mutate(code)}
                    onResendCode={() => {
                        if (verifyToken) {
                            sendMasterVerifyCode(verifyToken)
                                .then(() => alert('인증 코드가 재전송되었습니다.'))
                                .catch(() => alert('인증 코드 전송에 실패했습니다.'));
                        }
                    }}
                />
            )}
            {showPassword && (
                <ModalInputFilled
                    type="password-lost"
                    onClose={() => setShowPassword(false)}
                />
            )}
            {showTokenModal && (
                <ModalInput
                    modalType="token"
                    title="토큰 등록"
                    description="카카오워크 내 그룹 채팅방을 생성할 수 있는 토큰을 등록합니다."
                    onClose={() => setShowTokenModal(false)}
                    onSubmit={handleRegisterToken}
                />
            )}
        </>
    );
}
