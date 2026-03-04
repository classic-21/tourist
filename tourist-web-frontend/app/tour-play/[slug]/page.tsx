"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";
import Dropdown from "@/components/dropdown/dropdown";
import Image from "next/image";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ShowError from "@/components/ShowError/ShowError";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { createUrl, fetchAPI } from "@/utils/apiUtils";

interface AbstractView {
  screen: { availWidth: number };
}

interface TourData {
  name: string;
  place: string;
  description: Record<string, string>;
}

const TourPlay = () => {
  const [currentTime, setCurrentTime] = useState(0);
  const [musicData, setMusicData] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [totalTime, setTotalTime] = useState<number>(0);
  const [tourData, setTourData] = useState<TourData | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [tourMissing, setTourMissing] = useState(false);

  const router = useRouter();

  const getTourId = () => {
    try {
      return JSON.parse(sessionStorage.getItem("tourId") ?? "null");
    } catch {
      return null;
    }
  };

  // Fetch audio URL when language changes
  useEffect(() => {
    const fetchMusic = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.replace("/sign-in");
        return;
      }

      const tourId = getTourId();
      if (!tourId) {
        setTourMissing(true);
        return;
      }

      try {
        const isSubscribed = await fetchAPI(
          createUrl("checkSubscription", tourId),
          "GET",
          null,
          token
        );

        if (
          isSubscribed?.statusCode === 200 &&
          isSubscribed?.data?.status === "Success"
        ) {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/subscribed/${tourId}/${selectedLanguage}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const res = await response.json();
          setMusicData(res?.data?.audioUrl ?? "");
        } else {
          setAccessDenied(true);
        }
      } catch {
        toast("Something went wrong loading the audio.", {
          autoClose: 2000,
          onClose: () => router.push("/discover"),
        });
      }
    };

    fetchMusic();
  }, [selectedLanguage, router]);

  // Fetch tour metadata
  useEffect(() => {
    const fetchTourData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const tourId = getTourId();
      if (!tourId) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}tours/${tourId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const res = await response.json();
        setTourData(res?.data ?? null);
        setLanguages(Object.keys(res?.data?.description ?? {}));
      } catch {
        // non-fatal
      }
    };
    fetchTourData();
  }, []);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalTime(Math.floor(audioRef.current.duration));
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioEnded(true);
    setCurrentTime(totalTime);
  };

  // Tick timer while playing
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= totalTime) {
          clearInterval(timer);
          return t;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, totalTime]);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const barWidth = (e.view as unknown as AbstractView).screen.availWidth - 10;
    const touchWidth = e.clientX - 10;
    const newTime = Math.floor((touchWidth * 100) / barWidth);
    const clamped = Math.round((newTime * totalTime) / 100);
    setCurrentTime(clamped);
    setAudioEnded(false);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const getTimeStamp = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  // Reset player on language change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioEnded(false);
    audioRef.current?.pause();
  }, [selectedLanguage]);

  const handlePlay = () => {
    if (audioEnded) {
      // Replay from start
      setCurrentTime(0);
      setAudioEnded(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          toast("Unable to play audio. Please try again.");
        });
      }
      setIsPlaying(true);
      return;
    }

    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => {
        toast("Unable to play audio. Please try again.");
      });
    }
    setIsPlaying((p) => !p);
  };

  if (tourMissing) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="No tour selected."
        paragraph="Please go back to Discover and select a tour to listen to."
      />
    );
  }

  if (accessDenied) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Access Denied"
        paragraph="You have not purchased this tour. Please complete payment to access the audio."
      />
    );
  }

  if (!musicData) {
    return <LoadingComponent />;
  }

  const progress = totalTime > 0
    ? Math.min(100, Math.floor((currentTime * 100) / totalTime))
    : 0;

  // Determine play button icon
  let playIcon = "/icons/audio-play.svg";
  let playAlt = "Play";
  if (audioEnded) {
    playIcon = "/icons/audio-play.svg";
    playAlt = "Replay";
  } else if (isPlaying) {
    playIcon = "/icons/audio-pause.svg";
    playAlt = "Pause";
  }

  return (
    <div className={styles.playContainer}>
      <div className={styles.header}>
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className={styles.backBtn}
            aria-label="Go back"
          >
            ←
          </button>
          <span className={styles.tourname}>{tourData?.name}</span>
        </div>
        <Dropdown
          handleLanguageChange={handleLanguageChange}
          selectedLanguage={selectedLanguage}
          languages={languages}
        />
      </div>

      <div className={styles.player}>
        {/* Spinning disc art */}
        <div
          className={`${styles.playerImage} ${
            !isPlaying || audioEnded ? styles.animationPaused : ""
          }`}
        />

        {/* Tour name + place */}
        <div className={styles.tourDetail}>
          <div className={styles.destinationDetails}>
            <span className={styles.destination}>{tourData?.name}</span>
            <span>{tourData?.place}</span>
          </div>
          <div className={styles.avatarGroup}>
            <Image alt="viewers" src={"/images/avatargroup.png"} height={100} width={100} />
          </div>
        </div>

        {/* Audio ended banner */}
        {audioEnded && (
          <div className={styles.endedBanner}>
            <span>🎉 Tour complete! Tap play to replay.</span>
          </div>
        )}

        {/* Progress + controls */}
        <div className={styles.playerControl}>
          <div className={styles.playerControlSeek}>
            <div className={styles.bar} onClick={handleBarClick}>
              <div className={styles.barActive} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.playerTime}>
              <span>{getTimeStamp(currentTime)}</span>
              <span>{getTimeStamp(totalTime)}</span>
            </div>
            <div className={styles.playerButtons}>
              <span
                onClick={() => {
                  setCurrentTime((t) => Math.max(0, t - 10));
                  setAudioEnded(false);
                }}
                title="Back 10s"
              >
                <Image alt="Back 10s" src={"/icons/back10.svg"} height={100} width={100} />
              </span>

              <audio
                ref={audioRef}
                src={musicData}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />

              <span onClick={handlePlay} title={playAlt}>
                <Image alt={playAlt} src={playIcon} height={100} width={100} />
              </span>

              <span
                onClick={() => {
                  setCurrentTime((t) => Math.min(totalTime, t + 10));
                  setAudioEnded(false);
                }}
                title="Forward 10s"
              >
                <Image alt="Forward 10s" src={"/icons/next10.svg"} height={100} width={100} />
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.audioCaption}>
          <h3>Description</h3>
          <span>{tourData?.description?.[selectedLanguage]}</span>
        </div>
      </div>
    </div>
  );
};

export default TourPlay;
