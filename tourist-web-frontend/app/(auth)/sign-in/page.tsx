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

const SignIn = () => {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if the user is already signed in
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      // If a token exists, redirect to the discover page (or wherever appropriate)
      router.push("/discover");
    }
  }, [router]); // Make sure to rerun the effect if router changes

  const handleSignin = async () => {
    let email;
    let password;
    if (emailRef.current && passwordRef.current) {
      email = emailRef.current.value;
      password = passwordRef.current.value;
    } else {
      toast("Something went wrong!");
      return;
    }

    // Validation check
    if (email.length == 0) {
      toast("Please enter your email.");
      return;
    } else if (password.length == 0) {
      toast("Password enter your password.");
      return;
    } 
    try {
      const responseData = await fetchAPI(createUrl("login"), "post", {
        email,
        password,
      });

      // console.log(responseData);

      // Check for successful login response

      if (responseData.statusCode === 200) {
        
        localStorage.setItem("authToken", responseData.data.accessToken);
        router.push("/discover");

      } else {
        // Check for incorrect password
        if (responseData.message === "Invalid credentials") {
          toast("Incorrect email or password. Please try again.");
        } else {
          toast(responseData.message);
        }
      }
    } catch (error) {
      // Handle network errors or issues with the API
      console.error("Error during sign-in:", error);
      toast(
        "Unable to sign in. Please check your connection or try again later."
      );
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

      <form className={styles.signinForm}>
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

        <div style={{ marginTop: "15%" }} onClick={() => handleSignin()}>
          <Button
            text={"Sign In"}
            backgroundColor={"#000"}
            textColor={"#FFF"}
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
