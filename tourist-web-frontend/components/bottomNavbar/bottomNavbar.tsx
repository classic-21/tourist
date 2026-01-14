'use client'
import React, { useState } from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import Link from "next/link";

const items = [
  {
    label: "Discover",
    imgUrl: "/icons/home.svg",
    imgUrlActive: "/icons/home-active.svg",
    navigateTo:'/discover'
  },
  {
    label: "Profile",
    imgUrl: "/icons/profile.svg",
    imgUrlActive: "/icons/profile-active.svg",
    navigateTo:'/profile'
  },
];

const BottomNavbar = () => {
  const [selectedNavId,setSelectedNavId] = useState(0);
  return (
    <div className={styles.bottomNavbar}>
      {items.map((item, id) => (
        <Link key={id} onClick={()=>setSelectedNavId(id)} 
        className={`${styles.navBarItem} ${id === selectedNavId?styles["navBarItem-active"]:''}`}
        href={item.navigateTo}
        >
        <BottomNavbarItem
          id={id}
          label={item.label}
          imgUrl={item.imgUrl}
          imgUrlActive={item.imgUrlActive}
          isSelected={id==selectedNavId}
          />
          </Link>
      ))}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BottomNavbarItem = ({
  label,
  imgUrl,
  imgUrlActive,
  isSelected,
}: any) => {

  return (
    <>
      <div className={styles.navBarItemLogo}>
        <Image
          alt={`${label} logo`}
          src={isSelected ? imgUrlActive : imgUrl}
          height={100}
          width={100}
        />
      </div>
      <span className={styles.navBarItemText}>{label}</span>
    </>
  );
};

export default BottomNavbar;
