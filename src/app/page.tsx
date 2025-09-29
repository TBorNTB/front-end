import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import HeroBanner from "@/components/landing/HeroBanner";

export default function Home() {
  return (
    <><div className="min-h-screen bg-background">
       <Header />
          <div className="w-screen text-center text-3xl text-white sm:h-[250px] md:h-[420px]">
            <HeroBanner />
          </div>
    </div><Footer /></>
  );
}

