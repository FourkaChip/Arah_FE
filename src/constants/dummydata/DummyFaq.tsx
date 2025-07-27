// FAQ 더미 데이터입니다.
import {RowData} from "@/types/tables";

export const defaultData: RowData[] = [
    {
        id: 1,
        no: 1,
        tag: "일반",
        registeredAt: "2024/06/01",
        question: "서비스 이용 방법이 궁금해요.",
        answer: "서비스 이용 방법은 홈페이지 상단의 가이드를 참고해 주세요.",
    },
    {
        id: 2,
        no: 2,
        tag: "계정",
        registeredAt: "2024/06/03",
        question: "비밀번호를 잊어버렸어요.",
        answer: "로그인 화면에서 비밀번호 찾기를 통해 재설정할 수 있습니다.",
    },
    {
        id: 3,
        no: 3,
        tag: "결제",
        registeredAt: "2024/06/05",
        question: "결제 영수증은 어디서 확인하나요?",
        answer: "마이페이지 > 결제 내역에서 영수증을 확인하실 수 있습니다.",
    },
    {
        id: 4,
        no: 4,
        tag: "결제",
        registeredAt: "2024/06/04",
        question: "결제 장부의 관리 부서는 어디인가요?",
        answer: "몰라요 ㅇ.ㅇ",
    },
];