"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUrl, fetchAPI } from "@/utils/apiUtils";

interface LikedTour {
  tourID: string;
  name: string;
  place: string;
  amount?: number;
}

// Sample placeholder for dev/demo — shows what the liked page will look like
const SAMPLE_LIKED: LikedTour = {
  tourID: "sample-1",
  name: "Agra Fort",
  place: "Agra, Uttar Pradesh",
  amount: 399,
};

const Liked = () => {
  const router = useRouter();
  const [likedTours, setLikedTours] = useState<LikedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlikingId, setUnlikingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const fetchLiked = async () => {
      try {
        const data = await fetchAPI(createUrl("getLiked"), "GET", null, token);
        if (data?.statusCode === 200 && Array.isArray(data?.data)) {
          setLikedTours(data.data);
        }
      } catch {
        // silently show sample
      } finally {
        setLoading(false);
      }
    };

    fetchLiked();
  }, []);

  const handleUnlike = async (tourID: string) => {
    const token = localStorage.getItem("authToken");
    if (!token || unlikingId) return;

    setUnlikingId(tourID);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}likes/${tourID}`,
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
      if (data?.statusCode === 200 && data?.data?.liked === false) {
        setLikedTours((prev) => prev.filter((t) => t.tourID !== tourID));
      }
    } catch {
      // ignore
    } finally {
      setUnlikingId(null);
    }
  };

  const toursToShow = likedTours;
  const showSample = !loading && likedTours.length === 0;

  return (
    <div className="flex flex-col" style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div className="flex flex-row items-center gap-3 p-5 pb-3 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="flex justify-center items-center"
          aria-label="Go back"
        >
          <Image src="/icons/backIcon.svg" alt="Back" height={20} width={20} />
        </button>
        <span className="text-[18px]">Liked Tours</span>
        <Image
          src="/icons/heartfilled.svg"
          alt="Liked"
          height={18}
          width={18}
          className="ml-1"
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        {loading && (
          <p className="text-sm text-gray-400 text-center py-6">Loading...</p>
        )}

        {/* Sample placeholder */}
        {showSample && (
          <>
            <p className="text-xs text-gray-400 mb-1">
              Sample tour shown for preview — tours you like will appear here.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#F5F5F5] shadow-sm">
              <img
                src="/images/agra.png"
                alt={SAMPLE_LIKED.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/agra.png";
                }}
              />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-700">{SAMPLE_LIKED.name}</h4>
                <p className="text-xs text-gray-500">{SAMPLE_LIKED.place}</p>
                {SAMPLE_LIKED.amount && (
                  <p className="text-xs text-[#8E170D] font-medium mt-1">₹{SAMPLE_LIKED.amount}</p>
                )}
              </div>
              <Image src="/icons/heartfilled.svg" alt="Liked" height={20} width={20} className="flex-shrink-0" />
            </div>
          </>
        )}

        {/* Real liked tours */}
        {toursToShow.map((tour) => (
          <div
            key={tour.tourID}
            className="flex items-center gap-4 p-4 rounded-lg bg-[#F5F5F5] shadow-sm"
          >
            <img
              src="/images/agra.png"
              alt={tour.name}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/agra.png";
              }}
            />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-700">{tour.name}</h4>
              <p className="text-xs text-gray-500">{tour.place}</p>
              {tour.amount != null && (
                <p className="text-xs text-[#8E170D] font-medium mt-1">₹{tour.amount}</p>
              )}
            </div>
            <button
              onClick={() => handleUnlike(tour.tourID)}
              disabled={unlikingId === tour.tourID}
              aria-label="Unlike"
              className="flex-shrink-0 opacity-100 disabled:opacity-50"
            >
              <Image src="/icons/heartfilled.svg" alt="Unlike" height={20} width={20} />
            </button>
          </div>
        ))}

        {/* Empty state (only when real data loaded and empty) */}
        {!loading && !showSample && likedTours.length === 0 && (
          <div className="mt-6 p-4 rounded-lg bg-gray-50 text-center">
            <Image
              src="/icons/Heart.svg"
              alt="Heart"
              height={40}
              width={40}
              className="mx-auto mb-2 opacity-30"
            />
            <p className="text-sm text-gray-400">
              Like a tour from the Discover page to save it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Liked;
