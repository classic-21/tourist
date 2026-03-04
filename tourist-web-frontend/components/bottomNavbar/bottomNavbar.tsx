'use client'
import React from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    label: "Discover",
    imgUrl: "/icons/home.svg",
    imgUrlActive: "/icons/home-active.svg",
    navigateTo: "/discover",
  },
  {
    label: "Search",
    imgUrl: "/icons/Magnifer.svg",
    imgUrlActive: "/icons/Magnifer.svg",
    navigateTo: "/search",
  },
  {
    label: "Profile",
    imgUrl: "/icons/profile.svg",
    imgUrlActive: "/icons/profile-active.svg",
    navigateTo: "/profile",
  },
];

const BottomNavbar = () => {
  const pathname = usePathname();

  return (
    <div className={styles.bottomNavbar}>
      {items.map((item) => {
        const isActive = pathname === item.navigateTo;
        return (
          <Link
            key={item.navigateTo}
            className={`${styles.navBarItem} ${isActive ? styles["navBarItem-active"] : ""}`}
            href={item.navigateTo}
          >
            <div className={styles.navBarItemLogo}>
              <Image
                alt={`${item.label} icon`}
                src={isActive ? item.imgUrlActive : item.imgUrl}
                height={100}
                width={100}
              />
            </div>
            <span className={styles.navBarItemText}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavbar;
