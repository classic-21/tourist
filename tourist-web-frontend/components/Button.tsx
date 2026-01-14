"use client";

import { useRouter } from "next/navigation";

interface ButtonProps {
  link: string;
  css: string;
  text: string;
}

export function ButtonComponent(props: ButtonProps) {
  const { link, css, text } = props || {};
  const router = useRouter();

  const handleClick = () => {
    router.push(`/${link}`);
  };

  return (
    <button
      className={`w-80 flex items-center justify-center h-[50px] rounded-[10px] font-[600] text-[16px] ${css}`}
      onClick={handleClick}
    >
      {text}
    </button>
  );
}
