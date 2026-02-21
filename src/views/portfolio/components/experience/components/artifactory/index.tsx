"use client";
import { useTheme } from "next-themes";

const Artifactory = () => {
  const { resolvedTheme } = useTheme();

  return (
    <svg
      className="w-8 h-auto"
      width="800px"
      height="800px"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>artifactory</title>
      <g id="Layer_2" data-name="Layer 2">
        <g id="invisible_box" data-name="invisible box">
          <rect width="48" height="48" fill="none" />
        </g>
        <g id="icons_Q2" data-name="icons Q2">
          <rect
            x="5"
            y="42.4"
            width="38"
            height="2.92"
            fill={resolvedTheme === "dark" ? "#fff" : "#000"}
          />
          <path
            d="M23.93,34.48A16.24,16.24,0,1,1,40.17,18.24,16.25,16.25,0,0,1,23.93,34.48Zm0-29.38A13.14,13.14,0,1,0,37.07,18.24,13.16,13.16,0,0,0,23.93,5.1Z"
            fill={resolvedTheme === "dark" ? "#fff" : "#000"}
          />
        </g>
      </g>
    </svg>
  );
};

export default Artifactory;
