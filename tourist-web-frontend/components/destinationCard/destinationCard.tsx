"use client";
import React, { useState } from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import Link from "next/link";

interface Props {
  destination: string;
  location: string;
  imgUrl: string | null;
  navigateTo: string;
  tourId: string;
  isLiked?: boolean;
  onLikeToggle?: (tourId: string, newLikedState: boolean) => void;
}

const DestinationCard = ({
  destination,
  location,
  imgUrl,
  navigateTo,
  tourId,
  isLiked = false,
  onLikeToggle,
}: Props) => {
  const [liked, setLiked] = useState(isLiked);
  const [toggling, setToggling] = useState(false);

  const handleCardClick = () => {
    sessionStorage.setItem("tourId", JSON.stringify(tourId));
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (toggling) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setToggling(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}likes/${tourId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (data?.statusCode === 200) {
        const newState = data.data?.liked ?? !liked;
        setLiked(newState);
        onLikeToggle?.(tourId, newState);
      }
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className={styles.cardContainer} onClick={handleCardClick}>
      <Link href={navigateTo}>
        <div className={styles.imageContainer} style={{ position: "relative" }}>
          <img
            className="h-52 w-full object-cover"
            src={imgUrl || "/images/agra.png"}
            alt={destination}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/agra.png";
            }}
          />
          {/* Heart button */}
          <button
            onClick={handleHeartClick}
            aria-label={liked ? "Unlike" : "Like"}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(255,255,255,0.85)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: toggling ? "default" : "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              opacity: toggling ? 0.6 : 1,
            }}
          >
            <Image
              src={liked ? "/icons/heartfilled.svg" : "/icons/Heart.svg"}
              alt={liked ? "Liked" : "Like"}
              width={18}
              height={18}
            />
          </button>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className={styles.destinationDetails}>
            <span className={styles.destination}>{destination}</span>
            <span>{location}</span>
          </div>
          <div className={styles.avatarGroup}>
            <Image
              alt="viewers"
              src={"/images/avatargroup.png"}
              height={100}
              width={100}
            />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DestinationCard;
