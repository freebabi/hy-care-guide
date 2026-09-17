"use client";

import { getSendLog } from "@/lib/care-guide/notification-service";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import { CHANNEL_LABEL, type DeliveryChannel } from "@/lib/care-guide/types";

const MOCK_KPI = [
  { label: "최근 30일 안내 준비 건수", value: "1,284건" },
  { label: "콘텐츠 링크 클릭률", value: "82%" },
  { label: "링크 재방문율", value: "34%" },
];

const MOCK_TOP_CONTENT: { title: string; views: number }[] = [
  { title: "CT 검사 전 준비", views: 214 },
  { title: "수술 전 준비", views: 189 },
  { title: "퇴원 후 생활 안내", views: 171 },
  { title: "복약 안내", views: 158 },
  { title: "위내시경 검사 안내", views: 132 },
];

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-400">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-brand-teal" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function summarizeLog() {
  const log = getSendLog();
  return {
    sessionCount: log.length,
    channelCounts: {
      sms: log.filter((r) => r.channel === "sms").length,
      qr: log.filter((r) => r.channel === "qr").length,
      kakao: log.filter((r) => r.channel === "kakao").length,
    } satisfies Record<DeliveryChannel, number>,
  };
}

export default function DashboardPage() {
  const { sessionCount, channelCounts } = useClientValue(summarizeLog, {
    sessionCount: 0,
    channelCounts: { sms: 0, qr: 0, kakao: 0 } satisfies Record<DeliveryChannel, number>,
  });

  const maxViews = Math.max(...MOCK_TOP_CONTENT.map((c) => c.views));
  const maxChannel = Math.max(1, ...Object.values(channelCounts));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">통계</h1>
        <p className="mt-1 text-sm text-slate-500">
          안내 콘텐츠 준비·클릭 현황입니다. 아래 지표는 프로토타입 예시 데이터입니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {MOCK_KPI.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">콘텐츠별 클릭 순위 (예시)</h2>
          <div className="mt-4 flex flex-col gap-3">
            {MOCK_TOP_CONTENT.map((item) => (
              <BarRow key={item.title} label={item.title} value={item.views} max={maxViews} />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">채널별 준비 건수 (이번 세션)</h2>
          <p className="mt-1 text-xs text-slate-400">
            이번 브라우저 세션에서 실제로 준비한 안내 {sessionCount}건 기준입니다.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {(Object.keys(CHANNEL_LABEL) as DeliveryChannel[]).map((c) => (
              <BarRow key={c} label={CHANNEL_LABEL[c]} value={channelCounts[c]} max={maxChannel} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
