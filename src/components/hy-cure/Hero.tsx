import Image from "next/image";
import { CheckIcon } from "./icons";

function LiveSyncBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-cyan-100 ring-1 ring-inset ring-white/25">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
      </span>
      EMR Live Sync Active
    </span>
  );
}

function StatBadge({ text }: { text: string }) {
  return (
    <span className="group inline-flex cursor-default items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/30 transition-transform duration-200 ease-out hover:scale-105 hover:bg-white/20">
      <CheckIcon className="h-4 w-4 shrink-0" />
      <span className="inline-block transition-transform duration-200 ease-out group-hover:scale-110">
        {text}
      </span>
    </span>
  );
}

export default function Hero() {
  return (
    <section id="about" className="scroll-mt-24 px-4 pt-8 sm:px-6 sm:pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue-dark via-brand-blue to-brand-teal px-6 py-12 shadow-xl ring-1 ring-black/5 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-teal/30 sm:px-12 sm:py-16">
          {/* 은은한 배경 장식 (호버 시 함께 은은하게 확대) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-cyan/20 blur-3xl transition-transform duration-700 ease-out group-hover:scale-125"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="한양큐어 HY-Cure 로고"
                  width={1025}
                  height={1004}
                  className="h-10 w-10 rounded-lg bg-white/90 object-contain p-1 shadow-sm"
                />
                <p className="text-sm font-bold tracking-wide text-cyan-100">
                  EMR 연동 환자 맞춤형 교육자료 플랫폼
                </p>
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
                환자 맞춤형 교육자료의 시작,
                <br className="hidden sm:block" /> HY-Cure
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cyan-50 sm:text-lg">
                EMR 진료 정보와 자동 연동되어 환자에게 가장 필요한 맞춤형 헬스케어 콘텐츠를
                추천 및 발송합니다.
              </p>
            </div>

            <LiveSyncBadge />
          </div>

          <div className="relative mt-8 flex flex-wrap gap-3">
            <StatBadge text="표준 교육자료 500+개 구축" />
            <StatBadge text="누적 맞춤형 발송 60만+건 완료" />
          </div>

          <div className="relative mt-9 flex flex-wrap gap-3">
            <a
              href="#simulator"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-brand-blue shadow transition hover:bg-cyan-50"
            >
              큐레이션 체험하기
            </a>
            <a
              href="#library"
              className="rounded-full border border-white/70 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              교육자료 둘러보기
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
