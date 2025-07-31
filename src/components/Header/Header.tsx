// Header.tsx
'use client';
import React from 'react';
import './Header.scss';
import {useRouter} from 'next/navigation';
import {removeRefreshToken} from '@/utils/tokenStorage';
import {useAuthStore} from '@/store/auth.store';

const Header = () => {
    const router = useRouter();
    const {clearAccessToken} = useAuthStore();

    const handleLogout = () => {
        removeRefreshToken();

        clearAccessToken();

        router.push('/');
    };

    return (
        <nav className="navbar is-white" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <a className="navbar-item" href="#">
                    <img className="navbar-item-img" src="/kaef.svg" alt="Logo"/>
                </a>
            </div>

            <div id="mainNavbar" className="navbar-menu">
                <div className="navbar-end">
                    <div className="navbar-item">
                        <div className="buttons">
                            <a className="button is-white has-text-grey-light"><i className="fa-solid fa-bell"></i></a>
                            <a className="button is-white has-text-link">봇테스트</a>
                            <a className="button is-white has-text-grey-light" onClick={handleLogout}>로그아웃</a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
