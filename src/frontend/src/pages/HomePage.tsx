import {
  Bell,
  Coins,
  Download,
  Fish,
  Gamepad2,
  Layers,
  Trophy,
} from "lucide-react";
import type { Page } from "../App";

interface Props {
  onNavigate: (page: Page) => void;
}

const categories = [
  { icon: Trophy, label: "Popular", color: "text-yellow-500" },
  { icon: Layers, label: "Lottery", color: "text-blue-500" },
  { icon: Gamepad2, label: "Mini", color: "text-green-500" },
  { icon: Coins, label: "Slots", color: "text-purple-500" },
  { icon: Fish, label: "Fishing", color: "text-cyan-500" },
];

const games = [
  {
    name: "WinGo",
    rtp: "96.2%",
    hot: true,
    gradient: "from-red-500 via-orange-400 to-yellow-400",
    emoji: "🎯",
    page: "game" as Page,
  },
  {
    name: "TRX Win",
    rtp: "95.8%",
    hot: true,
    gradient: "from-blue-500 via-purple-500 to-pink-500",
    emoji: "💎",
    page: "game" as Page,
  },
  {
    name: "K3 Lotre",
    rtp: "95.5%",
    hot: false,
    gradient: "from-green-500 via-teal-500 to-cyan-500",
    emoji: "🎲",
    page: "game" as Page,
  },
  {
    name: "5D Lotre",
    rtp: "94.9%",
    hot: false,
    gradient: "from-violet-600 via-purple-500 to-indigo-500",
    emoji: "🔮",
    page: "game" as Page,
  },
  {
    name: "Big Small",
    rtp: "96.5%",
    hot: true,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    emoji: "⚡",
    page: "game" as Page,
  },
  {
    name: "Color Win",
    rtp: "95.0%",
    hot: false,
    gradient: "from-pink-500 via-rose-400 to-orange-400",
    emoji: "🌈",
    page: "game" as Page,
  },
];

export default function HomePage({ onNavigate }: Props) {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
      {/* Header */}
      <header className="app-header sticky top-0 z-20">
        <div className="max-w-[430px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-wide">
              ColorWin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              data-ocid="home.bell.button"
              className="text-white/90 hover:text-white"
            >
              <Bell size={20} />
            </button>
            <button
              type="button"
              data-ocid="home.download.button"
              className="text-white/90 hover:text-white"
            >
              <Download size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Marquee */}
      <div className="bg-yellow-50 border-b border-yellow-200 py-1.5 px-3 flex items-center gap-2 max-w-[430px] mx-auto w-full">
        <span className="text-yellow-600 text-xs font-bold shrink-0">📢</span>
        <div className="marquee-container flex-1 overflow-hidden">
          <span className="marquee-text text-xs text-yellow-700">
            Recharge aur withdrawal sirf official channel se karein
            &nbsp;&nbsp;&nbsp; सभी लेनदेन केवल आधिकारिक चैनल से करें &nbsp;&nbsp;&nbsp;
            Beware of fake apps and fraud calls!
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[430px] mx-auto w-full flex flex-1">
        {/* Left sidebar - categories */}
        <aside className="w-16 bg-white border-r border-gray-100 flex flex-col items-center pt-3 gap-1 shrink-0">
          {categories.map((cat, _i) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                type="button"
                data-ocid={`home.category.${cat.label.toLowerCase()}.button`}
                className="flex flex-col items-center gap-1 py-3 px-1 w-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <Icon size={22} className={cat.color} />
                <span className="text-[9px] text-gray-500 font-medium leading-tight text-center">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Right main area */}
        <main className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              🏆 Platform Recommendation
            </span>
          </div>

          {/* Game grid */}
          <div className="grid grid-cols-3 gap-2">
            {games.map((game, i) => (
              <button
                key={game.name}
                type="button"
                data-ocid={`home.game.item.${i + 1}`}
                onClick={() => onNavigate(game.page)}
                className="flex flex-col group"
              >
                {/* Card image area */}
                <div
                  className={`relative rounded-xl bg-gradient-to-br ${game.gradient} aspect-square flex items-center justify-center shadow-md group-active:scale-95 transition-transform overflow-hidden`}
                >
                  <span className="text-4xl">{game.emoji}</span>
                  {game.hot && (
                    <div className="absolute top-1 right-0">
                      <div className="bg-yellow-400 text-yellow-900 text-[8px] font-black px-1.5 py-0.5 rounded-l-full">
                        HOT
                      </div>
                    </div>
                  )}
                </div>
                {/* Card label */}
                <div className="mt-1 px-0.5">
                  <p className="text-xs font-bold text-gray-700 text-center">
                    {game.name}
                  </p>
                  <p className="text-[10px] text-gray-400 text-center">
                    RTP {game.rtp}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Banner */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-primary to-red-600 p-4 text-white shadow-md">
            <p className="font-bold text-sm">🎁 Welcome Bonus</p>
            <p className="text-xs opacity-90 mt-0.5">
              Pehli deposit pe 50% bonus pao!
            </p>
            <button
              type="button"
              data-ocid="home.bonus.button"
              onClick={() => onNavigate("wallet")}
              className="mt-2 bg-white text-primary text-xs font-bold px-3 py-1 rounded-full"
            >
              Deposit Now
            </button>
          </div>

          <footer className="mt-4 text-center py-2">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()}. Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
