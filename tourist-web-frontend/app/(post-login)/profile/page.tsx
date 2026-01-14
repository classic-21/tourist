/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import { toast } from "react-toastify";
import CustomerSupport from "@/components/CustomerSupport/CustomerSupport";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import Button from "@/components/button/button";
import { useRouter } from "next/navigation";

const Profile = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (token) {
        try {
          const data = await fetchAPI(createUrl("profile"), "GET", null, token);
          // console.log(data);
          setProfileData(data);
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to fetch profile data", {
            style: {
              backgroundColor: "#333", // Dark background color
              color: "#fff", // White text color
              borderRadius: "8px", // Optional: rounded corners
              padding: "10px", // Optional: add padding
            },
          });
        }
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_ENDPOINT + "users/logout",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        credentials: "include",
      }
    );
    const res = await response.json();

    if (res.statusCode === 200 || res.statusCode === 400) {
      localStorage.removeItem("authToken");
      router.push("/sign-in");
    }
  };

  return (
    <>
      <div className="flex flex-row items-center justify-center w-full">
        <div className="flex flex-row items-center justify-between p-5 pb-2 w-full">
          <div className="flex flex-row items-center  justify-center gap-3">
            <button className="flex justify-center items-center ">
              <Image
                className={`flex justify-center ${styles.backIcon}`}
                src="/icons/backIcon.svg"
                alt="Back Icon"
                height={20}
                width={20}
              />
            </button>
            <span className="text-[18px]">Profile</span>
          </div>
        </div>
      </div>
      <div className="p-4" style={{ height: "100vh" }}>
        {/* Profile Card */}
        <div className="p-4 flex items-center gap-4 rounded-lg shadow-md mb-4 bg-[#F5F5F5]">
          <img
            src={"/images/user_avatar.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-700">
              {profileData?.data?.name || "Alexandra Morgan"}
            </h2>
            <p className="text-sm text-gray-500">
              {profileData?.data?.email || "alexandra.morgan@gmail.com"}
            </p>
          </div>
        </div>

        {/* My Tours Section */}
        <div className="rounded-lg shadow-md mb-4 bg-[#F5F5F5]">
          <h3 className="px-4 pt-3 text-lg font-medium  text-gray-800">
            My Tours
          </h3>

          <div className="flex items-center gap-4 p-4">
            <img
              src={"/images/agra.png"}
              alt="Agra Fort"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="text-md font-medium text-gray-700">Agra Fort</h4>
              <p className="text-[0.6rem] text-gray-500">Agra, Uttar Pradesh</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  September 2024
                </span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  ₹399
                </span>
              </div>
            </div>
            <div className="text-gray-400 text-xl">&#8250;</div>
          </div>

          <div className="flex items-center gap-4 p-4">
            <img
              src={"/images/agra.png"}
              alt="Agra Fort"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="text-md font-medium text-gray-700">Agra Fort</h4>
              <p className="text-[0.6rem] text-gray-500">Agra, Uttar Pradesh</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  September 2024
                </span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  ₹399
                </span>
              </div>
            </div>
            <div className="text-gray-400 text-xl">&#8250;</div>
          </div>
          <div className="border border-grey-800"></div>
          <div className="p-4 flex items-center justify-between rounded-lg shadow-md bg-[#F5F5F5]">
            <p className="font-medium text-base">Booking history</p>
            <div className="text-gray-400 text-xl">&#8250;</div>
          </div>
        </div>

        <div onClick={handleLogout}>
          <Button
            text={"Logout"}
            backgroundColor={"#C80000"}
            textColor={"#FFF"}
          />
        </div>
        <CustomerSupport />

        <div className="text-center text-xs text-gray-500 pt-3">
          Current Version: 2.2.1.2001
        </div>
      </div>
    </>
  );
};

export default Profile;
