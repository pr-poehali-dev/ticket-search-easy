import SearchWidget from "@/components/home/SearchWidget";
import NewsSection from "@/components/home/NewsSection";
import WeatherTipsSection from "@/components/home/WeatherTipsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e5e5e3]">
      <SearchWidget />
      <NewsSection />
      <WeatherTipsSection />
    </div>
  );
}