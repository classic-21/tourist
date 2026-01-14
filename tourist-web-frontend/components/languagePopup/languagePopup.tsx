'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LanguagePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const router = useRouter();

  // Show the popup on route change to /discover
  useEffect(() => {
    if (router.pathname === '/discover') {
      setIsOpen(true);
    }
  }, [router.pathname]);

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleClosePopup = () => {
    setIsOpen(false);
  };

  return (
    isOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-bold mb-4">Choose Your Language</h2>
          <div className="mb-4">
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              {/* Add more languages here */}
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleClosePopup}
            >
              Select
            </button>
          </div>
        </div>
      </div>
    )
  );
}
