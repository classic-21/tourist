"use client";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import DestinationCard from "@/components/destinationCard/destinationCard";
import ShowError from "@/components/ShowError/ShowError";
import { createUrl, fetchAPI } from "@/utils/apiUtils";
import { useRouter } from "next/navigation";
import LoadingComponent from "@/components/LoadingComponent/LoadingComponent";
import Image from "next/image";

// Function to generate slug from destination name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '');
};

const Discover = () => {
  const [tourDetails, setTourDetails] = useState(null);
  const [tourImages, setTourImages] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // Track search input
  const [filteredDestinations, setFilteredDestinations] = useState([]); // Store filtered destinations
  const [error, setError] = useState(null); // Track API errors

  const router = useRouter();

  // Fetch tour details and images on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      router.replace("/sign-in");
      return;
    }

    const fetchTourDetails = async () => {
      try {
        const data1 = await fetchAPI(createUrl("getTourList"), "GET", {}, token);
        const data2 = await fetchAPI(createUrl("getAllImages"), "GET", {}, token);

        setTourDetails(data1);
        setTourImages(data2);
      } catch (error) {
        console.error("Error fetching tour details or images:", error);
        setError("We are having some trouble while processing your request. Please try again later.");
      }
    };

    fetchTourDetails();
  }, [router]);

  // Filter destinations based on search query
  useEffect(() => {
    if (tourDetails && tourImages) {
      try {
        const mergedData = tourDetails?.data.map((item) => {
          const imageData = tourImages?.newData.data[item.mappingID];
          const imageURL = imageData ? imageData[0].url : null;
          const slug = generateSlug(item.name);

          return {
            id: item.id,
            name: item.name,
            place: item.place,
            imgUrl: imageURL,
            navigateTo: `/tourDetails/${slug}`,
          };
        });

        const filtered = searchQuery ? mergedData.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase())) : mergedData;

        setFilteredDestinations(filtered);
      } catch (error) {
        console.error("Error processing tour details and images:", error);
        setFilteredDestinations([]); // Optionally, set empty list on error
      }
    }
  }, [tourDetails, tourImages, searchQuery]);

  // Handle loading, no destinations, or error scenarios
  if (!tourDetails || !tourImages) {
    return <LoadingComponent />;
  }

  // If API error exists, show the error screen
  if (error) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="Oops! Something went wrong."
        paragraph={error}
      />
    );
  }
  // If no destinations are found
  else if (filteredDestinations.length === 0) {
    return (
      <ShowError
        imageSrc="/images/sorry_vector.png"
        heading="No destinations found"
        paragraph="Sorry, no destinations match your search. Please try again."
      />
    );
  }

  return (
    <div className={styles.discover}>
      <h1 className={styles.heading}>
        Explore <span style={{ color: "#8E170D" }}>Uttar Pradesh</span>
        <br />
        through audio!
      </h1>

      <div className={styles.searchBar}>
        <Image
          src={"/icons/Magnifer.svg"}
          width={20}
          height={20}
          alt="search logo"
        />
        <input
          type="text"
          placeholder="Explore landmarks and history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query on change
        />
      </div>

      <div className={styles.bestDestinations}>
        <h3>Best Destinations</h3>
        {filteredDestinations.map((item) => (
          <DestinationCard
            key={item.id}
            destination={item.name}
            location={item.place}
            imgUrl={item.imgUrl}
            navigateTo={item.navigateTo}
            tourId={item.id}
          />
        ))}
      </div>
    </div>
  );
};

export default Discover;
