"use client";
import React from "react";
import styles from "./styles.module.css";
import Image from "next/image";
import Link from "next/link";

interface Props {
  destination: string;
  location: string;
  imgUrl: string | null;
  navigateTo: string;
  tourId: string
}

const DestinationCard = ({
  destination,
  location,
  imgUrl,
  navigateTo,
  tourId
}: Props) => {
  const handleCardClick = () => {
    sessionStorage.setItem("tourId", JSON.stringify(tourId));
    const oneDayInMilliseconds = 24 * 60 * 60 * 1000;
    setTimeout(() => {
      sessionStorage.removeItem("tourId");
      // console.log("Data cleared from sessionStorage after 1 day");
    }, oneDayInMilliseconds); 
  };
  return (
    <div className={styles.cardContainer} onClick={handleCardClick}>
      {/* <Like /> */}
      <Link href={navigateTo}>
        <div className={styles.imageContainer}>
          <Image
            className="h-52 w-full"
            src={imgUrl}
            alt="destination img"
            height={100}
            width={100}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className={styles.destinationDetails}>
            <span className={styles.destination}>{destination}</span>
            <span>{location}</span>
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
      </Link>
    </div>
  );
};

// const Like = () => {
//   const [liked, toggleLiked] = useState(false);

//   const handleClick = () => {
//     toggleLiked((prev) => !prev);
//   };

//   return (
//     <>
//       {/* <div className={styles.like} onClick={handleClick}>
//         {liked ? (
//           <Image
//             alt="like"
//             src={"/images/heartfilled.svg"}
//             height={100}
//             width={100}
//           />
//         ) : (
//           <Image
//             alt="like"
//             src={"/images/Heart.svg"}
//             height={100}
//             width={100}
//           />
//         )}
//       </div> */}
//     </>
//   );
// };

export default DestinationCard;
