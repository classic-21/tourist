"use client";
import Link from "next/link";
import styles from "./styles.module.css";

export default function Home() {
  return (
    <div className={styles.home}>
      <h1 className={styles.heading}>Explore Uttar Pradesh through audio!</h1>

      <div className={styles.buttons}>
        <Link href="/sign-up" className={styles.btnPrimary}>
          Get Started
        </Link>
        <Link href="/sign-in" className={styles.btnSecondary}>
          Login
        </Link>
      </div>
    </div>
  );
}
