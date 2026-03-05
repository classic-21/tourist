"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI, createUrl } from "@/utils/apiUtils";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ShowError from "@/components/ShowError/ShowError";
import { toast } from "react-toastify";

interface Place {
  id: string;
  name: string;
  description?: { en?: string; hi?: string };
  imageUrl?: string;
  order: number;
  amount: number;
}

interface District {
  id: string;
  name: string;
  description?: { en?: string; hi?: string };
  imageUrl?: string;
  amount: number;
  state: string;
  purchased: boolean;
  places: Place[];
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

const DistrictDetail = () => {
  const params = useParams();
  const router = useRouter();
  const districtId = params.slug as string;

  const [district, setDistrict] = useState<District | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const fetchDistrict = async () => {
      try {
        const data = await fetchAPI(createUrl("getDistrict", districtId), "GET", null, token);
        if (data?.statusCode === 200) {
          setDistrict(data.data);
        } else {
          setError("District not found.");
        }
      } catch {
        setError("Failed to load district.");
      } finally {
        setLoading(false);
      }
    };

    fetchDistrict();
  }, [districtId, router]);

  const handleBuyDistrict = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !district || paying) return;

    setPaying(true);

    const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!loaded) {
      toast("Payment SDK failed to load.");
      setPaying(false);
      return;
    }

    try {
      const data = await fetchAPI(
        createUrl("createDistrictOrder", district.id),
        "POST",
        null,
        token
      );

      // Dev mode — backend grants access directly, no Razorpay needed
      if (!data?.data?.paymentOrderID) {
        if (data?.statusCode === 200) {
          toast("Access granted!");
          const updated = await fetchAPI(createUrl("getDistrict", district.id), "GET", null, token);
          if (updated?.data) setDistrict(updated.data);
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
        description: `${district.name} District Audio Tour`,
        order_id: data.data.paymentOrderID,
        handler: async () => {
          toast("Payment successful! Refreshing access...");
          const updated = await fetchAPI(createUrl("getDistrict", district.id), "GET", null, token);
          if (updated?.data) setDistrict(updated.data);
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

  if (error || !district) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="District not found"
        paragraph={error || "This district could not be loaded."}
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
        <span className="text-[18px]">{district.name}</span>
        {district.purchased && (
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            Access Unlocked
          </span>
        )}
      </div>

      {/* Cover image */}
      <div className="relative w-full" style={{ height: "220px" }}>
        <img
          src={district.imageUrl || "/images/taj_mahal.jpg"}
          alt={district.name}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/images/taj_mahal.jpg"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white">
          <h1 className="text-xl font-bold">{district.name}</h1>
          <p className="text-sm opacity-80">{district.state}</p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Description */}
        {district.description?.en && (
          <p className="text-sm text-gray-600 leading-relaxed">{district.description.en}</p>
        )}

        {/* CTA — buy or browse */}
        {!district.purchased && (
          <div className="bg-[#FFF5F5] border border-[#8E170D]/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">District Package</p>
              <p className="text-xs text-gray-500">Unlock all {district.places.length} places</p>
            </div>
            <button
              onClick={handleBuyDistrict}
              disabled={paying}
              className="bg-[#8E170D] text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
            >
              {paying ? "Processing..." : `₹${district.amount}`}
            </button>
          </div>
        )}

        {/* Places list */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">
            Places ({district.places.length})
          </h2>
          <div className="flex flex-col gap-3">
            {district.places.map((place) => (
              <button
                key={place.id}
                onClick={() => router.push(`/place/${place.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F5F5] shadow-sm text-left w-full"
              >
                <img
                  src={place.imageUrl || "/images/taj_mahal.jpg"}
                  alt={place.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/images/taj_mahal.jpg"; }}
                />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">{place.name}</h3>
                  {place.description?.en && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{place.description.en}</p>
                  )}
                  {!district.purchased && place.amount > 0 && (
                    <p className="text-xs text-[#8E170D] font-medium mt-1">Also available at ₹{place.amount}</p>
                  )}
                </div>
                <span className="text-gray-400 text-xl flex-shrink-0">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictDetail;
