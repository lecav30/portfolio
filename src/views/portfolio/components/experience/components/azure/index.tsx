"use client";
import { useTheme } from "next-themes";

const Azure = () => {
  const { resolvedTheme } = useTheme();

  return (
    <svg
      className="w-8 h-auto"
      width="800px"
      height="800px"
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <g fill={resolvedTheme == "dark" ? "#fff" : "#000"}>
        <path d="M7.47 12.412l3.348-.592.031-.007-1.722-2.049a291.474 291.474 0 01-1.723-2.058c0-.01 1.779-4.909 1.789-4.926a788.95 788.95 0 012.934 5.066l2.95 5.115.023.039-10.948-.001 3.317-.587zM.9 11.788c0-.003.811-1.412 1.803-3.131L4.507 5.53l2.102-1.764C7.765 2.797 8.714 2 8.717 2a.37.37 0 01-.033.085L6.4 6.981 4.16 11.789l-1.63.002c-.897.001-1.63 0-1.63-.003z"></path>
      </g>
    </svg>
  );
};

export default Azure;
