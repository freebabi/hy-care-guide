import type { SVGProps } from "react";

function StandardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true" {...props}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true" {...props}>
      <path strokeLinecap="round" d="M9.5 14.5 14.5 9.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 7.5 12.6 5.9a3.2 3.2 0 0 1 4.5 4.5L15.5 12" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m13 16.5-1.6 1.6a3.2 3.2 0 1 1-4.5-4.5L8.5 12" />
    </svg>
  );
}

function DeviceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6" aria-hidden="true" {...props}>
      <rect x="7" y="3.5" width="10" height="17" rx="2" />
      <path strokeLinecap="round" d="M11 17.5h2" />
    </svg>
  );
}

const EFFECTS = [
  {
    title: "표준화된 교육자료",
    description: "병원·부서별 편차 없는 고품질 디지털 표준 교육 콘텐츠를 일관되게 제공합니다.",
    Icon: StandardIcon,
  },
  {
    title: "EMR 기반 자동 추천",
    description: "진단명·처방 정보와 연동해 자료를 직접 고르는 의료진의 업무 부담을 줄여줍니다.",
    Icon: LinkIcon,
  },
  {
    title: "환자 경험 혁신",
    description: "모바일 알림톡 링크로 환자와 보호자가 언제 어디서나 교육자료를 다시 볼 수 있습니다.",
    Icon: DeviceIcon,
  },
];

export default function EffectsSection() {
  return (
    <section id="emr" className="scroll-mt-24 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
            한양 케어가이드 도입 효과 및 필요성
          </h2>
          <p className="mt-2 text-slate-600">
            EMR 연동을 기반으로 의료진과 환자 모두에게 실질적인 변화를 만듭니다.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {EFFECTS.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-brand-teal hover:shadow-lg hover:shadow-brand-teal/20 hover:ring-2 hover:ring-brand-teal/30"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-brand-blue transition-transform duration-300 ease-out group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white">
                <Icon />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
