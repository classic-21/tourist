'use client'
import React, {  useState } from "react";
import styles from "./styles.module.css";
// import { languageDropdown } from "@/utils/languageOptions";
import Image from "next/image";

const Dropdown = ({ handleLanguageChange, selectedLanguage,languages }: any) => {
  
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div
      className={styles.dropdown}
      onClick={() => setShowDropdown((state) => !state)}
    >
      <span>
      {selectedLanguage}
      </span>
      <span
        className={`${styles.arrow} ${
          !showDropdown ? styles.arrowCollapse : styles.arrowExpand
        }`}
      >
        <Image
          alt="play back 10s"
          src={"/icons/down.svg"}
          height={100}
          width={100}
        />
      </span>
      {showDropdown ? (
        <ul className={styles.dropdownList}>
          {languages.map((item, id) =>
            selectedLanguage != item ? (
              <li key={id} onClick={() => handleLanguageChange(item)}>
                {item}
              </li>
            ) : (
              <></>
            )
          )}
        </ul>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Dropdown;
