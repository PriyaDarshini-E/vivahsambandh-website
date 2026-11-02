/**
 * @file src/components/CompanyLogo.tsx
 * Brand logo resolved from the local optimized asset with fallback / override
 * from the `getCompany` API. Renders synchronously from SSG to eliminate layout
 * shift and prevent external asset loading delays.
 */

import { cn } from "cn";
import { useCompanyDetails } from "../module/company";

interface CompanyLogoProps {
  className?: string;
  fallbackClassName?: string;
  width?: number;
  height?: number;
}

const LOCAL_LOGO = "/images/logo-150.webp";
const LOCAL_LOGO_SRCSET =
  "/images/logo-150.webp 150w, /images/logo-200.webp 200w, /images/logo-300.webp 300w";

export default function CompanyLogo({
  className = "h-8 w-auto",
  fallbackClassName: _fallback = "h-8 w-8 text-gold-400",
  width = 154,
  height = 38,
}: CompanyLogoProps) {
  const { logoUrl, name } = useCompanyDetails();
  const displayName = name || "VivahSambandh";

  // Use the local optimized logo by default or when CRM serves the default logo.webp
  const isLocalLogo = !logoUrl || logoUrl.includes("logo.webp");
  const src = isLocalLogo ? LOCAL_LOGO : logoUrl;
  const srcSet = isLocalLogo ? LOCAL_LOGO_SRCSET : undefined;

  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={`${width}px`}
      alt={displayName}
      title={`${displayName} – Online Matrimony and Marriage Services`}
      width={width}
      height={height}
      decoding="async"
      className={cn("object-contain", className)}
    />
  );
}
