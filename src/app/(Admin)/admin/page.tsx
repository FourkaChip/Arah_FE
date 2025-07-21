// 관리자용 서버 컴포넌트. 여기서 우선적으로 공통 컴포넌트 테스트 예정입니다.
import styles from 'src/app/page.module.css';
import ClientModalTrigger from "@/components/utils/ModalTrigger/ClientModalTrigger";

export default function Home() {
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                {/*<button className="button is-primary">Return to Home</button>*/}
                <h1>Test Route Page</h1>
                <button>클릭시 모달 열림</button>
                {/*<ModalDefault type='delete' label='삭제하시겠습니까?'/>*/}
                <ClientModalTrigger
                    type="delete-data"
                    title="답변이 삭제되었습니다."
                    buttonText="모달 열기"
                />
            </main>
        </div>
    );
}
