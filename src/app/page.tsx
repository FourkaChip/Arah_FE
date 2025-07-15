import styles from "./page.module.css";
import ModalWindow from "@/components/Modal/ModalWindow/ModalWindow";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button className="button is-primary">Return to Home</button>
        <ModalWindow />
      </main>
    </div>
  );
}
