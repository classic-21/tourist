"use client";
import Image from "next/image";
import styles from "./styles.module.css";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ShowError from "@/components/ShowError/ShowError";
import { createUrl, fetchAPI } from "@/utils/apiUtils";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface TourData {
  id: string;
  name: string;
  place: string;
  amount: number;
  images?: { url: string }[];
}

const Confirmation = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tourData, setTourData] = useState<TourData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [tourMissing, setTourMissing] = useState(false);

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        const authToken = localStorage.getItem("authToken");
        setToken(authToken);

        const tourId = (() => {
          try {
            return JSON.parse(sessionStorage.getItem("tourId") ?? "null");
          } catch {
            return null;
          }
        })();

        if (!tourId) {
          setTourMissing(true);
          return;
        }

        const [data, subscriptionResponse] = await Promise.all([
          fetchAPI(createUrl("getTourDetails", tourId), "GET", null, authToken),
          fetchAPI(createUrl("checkSubscription", tourId), "GET", null, authToken),
        ]);

        if (
          subscriptionResponse?.statusCode === 200 &&
          subscriptionResponse?.data?.status === "Success"
        ) {
          const slug = generateSlug(data?.data?.name?.toLowerCase() ?? "");
          router.replace(`/tour-play/${slug}`);
          return;
        }

        setTourData(data?.data ?? null);
      } catch {
        toast("Something went wrong loading tour details.");
        router.push("/discover");
      } finally {
        setLoading(false);
      }
    };

    fetchTourData();
  }, [router]);

  const handlePayment = async () => {
    if (!tourData || !token || paying) return;

    setPaying(true);

    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded) {
      toast("Payment SDK failed to load. Please check your connection.");
      setPaying(false);
      return;
    }

    try {
      const data = await fetchAPI(createUrl("order", tourData.id), "post", null, token);

      if (!data?.data?.paymentOrderID) {
        toast("Could not create order. Please try again.");
        setPaying(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        currency: "INR",
        amount: data.data.amount,
        name: "Kshipra Ventures",
        description: "Thank you for booking an audio tour",
        order_id: data.data.paymentOrderID,
        handler: async (response: { razorpay_payment_id?: string }) => {
          if (!response.razorpay_payment_id) {
            toast("Payment failed. Please try again.");
            setPaying(false);
            return;
          }

          try {
            const validation = await fetchAPI(
              createUrl("confirmOrder", data.data.id),
              "GET",
              null,
              token
            );

            if (validation?.statusCode === 200 && validation?.data?.status === 1) {
              toast("Payment successful!");
              const slug = generateSlug(tourData.name.toLowerCase());
              router.push(`/tour-play/${slug}`);
            } else {
              toast("Payment is being processed. Please check My Tours shortly.");
              setPaying(false);
            }
          } catch {
            toast("Error confirming payment. Please contact support.");
            setPaying(false);
          }
        },
        theme: { color: "#8E170D" },
        modal: {
          ondismiss: () => {
            toast("Payment cancelled.");
            setPaying(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch {
      toast("Payment failed. Please try again later.");
      setPaying(false);
    }
  };

  if (loading) return <LoadingComponent />;

  if (tourMissing) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="No tour selected."
        paragraph="Please go back and select a tour to continue."
      />
    );
  }

  if (!tourData) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Oops! Something went wrong."
        paragraph="We could not load the tour details. Please try again later."
      />
    );
  }

  const tourPrice = tourData.amount?.toFixed(2);
  const taxAmount = (tourData.amount * 0.18).toFixed(2);
  const totalPrice = (tourData.amount + Number(taxAmount)).toFixed(2);

  return (
    <>
      <div className="flex flex-row items-center justify-between p-5 pb-2 w-full">
        <div className="flex flex-row items-center justify-center gap-3">
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
          <span className="text-[18px]">Confirmation</span>
        </div>
      </div>

      <div className="min-h-[92vh] bg-gray-50 flex flex-col justify-between">
        <div className="p-2">
          <div className="rounded-lg m-2 p-2 overflow-hidden bg-[#F5F5F5]">
            <img
              src={tourData.images?.[0]?.url || "/images/agra.png"}
              alt={tourData.name}
              className="w-full rounded-lg object-cover"
              style={{ maxHeight: "200px" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/agra.png";
              }}
            />

            <div className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-700">{tourData.name}</h2>
                  <p className="text-sm text-gray-500">{tourData.place}</p>
                </div>
                <span className="bg-white text-xs font-medium px-2 py-1 rounded-md text-gray-600">
                  Online
                </span>
              </div>
            </div>

            <hr />

            <div className="border-t my-2 p-3 text-sm bg-white rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Tour Price</span>
                <span className="font-medium text-gray-600">₹{tourPrice}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Tax (18% GST)</span>
                <span className="font-medium text-gray-600">₹{taxAmount}</span>
              </div>
              <hr />
              <div className="flex justify-between mt-2">
                <span className="text-gray-800 font-semibold">Total Price</span>
                <span className="font-semibold text-gray-800">₹{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handlePayment}
            disabled={paying}
            className={`w-full text-white py-3 rounded-lg shadow-md font-semibold transition-opacity ${
              paying ? "bg-gray-400 cursor-not-allowed" : "bg-[#8E170D]"
            }`}
          >
            {paying ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </>
  );
};

export default Confirmation;
