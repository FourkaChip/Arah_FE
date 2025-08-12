// import {useState, useEffect, useMemo, useCallback} from 'react';
// import {
//     NotificationItem,
//     NotificationFilters,
//     NotificationTab,
//     CategoryFilter, UseNotificationsProps, UseNotificationsReturn
// } from '@/types/notification';
//
//
// export function useNotifications({
//                                      initialData,
//                                      itemsPerPage = 5
//                                  }: UseNotificationsProps): UseNotificationsReturn {
//
//     const sortedInitialData = useMemo(() =>
//         [...initialData].sort((a, b) =>
//             new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//         ), [initialData]
//     );
//
//     const [notifications, setNotifications] = useState<NotificationItem[]>(sortedInitialData);
//     const [filters, setFilters] = useState<NotificationFilters>({
//         tab: '전체',
//         category: '전체'
//     });
//     const [currentPage, setCurrentPage] = useState(1);
//
//     const filteredNotifications = useMemo(() => {
//         let result = notifications;
//
//         if (filters.tab === '읽음') {
//             result = result.filter(n => n.isRead);
//         } else if (filters.tab === '읽지 않음') {
//             result = result.filter(n => !n.isRead);
//         }
//
//         if (filters.category !== '전체') {
//             result = result.filter(n => n.category === filters.category);
//         }
//
//         return result;
//     }, [notifications, filters]);
//
//     const paginatedNotifications = useMemo(() =>
//         filteredNotifications.slice(
//             (currentPage - 1) * itemsPerPage,
//             currentPage * itemsPerPage
//         ), [filteredNotifications, currentPage, itemsPerPage]
//     );
//
//     const totalPages = useMemo(() =>
//             Math.ceil(filteredNotifications.length / itemsPerPage),
//         [filteredNotifications.length, itemsPerPage]
//     );
//
//     const unreadCount = useMemo(() =>
//             notifications.filter(n => !n.isRead).length,
//         [notifications]
//     );
//
//     useEffect(() => {
//         setCurrentPage(1);
//     }, [filters.tab, filters.category]);
//
//     useEffect(() => {
//         if (filteredNotifications.length > 0 && paginatedNotifications.length === 0 && currentPage > 1) {
//             setCurrentPage(Math.max(1, totalPages));
//         }
//     }, [filteredNotifications.length, paginatedNotifications.length, currentPage, totalPages]);
//
//     const handleTabChange = useCallback((tab: NotificationTab) => {
//         setFilters(prev => ({...prev, tab}));
//     }, []);
//
//     // const handleCategoryChange = useCallback((category: string) => {
//     //   const validCategory = (category === 'QnA' || category === 'Feedback') ? category : '전체';
//     //   setFilters(prev => ({ ...prev, category: validCategory as CategoryFilter }));
//     // }, []);
//
//     const handlePageChange = useCallback((page: number) => {
//         setCurrentPage(page);
//     }, []);
//
//     const handleItemClick = useCallback((id: string) => {
//         setNotifications(prev => {
//             const updated = prev.map(n => n.id === id ? {...n, isRead: true} : n);
//             return updated.sort((a, b) =>
//                 new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//             );
//         });
//     }, []);
//
//     const handleMarkAllAsRead = useCallback(() => {
//         setNotifications(prev => {
//             const updated = prev.map(n => ({...n, isRead: true}));
//             return updated.sort((a, b) =>
//                 new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//             );
//         });
//     }, []);
//
//     return {
//         // 상태
//         notifications,
//         filteredNotifications,
//         paginatedNotifications,
//         filters,
//         currentPage,
//         totalPages,
//         unreadCount,
//
//         // 액션
//         handleTabChange,
//         // handleCategoryChange,
//         handlePageChange,
//         handleItemClick,
//         handleMarkAllAsRead,
//     };
// }