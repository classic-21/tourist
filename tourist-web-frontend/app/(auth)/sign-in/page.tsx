"use client";
import React, { useEffect, useRef } from "react";
import styles from "./styles.module.css";
import Button from "@/components/button/button";
import Input from "@/components/input/input";
import ImageCarousal from "@/components/imageCarousel/imageCarousal";
import Link from "next/link";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/discover");
    }
  }, [router]);

  const handleSignin = async () => {
    const email = emailRef.current?.value?.trim() ?? "";
    const password = passwordRef.current?.value ?? "";

    if (!email) {
      toast("Please enter your email.");
      return;
    }

    if (!emailRegex.test(email)) {
      toast("Please enter a valid email address.");
      return;
    }

    if (!password) {
      toast("Please enter your password.");
      return;
    }

    try {
      const responseData = await fetchAPI(createUrl("login"), "post", {
        email,
        password,
      });

      if (responseData.statusCode === 200) {
        localStorage.setItem("authToken", responseData.data.accessToken);
        router.push("/discover");
      } else {
        toast(responseData.message || "Incorrect email or password. Please try again.");
      }
    } catch {
      toast("Unable to sign in. Please check your connection or try again later.");
    }
  };

  return (
    <div className={styles.signIn}>
      <div className={styles.signinHeader}>
        <div className={styles.headerbackBtn}>
          <Link href={"/"}>
            <span>←</span>
          </Link>
        </div>
        <h2>Sign In</h2>
      </div>

      <div className={styles.banner}>
        <ImageCarousal />
      </div>

      <form className={styles.signinForm} onSubmit={(e) => { e.preventDefault(); handleSignin(); }}>
        <Input
          type="email"
          placeholder="Enter your email"
          inputRef={emailRef}
        />

        <Input
          type="password"
          placeholder="Enter your password"
          inputRef={passwordRef}
        />

        <p
          className={styles.forgotPass}
          onClick={() => toast("Password reset is coming soon. Please contact support.")}
          style={{ cursor: "pointer" }}
        >
          Forgot password?
        </p>

        <div style={{ marginTop: "15%" }}>
          <Button
            text={"Sign In"}
            backgroundColor={"#000"}
            textColor={"#FFF"}
            callMethod={handleSignin}
          />
        </div>

        <Link href={"/sign-up"}>
          <p className={styles.createAccount}>Create new Account</p>
        </Link>
      </form>
    </div>
  );
};

export default SignIn;
