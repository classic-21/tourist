"use client";
import Image from "next/image";
import { useRouter } from 'next/navigation';

// Define the types for the props (all required)
interface ShowErrorProps {
    imageSrc: string;   // Required string for image source
    heading: string;    // Required string for heading
    paragraph: string;  // Required string for paragraph
}


const returnToHomeHandler = (router) => {
    router.push("/discover");
}

const ShowError: React.FC<ShowErrorProps> = ({ imageSrc, heading, paragraph }) => {
    const router = useRouter();
    return (
        <div className="flex flex-col min-h-screen bg-gray-100 p-4">
            <div className="flex-grow flex items-center justify-center">
                <div className="max-w-md text-center bg-white shadow-lg rounded-lg p-6">
                    <Image
                        src={imageSrc}
                        alt="Error"
                        width={300}
                        height={300}
                        className="mx-auto mb-4 object-cover"
                    />
                    <h2 className="text-xl font-bold text-[#8E170D]">{heading}</h2>
                    <p className="text-sm text-gray-800 mt-2">
                        {paragraph}
                    </p>
                    <button
                        onClick={() => returnToHomeHandler(router)}
                        className="w-full text-white py-3 mt-5 text-center rounded-lg shadow-sm font-semibold bg-[#8E170D]">
                        Return to Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ShowError;
