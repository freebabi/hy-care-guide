import type { SVGProps } from "react";
import type { GuideCategory } from "@/lib/care-guide/types";

type IconProps = SVGProps<SVGSVGElement>;

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.4 7.4a1 1 0 0 1-1.4 0L3.3 9.5a1 1 0 1 1 1.4-1.4l3.9 3.9 6.7-6.7a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true" {...props}>
      <path strokeLinecap="round" d="M3.75 6.5h16.5M3.75 12h16.5M3.75 17.5h16.5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true" {...props}>
      <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true" {...props}>
      <path d="M9.5 7.2c0-.9 1-1.4 1.7-.9l6.6 4.3c.6.4.6 1.3 0 1.7l-6.6 4.3c-.7.5-1.7 0-1.7-.9V7.2Z" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <rect x="8.75" y="8.75" width="11.5" height="11.5" rx="1.75" />
      <path strokeLinecap="round" d="M15.75 8.75V6.5A1.75 1.75 0 0 0 14 4.75H5.75A1.75 1.75 0 0 0 4 6.5v8.25a1.75 1.75 0 0 0 1.75 1.75h2.25" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0 3.75-3.75M12 15l-3.75-3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 17.5v1.75A1.75 1.75 0 0 0 6.75 21h10.5A1.75 1.75 0 0 0 19 19.25V17.5" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true" {...props}>
      <path d="M12 3.5c-5.06 0-9.17 3.13-9.17 6.99 0 2.47 1.68 4.64 4.22 5.9-.19.71-.68 2.44-.78 2.82-.12.47.17.46.36.34.15-.1 2.36-1.6 3.32-2.25.68.1 1.38.15 2.05.15 5.06 0 9.17-3.13 9.17-6.99S17.06 3.5 12 3.5Z" />
    </svg>
  );
}

export function SendCheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.5 4.5 4.5 10-11" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75 21.25 20H2.75L12 3.75Z" />
      <path strokeLinecap="round" d="M12 10v4" />
      <circle cx="12" cy="16.75" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LightbulbIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18h6M9.75 21h4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5a5.5 5.5 0 0 0-3 10.1c.6.42 1 1.1 1 1.9v.5h4v-.5c0-.8.4-1.48 1-1.9A5.5 5.5 0 0 0 12 3.5Z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path strokeLinecap="round" d="m19.5 19.5-4.35-4.35" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-6.5-5.6-6.5-10.8A6.5 6.5 0 0 1 18.5 10.2C18.5 15.4 12 21 12 21Z" />
      <circle cx="12" cy="10.2" r="2.1" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75h3l1.5 4-2 1.5a11 11 0 0 0 5.25 5.25l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15.75 15.75 0 0 1 4.5 5.35 1.5 1.5 0 0 1 6 3.75Z" />
    </svg>
  );
}

export function QrIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-5 w-5" aria-hidden="true" {...props}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path strokeLinecap="round" d="M14.5 15h2.5v2.5H14.5zM19 15h1.5v1.5H19zM14.5 19h1.5v1.5h-1.5zM19 19h1.5v1.5H19z" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 1 0 2.6-5.9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4.5V9h4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4.5l3 1.75" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5V10M12 19.5V4.5M19.5 19.5v-7" />
    </svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path strokeLinecap="round" d="M12 3.5v2M12 18.5v2M4.6 6.6l1.4 1.4M18 16l1.4 1.4M3.5 12h2M18.5 12h2M4.6 17.4 6 16M18 8l1.4-1.4" />
    </svg>
  );
}

export function DocumentPlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75h9l3 3v13.5H6z" />
      <path strokeLinecap="round" d="M10.25 13h3.5M12 11.25v3.5" />
    </svg>
  );
}

export function PillIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <rect x="4" y="10.5" width="16" height="7" rx="3.5" transform="rotate(-30 12 14)" />
      <path strokeLinecap="round" d="m10.2 12.3 3.6 2.1" />
    </svg>
  );
}

export function BedIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 18.5v-8a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 13.5H19a1.5 1.5 0 0 1 1.5 1.5v3.5" />
      <path strokeLinecap="round" d="M13 11h4.5a1.5 1.5 0 0 1 1.5 1.5v1" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 11 8-6.5 8 6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9.5V19h12V9.5" />
    </svg>
  );
}

export function StethoscopeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4v5.5a4.5 4.5 0 0 0 9 0V4" />
      <path strokeLinecap="round" d="M10.5 14v1.5a4 4 0 0 0 8 0v-1.2" />
      <circle cx="18.5" cy="12.3" r="1.4" />
    </svg>
  );
}

export function HeartPulseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 12h3l1.5-3 2.5 6 1.5-3h8" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.75 19.25a7.25 7.25 0 0 1 14.5 0" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path strokeLinecap="round" d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const CATEGORY_ICON: Record<GuideCategory, (props: IconProps) => React.JSX.Element> = {
  검사: StethoscopeIcon,
  수술: HeartPulseIcon,
  입원: BedIcon,
  퇴원: HomeIcon,
  기타: InfoIcon,
};

export function CategoryIcon({ category, ...props }: IconProps & { category: GuideCategory }) {
  const Icon = CATEGORY_ICON[category];
  return <Icon {...props} />;
}
