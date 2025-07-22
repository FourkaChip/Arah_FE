import Image from "next/image";
import './MainPage.scss';
import ModalDeptTrigger from "@/components/utils/ModalTrigger/ModalDeptTrigger";

export default function MasterMainPage() {
    return (
        <div id="master-login-page" className="master-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} priority/>
            {/* priority 속성 = Next가 Largest Contentful Paint로 인식한 이미지를 우선순위화해줍니다. 기본값은 false이며, 설정해줄 경우 true */}
            <h1 className="login-title">관리자 관리</h1>
            <ModalDeptTrigger buttonText="클릭시 관리자 추가 모달 노출" />
        </div>
    );
}
