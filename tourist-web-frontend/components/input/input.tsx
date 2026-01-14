"use client";
import React from "react";
import styles from "./styles.module.css";

interface Props {
  type: string;
  placeholder: string;
  inputRef: React.RefObject<HTMLInputElement>;
}

const Input = ({ type, placeholder, inputRef }: Props) => {
  return (
    <div className={styles.inputContainer}>
      <input type={type} placeholder={placeholder} ref={inputRef} />
    </div>
  );
};

export default Input;
