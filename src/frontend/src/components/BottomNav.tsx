import { Home, Settings, Wallet } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";

interface Props {
  current: Page;
  onChange: (page: Page) => void;
  isAdmin: boolean;
}

export default function BottomNav({ current, onChange, isAdmin }: Props) {
  const tabs = [
    { id: "game" as Page, label: "Game", icon: Home },
    { id: "wallet" as Page, label: "Wallet", icon: Wallet },
    ...(isAdmin
      ? [{ id: "admin" as Page, label: "Admin", icon: Settings }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div
        className="w-full max-w-[430px] bg-card border-t border-border flex justify-around items-center h-16 px-2"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = current === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.link`}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 flex-1 py-2 relative"
            >
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-primary/10"
                />
              )}
              <Icon
                size={22}
                className={active ? "text-primary" : "text-muted-foreground"}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
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
