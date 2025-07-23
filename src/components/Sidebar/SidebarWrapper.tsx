'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function SidebarWrapper() {
    const pathname = usePathname();

    // Sidebar를 표시하지 않을 경로들
    const excludedPaths = ['/admin/login', '/master/login'];

    if (excludedPaths.includes(pathname)) {
        return null;
    }

    return(
        <div className="sidebar-wrapper">
            <Sidebar />
        </div>
        )
}