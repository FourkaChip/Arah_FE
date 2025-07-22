import Image from "next/image";
import './ManageAdmin.scss';
import ModalDeptTrigger from "@/components/utils/ModalTrigger/ModalDeptTrigger";

export default function ManageAdminPage() {
    return (
        <div id="master-manage-page" className="master-manage-page">
            <Image src="/kaef.png" alt="kakaowork logo" width={300} height={100} priority/>
            <h1 className="master-manage-title">관리자 관리</h1>
            <ModalDeptTrigger buttonText="관리자 추가"/>
        </div>
    );
}