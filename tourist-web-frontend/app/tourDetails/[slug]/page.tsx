/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Import Swiper modules
import { Pagination, A11y, Autoplay } from "swiper/modules";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";

interface Image {
  id: number;
  url: string;
  description: string;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase() // Make lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, ""); // Remove non-word characters
};

const fetchTourPlaceDetails = async (id: string) => {
  const token = localStorage.getItem("authToken") || undefined;
  // Create the URL using the apiUtils
  const url = createUrl("getTourDetails", id);

  // Fetch data using the fetchAPI utility
  const tourPlaceDetails = await fetchAPI(url, "GET", null, token);

  if (!tourPlaceDetails) {
    throw new Error("Failed to fetch tour data with id");
  }

  return tourPlaceDetails.data;
};

export default function TourDetail({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const [audioClicked, setAudioClicked] = useState<boolean>(false);
  const audioPlayPauseRef = useRef<HTMLAudioElement>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false)
  const toggleReadMore = () => setIsExpanded(!isExpanded);

  // Set the maximum number of characters to display initially
  const MAX_CHAR_COUNT = 200;

  const { slug } = params;
  // console.log("Slug: ", slug);

  const [tourData, setTourData] = useState<any>({}); 
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const tours = await fetchAPI(createUrl("getTourList"), "GET");
        const tour = tours.data.find(
          (tour: any) =>
            generateSlug(tour.name.toLowerCase()) === slug.toLowerCase()
        );
        if (tour) {
          // console.log("token: ", token)
          // console.log("tourId: ", tour.id)
          try {
            const isSubscribed = await fetchAPI(createUrl("checkSubscription", tour.id), "GET", {}, token);
       
            if(isSubscribed?.statusCode === 411) {
              setIsSubscribed(false)
            }
  
            if (isSubscribed?.statusCode === 200 && isSubscribed?.data?.status === "Success") {
              setIsSubscribed(true)
            } 
          } catch (subErr: any) {
            console.error("Error while checking subscription: ", subErr);
          }
          
          // Fetch and set tour details if not subscribed
          const tourPlaceDetails = await fetchTourPlaceDetails(tour.id);
          setTourData(tourPlaceDetails);
          
        }
      } catch (err: any) {
          // console.error("Error: ", err);
          // if (err.response) {
          //   console.error("API Error Response: ", err.response);
          // }
          setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug, router]);
  

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Oops! Something went wrong."
        paragraph="We are having some trouble while processing your request. Please try again later."
      />
    );
  }

  const handlePayment = () => {
    if (isSubscribed) {
      router.push(`/tour-play/${slug}`);
    } else {
      router.push("/payment/confirmation");
    }
  };

  function handleAudioClick() {
    // Toggle audio state
    setAudioClicked((prevAudioClickedRes) => {
      const newState = !prevAudioClickedRes;

      if (audioPlayPauseRef.current) {
        if (newState) {
          audioPlayPauseRef?.current?.load();
          audioPlayPauseRef.current.play();
        } else {
          audioPlayPauseRef.current.pause();
        }
      }

      return newState;
    });
  }

  return (
    <div className="flex flex-col">
      {/* Tour Details */}
      <div className="flex flex-row items-center justify-center w-full">
        <div className="flex flex-row items-center justify-between p-5 pb-2 w-full">
          <div className="flex flex-row items-center  justify-center gap-3">
            <button className="flex justify-center items-center ">
              <Link href={"/discover"}>
                <Image
                  className={`flex justify-center ${styles.backIcon}`}
                  src="/icons/backIcon.svg"
                  alt="Back Icon"
                  height={20}
                  width={20}
                />
              </Link>
            </button>
            <span className="text-[18px]">Tour Details</span>
          </div>

          {/* <div className="flex flex-row items-center justify-center gap-2">
            <button>
              <Image
                className={`${styles.heartIcon}`}
                src="/icons/heartIcon.svg"
                    alt="Back Icon"
                    height={40}
                    width={40}
                  />
            </button>
            <button>
              <Image
                src="/icons/shareIcon.svg"
                alt="Back Icon"
                height={40}
                width={40}
              />
            </button>
          </div> */}
        </div>
      </div>

      {/* Image Carasoual */}
      <div className="flex flex-row">
        <div className="w-full">
          <Swiper
            modules={[Pagination, Autoplay, A11y]}
            spaceBetween={30}
            slidesPerView={1} // Only 1 slide visible at a time
            pagination={{ clickable: true }} // Dots for navigation
            autoplay={{ delay: 3000 }} // Auto-slide every 3 seconds
            style={{ height: "200px" }} // Set the height to 200px
            onSlideChange={() => {}}
            onSwiper={() => {}}
          >
            {tourData?.images?.map((item: any) => {
              return (
                <SwiperSlide key={item.id}>
                  {" "}
                  {/* Add unique key for each slide */}
                  <div className="bg-gray-200 p-0 rounded h-full flex items-center justify-center">
                    <img
                      src={item.url}
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Audio Section */}
      <div className="flex flex-col justify-center items-center">
        <div className="flex w-full justify-between p-5">
          <div className="flex flex-col">
            <span className="text-[18px] text-left">{tourData?.name}</span>
            <span className="text-[14px] text-left text-[#666666]">
              {/* Agra, Uttar Pradesh */}
              {tourData?.place}
            </span>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src={"/icons/peopleViewedIcon.svg"}
              alt="People Viewed"
              width={80}
              height={80}
            />
          </div>
        </div>

        {/* <div className="flex items-center justify-center w-full p-5 pt-0">
            <div className="flex flex-col bg-[#F5F5F5] rounded-[10px] w-full">
              <div className="flex items-center w-full h-10 p-3 justify-between">
                <span className="">Preview This Content</span>
                <button>
                  {" "}
                  <Image
                    src={"/icons/audioPlayButton.svg"}
                    alt="Audio Icon"
                    width={20}
                    height={20}
                  />{" "}
                </button>
              </div>
              <div className="flex p-3 w-full">
                <Image
                  className="w-full"
                  src={"/icons/audioBarIcon.svg"}
                  alt="Audio Bar Icon"
                  width={100}
                  height={20}
                />
              </div>
            </div>
          </div> */}

        <div className="flex items-center justify-center p-5 pt-0 w-full">
          <div className="flex rounded-[10px] bg-[#F5F5F5] w-full p-2">
            <div className="flex justify-between items-center w-full">
              <div className="flex gap-2">
                <Image
                  className="rounded"
                  src={tourData?.images[0]?.url}
                  alt="People Viewed"
                  width={70}
                  height={70}
                />
                <div className="flex flex-col justify-center">
                  <p className="text-xl">{tourData?.name}</p>
                  <p className="text-xs">{tourData?.place}</p>
                </div>
              </div>
              <div
                className="flex justify-center items-center rounded-[50%] bg-white h-[50px] w-[50px] hover:cursor-pointer"
                onClick={handleAudioClick}
              >
                <audio
                  src={"/Music/5_Goliyan.mp3"}
                  ref={audioPlayPauseRef}
                  preload="auto"
                />
                {audioClicked ? (
                  <Image
                    src={"/icons/audio-pause.svg"}
                    alt="People Viewed"
                    width={20}
                    height={20}
                  />
                ) : (
                  <Image
                    src={"/icons/audio-play.svg"}
                    alt="People Viewed"
                    width={20}
                    height={20}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/*  */}
        <div className="bg-[#F5F5F5] p-5 pt-5 flex flex-col justify-around items-center">
          <p className="text-[#666666] text-[14px]">
            {isExpanded
              ? tourData?.description["english"]
              : `${tourData?.description["english"]?.substring(
                  0,
                  MAX_CHAR_COUNT
                )}...`}
            {!isExpanded && (
              <span
                onClick={toggleReadMore}
                className="underline text-[#434343] cursor-pointer"
              >
                Read more
              </span>
            )}
          </p>

          {/* <div className="h-[2px] w-[100%] bg-gradient-to-r from-transparent via-gray-500 to-transparent mt-7 mb-2"></div> */}

          {/* <div className={`pt-5 flex justify-center items-center flex-col`}>
              <PlaceComponent
                place="Place 1"
                description="Mughal emperor Humayun was crowned at this fort in 1530. It was later renovated by the Mughal..."
              />
              <PlaceComponent
                place="Place 2"
                description="Mughal emperor Humayun was crowned at this fort in 1530. It was later renovated by the Mughal..."
              />
              <PlaceComponent
                place="Place 3"
                description="Mughal emperor Humayun was crowned at this fort in 1530. It was later renovated by the Mughal..."
              />
              <PlaceComponent
                place="Place 4"
                description="Mughal emperor Humayun was crowned at this fort in 1530. It was later renovated by the Mughal..."
              />
              <PlaceComponent
                place="Place 5"
                description="Mughal emperor Humayun was crowned at this fort in 1530. It was later renovated by the Mughal..."
                last={true}
              />
            </div> */}
        </div>
      </div>
      <div className="p-4 border-t fixed bottom-0 left-0 right-0 bg-white">
        <button
          onClick={handlePayment}
          className="w-full text-white py-3 text-center rounded-lg shadow-sm font-semibold bg-[#8E170D]"
        >
          {isSubscribed ? "Start Listening" : "Pay and enjoy your tour"}
        </button>
      </div>
    </div>
  );
}
