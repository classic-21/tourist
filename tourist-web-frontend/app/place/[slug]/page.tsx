"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI, createUrl } from "@/utils/apiUtils";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ShowError from "@/components/ShowError/ShowError";
import { toast } from "react-toastify";

interface Scenic {
  id: string;
  name: string;
  description?: { en?: string; hi?: string };
  imageUrl?: string;
  order: number;
  languages: string[];
}

interface Place {
  id: string;
  name: string;
  description?: { en?: string; hi?: string };
  imageUrl?: string;
  amount: number;
  districtID: string;
  purchased: boolean;
  scenics: Scenic[];
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadScript = (src: string): Promise<boolean> =>
  new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const PlaceDetail = () => {
  const params = useParams();
  const router = useRouter();
  const placeId = params.slug as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const fetchPlace = async () => {
      try {
        const data = await fetchAPI(createUrl("getPlace", placeId), "GET", null, token);
        if (data?.statusCode === 200) {
          setPlace(data.data);
        } else {
          setError("Place not found.");
        }
      } catch {
        setError("Failed to load place.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [placeId, router]);

  const handleBuyPlace = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !place || paying) return;

    setPaying(true);

    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded) {
      toast("Payment SDK failed to load.");
      setPaying(false);
      return;
    }

    try {
      const data = await fetchAPI(
        createUrl("createPlaceOrder", place.id),
        "POST",
        null,
        token
      );

      // Dev mode — backend grants access directly, no Razorpay needed
      if (!data?.data?.paymentOrderID) {
        if (data?.statusCode === 200) {
          toast("Access granted!");
          const updated = await fetchAPI(createUrl("getPlace", place.id), "GET", null, token);
          if (updated?.data) setPlace(updated.data);
        } else {
          toast("Could not create order. Please try again.");
        }
        setPaying(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        currency: "INR",
        amount: data.data.amount,
        name: "Indian Narrated",
        description: `${place.name} Audio Tour`,
        order_id: data.data.paymentOrderID,
        handler: async () => {
          toast("Payment successful! Refreshing access...");
          const updated = await fetchAPI(createUrl("getPlace", place.id), "GET", null, token);
          if (updated?.data) setPlace(updated.data);
          setPaying(false);
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

  if (error || !place) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Place not found"
        paragraph={error || "This place could not be loaded."}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 p-5 pb-3 border-b border-gray-100">
        <button onClick={() => router.back()} aria-label="Go back">
          <Image src="/icons/backIcon.svg" alt="Back" height={20} width={20} />
        </button>
        <span className="text-[18px]">{place.name}</span>
        {place.purchased && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            Access Unlocked
          </span>
        )}
      </div>

      {/* Cover image */}
      <div className="relative w-full" style={{ height: "200px" }}>
        <img
          src={place.imageUrl || "/images/taj_mahal.jpg"}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/images/taj_mahal.jpg"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <h1 className="text-xl font-bold">{place.name}</h1>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Description */}
        {place.description?.en && (
          <p className="text-sm text-gray-600 leading-relaxed">{place.description.en}</p>
        )}

        {/* CTA — buy place */}
        {!place.purchased && (
          <div className="bg-[#FFF5F5] border border-[#8E170D]/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Place Access</p>
              <p className="text-xs text-gray-500">
                Unlock all {place.scenics.length} audio stop{place.scenics.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {place.amount > 0 && (
                <button
                  onClick={handleBuyPlace}
                  disabled={paying}
                  className="bg-[#8E170D] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                >
                  {paying ? "Processing..." : `Buy ₹${place.amount}`}
                </button>
              )}
              <button
                onClick={() => router.push(`/district/${place.districtID}`)}
                className="text-xs text-[#8E170D] underline"
              >
                Buy District Package instead
              </button>
            </div>
          </div>
        )}

        {/* Scenic stops */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Audio Stops ({place.scenics.length})
          </h2>
          <div className="flex flex-col gap-3">
            {place.scenics.map((scenic, idx) => (
              <button
                key={scenic.id}
                onClick={() => {
                  if (!place.purchased) {
                    toast("Purchase this place or district to access audio.");
                    return;
                  }
                  router.push(`/scenic-play/${scenic.id}`);
                }}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F5F5] shadow-sm text-left w-full"
              >
                {/* Stop number badge */}
                <div className="w-10 h-10 rounded-full bg-[#8E170D]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#8E170D] font-bold text-sm">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">{scenic.name}</h3>
                  {scenic.description?.en && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{scenic.description.en}</p>
                  )}
                  {scenic.languages.length > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {scenic.languages.join(" · ")}
                    </p>
                  )}
                </div>
                {place.purchased ? (
                  <Image src="/icons/audio-play.svg" alt="Play" width={24} height={24} className="flex-shrink-0 opacity-60" />
                ) : (
                  <span className="text-gray-300 text-xl flex-shrink-0">🔒</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
