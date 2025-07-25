import Image from "next/image";
import './Feedback.scss';
import ModalUploadTrigger from "@/components/utils/ModalTrigger/ModalUploadTrigger";
import ModalFAQTrigger from "@/components/utils/ModalTrigger/ModalFAQTrigger";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";

export default function FeedbackPage() {
    return (
        <div id="admin-main-page" className="admin-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} />
            <h1 className="login-title">똑똑.. 문 좀 열어봐</h1>
            <p>나야..</p>
            <p>문 좀 열어봐</p>
            <p>피드백만 주고 갈게</p>
        </div>
    );
}