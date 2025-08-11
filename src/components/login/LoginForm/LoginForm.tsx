// 로그인 페이지용 Form입니다.
'use client';

import React, {useState} from 'react';
import {usePathname} from 'next/navigation';
import LoginButton from '@/components/login/Buttons/LoginButton';
import './LoginForm.scss';
import {dummyCompanies} from "@/constants/dummydata/DummyCompanyData";
import ModalInput from "@/components/modal/ModalInput/ModalInput";
import ModalInputFilled from "@/components/modal/ModalInput/ModalInputFilled";
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import {
    masterLogin,
    confirmMasterVerifyCode,
    sendMasterVerifyCode,
    clearMasterLoginCache
} from '@/api/auth/master';
import {adminLogin, clearAdminLoginCache} from '@/api/auth/admin';
import {useAuthStore} from "@/store/auth.store";
import {saveRefreshToken} from "@/utils/tokenStorage";
import {useMutation} from '@tanstack/react-query';
import {useRouter} from 'next/navigation';
import {fetchCompanyToken, registerCompanyToken} from "@/api/master/deptFetch";
import {toast} from "react-hot-toast";

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
    const [showTokenModal, setShowTokenModal] = useState(false);

    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorType, setErrorType] = useState<'email' | 'password' | 'verify'>('password');
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
                setErrorMessages(['인증 처리 중 오류가 발생했습니다. 다시 시도해 주세요.']);
                setShowErrorModal(true);
            }
        },
        onError: (error: any) => {
            setPasswordError(true);
            clearMasterLoginCache();
            handleLoginError(error);
        },
    });

    const adminLoginMutation = useMutation({
        mutationFn: () => adminLogin(email, password),
        onSuccess: ({accessToken, refreshToken}) => {
            setPasswordError(false);
            useAuthStore.getState().setAccessToken(accessToken);
            saveRefreshToken(refreshToken);
            clearAdminLoginCache();
            router.push('/admin/manage');
        },
        onError: (error: any) => {
            setPasswordError(true);
            clearAdminLoginCache();
            handleLoginError(error);
        },
    });

    const handleLoginError = (error: any) => {
        const messages: string[] = [];

        if (error.response?.data?.error) {
            const errorObj = error.response.data.error;
            const errorValues = Object.values(errorObj);
            const lastErrorValue = errorValues[errorValues.length - 1];
            if (typeof lastErrorValue === 'string') {
                messages.push(lastErrorValue);
            }
        }

        if (messages.length === 0) {
            if (error.response?.data?.message) {
                messages.push(error.response.data.message);
            } else if (error instanceof Error) {
                messages.push(error.message);
            } else {
                messages.push('로그인 처리 중 오류가 발생했습니다.');
            }
        }

        setErrorMessages(messages);
        setShowErrorModal(true);
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
                    router.push('/master/dept');
                }
            } catch {
                setTimeout(() => setShowTokenModal(true), 200);
            }
        },
        onError: (error: any) => {
            handleVerifyError(error);
        },
    });

    const handleVerifyError = (error: any) => {
        const messages: string[] = [];

        if (error.response?.data?.error) {
            const errorObj = error.response.data.error;
            const errorValues = Object.values(errorObj);
            const lastErrorValue = errorValues[errorValues.length - 1];
            if (typeof lastErrorValue === 'string') {
                messages.push(lastErrorValue);
            }
        }

        if (messages.length === 0) {
            if (error.response?.data?.message) {
                messages.push(error.response.data.message);
            } else if (error instanceof Error) {
                messages.push(error.message);
            } else {
                messages.push('인증 처리 중 오류가 발생했습니다.');
            }
        }

        setErrorMessages(messages);
        setShowErrorModal(true);
    };

    const handleRegisterToken = async (inputToken: string) => {
        try {
            await registerCompanyToken(inputToken);
            setShowTokenModal(false);
            router.push('/master/manage');
            return true;
        } catch (error: any) {
            const messages: string[] = [];

            if (error.response?.data?.error) {
                const errorObj = error.response.data.error;
                const errorValues = Object.values(errorObj);
                const lastErrorValue = errorValues[errorValues.length - 1];
                if (typeof lastErrorValue === 'string') {
                    messages.push(lastErrorValue);
                }
            }

            if (messages.length === 0) {
                messages.push('토큰 등록 중 오류가 발생했습니다. 다시 시도해 주세요.');
            }

            setErrorMessages(messages);
            setShowErrorModal(true);
            return false;
        }
    };

    const handleLogin = () => {
        if (pathname === '/master/login') {
            masterLoginMutation.mutate();
        } else {
            adminLoginMutation.mutate();
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleLogin();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin();
        }
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
                            onKeyDown={handleKeyDown}
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
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onInvalid={(e) => e.preventDefault()}
                    />
                </label>

                <label className="login-form-label">
                    <p className="login-form-description">비밀번호</p>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="비밀번호를 입력해 주세요."
                        value={password}
                        className={`login-form-input`}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setPasswordError(false);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    {/*{passwordError && (*/}
                    {/*    <p className="login-form-error-text">비밀번호를 다시 입력해 주세요</p>*/}
                    {/*)}*/}
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
                                .then(() => {
                                    toast.success("인증코드가 재전송되었습니다.");
                                })
                                .catch((error) => {
                                    const messages: string[] = [];

                                    if (error.response?.data?.error) {
                                        const errorObj = error.response.data.error;
                                        const errorValues = Object.values(errorObj);
                                        const lastErrorValue = errorValues[errorValues.length - 1];
                                        if (typeof lastErrorValue === 'string') {
                                            messages.push(lastErrorValue);
                                        }
                                    }

                                    if (messages.length === 0) {
                                        messages.push('인증코드 재전송에 실패했습니다. 다시 로그인해주세요.');
                                    }

                                    setErrorMessages(messages);
                                    setShowErrorModal(true);
                                });
                        }
                    }}
                    onVerifyError={handleVerifyError}
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
            {showErrorModal && (
                <ModalDefault
                    type="default"
                    label="로그인 오류"
                    onClose={() => setShowErrorModal(false)}
                    errorMessages={errorMessages}
                />
            )}
        </>
    );
}
