// Header.tsx
'use client';
import React, { useState, useRef } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';
import NotificationModal from '@/components/Modal/NotificationModal/NotificationModal';
import './Header.scss';

const Header = () => {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);

  const { unreadCount } = useNotificationContext();

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsNotificationModalOpen(false);
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
                <a className="button is-white has-text-grey-light">로그아웃</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

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
