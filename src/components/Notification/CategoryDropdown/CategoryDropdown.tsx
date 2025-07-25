"use client";

import React from 'react';
import './CategoryDropdown.scss';

export default function CategoryDropdown() {
    return (
        <div className="dropdown">
            <div className="dropdown-trigger">
                <button className="button is-white" aria-haspopup="true" aria-controls="dropdown-menu3">
                <span>Click me</span>
                <span className="icon is-small">
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                </span>
                </button>
            </div>
            <div className="dropdown-menu" id="dropdown-menu3" role="menu">
                <div className="dropdown-content">
                <a href="#" className="dropdown-item"> QnA </a>
                <a href="#" className="dropdown-item"> Feedback </a>
                </div>
            </div>
        </div>
    );
}