"use client";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import DestinationCard from "@/components/destinationCard/destinationCard";
import ShowError from "@/components/ShowError/ShowError";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import { useRouter } from "next/navigation";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import Image from "next/image";

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

interface Destination {
  id: string;
  name: string;
  place: string;
  amount: number;
  imgUrl: string | null;
  navigateTo: string;
}

interface Filters {
  minPrice: string;
  maxPrice: string;
  place: string;
}

const Discover = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({ minPrice: "", maxPrice: "", place: "" });
  const [activeFilters, setActiveFilters] = useState<Filters>({ minPrice: "", maxPrice: "", place: "" });

  const router = useRouter();

  // Unique places derived from destinations for the place filter dropdown
  const uniquePlaces = Array.from(new Set(destinations.map((d) => d.place))).sort();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        const [tourList, imageData, likedIdsRes] = await Promise.all([
          fetchAPI(createUrl("getTourList"), "GET", {}, token),
          fetchAPI(createUrl("getAllImages"), "GET", {}, token),
          fetchAPI(createUrl("getLikedIDs"), "GET", {}, token).catch(() => null),
        ]);

        if (Array.isArray(likedIdsRes?.data)) {
          setLikedIds(new Set(likedIdsRes.data));
        }

        const merged: Destination[] = (tourList?.data ?? []).map((item: { id: string; name: string; place: string; mappingID: number; amount: number }) => {
          const imgs = imageData?.newData?.data?.[item.mappingID];
          const imgUrl = Array.isArray(imgs) && imgs.length > 0 ? imgs[0].url : null;
          return {
            id: item.id,
            name: item.name,
            place: item.place,
            amount: item.amount ?? 0,
            imgUrl,
            navigateTo: `/tourDetails/${generateSlug(item.name)}`,
          };
        });

        setDestinations(merged);
      } catch {
        setError("We are having some trouble loading destinations. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Oops! Something went wrong."
        paragraph={error}
      />
    );
  }

  const handleLikeToggle = (tourId: string, newLikedState: boolean) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (newLikedState) next.add(tourId);
      else next.delete(tourId);
      return next;
    });
  };

  const applyFilters = () => {
    setActiveFilters({ ...filters });
    setShowFilters(false);
  };

  const clearFilters = () => {
    const empty = { minPrice: "", maxPrice: "", place: "" };
    setFilters(empty);
    setActiveFilters(empty);
  };

  const hasActiveFilters =
    activeFilters.minPrice !== "" ||
    activeFilters.maxPrice !== "" ||
    activeFilters.place !== "";

  const filtered = destinations.filter((d) => {
    // Text search
    if (
      searchQuery &&
      !d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !d.place.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    // Place filter
    if (activeFilters.place && d.place !== activeFilters.place) return false;
    // Price filter
    if (activeFilters.minPrice !== "" && d.amount < Number(activeFilters.minPrice)) return false;
    if (activeFilters.maxPrice !== "" && d.amount > Number(activeFilters.maxPrice)) return false;
    return true;
  });

  return (
    <div className={styles.discover}>
      <h1 className={styles.heading}>
        Explore <span style={{ color: "#8E170D" }}>Uttar Pradesh</span>
        <br />
        through audio!
      </h1>

      {/* Search + Filter row */}
      <div className="flex gap-2 mx-[10px]">
        <div className={styles.searchBar} style={{ flex: 1, margin: 0 }}>
          <Image src={"/icons/Magnifer.svg"} width={20} height={20} alt="search" />
          <input
            type="text"
            placeholder="Explore landmarks and history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-1 px-3 rounded-[10px] text-sm font-medium transition-colors ${
            hasActiveFilters
              ? "bg-[#8E170D] text-white"
              : "bg-[#f5f5f5] text-gray-600"
          }`}
          aria-label="Toggle filters"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="11" y1="18" x2="13" y2="18" />
          </svg>
          {hasActiveFilters ? "Filtered" : "Filter"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="mx-[10px] mt-2 p-4 bg-white rounded-xl border border-gray-100 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-700">Filters</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-[#8E170D] underline">
                Clear all
              </button>
            )}
          </div>

          {/* Place filter */}
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Location</label>
            <select
              value={filters.place}
              onChange={(e) => setFilters((f) => ({ ...f, place: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E170D] bg-white"
            >
              <option value="">All locations</option>
              {uniquePlaces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Price range (₹)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E170D]"
                min={0}
              />
              <span className="text-gray-400 text-sm">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E170D]"
                min={0}
              />
            </div>
          </div>

          <button
            onClick={applyFilters}
            className="w-full py-2 rounded-lg bg-[#8E170D] text-white text-sm font-semibold"
          >
            Apply Filters
          </button>
        </div>
      )}

      <div className={styles.bestDestinations} style={{ marginTop: "16px" }}>
        <h3>
          Best Destinations
          {hasActiveFilters && (
            <span className="text-xs font-normal text-gray-400 ml-2">
              ({filtered.length} result{filtered.length !== 1 ? "s" : ""})
            </span>
          )}
        </h3>
        {filtered.length === 0 ? (
          <ShowError
            imageSrc="/images/sorry_vector.png"
            heading="No destinations found"
            paragraph="No destinations match your search or filters. Try adjusting them."
          />
        ) : (
          filtered.map((item) => (
            <DestinationCard
              key={item.id}
              destination={item.name}
              location={item.place}
              imgUrl={item.imgUrl}
              navigateTo={item.navigateTo}
              tourId={item.id}
              isLiked={likedIds.has(item.id)}
              onLikeToggle={handleLikeToggle}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Discover;
