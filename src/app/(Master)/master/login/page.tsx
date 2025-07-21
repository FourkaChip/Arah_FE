import Image from "next/image";
import LoginForm from "@/components/Login/LoginForm/LoginForm";
import './LoginPage.scss';

export default function MasterLoginPage() {
    return (
        <div id="master-login-page" className="master-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} priority/>
            {/* priority 속성 = Next가 Largest Contentful Paint로 인식한 이미지를 우선순위화해줍니다. 기본값은 false이며, 설정해줄 경우 true */}
            <h1 className="login-title">마스터 대시보드 로그인</h1>
            {/*<p className="login-description">관리자 인증을 위하여 2차 인증을 진행해 주세요.</p>*/}
            <LoginForm/>
        </div>
    );
}