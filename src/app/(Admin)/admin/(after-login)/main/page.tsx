import Image from "next/image";
import './MainPage.scss';
import ModalUploadTrigger from "@/components/utils/ModalTrigger/ModalUploadTrigger";
import ModalFAQTrigger from "@/components/utils/ModalTrigger/ModalFAQTrigger";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";

export default function AdminMainPage() {
    return (
        <div id="admin-main-page" className="admin-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} />
            <h1 className="login-title">관리자 페이지</h1>
            {/* 여기에 데이터셋 관리 페이지가 들어갈 예정입니다. */}
            <ModalUploadTrigger buttonText={"데이터셋 업로드"}/>
            <ModalFAQTrigger/>
            <ModalCommitTrigger/>
        </div>
    );
}