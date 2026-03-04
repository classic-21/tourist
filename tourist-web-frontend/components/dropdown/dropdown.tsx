'use client'
import React, { useState, useRef, useEffect } from "react";
import styles from "./styles.module.css";
import Image from "next/image";

interface DropdownProps {
  handleLanguageChange: (language: string) => void;
  selectedLanguage: string;
  languages: string[];
}

const Dropdown = ({ handleLanguageChange, selectedLanguage, languages }: DropdownProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (language: string) => {
    handleLanguageChange(language);
    setShowDropdown(false);
  };

  if (!languages || languages.length === 0) return null;

  return (
    <div
      ref={ref}
      className={styles.dropdown}
      onClick={() => setShowDropdown((s) => !s)}
    >
      <span className={styles.selectedLabel}>
        {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
      </span>
      <span
        className={`${styles.arrow} ${
          showDropdown ? styles.arrowExpand : styles.arrowCollapse
        }`}
      >
        <Image
          alt="toggle dropdown"
          src={"/icons/down.svg"}
          height={100}
          width={100}
        />
      </span>

      {showDropdown && (
        <ul className={styles.dropdownList}>
          {languages.map((item) => (
            <li
              key={item}
              className={item === selectedLanguage ? styles.activeItem : ""}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(item);
              }}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
              {item === selectedLanguage && (
                <span className={styles.checkmark}>✓</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
