"use client";
import { useEffect, useState } from "react";
// import { CounterStoreProvider } from "../providers/counter";
import styles from "./styles.module.css";
import Button from "@/components/button/button";
import HomeSkeleton from "@/components/skeletons/home/home-skeleton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return isLoading ? (
    <HomeSkeleton />
  ) : (
    <div className={styles.home}>
      <h1 className={styles.heading}>Explore Uttar Pradesh through audio!</h1>

      <div className={styles.buttons}>
        <Button
          text={"Get Started"}
          backgroundColor={"#FFF"}
          textColor={"#8E170D"}
          navigateTo={"sign-up"}
        />

        <Button
          text={"Login"}
          backgroundColor={"rgba(255, 255, 255, 0.32)"}
          textColor={"#FFF"}
          backdropFilter="blur(4px)"
          navigateTo={"sign-in"}
        />
      </div>
      
    </div>
  );
}
