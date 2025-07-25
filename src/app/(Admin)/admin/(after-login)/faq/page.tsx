import Image from "next/image";
import './Faq.scss';
import ModalUploadTrigger from "@/components/utils/ModalTrigger/ModalUploadTrigger";
import ModalFAQTrigger from "@/components/utils/ModalTrigger/ModalFAQTrigger";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";

export default function FaqPage() {
    return (
        <div id="admin-main-page" className="admin-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} />
            <h1 className="login-title">FAQ로 3행시 해보겠습니다.</h1>
            <p>F: 내일부터</p>
            <p>A: 진짜</p>
            <p>Q: 다이어트 함</p>
        </div>
    );
}