import { Link } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { useEffect, useState } from "react";
import { publicService } from "../../../services/publicService";

const LINKS_COL1 = [
  { path: "/about", label: "आमच्याबद्दल" },
  { path: "/administration", label: "प्रशासन" },
  { path: "/notices", label: "सूचना" },
  { path: "/programs", label: "विकासकामे" },
  { path: "/gallery", label: "गॅलरी" },
  { path: "/awards", label: "पुरस्कार" },
];

const LINKS_COL2 = [
  { path: "/schemes", label: "शासकीय योजना" },
  { path: "/services", label: "नागरिक सेवा" },
  { path: "/important", label: "महत्त्वाची माहिती" },
  { path: "/financial-reports", label: "जमा खर्च" },
  { path: "/declarations", label: "स्वयंघोषणापत्रे" },
  { path: "/contact", label: "संपर्क" },
];

export default function ModernFooter() {
  const { village } = useTenant();
  const [contact, setContact] = useState<Record<string, string>>({});

  useEffect(() => {
    publicService.getContentSection("contact").then((c) => setContact((c as Record<string, string>) || {})).catch(() => {});
  }, []);

  const villageName = village?.name || "";

  const socialLinks = [
    contact.facebookUrl && { url: String(contact.facebookUrl), label: "Facebook", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
    contact.instagramUrl && { url: String(contact.instagramUrl), label: "Instagram", d: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" },
    contact.twitterUrl && { url: String(contact.twitterUrl), label: "Twitter", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
    contact.youtubeUrl && { url: String(contact.youtubeUrl), label: "YouTube", d: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
  ].filter(Boolean) as { url: string; label: string; d: string }[];

  return (
    <footer className="bg-slate-900">
      {/* Gradient separator */}
      <div className="h-1 bg-gradient-to-r from-teal-500 via-indigo-500 to-teal-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                {villageName.charAt(0) || "ग्रा"}
              </div>
              <div>
                <h3 className="text-white font-bold text-base">ग्रामपंचायत {villageName}</h3>
                <p className="text-slate-500 text-xs">
                  {village?.tehsil?.name && `ता. ${village.tehsil.name}`}
                  {village?.tehsil?.district && `, जि. ${village.tehsil.district}`}
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              गावाच्या सर्वांगीण विकासासाठी कटिबद्ध. पारदर्शक प्रशासन व डिजिटल सेवा.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-2 pt-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-teal-600 flex items-center justify-center text-slate-400 hover:text-white transition-all"
                    title={s.label}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.d} /></svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">द्रुत दुवे</h4>
            <ul className="space-y-2">
              {LINKS_COL1.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-slate-400 hover:text-teal-400 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">सेवा</h4>
            <ul className="space-y-2">
              {LINKS_COL2.map((l) => (
                <li key={l.path}>
                  <Link to={l.path} className="text-slate-400 hover:text-teal-400 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">संपर्क</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <svg className="w-4 h-4 mt-0.5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <span>ग्रामपंचायत कार्यालय, {villageName}</span>
              </li>
              {contact.phone && (
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                  <a href={`tel:${contact.phone}`} className="hover:text-teal-400 transition-colors">{contact.phone}</a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  <a href={`mailto:${contact.email}`} className="hover:text-teal-400 transition-colors truncate">{contact.email}</a>
                </li>
              )}
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>सोम - शनि: सकाळी १० ते संध्या ५</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ग्रामपंचायत {villageName}. सर्व हक्क राखीव.
          </p>
          <p className="text-xs text-slate-600">
            Powered by GPMH Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
