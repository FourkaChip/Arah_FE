import Image from "next/image";
import './Ara.scss';
import ModalUploadTrigger from "@/components/utils/ModalTrigger/ModalUploadTrigger";
import ModalFAQTrigger from "@/components/utils/ModalTrigger/ModalFAQTrigger";
import ModalCommitTrigger from "@/components/utils/ModalTrigger/ModalCommitTrigger";

export default function AraPage() {
    return (
        <div id="admin-main-page" className="admin-login-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} />
            <h1 className="login-title">안녕 나는 아라. 나는 다 아라. 너는 다 몰라? 나는 다 아라</h1>
        </div>
    );
}