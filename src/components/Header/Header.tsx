'use client';
import React, { useState, useRef } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import NotificationModal from '@/components/Modal/NotificationModal/NotificationModal';
import './Header.scss';
import { useRouter, usePathname } from 'next/navigation';
import { removeRefreshToken } from '@/utils/tokenStorage';
import { useAuthStore } from '@/store/auth.store';

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { clearAccessToken } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const { unreadCount } = useNotificationContext();

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNotificationModalOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      removeRefreshToken();
      clearAccessToken();
      router.push('/');
    } catch (error) {
      alert('로그아웃 처리 중 오류가 발생했습니다. 다시 시도해주세요.');

      if (confirm('계속해서 로그아웃하시겠습니까?')) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('refresh_token');
            sessionStorage.clear();
          }
          clearAccessToken();
          router.push('/');
        } catch (e) {
          alert('로그아웃에 실패했습니다. 페이지를 새로고침해주세요.');
        }
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="navbar is-white" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="#">
            <img className="navbar-item-img" src="/kaef.svg" alt="Logo" />
          </a>
        </div>

        <div id="mainNavbar" className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
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
                  로그아웃
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

            <div id="mainNavbar" className="navbar-menu">
                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="buttons">
                            {pathname.startsWith('/master') ? (
                                <a
                                    className="button is-white has-text-grey-light"
                                    onClick={isLoggingOut ? undefined : handleLogout}
                                    style={{ cursor: isLoggingOut ? 'wait' : 'pointer' }}
                                >
                                    로그아웃
                                </a>
                            ) : (
                                <>
                                    <a className="button is-white has-text-grey-light"><i className="fa-solid fa-bell"></i></a>
                                    <a className="button is-white has-text-link">봇테스트</a>
                                    <a
                                        className="button is-white has-text-grey-light"
                                        onClick={isLoggingOut ? undefined : handleLogout}
                                        style={{ cursor: isLoggingOut ? 'wait' : 'pointer' }}
                                    >
                                        로그아웃
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

    );
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={handleCloseModal}
        maxItems={5}
        buttonRef={notificationButtonRef}
      />
    </>
  );
};

export default Header;