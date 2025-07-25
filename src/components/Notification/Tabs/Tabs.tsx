"use client";

import React from 'react';
import './Tabs.scss';

export default function Tabs() {
    return (
        <div className="tabs">
            <ul>
                <li className="is-active"><a>전체</a></li>
                <li><a>읽음</a></li>
                <li><a>안읽음</a></li>
            </ul>
        </div>
    );
}