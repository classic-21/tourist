"use client";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import DestinationCard from "@/components/destinationCard/destinationCard";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

interface Destination {
  id: string;
  name: string;
  place: string;
  imgUrl: string | null;
  navigateTo: string;
}

const Search = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const [tourList, imageData] = await Promise.all([
          fetchAPI(createUrl("getTourList"), "GET", {}, token),
          fetchAPI(createUrl("getAllImages"), "GET", {}, token),
        ]);

        const merged: Destination[] = (tourList?.data ?? []).map((item: { id: string; name: string; place: string; mappingID: number }) => {
          const imgs = imageData?.newData?.data?.[item.mappingID];
          const imgUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0].url : null;
          return {
            id: item.id,
            name: item.name,
            place: item.place,
            imgUrl,
            navigateTo: `/tourDetails/${generateSlug(item.name)}`,
          };
        });

        setAllDestinations(merged);
      } catch {
        // fallback: show empty
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const results = query.trim()
    ? allDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.place.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  if (loading) return <LoadingComponent />;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className="flex flex-row items-center gap-3 p-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex justify-center items-center"
          aria-label="Go back"
        >
          <Image src="/icons/backIcon.svg" alt="Back" height={20} width={20} />
        </button>
        <span className="text-[18px]">Search</span>
      </div>

      {/* Search Input */}
      <div className="mx-4 mb-4 flex items-center gap-2 bg-[#F5F5F5] rounded-lg px-3 py-2">
        <Image src="/icons/Magnifer.svg" width={20} height={20} alt="Search" />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-gray-400 text-xs">
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      <div className="px-4">
        {!query.trim() ? (
          <p className="text-center text-sm text-gray-400 mt-10">
            Start typing to search for destinations...
          </p>
        ) : results.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-10">
            No destinations found for &quot;{query}&quot;
          </p>
        ) : (
          results.map((item) => (
            <DestinationCard
              key={item.id}
              destination={item.name}
              location={item.place}
              imgUrl={item.imgUrl}
              navigateTo={item.navigateTo}
              tourId={item.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Search;
