import { Helmet } from "react-helmet-async";
import { useTenant } from "../../../context/TenantContext";

interface SeoHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  path?: string;
  type?: string;
  image?: string;
}

export default function SeoHead({
  title,
  description,
  keywords,
  path = "",
  type = "website",
  image,
}: SeoHeadProps) {
  const { village, subdomain } = useTenant();
  const villageName = village?.name || "";
  const tehsil = village?.tehsil;

  const fullTitle = `${title} | ग्रामपंचायत ${villageName}`;
  const defaultDescription =
    description ||
    `ग्रामपंचायत ${villageName}, ता. ${tehsil?.name || ""}, जि. ${tehsil?.district || ""}, ${tehsil?.state || ""} यांची अधिकृत वेबसाइट. गावाच्या विकासाची माहिती, सूचना, योजना, फोटो गॅलरी व नागरिक सेवा.`;
  const defaultKeywords =
    keywords ||
    `ग्रामपंचायत ${villageName}, ${villageName}, ${tehsil?.name || ""}, ${tehsil?.district || ""}, ग्रामपंचायत, महाराष्ट्र, village, grampanchayat, ${village?.slug || ""}`;
  const domain = import.meta.env.VITE_PLATFORM_DOMAIN || "gpmh.local";
  const siteUrl = `https://${subdomain}.${domain}`;
  const canonicalUrl = `${siteUrl}${path}`;

  // JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: `ग्रामपंचायत ${villageName}`,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: villageName,
      addressRegion: tehsil?.district || "",
      addressCountry: "IN",
    },
    ...(image && { image }),
    description: defaultDescription,
    areaServed: {
      "@type": "Place",
      name: villageName,
    },
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={defaultDescription} />
      <meta name="keywords" content={defaultKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={defaultDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={`ग्रामपंचायत ${villageName}`} />
      <meta property="og:locale" content="mr_IN" />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={defaultDescription} />
      {image && <meta name="twitter:image" content={image} />}

      {/* Geo */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content={villageName} />

      {/* Language */}
      <meta httpEquiv="content-language" content="mr" />
      <html lang="mr" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}
