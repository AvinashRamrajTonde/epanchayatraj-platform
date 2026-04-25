import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";
import { useTenant } from "../../../context/TenantContext";
import SeoHead from "../components/SeoHead";
import SectionHero from "../components/SectionHero";
import SectionHeading from "../components/SectionHeading";
import AnimatedSection, { StaggerContainer, StaggerItem } from "../components/AnimatedSection";

interface ImportantLink {
  name: string;
  url: string;
  icon?: string;
}

interface EmergencyNumber {
  name: string;
  number: string;
  icon?: string;
}

interface ImportantContent {
  emergencyNumbers?: EmergencyNumber[];
  links?: ImportantLink[];
  weatherWidget?: boolean;
  farmingInfo?: string;
  additionalInfo?: string;
}

const DEFAULT_EMERGENCY: EmergencyNumber[] = [
  { name: "पोलीस", number: "100", icon: "🚔" },
  { name: "अग्निशमन दल", number: "101", icon: "🚒" },
  { name: "रुग्णवाहिका", number: "108", icon: "🚑" },
  { name: "महिला हेल्पलाइन", number: "1091", icon: "👩" },
  { name: "बालक हेल्पलाइन", number: "1098", icon: "👶" },
  { name: "आपत्ती व्यवस्थापन", number: "1070", icon: "⚠️" },
  { name: "विद्युत तक्रार", number: "1912", icon: "⚡" },
  { name: "जलवाहिनी तक्रार", number: "1916", icon: "💧" },
];

const DEFAULT_LINKS: ImportantLink[] = [
  { name: "महाराष्ट्र शासन", url: "https://maharashtra.gov.in", icon: "🏛️" },
  { name: "ग्रामविकास विभाग", url: "https://rural.maharashtra.gov.in", icon: "🌾" },
  { name: "महा-ई-सेवा केंद्र", url: "https://www.csc.gov.in", icon: "🖥️" },
  { name: "आपले सरकार", url: "https://aaplesarkar.mahaonline.gov.in", icon: "📋" },
  { name: "डिजिटल इंडिया", url: "https://digitalindia.gov.in", icon: "🇮🇳" },
  { name: "पंतप्रधान आवास योजना", url: "https://pmaymis.gov.in", icon: "🏠" },
  { name: "किसान पोर्टल", url: "https://farmer.gov.in", icon: "🧑‍🌾" },
  { name: "मनरेगा", url: "https://nrega.nic.in", icon: "👷" },
];

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  daily?: {
    date: string;
    maxTemp: number;
    minTemp: number;
    weatherCode: number;
  }[];
}

function getWeatherInfo(code: number, isDay = true): { label: string; icon: string } {
  if (code === 0) return { label: "स्वच्छ आकाश", icon: isDay ? "☀️" : "🌙" };
  if (code <= 3) return { label: "अंशतः ढगाळ", icon: isDay ? "⛅" : "☁️" };
  if (code <= 48) return { label: "धुके / धूसर", icon: "🌫️" };
  if (code <= 57) return { label: "रिमझिम", icon: "🌦️" };
  if (code <= 67) return { label: "पाऊस", icon: "🌧️" };
  if (code <= 77) return { label: "हिमवर्षाव", icon: "❄️" };
  if (code <= 82) return { label: "जोराचा पाऊस", icon: "🌧️" };
  if (code <= 86) return { label: "हिमवर्षाव", icon: "🌨️" };
  if (code <= 99) return { label: "वादळ / गडगडाट", icon: "⛈️" };
  return { label: "अनिश्चित", icon: "🌤️" };
}

const DAY_NAMES = ["रवि", "सोम", "मंगळ", "बुध", "गुरु", "शुक्र", "शनि"];

export default function ImportantPage() {
  const { village } = useTenant();
  const [content, setContent] = useState<ImportantContent>({});
  const [loading, setLoading] = useState(true);
  const [globalEmergency, setGlobalEmergency] = useState<EmergencyNumber[]>([]);
  const [globalLinks, setGlobalLinks] = useState<ImportantLink[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    publicService
      .getContentSection("important")
      .then((data) => {
        if (data) setContent(data as ImportantContent);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch global settings (emergency numbers + useful links)
    publicService
      .getGlobalSettings()
      .then((data) => {
        if (Array.isArray(data?.emergency_numbers)) setGlobalEmergency(data.emergency_numbers as EmergencyNumber[]);
        if (Array.isArray(data?.useful_links)) setGlobalLinks(data.useful_links as ImportantLink[]);
      })
      .catch(() => {});
  }, []);

  // Fetch weather using Open-Meteo (free, no API key)
  useEffect(() => {
    const fetchWeather = async () => {
      if (!village?.name) { setWeatherLoading(false); return; }
      try {
        // Use English names for geocoding API (Marathi names don't resolve)
        const tehsilEn = village.tehsil?.nameEn || "";
        const districtEn = village.tehsil?.districtEn || "";
        const stateEn = village.tehsil?.stateSlug || "Maharashtra";
        const searchTerm = tehsilEn && districtEn
          ? `${tehsilEn}, ${districtEn}, ${stateEn}`
          : districtEn || tehsilEn || village.name;
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm)}&count=1&language=en`
        );
        const geoData = await geoRes.json();
        if (!geoData.results?.length) {
          // Fallback: try district only
          const fallbackTerm = districtEn || village.tehsil?.district || village.name;
          const fallbackRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(fallbackTerm)}&count=1&language=en`
          );
          const fallbackData = await fallbackRes.json();
          if (!fallbackData.results?.length) { setWeatherError("स्थान सापडले नाही"); setWeatherLoading(false); return; }
          geoData.results = fallbackData.results;
        }

        const { latitude, longitude } = geoData.results[0];
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata&forecast_days=5`
        );
        const weatherData = await weatherRes.json();
        const c = weatherData.current;
        const d = weatherData.daily;
        setWeather({
          temperature: Math.round(c.temperature_2m),
          feelsLike: Math.round(c.apparent_temperature),
          humidity: c.relative_humidity_2m,
          windSpeed: Math.round(c.wind_speed_10m),
          weatherCode: c.weather_code,
          isDay: c.is_day === 1,
          daily: d?.time?.map((date: string, i: number) => ({
            date,
            maxTemp: Math.round(d.temperature_2m_max[i]),
            minTemp: Math.round(d.temperature_2m_min[i]),
            weatherCode: d.weather_code[i],
          })),
        });
      } catch {
        setWeatherError("हवामान माहिती उपलब्ध नाही");
      } finally {
        setWeatherLoading(false);
      }
    };
    fetchWeather();
  }, [village]);

  const emergencyNumbers = globalEmergency.length > 0 ? globalEmergency : DEFAULT_EMERGENCY;
  const importantLinks = globalLinks.length > 0 ? globalLinks : DEFAULT_LINKS;

  return (
    <>
      <SeoHead
        title="महत्त्वाची माहिती"
        description="आपत्कालीन संपर्क क्रमांक, उपयुक्त दुवे व इतर महत्त्वाची माहिती"
        path="/important"
      />

      <SectionHero
        title="महत्त्वाची माहिती"
        subtitle="आपत्कालीन क्रमांक, शासकीय संकेतस्थळे व उपयुक्त दुवे"
        gradient="from-red-700 to-rose-600"
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-red-200 animate-spin border-t-red-500" />
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🚨</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">माहिती लोड होत आहे...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Weather Report Section */}
          <section className="py-14 bg-gradient-to-b from-sky-50/80 to-white">
            <div className="max-w-7xl mx-auto px-4">
              <SectionHeading
                badge="🌤️ हवामान"
                title="हवामान अहवाल"
                subtitle={`${village?.name || ""} ${village?.tehsil?.district ? `— ${village.tehsil.district}` : ""} — सध्याचे हवामान व ५ दिवसांचा अंदाज`}
                badgeColor="text-sky-600 bg-sky-50 border-sky-200"
                align="center"
              />

              {weatherLoading ? (
                <div className="flex justify-center py-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-sky-200 animate-spin border-t-sky-500" />
                    <p className="text-sm text-gray-400">हवामान माहिती लोड होत आहे...</p>
                  </div>
                </div>
              ) : weatherError ? (
                <div className="text-center py-8 text-gray-400 text-sm">{weatherError}</div>
              ) : weather ? (
                <AnimatedSection animation="fadeUp">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Current Weather - main card */}
                    <div className="lg:col-span-1 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-sky-500/20">
                      <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl" />
                      <div className="relative z-10">
                        <p className="text-sky-100 text-sm font-medium mb-1">{village?.name || ""} — आत्ताचे हवामान</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-6xl">{getWeatherInfo(weather.weatherCode, weather.isDay).icon}</span>
                          <div>
                            <p className="text-5xl font-extrabold tracking-tight">{weather.temperature}°</p>
                            <p className="text-sky-200 text-sm mt-1">{getWeatherInfo(weather.weatherCode, weather.isDay).label}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/20">
                          <div>
                            <p className="text-sky-200 text-[10px] uppercase tracking-wider">जाणवते</p>
                            <p className="font-bold text-lg">{weather.feelsLike}°C</p>
                          </div>
                          <div>
                            <p className="text-sky-200 text-[10px] uppercase tracking-wider">आर्द्रता</p>
                            <p className="font-bold text-lg">{weather.humidity}%</p>
                          </div>
                          <div>
                            <p className="text-sky-200 text-[10px] uppercase tracking-wider">वारा</p>
                            <p className="font-bold text-lg">{weather.windSpeed} km/h</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 5-day forecast */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        ५ दिवसांचा अंदाज
                      </h3>
                      <div className="grid grid-cols-5 gap-3">
                        {weather.daily?.map((day, i) => {
                          const d = new Date(day.date);
                          const dayName = i === 0 ? "आज" : DAY_NAMES[d.getDay()];
                          const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
                          const info = getWeatherInfo(day.weatherCode);
                          return (
                            <div key={day.date} className={`text-center rounded-xl p-3 transition-colors ${i === 0 ? "bg-sky-50 border border-sky-200" : "hover:bg-gray-50"}`}>
                              <p className={`text-xs font-bold ${i === 0 ? "text-sky-600" : "text-gray-600"}`}>{dayName}</p>
                              <p className="text-[10px] text-gray-400">{dateStr}</p>
                              <span className="text-3xl block my-2">{info.icon}</span>
                              <p className="text-xs text-gray-500 mb-1 leading-tight">{info.label}</p>
                              <p className="font-bold text-sm text-gray-800">{day.maxTemp}°</p>
                              <p className="text-xs text-gray-400">{day.minTemp}°</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-300 text-center mt-3">
                    Source: Open-Meteo.com — हवामान डेटा स्वयंचलितपणे अपडेट होतो
                  </p>
                </AnimatedSection>
              ) : null}
            </div>
          </section>

          {/* Emergency Numbers */}
          <section className="py-14 bg-gradient-to-b from-red-50/50 to-white">
            <div className="max-w-7xl mx-auto px-4">
              <SectionHeading
                badge="🚨 आपत्कालीन"
                title="आपत्कालीन संपर्क क्रमांक"
                subtitle="गरजेच्या वेळी तात्काळ संपर्कासाठी क्रमांक — टॅप करा आणि कॉल करा"
                badgeColor="text-red-600 bg-red-50 border-red-200"
                align="center"
              />
              <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5" staggerDelay={0.06}>
                {emergencyNumbers.map((item, idx) => (
                  <StaggerItem key={idx} animation="scaleIn">
                    <a
                      href={`tel:${item.number}`}
                      className="group relative bg-white border border-red-100 rounded-2xl p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                    >
                      {/* Decorative gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-white/20 transition-colors duration-500">
                          <span className="text-3xl">{item.icon || "📞"}</span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-white transition-colors duration-500">
                          {item.name}
                        </h3>
                        <p className="text-3xl font-extrabold text-red-600 mt-2 group-hover:text-white transition-colors duration-500 tracking-wide">
                          {item.number}
                        </p>
                        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-white/90 text-xs font-medium bg-white/20 px-3 py-1 rounded-full">
                            📞 कॉल करा
                          </span>
                        </div>
                      </div>
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>

          {/* Important Links */}
          <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
              <SectionHeading
                badge="🔗 उपयुक्त दुवे"
                title="उपयुक्त दुवे / संकेतस्थळे"
                subtitle="शासकीय व इतर महत्त्वाची संकेतस्थळे — क्लिक करून भेट द्या"
                badgeColor="text-blue-600 bg-blue-50 border-blue-200"
                align="center"
              />
              <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" staggerDelay={0.05}>
                {importantLinks.map((link, idx) => (
                  <StaggerItem key={idx} animation="scaleIn">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-500"
                    >
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-500">
                        <span className="text-2xl group-hover:brightness-0 group-hover:invert transition-all duration-500">
                          {link.icon || "🔗"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                          {link.name}
                        </h3>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{link.url}</p>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>

          {/* Farming / Additional Info */}
          {(content.farmingInfo || content.additionalInfo) && (
            <section className="py-14">
              <div className="max-w-5xl mx-auto px-4">
                <AnimatedSection animation="fadeUp">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {content.farmingInfo && (
                      <div className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🌾</span>
                          </div>
                          <h3 className="text-xl font-bold text-green-800">
                            शेती व कृषी माहिती
                          </h3>
                        </div>
                        <div className="text-green-700 whitespace-pre-wrap leading-relaxed text-sm">
                          {content.farmingInfo}
                        </div>
                      </div>
                    )}
                    {content.additionalInfo && (
                      <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-500">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">ℹ️</span>
                          </div>
                          <h3 className="text-xl font-bold text-blue-800">
                            अतिरिक्त माहिती
                          </h3>
                        </div>
                        <div className="text-blue-700 whitespace-pre-wrap leading-relaxed text-sm">
                          {content.additionalInfo}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedSection>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
