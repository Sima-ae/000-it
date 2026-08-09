import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p className={styles.brand}>000-it</p>
        <h1 className={styles.title}>Infrastructure ready</h1>
        <p className={styles.lead}>
          Next.js on port 3066, MariaDB connected, SSL and auto-deploy wired for
          000-it.com.
        </p>
      </main>
    </div>
  );
}
