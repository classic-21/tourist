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

const SignUp = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is already signed in
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      // If a token exists, redirect to the discover page (or wherever appropriate)
      router.push("/discover");
    }
  }, [router]); // Make sure to rerun the effect if router changes

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const handleSignup = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      toast("Something went wrong!");
      return;
    }

    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    // console.log(name, email, password);

    // if (name.length == 0 || email.length == 0 || password.length < 5) {
    //   console.log("please enter the correct details");

    //   return;
    // }

    const responseData = await fetchAPI(createUrl("signup"), "post", {
      name,
      email,
      password,
    });

    console.log(responseData);

    if (responseData.statusCode == 200) {
      router.push("/sign-in");
    } else {
      toast(responseData.message);
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

      <form className={styles.signupForm}>
        <Input type="text" placeholder="Enter your name" inputRef={nameRef} />
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

        <p className={styles.forgotPass}>Forgot password?</p>

        <div style={{ marginTop: "15%" }} onClick={() => handleSignup()}>
          <Button
            text={"Sign Up"}
            backgroundColor={"#000"}
            textColor={"#FFF"}
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
