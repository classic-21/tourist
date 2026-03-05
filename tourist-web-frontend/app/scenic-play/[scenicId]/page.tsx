"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "../../tour-play/[slug]/styles.module.css";
import Dropdown from "@/components/dropdown/dropdown";
import Image from "next/image";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import ShowError from "@/components/ShowError/ShowError";
import { toast } from "react-toastify";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI, createUrl } from "@/utils/apiUtils";

interface AbstractView {
  screen: { availWidth: number };
}

interface ScenicData {
  id: string;
  name: string;
  placeID: string;
  description?: Record<string, string>;
  audios?: { language: string; s3Key: string }[];
}

interface PlaceData {
  id: string;
  name: string;
  districtID: string;
  scenics: { id: string; name: string; order: number }[];
}

const ScenicPlay = () => {
  const params = useParams();
  const router = useRouter();
  const scenicId = params.scenicId as string;

  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnded, setAudioEnded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [totalTime, setTotalTime] = useState<number>(0);
  const [scenicData, setScenicData] = useState<ScenicData | null>(null);
  const [placeData, setPlaceData] = useState<PlaceData | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [scenicMissing, setScenicMissing] = useState(false);
  const [nextScenicId, setNextScenicId] = useState<string | null>(null);

  // Fetch scenic metadata
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.replace("/sign-in");
        return;
      }

      try {
        const scenicRes = await fetchAPI(createUrl("getScenic", scenicId), "GET", null, token);
        if (!scenicRes?.data) {
          setScenicMissing(true);
          return;
        }
        const scenic: ScenicData = scenicRes.data;
        setScenicData(scenic);

        const langs = scenic.audios?.map((a) => a.language) ?? [];
        setLanguages(langs);
        if (langs.length > 0 && !langs.includes(selectedLanguage)) {
          setSelectedLanguage(langs[0]);
        }

        // Fetch place data for breadcrumb + next scenic navigation
        const placeRes = await fetchAPI(createUrl("getPlace", scenic.placeID), "GET", null, token);
        if (placeRes?.data) {
          setPlaceData(placeRes.data);
          // Find next scenic
          const scenicsInOrder = placeRes.data.scenics.sort((a: any, b: any) => a.order - b.order);
          const currentIdx = scenicsInOrder.findIndex((s: any) => s.id === scenicId);
          if (currentIdx >= 0 && currentIdx < scenicsInOrder.length - 1) {
            setNextScenicId(scenicsInOrder[currentIdx + 1].id);
          }
        }
      } catch {
        toast("Failed to load scenic data.");
        setScenicMissing(true);
      }
    };

    fetchData();
  }, [scenicId, router]);

  // Fetch audio URL when language changes
  useEffect(() => {
    if (!scenicData) return;

    const fetchAudio = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await fetchAPI(
          createUrl("getScenicAudio", scenicId, selectedLanguage),
          "GET",
          null,
          token
        );

        if (res?.statusCode === 403) {
          setAccessDenied(true);
          return;
        }

        setAudioUrl(res?.data?.audioUrl ?? "");
      } catch {
        toast("Something went wrong loading the audio.");
      }
    };

    fetchAudio();
  }, [selectedLanguage, scenicId, scenicData]);

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

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setAudioEnded(false);
    audioRef.current?.pause();
  }, [selectedLanguage]);

  const handlePlay = () => {
    if (audioEnded) {
      setCurrentTime(0);
      setAudioEnded(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => toast("Unable to play audio."));
      }
      setIsPlaying(true);
      return;
    }
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(() => toast("Unable to play audio."));
    }
    setIsPlaying((p) => !p);
  };

  if (scenicMissing) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Scenic not found."
        paragraph="Please go back and select a scenic stop."
      />
    );
  }

  if (accessDenied) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Access Denied"
        paragraph="You have not purchased this place or district. Please complete payment to access the audio."
      />
    );
  }

  if (!audioUrl && scenicData) {
    // If no audio configured (dev/placeholder), show a message
    if (languages.length === 0) {
      return (
        <ShowError
          imageSrc="/images/sorry_vector.png"
          heading="No audio available"
          paragraph="Audio has not been uploaded for this scenic stop yet."
        />
      );
    }
  }

  if (!scenicData) {
    return <LoadingComponent />;
  }

  const progress = totalTime > 0
    ? Math.min(100, Math.floor((currentTime * 100) / totalTime))
    : 0;

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
          <button onClick={() => router.back()} className={styles.backBtn} aria-label="Go back">
            ←
          </button>
          <div className="flex flex-col">
            <span className={styles.tourname}>{scenicData?.name}</span>
            {placeData && (
              <span className="text-xs text-gray-400">
                {placeData.name}
              </span>
            )}
          </div>
        </div>
        {languages.length > 0 && (
          <Dropdown
            handleLanguageChange={setSelectedLanguage}
            selectedLanguage={selectedLanguage}
            languages={languages}
          />
        )}
      </div>

      <div className={styles.player}>
        <div
          className={`${styles.playerImage} ${
            !isPlaying || audioEnded ? styles.animationPaused : ""
          }`}
        />

        <div className={styles.tourDetail}>
          <div className={styles.destinationDetails}>
            <span className={styles.destination}>{scenicData?.name}</span>
            <span>{placeData?.name}</span>
          </div>
          <div className={styles.avatarGroup}>
            <Image alt="viewers" src={"/images/avatargroup.png"} height={100} width={100} />
          </div>
        </div>

        {audioEnded && (
          <div className={styles.endedBanner}>
            <span>Stop complete! Tap play to replay.</span>
          </div>
        )}

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
                onClick={() => { setCurrentTime((t) => Math.max(0, t - 10)); setAudioEnded(false); }}
                title="Back 10s"
              >
                <Image alt="Back 10s" src={"/icons/back10.svg"} height={100} width={100} />
              </span>

              <audio
                ref={audioRef}
                src={audioUrl || undefined}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />

              <span onClick={handlePlay} title={playAlt}>
                <Image alt={playAlt} src={playIcon} height={100} width={100} />
              </span>

              <span
                onClick={() => { setCurrentTime((t) => Math.min(totalTime, t + 10)); setAudioEnded(false); }}
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
          <span>{scenicData?.description?.[selectedLanguage]}</span>
        </div>

        {/* Next Scenic Button */}
        {nextScenicId && (
          <div className="px-3 pb-6">
            <button
              onClick={() => router.push(`/scenic-play/${nextScenicId}`)}
              className="w-full py-3 rounded-xl bg-[#8E170D] text-white font-semibold text-sm"
            >
              Next Stop →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScenicPlay;
