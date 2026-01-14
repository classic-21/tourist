"use client";
import React from "react";
import Image from "next/image";
// import styles from "./styles.module.css";
import { useRouter } from "next/navigation";

const Confirmation = () => {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-row items-center justify-center w-full">
        <div className="flex flex-row items-center justify-between p-5 pb-2 w-full">
          <div className="flex flex-row items-center  justify-center gap-3">
            <button
              className="flex justify-center items-center "
              onClick={() => router.back()}
            >
              <Image
                className={`flex justify-center`}
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
              src={"/images/agra.png"}
              width={100}
              height={48}
              priority={false}
              objectFit="cover"
              alt="Agra Fort"
              className="w-full rounded-lg"
            />

            <div className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-gray-700">Agra Fort</h2>
                  <p className="text-sm text-gray-500">Agra, Uttar Pradesh</p>
                </div>
                <span className="bg-white text-xs font-medium px-2 py-1 rounded-md text-gray-600">
                  Online
                </span>
              </div>
            </div>
            <hr />
            <div className="border-t my-2 p-3 text-sm bg-white rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Tour Price</span>
                <span className="font-medium text-gray-600">₹399</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-600">₹69</span>
              </div>
              <hr />
              <div className="flex justify-between mt-2">
                <span className="text-gray-800">Total</span>
                <span className="font-medium text-gray-800">₹468</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 border-t">
          <button className="w-full text-white py-3 rounded-lg shadow-md font-semibold bg-[#8E170D]">
            Continue to Pay
          </button>
        </div>
      </div>
    </>
  );
};

export default Confirmation;
