import Image from "next/image";
import LoginForm from "@/components/login/LoginForm/LoginForm";
import LoginFormRedirectGuard from "@/components/login/LoginForm/LoginFormRedirectGuard";
import './LoginPage.scss';

export default function AdminLoginPage() {
    return (
        <div id="admin-login-page" className="admin-login-page">
            <LoginFormRedirectGuard redirectTo="/admin/manage" />
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} />
            <h1 className="login-title">관리자 대시보드 로그인</h1>
            <LoginForm />
        </div>
    );
}