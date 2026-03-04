"use client";
import React, { useState } from "react";

const SUPPORT_PHONE = "+91 98765 43210";
const SUPPORT_EMAIL = "support@indianarrated.com";

const CustomerSupport = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-4 rounded-xl overflow-hidden shadow-sm">
      <div
        className="p-4 flex items-center justify-between bg-gradient-to-r from-red-500 via-orange-500 to-orange-400 cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src="/images/contact_avatar.png"
            alt="Support"
          />
          <div>
            <h4 className="text-white text-sm font-semibold leading-tight">Customer Support</h4>
            <p className="text-orange-100 text-xs">Tap to get help</p>
          </div>
        </div>
        <span className="text-white text-lg">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="bg-white px-4 py-3 flex flex-col gap-2 border border-orange-100">
          <a
            href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
            className="flex items-center gap-2 text-sm text-gray-700 py-2 border-b border-gray-100"
          >
            <span className="text-lg">📞</span>
            <div>
              <p className="text-xs text-gray-400 leading-none">Call us</p>
              <p className="font-medium">{SUPPORT_PHONE}</p>
            </div>
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="flex items-center gap-2 text-sm text-gray-700 py-2"
          >
            <span className="text-lg">✉️</span>
            <div>
              <p className="text-xs text-gray-400 leading-none">Email us</p>
              <p className="font-medium">{SUPPORT_EMAIL}</p>
            </div>
          </a>
        </div>
      )}
    </div>
  );
};

export default CustomerSupport;
