import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export const Logo = ({ size = "xl" }: LogoProps) => {
  // Define size mappings for text classes and image dimensions
  const sizeConfig = {
    sm: {
      textClass: "text-lg",
      imageSize: 40,
      imageClass: "w-10 h-10",
      marginClass: "-ml-1"
    },
    md: {
      textClass: "text-md",
      imageSize: 60,
      imageClass: "w-15 h-15",
      marginClass: "-ml-2"
    },
    lg: {
      textClass: "text-xl",
      imageSize: 80,
      imageClass: "w-20 h-20",
      marginClass: "-ml-3 "
    },
    xl: {
      textClass: "text-3xl",
      imageSize: 120,
      imageClass: "w-30 h-30",
      marginClass: "-ml-4"
    },
    "2xl": {
      textClass: "text-4xl",
      imageSize: 160,
      imageClass: "w-40 h-40",
      marginClass: "-ml-5"
    }
  };

  const config = sizeConfig[size];

  return (
    <div className="text-center space-y-4">
      <h1 className={`${config.textClass} font-bold text-center leading-none`}>
        <div className="flex items-center justify-center gap-0">
          <Image
            src="/world.png"
            alt="World Map Logo"
            width={config.imageSize}
            height={config.imageSize}
            className={config.imageClass}
            priority
          />
          <span className={`bg-gradient-to-r from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl ${config.marginClass}`}>
            Map
          </span>
        </div>
      </h1>
    </div>
  );
};
