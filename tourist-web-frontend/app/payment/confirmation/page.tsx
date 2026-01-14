/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from 'next/image';
import styles from "./styles.module.css";
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation'; // Import useRouter hook
import LoadingComponent from '@/components/LoadingComponent/LoadingComponent';
import ShowError from "@/components/ShowError/ShowError";
import { createUrl, fetchAPI } from '@/utils/apiUtils';

const generateSlug = (name: string) => {
    return name
      .toLowerCase() // Make lowercase
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w-]+/g, ''); // Remove non-word characters
};

declare global {
    interface Window {
      Razorpay: any;
    }
}

const validateOrder = async (orderId: string, token: string) => {
    try {
        return await fetchAPI(createUrl("confirmOrder", orderId), "GET", null, token);
    } catch (error) {
        console.error("Error during order validation:", error);
        throw new Error("Order validation failed");
    }
};

  

const loadScript = (src: string) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const displayRazorpay = async (token: any, tourId: any, router: any, tourName: any) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    if (!res) {
        alert("Razorpay SDK failed to load. Please try again later.");
        return;
    }

    try {
        const data = await fetchAPI(createUrl("order", tourId), "post", null, token);
        const orderId = data.data.id; // Assuming `id` is the correct order ID

        const options = {
            "key": process.env.RAZORPAY_PRODUCTION_KEY,
            "currency": "INR",
            "amount": data.data.amount,
            "name": "Kshipra Ventures",
            "description": "Thank you for booking an audio tour",
            "image": "https://example.com/your_logo",
            "order_id": data.data.paymentOrderID,
            "handler": async function (response: any) {
                if (!response.razorpay_payment_id) {
                    toast("Payment failed. Redirecting...");
                    router.reload();
                } else {
                    try {
                        // Validate the tour order of user
                        const validationResponse = await validateOrder(orderId, token);

                        // Log the validation response for debugging
                        // console.log("Validation Response:", validationResponse);

                        if (validationResponse.statusCode === 200 && validationResponse.data.status === 1) {
                            toast("Payment successful!");
                            router.push(`/tour-play/${tourName}`)
                        } else {
                            toast("Order validation failed. Please contact support.");
                        }
                    } catch (error) {
                        toast("Error validating payment. Please try again later.");
                        console.error("Error during validation:", error);
                    }
                }
            },
            "theme": {
                "color": "#3399cc"
            },
            "modal": {
                "ondismiss": function () {
                    toast("Payment got cancelled!");
                }
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

    } catch (error) {
        toast("Payment Failed. Please try again later!");
        console.error("Error during Razorpay payment process:", error);
    }
};


const Confirmation = () => {
    const router = useRouter();
    const [token, setToken] = useState<any>(null)
    const [tourData, setTourData] = useState(null); // Tour data
    const [loading, setLoading] = useState(true); // Manage loading state
    const [redirecting, setRedirecting] = useState(false); // Handle redirection separately
    const [isTourPresent, setIsTourPresent] = useState(false)

    useEffect(() => {
        const fetchTourData = async () => {
            try {
                setLoading(true); // Start loading

                const token = localStorage.getItem("authToken");
                setToken(token)
                const tourId = JSON.parse(sessionStorage.getItem("tourId"));

                // Fetch tour details
                if (tourId) {
                    setIsTourPresent(true)
                    try {
                        const data = await fetchAPI(createUrl("getTourDetails", tourId), "GET", null, token);
                        setTourData(data.data); // Set the tour data
        
                        // Check subscription status
                        const subscriptionResponse = await fetchAPI(createUrl("checkSubscription", tourId),"GET",null,token);
        
                        // If subscribed, redirect the user
                        if (subscriptionResponse?.statusCode === 200 && subscriptionResponse?.data?.status === "Success") {
                            setRedirecting(true); 
                            const slug = generateSlug(data?.data?.name?.toLowerCase());
                            router.push(`/tour-play/${slug}`);
                        }
                    } catch (error) {
                        console.error("Error: ", error.message);
                    }
                }
                else {
                    setIsTourPresent(false)
                }
            } catch (error) {
                console.error("Error: ", error.message);
                toast("Something went wrong!");
                router.push("/discover");
            } finally {
                setLoading(false); 
            }
        };
        fetchTourData();
    }, [router, token]);

    // Display loading screen during fetch or redirection
    if (loading || redirecting) {
        return <LoadingComponent />;
    }

    // Show error if no tourData found
    if(!isTourPresent) {
        return (
            <ShowError
                imageSrc="/images/sorry_vector.png"
                heading="Oops! No tour found."
                paragraph="The tour you are looking for seems to be missing or has been cancelled. Please check your selection and try again."
            />
        );
    }

    // Show error if tourData couldn't be loaded
    if (!tourData) {
        return (
            <ShowError
                imageSrc="/images/sorry_vector.png"
                heading="Oops! Something went wrong."
                paragraph="We are having some trouble while processing your request. Please try again later."
            />
        );
    }

    const tourName = generateSlug(tourData?.name?.toLowerCase())
    const tourPrice = (tourData?.amount)?.toFixed(2);
    const GST = 0.18;
    const taxAmount = (Number(tourPrice) * GST).toFixed(2); 
    
    const totalPrice = (Number(tourPrice) + Number(taxAmount)).toFixed(2);

    // Render the component if tourData is loaded and user is not subscribed
    return (
        <>
            <div className="flex flex-row items-center justify-center w-full">
                <div className="flex flex-row items-center justify-between p-5 pb-2 w-full">
                    <div className="flex flex-row items-center justify-center gap-3">
                        <button className="flex justify-center items-center">
                            <Image
                                className={`flex justify-center ${styles.backIcon}`}
                                src="/icons/backIcon.svg"
                                alt="Back Icon"
                                height={20}
                                width={20}
                            />
                        </button>
                        <span className="text-[18px]">Confirmation</span>
                    </div>
                </div>
            </div>
            <div className="min-h-[92vh] bg-gray-50 flex flex-col justify-between">
                <div className="p-2">
                    <div className="rounded-lg m-2 p-2 overflow-hidden bg-[#F5F5F5]">
                        <Image
                            src={tourData.images[0].url}
                            width={100}
                            height={48}
                            priority={false}
                            alt={tourData.name}
                            className="w-full rounded-lg"
                            style={{ objectFit: 'cover' }}
                        />

                        <div className="p-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-gray-700">{tourData.name}</h2>
                                    <p className="text-sm text-gray-500">{tourData.place}</p>
                                </div>
                                <span
                                    className="bg-white text-xs font-medium px-2 py-1 rounded-md text-gray-600"
                                >Online</span>
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
                                <span className="text-gray-800">Total Price</span>
                                <span className="font-medium text-gray-800">₹{totalPrice}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t">
                    <button onClick={() => displayRazorpay(token, tourData.id, router, tourName)} className="w-full text-white py-3 rounded-lg shadow-md font-semibold bg-[#8E170D]">Proceed to Payment</button>
                </div>
            </div>
        </>
    );
};

export default Confirmation;
