import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTenant } from "../../../context/TenantContext";
import { publicService } from "../../../services/publicService";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";

const QUICK_LINKS = [
  { path: "/about", label: "आमच्याबद्दल" },
  { path: "/administration", label: "प्रशासन" },
  { path: "/notices", label: "सूचना" },
  { path: "/programs", label: "विकासकामे" },
  { path: "/gallery", label: "गॅलरी" },
  { path: "/awards", label: "पुरस्कार" },
];

const SERVICE_LINKS = [
  { path: "/schemes", label: "शासकीय योजना" },
  { path: "/services", label: "नागरिक सेवा" },
  { path: "/important", label: "महत्त्वाची माहिती" },
  { path: "/contact", label: "संपर्क" },
];

import type { ReactNode } from "react";

interface SocialLink {
  url: string;
  label: string;
  icon: ReactNode;
}

export default function ClassicFooter() {
  const { village } = useTenant();
  const [contact, setContact] = useState<Record<string, unknown>>({});

  useEffect(() => {
    publicService.getContentSection("contact").then((c) => setContact(c || {})).catch(() => {});
  }, []);

  const villageName = village?.name || "";
  const tehsilName = village?.tehsil?.name || "";
  const districtName = village?.tehsil?.district || "";

  // Social links from contact data
  const socialLinks: SocialLink[] = [
    contact.facebookUrl && {
      url: String(contact.facebookUrl),
      label: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
      ),
    },
    contact.instagramUrl && {
      url: String(contact.instagramUrl),
      label: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
      ),
    },
    contact.twitterUrl && {
      url: String(contact.twitterUrl),
      label: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
      ),
    },
    contact.youtubeUrl && {
      url: String(contact.youtubeUrl),
      label: "YouTube",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
      ),
    },
  ].filter(Boolean) as SocialLink[];

  return (
    <footer className="relative overflow-hidden">
      {/* Wave top separator */}
      <div className="bg-white">
        <svg viewBox="0 0 1440 60" className="w-full h-8 text-gray-900 fill-current">
          <path d="M0,60 C360,20 720,40 1080,20 C1260,10 1380,20 1440,30 L1440,60 Z" />
        </svg>
      </div>

      <div className="bg-gray-900 text-gray-300 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <AnimatedSection animation="fadeUp">
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10" staggerDelay={0.1}>
              {/* Village Info */}
              <StaggerItem>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/30">
                      {villageName.charAt(0) || "ग्रा"}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">
                        ग्रामपंचायत {villageName}
                      </h3>
                      {(tehsilName || districtName) && (
                        <p className="text-gray-400 text-xs">
                          {tehsilName && `ता. ${tehsilName}`}{tehsilName && districtName && ", "}{districtName && `जि. ${districtName}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    गावाच्या सर्वांगीण विकासासाठी कटिबद्ध. पारदर्शक प्रशासन,
                    डिजिटल सेवा व नागरिक सहभागातून आदर्श गाव निर्माण.
                  </p>
                  {/* Social Links */}
                  {socialLinks.length > 0 && (
                    <div className="flex items-center gap-3 pt-1">
                      {socialLinks.map((s) => (
                        <a
                          key={s.label}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-orange-500 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300"
                          title={s.label}
                        >
                          {s.icon}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>

              {/* Quick Links */}
              <StaggerItem>
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    द्रुत दुवे
                  </h4>
                  <ul className="space-y-2">
                    {QUICK_LINKS.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5"
                        >
                          <span className="text-orange-500/60 text-[10px]">▸</span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>

              {/* Service Links */}
              <StaggerItem>
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    सेवा
                  </h4>
                  <ul className="space-y-2">
                    {SERVICE_LINKS.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5"
                        >
                          <span className="text-orange-500/60 text-[10px]">▸</span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>

              {/* Contact Info */}
              <StaggerItem>
                <div>
                  <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                    संपर्क
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 flex-shrink-0">📍</span>
                      <span>ग्रामपंचायत कार्यालय, {villageName}</span>
                    </li>
                    {(contact.phone as string) && (
                      <li className="flex items-center gap-2">
                        <span className="flex-shrink-0">📞</span>
                        <a href={`tel:${contact.phone}`} className="hover:text-orange-400 transition-colors">
                          {contact.phone as string}
                        </a>
                      </li>
                    )}
                    {(contact.email as string) && (
                      <li className="flex items-center gap-2">
                        <span className="flex-shrink-0">✉️</span>
                        <a href={`mailto:${contact.email}`} className="hover:text-orange-400 transition-colors break-all">
                          {contact.email as string}
                        </a>
                      </li>
                    )}
                    <li className="flex items-center gap-2">
                      <span>🕐</span>
                      <span>सोम - शनि: सकाळी १० ते संध्या ५</span>
                    </li>
                  </ul>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </AnimatedSection>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © {new Date().getFullYear()} ग्रामपंचायत {villageName}. सर्व हक्क राखीव.
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              Powered by{" "}
              <span className="text-orange-500 font-semibold">GPMH Platform</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
