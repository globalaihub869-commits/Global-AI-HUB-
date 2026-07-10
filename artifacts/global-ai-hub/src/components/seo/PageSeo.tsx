import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { getRouteMeta } from "@/lib/seo-meta";

/**
 * Automatic Dynamic SEO Engine — reads the current route and injects
 * matching title/description/keywords meta tags, with auto-generated
 * keywords derived from the page copy. Mounted once in App.tsx so every
 * route (current and future) gets indexable metadata with zero per-page code.
 */
export default function PageSeo() {
  const [location] = useLocation();
  const meta = getRouteMeta(location);
  const canonicalPath = `${import.meta.env.BASE_URL.replace(/\/$/, "")}${location}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords.join(", ")} />
      <link rel="canonical" href={canonicalPath} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  );
}
