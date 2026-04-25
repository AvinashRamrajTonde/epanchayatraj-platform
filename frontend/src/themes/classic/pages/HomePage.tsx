import { useEffect, useState } from "react";
import { publicService, type VillageFullData } from "../../../services/publicService";
import SeoHead from "../components/SeoHead";
import HeroSection from "../sections/HeroSection";
import NotificationTicker from "../sections/NotificationTicker";
import AboutSection from "../sections/AboutSection";
import AdministrationPreview from "../sections/AdministrationPreview";
import VillageStatsSection from "../sections/VillageStatsSection";
import NoticesPreview from "../sections/NoticesPreview";
import GalleryPreview from "../sections/GalleryPreview";
import ProgramsPreview from "../sections/ProgramsPreview";
import ContactPreview from "../sections/ContactPreview";
import AwardsPreview from "../sections/AwardsPreview";

export default function HomePage() {
  const [data, setData] = useState<VillageFullData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicService
      .getVillageFullData()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        डेटा लोड करण्यात अयशस्वी
      </div>
    );
  }

  const { village, content, heroSlides, members, notices, programs, gallery, awards } = data;

  return (
    <>
      <SeoHead
        title="मुख्यपृष्ठ"
        path="/"
        description={`ग्रामपंचायत ${village.name} यांची अधिकृत वेबसाइट. गावाच्या विकासाची माहिती, सूचना, योजना व नागरिक सेवा.`}
      />

      {/* Hero Carousel */}
      <HeroSection slides={heroSlides} hero={content.hero} villageStats={content.village_stats} village={village} />

      {/* Notification Ticker */}
      {notices.length > 0 && <NotificationTicker notices={notices} />}

      {/* About Section */}
      <AboutSection about={content.about} villageName={village.name} />

      {/* Administration Preview */}
      {members.length > 0 && <AdministrationPreview members={members} />}

      {/* Village Stats */}
      {content.village_stats && <VillageStatsSection stats={content.village_stats} />}

      {/* Notices Preview */}
      {notices.length > 0 && <NoticesPreview notices={notices.slice(0, 3)} />}

      {/* Gallery Preview */}
      {gallery.length > 0 && <GalleryPreview images={gallery.slice(0, 8)} />}

      {/* Programs Preview */}
      {programs.length > 0 && <ProgramsPreview programs={programs.slice(0, 3)} />}

      {/* Awards Preview */}
      {awards && awards.length > 0 && <AwardsPreview awards={awards} />}

      {/* Contact Preview */}
      <ContactPreview contact={content.contact} villageName={village.name} />
    </>
  );
}
