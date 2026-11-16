"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchUsageStats } from "@/lib/care-guide/me-api";
import { ACTIVITY_LABEL, ACTIVITY_TYPES, type ActivityType } from "@/lib/care-guide/me-types";
import { useRequests } from "@/lib/care-guide/requests-store";
import { REVIEW_STATUS_LABEL, REVIEW_STATUS_ORDER, reviewStatusOf } from "@/lib/care-guide/review";
import { useRole } from "@/lib/care-guide/role";
import type { GuideContent, ImprovementRequest, ReviewStatus } from "@/lib/care-guide/types";
import { useGuides } from "@/lib/care-guide/use-guides";

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
      {note && <p className="mt-1 text-xs text-slate-600">{note}</p>}
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-semibold text-slate-700">{label}</span>
        <span className="shrink-0 text-slate-600">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-brand-teal" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const EMPTY = {
  published: 0,
  total: 0,
  approved: 0,
  reviewCounts: Object.fromEntries(REVIEW_STATUS_ORDER.map((s) => [s, 0])) as Record<ReviewStatus, number>,
  openRequests: 0,
  totalRequests: 0,
};

/** 서버에 저장된 실제 콘텐츠·개선 요청만 집계합니다. 예시 숫자는 쓰지 않습니다. */
function summarize(guides: GuideContent[], requests: ImprovementRequest[]) {
  const reviewCounts = Object.fromEntries(REVIEW_STATUS_ORDER.map((s) => [s, 0])) as Record<ReviewStatus, number>;
  guides.forEach((g) => (reviewCounts[reviewStatusOf(g)] += 1));
  return {
    published: guides.filter((g) => g.status === "게시").length,
    total: guides.length,
    approved: reviewCounts.approved,
    reviewCounts,
    openRequests: requests.filter((r) => r.status === "received" || r.status === "reviewing").length,
    totalRequests: requests.length,
  };
}

type Usage = Awaited<ReturnType<typeof fetchUsageStats>>;

/** 전체 직원의 활용 이력을 서버가 합산한 통계. 숫자만 보여 주며 직원 이름·개인별 내역은 나오지 않습니다. */
function UsagePanel() {
  const [days, setDays] = useState(30);
  const [usage, setUsage] = useState<Usage | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchUsageStats(days).then((r) => {
      if (!cancelled) setUsage(r);
    });
    return () => {
      cancelled = true;
    };
  }, [days]);

  const stats = usage?.ok ? usage.data.stats : null;
  const maxTop = Math.max(1, ...(stats?.topContents.map((c) => c.views) ?? [1]));
  const maxDaily = Math.max(1, ...(stats?.daily.map((d) => d.count) ?? [1]));

  return (
    <section className="flex flex-col gap-4" aria-labelledby="usage-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="usage-heading" className="text-base font-bold text-slate-900">
            전체 활용 통계
          </h2>
          <p className="mt-1 text-xs text-slate-600">모든 직원의 활용 이력을 합산한 숫자입니다. 직원별 내역은 표시하지 않습니다.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          기간
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="min-h-[40px] rounded-lg border border-slate-300 bg-white px-2.5 text-sm"
          >
            <option value={7}>최근 7일</option>
            <option value={30}>최근 30일</option>
            <option value={90}>최근 90일</option>
          </select>
        </label>
      </div>

      {usage && !usage.ok && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {usage.error}
        </p>
      )}
      {usage?.ok && !usage.data.durable && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
          현재 서버 환경에서는 이력이 영구 보관되지 않아 서버가 다시 시작되면 통계가 줄어들 수 있습니다.
        </p>
      )}

      {!stats ? (
        !usage && <p className="text-sm text-slate-600">불러오는 중입니다…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label="활동한 직원 수" value={`${stats.activeUsers}명`} note={`최근 ${stats.days}일`} />
            {ACTIVITY_TYPES.map((t: ActivityType) => (
              <StatCard key={t} label={ACTIVITY_LABEL[t]} value={`${stats.totals[t]}건`} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">많이 열람한 안내자료</h3>
              {stats.topContents.length === 0 ? (
                <p className="mt-3 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-700">아직 열람 기록이 없습니다.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {stats.topContents.map((c) => (
                    <BarRow key={c.contentId} label={c.title} value={c.views} max={maxTop} />
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-bold text-slate-900">날짜별 활용 건수</h3>
              {stats.daily.length === 0 ? (
                <p className="mt-3 rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-700">아직 활용 기록이 없습니다.</p>
              ) : (
                <div className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
                  {stats.daily
                    .slice()
                    .reverse()
                    .map((d) => (
                      <BarRow key={d.day} label={d.day} value={d.count} max={maxDaily} />
                    ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const role = useRole();
  const { guides } = useGuides();
  const { requests } = useRequests();
  const s = guides.length > 0 ? summarize(guides, requests) : EMPTY;
  const maxReview = Math.max(1, ...Object.values(s.reviewCounts));

  // 통계는 관리자 전용입니다(일반 직원 메뉴에서는 제거되었습니다).
  if (role !== "ADMIN") {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
        <h1 className="text-lg font-extrabold text-slate-900">관리자 전용 화면입니다</h1>
        <p className="text-sm leading-relaxed text-slate-700">통계는 관리자만 볼 수 있습니다. 내 활용 기록은 ‘발송·활용 이력’에서 확인할 수 있습니다.</p>
        <Link href="/history" className="mt-1 inline-flex min-h-[44px] items-center rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark">
          발송·활용 이력 보기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">통계</h1>
        <p className="mt-1 text-sm text-slate-700">
          콘텐츠 현황과 개선 요청은 서버에 저장된 실제 데이터를, 활용 통계는 서버에 저장된 직원 이력을 집계합니다(환자별 집계 없음).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="게시 중인 안내" value={`${s.published}건`} note={`전체 ${s.total}건 중`} />
        <StatCard
          label="공식 승인 완료 안내"
          value={`${s.approved}건`}
          note={s.approved === 0 ? "아직 승인된 안내가 없습니다." : `전체 ${s.total}건 중`}
        />
        <StatCard label="처리 대기 개선 요청" value={`${s.openRequests}건`} note={`접수된 요청 전체 ${s.totalRequests}건`} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="text-base font-bold text-slate-900">콘텐츠 검토 현황</h2>
        <p className="mt-1 text-xs text-slate-600">검토 상태별 안내 건수입니다.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {REVIEW_STATUS_ORDER.map((st) => (
            <BarRow key={st} label={REVIEW_STATUS_LABEL[st]} value={s.reviewCounts[st]} max={maxReview} />
          ))}
        </div>
      </div>

      <UsagePanel />
    </div>
  );
}
