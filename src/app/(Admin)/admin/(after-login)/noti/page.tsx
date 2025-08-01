import './Noti.scss';
import Notification from '@/components/notification/Notification';

export default function AdminNotiPage() {
  return (
    <div id="admin-main-page">
      <div className="page-header">
        <div className="admin-noti-page-wrapper">
          <h1 className="noti-title">알림</h1>
          <p className="noti-description">사용자 피드백에 대한 수신 알림을 제공합니다.</p>
        </div>
      </div>
      
      <Notification itemsPerPage={5} />
    </div>
  );
}
