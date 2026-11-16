import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Svg(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

/** 상세 안내 섹션 제목 옆에 쓰는 아이콘 모음. 키는 DetailSection.icon 과 같습니다. */
const ICONS: Record<string, (p: IconProps) => React.JSX.Element> = {
  info: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </Svg>
  ),
  heart: (p) => (
    <Svg {...p}>
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
    </Svg>
  ),
  target: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" />
    </Svg>
  ),
  clipboard: (p) => (
    <Svg {...p}>
      <rect x="5" y="4.5" width="14" height="17" rx="2.5" />
      <rect x="9" y="2.5" width="6" height="4" rx="1.2" />
      <path d="M9 12h6M9 16h4" />
    </Svg>
  ),
  route: (p) => (
    <Svg {...p}>
      <circle cx="6" cy="6" r="2.2" />
      <circle cx="18" cy="18" r="2.2" />
      <path d="M8 6h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h5.8" />
    </Svg>
  ),
  care: (p) => (
    <Svg {...p}>
      <path d="M12 21c-5-3-8-6.2-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3.8-3 7-8 10Z" />
      <path d="M12 9v5M9.5 11.5h5" />
    </Svg>
  ),
  home: (p) => (
    <Svg {...p}>
      <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5Z" />
    </Svg>
  ),
  alert: (p) => (
    <Svg {...p}>
      <path d="M12 4 3 19.5h18L12 4Z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </Svg>
  ),
  question: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.3c-.7.4-1.1.9-1.1 1.7M12 16.5h.01" />
    </Svg>
  ),
  bed: (p) => (
    <Svg {...p}>
      <path d="M3 18V7M3 14h18v4M21 14v-2.5A2.5 2.5 0 0 0 18.5 9H11v5" />
      <circle cx="7" cy="11" r="1.6" />
    </Svg>
  ),
  walk: (p) => (
    <Svg {...p}>
      <circle cx="13" cy="4.5" r="1.8" />
      <path d="m10 21 2-6-2.5-2.5 1-4.5 3 2 2.5 1M9.5 12.5 7 14M14.5 15l2 6" />
    </Svg>
  ),
  shoe: (p) => (
    <Svg {...p}>
      <path d="M3 16.5V11l4 1.5 3-3.5 3 2.5h4a4 4 0 0 1 4 4v1H3Z" />
      <path d="M3 19.5h18" />
    </Svg>
  ),
  bell: (p) => (
    <Svg {...p}>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15L6 16.5ZM10 20a2 2 0 0 0 4 0" />
    </Svg>
  ),
  users: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6a3 3 0 0 1 0 5.8M17.5 14a5.5 5.5 0 0 1 3 5" />
    </Svg>
  ),
  shield: (p) => (
    <Svg {...p}>
      <path d="M12 3 5 6v5.5c0 4.5 3 7.7 7 9.5 4-1.8 7-5 7-9.5V6l-7-3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </Svg>
  ),
  hand: (p) => (
    <Svg {...p}>
      <path d="M8 12V6.5a1.5 1.5 0 0 1 3 0V11m0-1V5a1.5 1.5 0 0 1 3 0v6m0-3a1.5 1.5 0 0 1 3 0v6.5c0 3.6-2.4 6-5.5 6S7 18.6 5.5 16.5L4 14a1.6 1.6 0 0 1 2.6-1.8L8 14" />
    </Svg>
  ),
  pill: (p) => (
    <Svg {...p}>
      <rect x="3.5" y="9" width="17" height="6" rx="3" transform="rotate(-35 12 12)" />
      <path d="m9.2 9.2 5.6 5.6" />
    </Svg>
  ),
  id: (p) => (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6.5 16a3 3 0 0 1 5 0M14 10h4M14 14h3" />
    </Svg>
  ),
  mask: (p) => (
    <Svg {...p}>
      <path d="M4 9c4-1.6 12-1.6 16 0v3c0 3-3 6-8 6s-8-3-8-6V9Z" />
      <path d="M4 10.5H2M20 10.5h2M8 12.5h8M8.5 15h7" />
    </Svg>
  ),
};

export function DetailIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || ICONS.info;
  return <Icon className={className ?? "h-5 w-5"} />;
}
