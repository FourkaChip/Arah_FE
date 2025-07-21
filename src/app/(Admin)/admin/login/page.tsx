import Image from "next/image";
import LoginForm from "@/components/Login/LoginForm/LoginForm";
import './LoginPage.scss';

export default function AdminLoginPage() {
    return (
        <div id="admin-login-page" className="admin-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} />
            <h1 className="login-title">관리자 대시보드 로그인</h1>
            {/*<p className="login-description">관리자 인증을 위하여 2차 인증을 진행해 주세요.</p>*/}
            <LoginForm />
        </div>
    );
}