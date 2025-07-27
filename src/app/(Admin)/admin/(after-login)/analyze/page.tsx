import Image from "next/image";
import './Analyze.scss';
import ModalUploadTrigger from "@/components/utils/ModalTrigger/ModalUploadTrigger";
import ModalFAQTrigger from "@/components/utils/ModalTrigger/ModalFAQTrigger";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";

export default function AnalysisPage() {
    return (
        <div id="admin-main-page" className="admin-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} />
            <h1 className="login-title">안녕 내 이름은 통계!</h1>
        </div>
    );
}