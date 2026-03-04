"use client";

import { useEffect, useRef, useState } from "react";
import React from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import { toast } from "react-toastify";
import CustomerSupport from "@/components/CustomerSupport/CustomerSupport";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import { useRouter } from "next/navigation";

interface ProfileData {
  name: string;
  email: string;
}

interface PurchasedTour {
  tourID: string;
  name?: string;
  place?: string;
  image?: string;
  date?: string;
  amount?: number;
}

// Sample shown when no real purchases exist (for dev/demo navigation)
const SAMPLE_TOUR: PurchasedTour = {
  tourID: "sample",
  name: "Agra Fort",
  place: "Agra, Uttar Pradesh",
  date: "September 2024",
  amount: 399,
  image: "/images/agra.png",
};

type ActiveSection = "main" | "editProfile" | "changePassword";

const Profile = () => {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [purchasedTours, setPurchasedTours] = useState<PurchasedTour[]>([]);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>("main");

  // Edit profile state
  const [editName, setEditName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const data = await fetchAPI(createUrl("profile"), "GET", null, token);
        setProfileData(data?.data ?? null);
        setEditName(data?.data?.name ?? "");
      } catch {
        toast.error("Failed to fetch profile data.");
      }
    };

    const fetchPurchasedTours = async () => {
      try {
        const data = await fetchAPI(createUrl("getPurchasedTours"), "GET", null, token);
        if (data?.statusCode === 200 && Array.isArray(data?.data)) {
          setPurchasedTours(data.data);
        }
      } catch {
        // Silently fall back to sample
      }
    };

    fetchProfile();
    fetchPurchasedTours();
  }, []);

  const confirmLogout = async () => {
    try {
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
        sessionStorage.removeItem("tourId");
        router.push("/sign-in");
      }
    } catch {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("tourId");
      router.push("/sign-in");
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast("Name cannot be empty.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setSavingProfile(true);
    try {
      const res = await fetchAPI(createUrl("updateProfile"), "PATCH", { name: editName.trim() }, token);
      if (res?.statusCode === 200) {
        setProfileData((prev) => prev ? { ...prev, name: editName.trim() } : prev);
        toast("Profile updated successfully.");
        setActiveSection("main");
      } else {
        toast(res?.message || "Failed to update profile.");
      }
    } catch {
      toast("Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      toast("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;

    setSavingPassword(true);
    try {
      const res = await fetchAPI(createUrl("changePassword"), "PATCH", { currentPassword, newPassword }, token);
      if (res?.statusCode === 200) {
        toast("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setActiveSection("main");
      } else {
        toast(res?.message || "Failed to change password.");
      }
    } catch {
      toast("Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Use real tours if available, otherwise show sample for dev/demo
  const toursToShow: PurchasedTour[] =
    purchasedTours.length > 0 ? purchasedTours : [SAMPLE_TOUR];

  if (activeSection === "editProfile") {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-row items-center gap-3 p-5 pb-3 border-b border-gray-100">
          <button onClick={() => setActiveSection("main")} className="flex justify-center items-center" aria-label="Go back">
            <Image src="/icons/backIcon.svg" alt="Back" height={20} width={20} />
          </button>
          <span className="text-[18px]">Edit Profile</span>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E170D]"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={profileData?.email || ""}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="w-full py-3 rounded-lg text-white font-semibold bg-[#8E170D] disabled:opacity-60 mt-2"
          >
            {savingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    );
  }

  if (activeSection === "changePassword") {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-row items-center gap-3 p-5 pb-3 border-b border-gray-100">
          <button onClick={() => setActiveSection("main")} className="flex justify-center items-center" aria-label="Go back">
            <Image src="/icons/backIcon.svg" alt="Back" height={20} width={20} />
          </button>
          <span className="text-[18px]">Change Password</span>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E170D]"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E170D]"
              placeholder="New password (min 8 chars)"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E170D]"
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="w-full py-3 rounded-lg text-white font-semibold bg-[#8E170D] disabled:opacity-60 mt-2"
          >
            {savingPassword ? "Saving..." : "Change Password"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Log out?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-600 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2 rounded-lg bg-[#C80000] text-white font-medium text-sm"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-row items-center gap-3 p-5 pb-2">
        <button
          onClick={() => router.back()}
          className="flex justify-center items-center"
          aria-label="Go back"
        >
          <Image
            className={styles.backIcon}
            src="/icons/backIcon.svg"
            alt="Back"
            height={20}
            width={20}
          />
        </button>
        <span className="text-[18px]">Profile</span>
      </div>

      <div className="p-4 pb-24">
        {/* Profile Card */}
        <div className="p-4 flex items-center gap-4 rounded-lg shadow-sm mb-4 bg-[#F5F5F5]">
          <img
            src={"/images/user_avatar.png"}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-700">
              {profileData?.name || "Guest User"}
            </h2>
            <p className="text-sm text-gray-500">{profileData?.email || "—"}</p>
          </div>
          <button
            onClick={() => setActiveSection("editProfile")}
            className="text-xs text-[#8E170D] border border-[#8E170D] px-3 py-1 rounded-full"
          >
            Edit
          </button>
        </div>

        {/* Account Settings */}
        <div className="rounded-lg shadow-sm mb-4 bg-[#F5F5F5] overflow-hidden">
          <h3 className="px-4 pt-3 pb-1 text-base font-medium text-gray-800">
            Account Settings
          </h3>
          <button
            onClick={() => setActiveSection("changePassword")}
            className="w-full flex items-center justify-between px-4 py-3 border-t border-gray-100"
          >
            <span className="text-sm text-gray-700">Change Password</span>
            <span className="text-gray-400 text-xl">›</span>
          </button>
        </div>

        {/* My Tours */}
        <div className="rounded-lg shadow-sm mb-4 bg-[#F5F5F5] overflow-hidden">
          <h3 className="px-4 pt-3 pb-1 text-lg font-medium text-gray-800">
            My Tours
          </h3>
          {purchasedTours.length === 0 && (
            <p className="px-4 pb-1 text-xs text-gray-400">
              Sample tour shown for preview — your purchases will appear here.
            </p>
          )}

          {toursToShow.map((tour, i) => (
            <div key={tour.tourID || i} className="flex items-center gap-4 p-4 border-t border-gray-100">
              <img
                src={tour.image || "/images/agra.png"}
                alt={tour.name || "Tour"}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/agra.png";
                }}
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700">
                  {tour.name || "Tour"}
                </h4>
                <p className="text-[0.6rem] text-gray-500">{tour.place || "—"}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {tour.date && (
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {tour.date}
                    </span>
                  )}
                  {tour.amount != null && (
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      ₹{tour.amount}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-gray-400 text-xl flex-shrink-0">›</div>
            </div>
          ))}

          <div className="border-t border-gray-200" />
          <div className="p-4 flex items-center justify-between">
            <p className="font-medium text-base text-gray-700">Booking history</p>
            <div className="text-gray-400 text-xl">›</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3 rounded-lg text-white font-semibold bg-[#C80000] mb-4"
        >
          Logout
        </button>

        <CustomerSupport />

        <div className="text-center text-xs text-gray-500 pt-3">
          Current Version: 2.2.1.2001
        </div>
      </div>
    </>
  );
};

export default Profile;
