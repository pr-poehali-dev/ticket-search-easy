import SearchWidget from "@/components/home/SearchWidget";
import AirportStatusSection from "@/components/home/AirportStatusSection";
import NewsSection from "@/components/home/NewsSection";
import WeatherTipsSection from "@/components/home/WeatherTipsSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#e5e5e3]">
      <SearchWidget />
      <AirportStatusSection />
      <NewsSection />
      <WeatherTipsSection />
    </div>
  );
}
