import type { SVGProps } from "react";
import type { JourneyStageId } from "@/lib/care-guide/types";
import { BedIcon, HomeIcon, StethoscopeIcon } from "./icons";

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

function CalendarCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M3 10h18M8 3v4M16 3v4M9 15.5l2 2 4-4" />
    </Svg>
  );
}

function ClipboardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="4.5" width="14" height="17" rx="2.5" />
      <rect x="9" y="2.5" width="6" height="4" rx="1.2" />
      <path d="M9 11h6M9 14.5h6M9 18h4" />
    </Svg>
  );
}

function ScanIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 8V6.5A2.5 2.5 0 0 1 6.5 4H8M16 4h1.5A2.5 2.5 0 0 1 20 6.5V8M20 16v1.5a2.5 2.5 0 0 1-2.5 2.5H16M8 20H6.5A2.5 2.5 0 0 1 4 17.5V16M4 12h16" />
    </Svg>
  );
}

function SyringeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6" y="9" width="10" height="6" rx="1.2" />
      <path d="M16 12h4M20 9v6M6 12H3M9 9v2M12 9v2" />
    </Svg>
  );
}

function MedkitIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="7.5" width="18" height="13" rx="2.5" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M12 11.5v6M9 14.5h6" />
    </Svg>
  );
}

function DoorExitIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M10 4H6.5A2.5 2.5 0 0 0 4 6.5v11A2.5 2.5 0 0 0 6.5 20H10M14 8l4 4-4 4M18 12H9" />
    </Svg>
  );
}

function SirenIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="16" width="14" height="4" rx="1.2" />
      <path d="M7 16v-4a5 5 0 0 1 10 0v4M12 3v1.5M4.5 6l1.2 1M19.5 6l-1.2 1" />
    </Svg>
  );
}

function BuildingIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 21V6.5A2.5 2.5 0 0 1 7.5 4h6A2.5 2.5 0 0 1 16 6.5V21M16 10h2.5a2.5 2.5 0 0 1 2.5 2.5V21M3 21h18M10.5 8v4M8.5 10h4M8.5 15h4" />
    </Svg>
  );
}

type IconComponent = (props: IconProps) => React.JSX.Element;

const ICONS: Record<JourneyStageId, IconComponent> = {
  "pre-visit": CalendarCheckIcon,
  "arrival-registration": ClipboardIcon,
  outpatient: StethoscopeIcon,
  examination: ScanIcon,
  procedure: SyringeIcon,
  surgery: MedkitIcon,
  inpatient: BedIcon,
  discharge: DoorExitIcon,
  "post-discharge": HomeIcon,
  emergency: SirenIcon,
  "hospital-facilities": BuildingIcon,
};

export function JourneyIcon({ id, className }: { id: JourneyStageId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className ?? "h-6 w-6"} />;
}
