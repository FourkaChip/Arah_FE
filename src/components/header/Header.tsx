'use client';
import React, {useState, useRef, useEffect} from 'react';
import {useNotificationContext} from '@/contexts/NotificationContext';
import NotificationModal from '@/components/modal/NotificationModal/NotificationModal';
import '@/components/modal/NotificationModal/NotificationModal.scss';
import ModalDefault from '@/components/modal/ModalDefault/ModalDefault';
import './Header.scss';
import {useRouter, usePathname} from 'next/navigation';
import {removeRefreshToken} from '@/utils/tokenStorage';
import {useAuthStore} from '@/store/auth.store';
import {logout} from '@/api/auth/authorizedFetch';
import Image from 'next/image';
import ModalBotTest from '../modal/BotTest/ModalBotTest';

function NotificationBell({
                              onClick,
                              buttonRef,
                          }: {
    onClick: () => void;
    buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
    const {unreadCount} = useNotificationContext();

    return (
        <button
            ref={buttonRef}
            className="button is-white has-text-grey-light notification-button"
            onClick={onClick}
            aria-label={`알림 ${unreadCount}개`}
        >
            <i className="fa-solid fa-bell fa-xl"></i>
            {unreadCount > 0 && (
                <span className="notification-badge" suppressHydrationWarning>
                    {unreadCount}
                </span>
            )}
        </button>
    );
}

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const {clearAccessToken} = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isMaster = pathname.startsWith('/master');
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const notificationButtonRef = useRef<HTMLButtonElement>(null);
    const [isBotTestModalOpen, setIsBotTestModalOpen] = useState(false);

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
            try {
                removeRefreshToken();
                clearAccessToken();
                router.push('/');
            } catch (localError) {
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
                                        style={{cursor: isLoggingOut ? 'wait' : 'pointer'}}
                                    >
                                        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                                    </a>
                                ) : (
                                    <>
                                        <NotificationBell onClick={handleNotificationClick}
                                                          buttonRef={notificationButtonRef}/>
                                        <button className="button is-white has-text-link"
                                                onClick={() => setIsBotTestModalOpen(true)}>봇테스트
                                        </button>
                                        <a
                                            className="button is-white has-text-grey-light"
                                            onClick={isLoggingOut ? undefined : handleLogout}
                                            style={{cursor: isLoggingOut ? 'wait' : 'pointer'}}
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
            {isBotTestModalOpen && (
                <ModalBotTest onClose={() => setIsBotTestModalOpen(false)}/>
            )}
        </>
    );
};

export default Header;