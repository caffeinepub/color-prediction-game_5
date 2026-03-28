import { Clock, Gift, Home, User, Wallet } from "lucide-react";
import type { Page } from "../App";

interface Props {
  current: Page;
  onChange: (page: Page) => void;
  isAdmin: boolean;
}

export default function BottomNav({ current, onChange, isAdmin }: Props) {
  const navTabs = [
    { id: "home" as Page, label: "Home", icon: Home },
    { id: "game" as Page, label: "Activity", icon: Clock },
    { id: "wallet" as Page, label: "Wallet", icon: Wallet },
    ...(isAdmin
      ? [{ id: "admin" as Page, label: "Admin", icon: Gift }]
      : [{ id: "home" as Page, label: "Promo", icon: Gift }]),
    { id: "account" as Page, label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div
        className="w-full max-w-[430px] bg-white border-t border-gray-200 flex justify-around items-center h-16 px-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navTabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive =
            current === tab.id && !(tab.id === "home" && idx !== 0);
          return (
            <button
              type="button"
              key={`${tab.id}-${idx}`}
              data-ocid={`nav.${tab.label.toLowerCase()}.link`}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 flex-1 py-2"
            >
              <Icon
                size={22}
                className={isActive ? "text-primary" : "text-gray-400"}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
