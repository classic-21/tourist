/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import Dropdown from "@/components/dropdown/dropdown";
import Image from "next/image";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'
import { createUrl, fetchAPI } from "@/utils/apiUtils";

interface AbstractView {
  screen: {
    availWidth: number;
  };
}

const TourPlay = () => {
  const [currentTime, setCurrentTime] = useState(0);

  const [musicData, fetchMusicData] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState("english");

  const [totalTime, setTotalTime] = useState<number>(0);

  const [tourData, setTourData] = useState<any>(null);

  const [languages, setLanguages] = useState<string[]>([]);

  const router = useRouter();

  const pathName = usePathname()


  useEffect(() => {
    const fetchMusic = async () => {
      try {

        if(!localStorage.getItem("authToken")){
          return
        }
        const token = localStorage.getItem("authToken")
        const tourId = JSON.parse(sessionStorage.getItem("tourId"))
        // const resurl = `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/subscribed/${tourId}/${selectedLanguage}`
        // console.log("resurl: ", resurl)
        const isSubscribed = await fetchAPI(createUrl("checkSubscription", tourId), "GET", null, token);
        if (isSubscribed.statusCode === 200 && isSubscribed.data.status === "Success") {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/subscribed/${tourId}/${selectedLanguage}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                  
                }
              }
            );
  
          const res = await response.json();
          // // console.log("res2: ", res)
          // const audioData = await fetch(res?.data?.audioUrl);
          // // console.log("audioData: ", audioData)
          // // console.log(audioRef.current?.duration);
  
          // const blob = await audioData.blob(); // Create Blob from response
          // // console.log("blob: ", blob)
          // const url = URL.createObjectURL(blob); // Create URL for the Blob
          // // console.log("url: ", url)
          fetchMusicData(res?.data?.audioUrl);
        }
        else {
          toast("Unauthorized access!")
          router.push("/discover")
        }
        
      } catch (err) {
        console.error(err)

        toast("Something went wrong!", {
          autoClose: 1000,
          onClose: handleAPIError,
        });
      }
    };

    fetchMusic();
  }, [selectedLanguage, router]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalTime(Math.floor(Number(audioRef.current?.duration)));
    }
  };

  // const handleTimeUpdate = () => {
  //   if (audioRef.current) {
  //     setCurrentTime(audioRef.current.currentTime); // Update state for display
  //   }
  // };

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime((time) => time + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (audioRef.current && !audioRef.current.paused) {
  //       setCurrentTime(audioRef.current.currentTime);
  //     }
  //   }, 1000); // Update every second

  //   return () => clearInterval(interval); // Cleanup on component unmount
  // }, [isPlaying,audioRef]);



  const handleBarClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();

    const barWidth: number =
      (e.view as unknown as AbstractView).screen.availWidth - 10;
    const touchWidth: number = e.clientX - 10;

    const newTime: number = Math.floor((touchWidth * 100) / barWidth);

    // console.log(barWidth, touchWidth, (newTime * totalTime) / 100);
    setCurrentTime(Math.round((newTime * totalTime) / 100));
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const getTimeStamp = (time: number) => {
    const minutes: number = Math.floor(time / 60);
    const seconds: number = Math.floor(time % 60);

    return `${formatNumber(minutes)}:${formatNumber(seconds)}`;
  };

  const formatNumber = (number: number) => {
    let str = number.toString();

    if (str.length === 1) {
      str = "0" + str;
    }

    return str;
  };

  const handleLanguageChange = (languageSelected: string) => {
    setSelectedLanguage(languageSelected);
  };

  useEffect(()=>{

    setIsPlaying(false)
    setCurrentTime(0)
    handleLoadedMetadata()

    audioRef.current?.pause();
  },[selectedLanguage])

  const handlePlay = () => {
    // console.log(currentTime, totalTime);

    // console.log(audioRef);

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch((error) => {
        console.error("Error playing the audio:", error);
      });
    }
    setIsPlaying((play) => !play);
  };

  useEffect(() => {
    const fetchTourData = async () => {
      try {
        if(!localStorage.getItem("authToken")){
          return
        }
        const tourId = JSON.parse(sessionStorage.getItem("tourId"))
        // const url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/${tourId}`
        // console.log("url: ", url)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/${tourId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`
            }
          }
        );
        const res = await response.json();
        // console.log("res: ", res)
        // console.log("res.data: ", res.data)
        setTourData(res.data);

        setLanguages(Object.keys(res.data.description));
      } catch (err: any) {
        console.error(err);
      }
    };
    fetchTourData();
  }, []);

  const handleAPIError = ()=>{
      localStorage.removeItem("authToken");
      if(pathName !== 'sign-in')router.replace("/sign-in");
  }

  // const handleTimeUpdate = () => {
  //   if (audioRef.current) {
  //     setCurrentTime(audioRef.current.currentTime);
  //   }
  // };

  return !musicData ? (
    <LoadingComponent />
  ) : (
    <div className={styles.playContainer}>
      <div className={styles.header}>
        <div>
          <span className={styles.backBtn}>←</span>
          <span className={styles.tourname}> {tourData?.name}</span>
        </div>
        <Dropdown
          handleLanguageChange={handleLanguageChange}
          selectedLanguage={selectedLanguage}
          languages={languages}
        />
      </div>

      <div className={styles.player}>
        <div
          className={`${styles.playerImage} ${
            !isPlaying || currentTime > totalTime ? styles.animationPaused : ""
          }`}
        ></div>
        <div className={styles.tourDetail}>
          <div className={styles.destinationDetails}>
            <span className={styles.destination}>{tourData?.name}</span>
            <span>{tourData?.place}</span>
          </div>
          <div className={styles.avatarGroup}>
            <Image
              alt="like"
              src={"/images/avatargroup.png"}
              height={100}
              width={100}
            />
          </div>
        </div>
        <div className={styles.playerControl}>
          <div className={styles.playerControlSeek}>
            <div className={styles.bar} onClick={(e) => handleBarClick(e)}>
              <div
                className={`${styles.barActive} `}
                style={{
                  width: `${Math.min(
                    100,
                    Math.floor((currentTime * 100) / totalTime)
                  )}%`,
                }}
              ></div>
            </div>
            <div className={styles.playerTime}>
              <span>{getTimeStamp(currentTime)}</span>
              <span>{getTimeStamp(totalTime)}</span>
            </div>
            <div className={styles.playerButtons}>
              <span
                onClick={() => setCurrentTime((time) => Math.max(0, time - 10))}
              >
                <Image
                  alt="play back 10s"
                  src={"/icons/back10.svg"}
                  height={100}
                  width={100}
                />
              </span>
              <audio
                ref={audioRef}
                src={musicData}
                onLoadedMetadata={handleLoadedMetadata}
                // onTimeUpdate={handleTimeUpdate}
              ></audio>

              <span
                onClick={() => {
                  handlePlay();
                }}
              >
                {isPlaying ? (
                  <Image
                    alt="play back 10s"
                    src={"/icons/audio-pause.svg"}
                    height={100}
                    width={100}
                  />
                ) : (
                  <Image
                    alt="play back 10s"
                    src={"/icons/audio-play.svg"}
                    height={100}
                    width={100}
                  />
                )}
              </span>
              <span
                onClick={() =>
                  setCurrentTime((time) => Math.min(totalTime, time + 10))
                }
              >
                <Image
                  alt="play back 10s"
                  src={"/icons/next10.svg"}
                  height={100}
                  width={100}
                />
              </span>
            </div>
          </div>
        </div>
        <div className={styles.audioCaption}>
          <h3>content</h3>
          <span>
            {tourData?.description[selectedLanguage]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TourPlay;