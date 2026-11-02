
/**
 * @file src/components/SectionBrandMark.tsx
 * Vivah Sambandh — V logo brand mark using /logo.svg from public/.
 */

interface SectionBrandMarkProps {
  className?: string
  size?: string
}

export default function SectionBrandMark({
  className = '',
  size = 'h-10 w-12',
}: SectionBrandMarkProps) {
  return (
    <img
      src="/logo.svg"
      alt="Vivah Sambandh Logo"
      title="VivahSambandh – Online Matrimony and Marriage Services"
      className={`inline-block object-contain ${size} ${className}`}
      aria-hidden="true"
    />
  )
}
