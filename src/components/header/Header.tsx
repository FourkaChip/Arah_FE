'use client';
import React, { useState, useRef } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import NotificationModal from '@/components/modal/NotificationModal/NotificationModal';
import '@/components/modal/NotificationModal/NotificationModal.scss';
import ModalDefault from '@/components/modal/ModalDefault/ModalDefault';
import './Header.scss';
import { useRouter, usePathname } from 'next/navigation';
import { removeRefreshToken } from '@/utils/tokenStorage';
import { useAuthStore } from '@/store/auth.store';
import { logout } from '@/api/auth/authorizedFetch';
import Image from 'next/image';
import Link from 'next/link';

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { clearAccessToken } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isMaster = pathname.startsWith('/master');
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const notificationButtonRef = useRef<HTMLButtonElement>(null);

    let unreadCount = 0;
    if (!isMaster) {
        unreadCount = useNotificationContext().unreadCount;
    }

    const handleNotificationClick = () => {
        setIsNotificationModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsNotificationModalOpen(false);
    };

    const forceLogout = () => {
        try {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('refresh_token');
                sessionStorage.removeItem('access_token');
                sessionStorage.clear();
            }
            clearAccessToken();
            router.push('/');
        } catch (e) {
            alert('로그아웃에 실패했습니다. 페이지를 새로고침해주세요.');
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();

            removeRefreshToken();
            clearAccessToken();

            router.push('/');
        } catch (error) {
            console.error('로그아웃 API 호출 실패:', error);
            try {
                removeRefreshToken();
                clearAccessToken();
                router.push('/');
            } catch (localError) {
                console.error('클라이언트 토큰 정리 실패:', localError);
                setShowErrorModal(true);
            }
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <nav className="navbar is-white" role="navigation" aria-label="main navigation">
                <div className="navbar-brand">
                    <div className="navbar-item">
                        <Image
                            src="/kaef.svg"
                            alt="Logo"
                            width={500}
                            height={160}
                        />
                    </div>
                </div>

                <div id="mainNavbar" className="navbar-menu">
                    <div className="navbar-end">
                        <div className="navbar-item">
                            <div className="buttons">
                                {isMaster ? (
                                    <a
                                        className="button is-white has-text-grey-light"
                                        onClick={isLoggingOut ? undefined : handleLogout}
                                        style={{ cursor: isLoggingOut ? 'wait' : 'pointer' }}
                                    >
                                        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                                    </a>
                                ) : (
                                    <>
                                        <button
                                            ref={notificationButtonRef}
                                            className="button is-white has-text-grey-light notification-button"
                                            onClick={handleNotificationClick}
                                            aria-label={`알림 ${unreadCount}개`}
                                        >
                                            <i className="fa-solid fa-bell fa-xl"></i>
                                            {unreadCount > 0 && (
                                                <span className="notification-badge">{unreadCount}</span>
                                            )}
                                        </button>
                                        <a className="button is-white has-text-link">봇테스트</a>
                                        <a
                                            className="button is-white has-text-grey-light"
                                            onClick={isLoggingOut ? undefined : handleLogout}
                                            style={{ cursor: isLoggingOut ? 'wait' : 'pointer' }}
                                        >
                                            {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {!isMaster && (
                <NotificationModal
                    isOpen={isNotificationModalOpen}
                    onClose={handleCloseModal}
                    maxItems={5}
                    buttonRef={notificationButtonRef}
                />
            )}

            {showErrorModal && (
                <ModalDefault
                    type="default"
                    label="로그아웃 오류"
                    onClose={() => {
                        setShowErrorModal(false);
                        setShowConfirmModal(true);
                    }}
                    errorMessages={['로그아웃 처리 중 오류가 발생했습니다. 다시 시도해주세요.']}
                />
            )}

            {showConfirmModal && (
                <ModalDefault
                    type="default"
                    label="로그아웃 확인"
                    onClose={() => setShowConfirmModal(false)}
                    onSubmit={() => {
                        setShowConfirmModal(false);
                        forceLogout();
                    }}
                    errorMessages={['계속해서 로그아웃하시겠습니까?']}
                />
            )}
            <div style={{ display: 'none' }}>
                <NotificationModal
                    isOpen={true}
                    onClose={() => {}}
                    maxItems={0}
                    buttonRef={notificationButtonRef}
                />
            </div>
        </>
    );
};

export default Header;