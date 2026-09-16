import type { SVGProps } from "react";
import type { MaterialFormat } from "@/lib/hy-cure-data";

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

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.75h16.5v12.5H3.75z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 6.5 7.5 6 7.5-6" />
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

export function LayersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true" {...props}>
      <path strokeLinejoin="round" d="m12 4 8 4.5-8 4.5-8-4.5L12 4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 12.5 8 4.5 8-4.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4 16.5 8 4.5 8-4.5" />
    </svg>
  );
}

export function LeafletIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 3.75h12v16.5H6z" />
      <path strokeLinecap="round" d="M8.5 8h7M8.5 11.5h7M8.5 15h4.5" />
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

export function PauseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden="true" {...props}>
      <rect x="7" y="5.5" width="3.5" height="13" rx="1" />
      <rect x="13.5" y="5.5" width="3.5" height="13" rx="1" />
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

export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden="true" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0 3.75-3.75M12 15l-3.75-3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 17.5v1.75A1.75 1.75 0 0 0 6.75 21h10.5A1.75 1.75 0 0 0 19 19.25V17.5" />
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

const FORMAT_ICON: Record<MaterialFormat, (props: IconProps) => React.JSX.Element> = {
  "동영상 가이드": PlayIcon,
  "카드뉴스": LayersIcon,
  "주의사항 리플렛": LeafletIcon,
};

export function FormatIcon({ format, ...props }: IconProps & { format: MaterialFormat }) {
  const Icon = FORMAT_ICON[format];
  return <Icon {...props} />;
}
