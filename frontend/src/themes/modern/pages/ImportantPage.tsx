import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";
import { useTenant } from "../../../context/TenantContext";

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
  const [data, setData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [globalEmergency, setGlobalEmergency] = useState<{ name: string; number: string }[]>([]);
  const [globalLinks, setGlobalLinks] = useState<{ name: string; url: string; icon?: string }[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    publicService
      .getContentSection("important_info")
      .then((d) => setData(d || {}))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Fetch global settings (emergency numbers + useful links)
    publicService
      .getGlobalSettings()
      .then((d) => {
        if (Array.isArray(d?.emergency_numbers)) setGlobalEmergency(d.emergency_numbers as { name: string; number: string }[]);
        if (Array.isArray(d?.useful_links)) setGlobalLinks(d.useful_links as { name: string; url: string; icon?: string }[]);
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

  const items = (data?.items as { title: string; content: string; link?: string }[]) || [];
  const helplineNumbers = globalEmergency.length > 0 ? globalEmergency : ((data?.helplineNumbers as { name: string; number: string }[]) || []);
  const importantLinks = globalLinks.length > 0 ? globalLinks : ((data?.importantLinks as { name: string; url: string }[]) || []);

  return (
    <>
      <section className="bg-gradient-to-br from-teal-700 to-indigo-800 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white">महत्त्वाची माहिती</h1>
          <p className="text-teal-200 mt-2">नागरिकांसाठी महत्त्वाची माहिती व दुवे</p>
        </div>
      </section>

      <section className="py-12 bg-slate-50 min-h-[60vh]">
        <div className="max-w-5xl mx-auto px-4">
          {/* Weather Report Section */}
          <div className="mb-10">
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
              🌤️ हवामान अहवाल
              <span className="text-xs font-normal text-slate-400 ml-1">{village?.name || ""}</span>
            </h2>
            {weatherLoading ? (
              <div className="flex justify-center py-8"><div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
            ) : weatherError ? (
              <div className="text-center py-6 text-slate-400 text-sm">{weatherError}</div>
            ) : weather ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Weather Card */}
                <div className="md:col-span-1 bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  <div className="relative z-10">
                    <p className="text-teal-200 text-xs font-medium">आत्ताचे हवामान</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-5xl">{getWeatherInfo(weather.weatherCode, weather.isDay).icon}</span>
                      <div>
                        <p className="text-4xl font-extrabold">{weather.temperature}°</p>
                        <p className="text-teal-200 text-xs mt-0.5">{getWeatherInfo(weather.weatherCode, weather.isDay).label}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
                      <div>
                        <p className="text-teal-300 text-[9px] uppercase">जाणवते</p>
                        <p className="font-bold text-sm">{weather.feelsLike}°C</p>
                      </div>
                      <div>
                        <p className="text-teal-300 text-[9px] uppercase">आर्द्रता</p>
                        <p className="font-bold text-sm">{weather.humidity}%</p>
                      </div>
                      <div>
                        <p className="text-teal-300 text-[9px] uppercase">वारा</p>
                        <p className="font-bold text-sm">{weather.windSpeed} km/h</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-day Forecast */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
                  <h3 className="font-bold text-slate-700 text-sm mb-3">५ दिवसांचा अंदाज</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {weather.daily?.map((day, i) => {
                      const d = new Date(day.date);
                      const dayName = i === 0 ? "आज" : DAY_NAMES[d.getDay()];
                      const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
                      const info = getWeatherInfo(day.weatherCode);
                      return (
                        <div key={day.date} className={`text-center rounded-xl p-2.5 ${i === 0 ? "bg-teal-50 border border-teal-200" : "hover:bg-slate-50"} transition-colors`}>
                          <p className={`text-xs font-bold ${i === 0 ? "text-teal-700" : "text-slate-600"}`}>{dayName}</p>
                          <p className="text-[10px] text-slate-400">{dateStr}</p>
                          <span className="text-2xl block my-1">{info.icon}</span>
                          <p className="text-[10px] text-slate-400 leading-tight">{info.label}</p>
                          <p className="font-bold text-sm text-slate-800">{day.maxTemp}°</p>
                          <p className="text-xs text-slate-400">{day.minTemp}°</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-slate-300 text-right mt-2">Source: Open-Meteo.com</p>
                </div>
              </div>
            ) : null}
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            <div className="space-y-8">
              {/* Items */}
              {items.length > 0 && (
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6">
                      <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal-600 text-sm font-medium mt-3 hover:text-teal-700">
                          दुवा उघडा
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Helpline Numbers */}
              {helplineNumbers.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-slate-800 mb-4">हेल्पलाइन क्रमांक</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {helplineNumbers.map((h, i) => (
                      <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{h.name}</p>
                          <a href={`tel:${h.number}`} className="text-teal-600 font-bold text-sm">{h.number}</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Links */}
              {importantLinks.length > 0 && (
                <div>
                  <h2 className="text-xl font-black text-slate-800 mb-4">महत्त्वाचे दुवे</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {importantLinks.map((l, i) => (
                      <a
                        key={i}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 hover:shadow-md hover:border-teal-200 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-teal-100 transition-colors">
                          <svg className="w-5 h-5 text-indigo-600 group-hover:text-teal-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-1.758a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.8 8.88" /></svg>
                        </div>
                        <span className="text-sm font-medium text-slate-700 group-hover:text-teal-700">{l.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {items.length === 0 && helplineNumbers.length === 0 && importantLinks.length === 0 && (
                <div className="text-center py-20">
                  <h3 className="text-lg font-bold text-slate-600">माहिती उपलब्ध नाही</h3>
                  <p className="text-slate-400 text-sm mt-1">कृपया नंतर भेट द्या</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
