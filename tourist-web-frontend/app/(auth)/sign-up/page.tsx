"use client";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import React, { useEffect, useRef } from "react";
import styles from "./styles.module.css";
import ImageCarousal from "@/components/imageCarousel/imageCarousal";
import Link from "next/link";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp = () => {
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/discover");
    }
  }, [router]);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSignup = async () => {
    const name = nameRef.current?.value?.trim() ?? "";
    const email = emailRef.current?.value?.trim() ?? "";
    const password = passwordRef.current?.value ?? "";

    if (!name) {
      toast("Please enter your name.");
      return;
    }

    if (!email) {
      toast("Please enter your email.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast("Password must be at least 8 characters.");
      return;
    }

    try {
      const responseData = await fetchAPI(createUrl("signup"), "post", {
        name,
        email,
        password,
      });

      if (responseData?.statusCode === 200) {
        toast("Account created! Please sign in.");
        router.push("/sign-in");
      } else {
        toast(responseData?.message || "Something went wrong!");
      }
    } catch {
      toast("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={styles.signUp}>
      <div className={styles.signupHeader}>
        <div className={styles.headerbackBtn}>
          <Link href={"/"}>
            <span>←</span>
          </Link>
        </div>
        <h2>Sign Up</h2>
      </div>

      <div className={styles.banner}>
        <ImageCarousal />
      </div>

      <form className={styles.signupForm} onSubmit={(e) => { e.preventDefault(); handleSignup(); }}>
        <Input type="text" placeholder="Enter your name" inputRef={nameRef} />
        <Input
          type="email"
          placeholder="Enter your email"
          inputRef={emailRef}
        />
        <Input
          type="password"
          placeholder="Enter your password (min 8 chars)"
          inputRef={passwordRef}
        />

        <p className="text-xs text-gray-400 px-1 mt-1">
          Password must be at least 8 characters.
        </p>

        <div style={{ marginTop: "15%" }}>
          <Button
            text={"Sign Up"}
            backgroundColor={"#000"}
            textColor={"#FFF"}
            callMethod={handleSignup}
          />
        </div>

        <Link href={"/sign-in"}>
          <p className={styles.haveAccount}>Already have an Account</p>
        </Link>
      </form>
    </div>
  );
};

export default SignUp;
