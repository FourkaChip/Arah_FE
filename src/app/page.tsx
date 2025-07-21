import styles from "./page.module.css";
import ModalDefault from "@/components/Modal/ModalDefault/ModalDefault";
import ClientModalTrigger from "@/components/utils/ModalTrigger/ClientModalTrigger";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/*<button className="button is-primary">Return to Home</button>*/}
          <h1>Test Page</h1>
        <img src="/갱얼쥐.jpeg" alt="갱얼쥐" width="350" height="400" />
          <button>클릭시 모달 열림</button>
        {/*<ModalDefault type='delete' label='삭제하시겠습니까?'/>*/}
          <ClientModalTrigger
              type="default"
              title="답변이 전송되었습니다."
              buttonText="모달 열기"
          />
      </main>
    </div>
  );
}
