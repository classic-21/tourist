"use client";
import ShowError from "@/components/ShowError/ShowError";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./styles.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import { Pagination, A11y, Autoplay } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { toast } from "react-toastify";

interface TourImage {
  id: number;
  url: string;
  description: string;
}

interface TourData {
  id: string;
  name: string;
  place: string;
  amount: number;
  description: { english?: string } | string;
  images: TourImage[];
  trialAudioUrl?: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
}

interface ReviewData {
  reviews: Review[];
  averageRating: number | null;
  totalReviews: number;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function TourDetail({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;

  const [audioClicked, setAudioClicked] = useState(false);
  const audioPlayPauseRef = useRef<HTMLAudioElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [tourData, setTourData] = useState<TourData | null>(null);
  const [trialAudioUrl, setTrialAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Reviews state
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tourId, setTourId] = useState<string | null>(null);

  const MAX_CHAR_COUNT = 200;

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("authToken") || undefined;
        const tours = await fetchAPI(createUrl("getTourList"), "GET");
        const tour = tours?.data?.find(
          (t: { id: string; name: string }) =>
            generateSlug(t.name.toLowerCase()) === slug.toLowerCase()
        );

        if (!tour) {
          setError("Tour not found.");
          return;
        }

        // Store tourId in sessionStorage immediately on page load
        sessionStorage.setItem("tourId", JSON.stringify(tour.id));
        setTourId(tour.id);

        // Check subscription status
        try {
          const subCheck = await fetchAPI(
            createUrl("checkSubscription", tour.id),
            "GET",
            {},
            token
          );
          setIsSubscribed(
            subCheck?.statusCode === 200 && subCheck?.data?.status === "Success"
          );
        } catch {
          setIsSubscribed(false);
        }

        // Fetch full tour details + reviews in parallel
        const [details, reviewsRes] = await Promise.all([
          fetchAPI(createUrl("getTourDetails", tour.id), "GET", null, token),
          fetchAPI(createUrl("getReviews", tour.id), "GET").catch(() => null),
        ]);

        setTourData(details?.data ?? null);
        if (reviewsRes?.statusCode === 200) {
          setReviewData(reviewsRes.data);
        }

        if (details?.data?.trialAudioUrl) {
          setTrialAudioUrl(details.data.trialAudioUrl);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tour.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  if (loading) return <LoadingComponent />;

  if (error || !tourData) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Oops! Something went wrong."
        paragraph="We are having some trouble loading this tour. Please try again later."
      />
    );
  }

  const handlePayment = () => {
    // tourId is already in sessionStorage from loadData above
    if (isSubscribed) {
      router.push(`/tour-play/${slug}`);
    } else {
      router.push("/payment/confirmation");
    }
  };

  const handleAudioClick = () => {
    setAudioClicked((prev) => {
      const next = !prev;
      if (audioPlayPauseRef.current) {
        if (next) {
          audioPlayPauseRef.current.load();
          audioPlayPauseRef.current.play();
        } else {
          audioPlayPauseRef.current.pause();
        }
      }
      return next;
    });
  };

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      toast("Please select a star rating.");
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token || !tourId) return;

    setSubmittingReview(true);
    try {
      const res = await fetchAPI(
        createUrl("addReview", tourId),
        "POST",
        { rating: userRating, comment: reviewComment.trim() },
        token
      );
      if (res?.statusCode === 200) {
        toast("Review submitted!");
        // Refresh reviews
        const reviewsRes = await fetchAPI(createUrl("getReviews", tourId), "GET").catch(() => null);
        if (reviewsRes?.statusCode === 200) setReviewData(reviewsRes.data);
        setUserRating(0);
        setReviewComment("");
      } else {
        toast(res?.message || "Failed to submit review.");
      }
    } catch {
      toast("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const description =
    typeof tourData.description === "object"
      ? tourData.description?.english ?? ""
      : tourData.description ?? "";

  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-5 pb-2 w-full">
        <div className="flex flex-row items-center justify-center gap-3">
          <Link href={"/discover"}>
            <Image
              className={styles.backIcon}
              src="/icons/backIcon.svg"
              alt="Back"
              height={20}
              width={20}
            />
          </Link>
          <span className="text-[18px]">Tour Details</span>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="w-full">
        {tourData.images?.length > 0 ? (
          <Swiper
            modules={[Pagination, Autoplay, A11y]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000 }}
            style={{ height: "220px" }}
          >
            {tourData.images.map((item) => (
              <SwiperSlide key={item.id}>
                <div className="bg-gray-200 h-full flex items-center justify-center">
                  <img
                    src={item.url}
                    alt={item.description || tourData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/agra.png";
                    }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="h-[220px] bg-gray-200">
            <img
              src="/images/agra.png"
              alt={tourData.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Tour name + place + viewers */}
      <div className="flex w-full justify-between p-5">
        <div className="flex flex-col">
          <span className="text-[18px] font-semibold">{tourData.name}</span>
          <span className="text-[14px] text-[#666666]">{tourData.place}</span>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src={"/icons/peopleViewedIcon.svg"}
            alt="Viewers"
            width={80}
            height={80}
          />
        </div>
      </div>

      {/* Audio Preview Player */}
      <div className="px-5 pb-4">
        <div className="flex rounded-[10px] bg-[#F5F5F5] w-full p-3">
          <div className="flex justify-between items-center w-full gap-3">
            <div className="flex gap-3 items-center">
              <img
                className="rounded w-[60px] h-[60px] object-cover flex-shrink-0"
                src={tourData.images?.[0]?.url || "/images/agra.png"}
                alt={tourData.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/agra.png";
                }}
              />
              <div className="flex flex-col justify-center">
                <p className="text-base font-medium">{tourData.name}</p>
                <p className="text-xs text-[#666666]">{tourData.place}</p>
                {!trialAudioUrl && (
                  <p className="text-xs text-[#999] mt-1">No preview available</p>
                )}
              </div>
            </div>
            {trialAudioUrl && (
              <div
                className="flex-shrink-0 flex justify-center items-center rounded-full bg-white h-[48px] w-[48px] shadow-sm cursor-pointer"
                onClick={handleAudioClick}
              >
                <audio src={trialAudioUrl} ref={audioPlayPauseRef} preload="none" />
                <Image
                  src={audioClicked ? "/icons/audio-pause.svg" : "/icons/audio-play.svg"}
                  alt={audioClicked ? "Pause preview" : "Play preview"}
                  width={20}
                  height={20}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-[#F5F5F5] mx-5 rounded-lg p-4">
        <p className="text-[#666666] text-[14px] leading-relaxed">
          {isExpanded
            ? description
            : `${description.substring(0, MAX_CHAR_COUNT)}${description.length > MAX_CHAR_COUNT ? "..." : ""}`}
          {!isExpanded && description.length > MAX_CHAR_COUNT && (
            <span
              onClick={() => setIsExpanded(true)}
              className="underline text-[#434343] cursor-pointer ml-1 font-medium"
            >
              Read more
            </span>
          )}
          {isExpanded && (
            <span
              onClick={() => setIsExpanded(false)}
              className="underline text-[#434343] cursor-pointer ml-1 font-medium"
            >
              {" "}Show less
            </span>
          )}
        </p>
      </div>

      {/* Price tag */}
      {!isSubscribed && tourData.amount > 0 && (
        <div className="flex justify-between items-center mx-5 mt-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
          <span className="text-sm text-gray-500">Tour Price</span>
          <span className="font-semibold text-[#8E170D] text-lg">
            ₹{tourData.amount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mx-5 mt-4">
        {/* Rating summary */}
        {reviewData && reviewData.totalReviews > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl font-bold text-gray-800">{reviewData.averageRating}</span>
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={s <= Math.round(reviewData.averageRating ?? 0) ? "text-yellow-400" : "text-gray-300"} style={{ fontSize: "18px" }}>★</span>
              ))}
            </div>
            <span className="text-sm text-gray-500">({reviewData.totalReviews} review{reviewData.totalReviews !== 1 ? "s" : ""})</span>
          </div>
        )}

        {/* Write a review (only for subscribed users) */}
        {isSubscribed && (
          <div className="bg-[#F5F5F5] rounded-lg p-4 mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Leave a Review</h4>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUserRating(s)}
                  className="text-2xl transition-colors"
                  style={{ color: s <= (hoverRating || userRating) ? "#F59E0B" : "#D1D5DB" }}
                  aria-label={`Rate ${s} star${s !== 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={3}
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#8E170D] bg-white mb-2"
            />
            <button
              onClick={handleSubmitReview}
              disabled={submittingReview || userRating === 0}
              className="w-full py-2 rounded-lg bg-[#8E170D] text-white text-sm font-semibold disabled:opacity-50"
            >
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {/* Reviews list */}
        {reviewData && reviewData.reviews.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Reviews</h4>
            <div className="flex flex-col gap-3">
              {reviewData.reviews.slice(0, 5).map((r) => (
                <div key={r.id} className="bg-[#F5F5F5] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{r.userName}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} style={{ color: s <= r.rating ? "#F59E0B" : "#D1D5DB", fontSize: "14px" }}>★</span>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-xs text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button — fixed at bottom */}
      <div className="p-4 border-t fixed bottom-0 left-0 right-0 bg-white z-10">
        <button
          onClick={handlePayment}
          className="w-full text-white py-3 text-center rounded-lg shadow-sm font-semibold bg-[#8E170D]"
        >
          {isSubscribed ? "▶  Start Listening" : `Pay ₹${tourData.amount?.toFixed(2)} & Enjoy`}
        </button>
      </div>
    </div>
  );
}
