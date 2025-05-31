import React from "react";

export const Logo = () => {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-6xl font-bold text-center leading-none">
        <div className="flex items-center justify-center gap-0">
          <img src="/world.png" className="w-40 h-40" />
          <span className="bg-gradient-to-r from-cyan-200 via-blue-200 to-white bg-clip-text text-transparent drop-shadow-2xl -ml-6">
            Map
          </span>
        </div>
      </h1>
    </div>
  );
};
