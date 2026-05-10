import Icon from "@/components/ui/icon";

type Page = "home" | "cabinet" | "faq" | "contacts";

interface LayoutProps {
  page: Page;
  onNav: (p: Page) => void;
  children: React.ReactNode;
}

const navItems: { key: Page; label: string; icon: string }[] = [
  { key: "home", label: "Поиск", icon: "Search" },
  { key: "cabinet", label: "Кабинет", icon: "User" },
  { key: "faq", label: "Помощь", icon: "HelpCircle" },
  { key: "contacts", label: "Контакты", icon: "MessageSquare" },
];

export default function Layout({ page, onNav, children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e8e8e6]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => onNav("home")}
            className="flex items-center"
          >
            <img
              src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/f0381683-417d-42a0-98e9-148201492b78.png"
              alt="КОМПАС"
              className="h-9 w-auto"
            />
          </button>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNav(item.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  page === item.key
                    ? "bg-[#f2f2f0] text-[#111]"
                    : "text-[#8a8a8a] hover:text-[#111] hover:bg-[#f7f7f6]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#e8e8e6] z-50">
        <div className="flex">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                page === item.key ? "text-[#111]" : "text-[#c0c0bc]"
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden sm:block border-t border-[#e8e8e6] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/deb6d332-2cc4-4c3a-bcd1-e4e0a738361b/bucket/f0381683-417d-42a0-98e9-148201492b78.png"
              alt="КОМПАС"
              className="h-6 w-auto opacity-30"
            />
            <span className="text-xs text-[#c0c0bc] font-['IBM_Plex_Mono']">© 2025</span>
          </div>
          <div className="flex gap-6">
            {["Пользовательское соглашение", "Политика конфиденциальности"].map((t) => (
              <button key={t} className="text-xs text-[#c0c0bc] hover:text-[#8a8a8a] transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}