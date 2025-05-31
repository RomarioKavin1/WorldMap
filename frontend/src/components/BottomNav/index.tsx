"use client";
/* eslint-disable react/prop-types */
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BottomNavProps {
  activeTab: string;
  onTabChange?: (tab: string) => void; // Made optional since we'll use router
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
}) => {
  const router = useRouter();

  const tabs = [
    { id: "globe", label: "My Globe", icon: "🌍", href: "/globe" },
    { id: "trips", label: "My Trips", icon: "✈️", href: "/trips" },
    { id: "add", label: "Add Trip", icon: "➕", href: "/add-trip" },
    { id: "merit", label: "Merit Miles", icon: "/blockscout_merit_icon.png", href: "/merit-miles", isImage: true },
    { id: "profile", label: "My Profile", icon: "👤", href: "/profile" },
  ];

  const handleTabChange = (tab: any) => {
    router.push(tab.href);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 ${activeTab === tab.id
              ? "text-white bg-white/10"
              : "text-white/60 hover:text-white/80"
              }`}
          >
            {tab.isImage ? (
              <Image
                src={tab.icon}
                alt={tab.label}
                width={40}
                height={40}
                className="w-5 h-5 mb-2 mt-2"
              />
            ) : (
              <span className="text-xl">{tab.icon}</span>
            )}
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
