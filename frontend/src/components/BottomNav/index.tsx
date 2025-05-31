"use client";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: "globe", label: "My Globe", icon: "🌍" },
    { id: "trips", label: "My Trips", icon: "✈️" },
    { id: "add", label: "Add Trip", icon: "➕" },
    { id: "profile", label: "My Profile", icon: "👤" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200 ${
              activeTab === tab.id
                ? "text-white bg-white/10"
                : "text-white/60 hover:text-white/80"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
