// Header.tsx
'use client';
import React from 'react';
import './Header.scss';

const Header = () => (
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
            <a className="button is-white has-text-grey-light"><i className="fa-solid fa-bell"></i></a>
            <a className="button is-white has-text-link">봇테스트</a>
            <a className="button is-white has-text-grey-light">로그아웃</a>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export default Header;
