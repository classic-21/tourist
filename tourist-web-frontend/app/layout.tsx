"use client";
import React, { ReactNode, useEffect, useState } from "react";
import "./globals.css";
import { toast, ToastContainer } from "react-toastify";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

interface HomeLayoutProps {
  children: ReactNode; // Explicitly define the type of children
}

const HomeLayout = ({ children }: HomeLayoutProps) => {
  const [screenWidth, setScreenWidth] = useState<number | null>(null);

  const pathName = usePathname()


  const router = useRouter();

  useEffect(() => {
    setScreenWidth(window.innerWidth);

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Add the event listener
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      if(pathName !== '/' && pathName !== '/sign-in' && pathName !== '/sign-up'){

        toast('User is unauthorized!!',{
          autoClose:1000,
          onClose:()=>{
            router.replace('/sign-in')
          }
        })
      }
    } else {
      if(pathName === '/' || pathName === '/sign-in' || pathName === '/sign-up'){
        router.replace("/discover")
      }
    }
  }, [pathName, router]);

  return (
    <html lang="en">
      <body>
        <ToastContainer />
        {screenWidth && screenWidth > 700 ? (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="bg-white p-4 rounded-lg shadow-md max-w-sm text-center">
              <Image
                src={"/images/5006166.jpg"}
                width={300}
                height={300}
                layout="intrinsic"
                alt="search logo"
              />
              <h1 className="text-xl font-semibold text-gray-800">
                This website is only accessible on mobile or tablet view
              </h1>
              <p className="text-gray-600 mt-2">
                Please switch to a mobile or tablet device to access this
                website.
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
};

export default HomeLayout;
