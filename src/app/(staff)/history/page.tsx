"use client";

import Link from "next/link";
import { getSendLog } from "@/lib/care-guide/notification-service";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import { CHANNEL_LABEL } from "@/lib/care-guide/types";
import { HistoryIcon, SendCheckIcon } from "@/components/care-guide/icons";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const records = useClientValue(getSendLog, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">발송 이력</h1>
        <p className="mt-1 text-sm text-slate-500">
          PII 제로 원칙에 따라 발송 시각·콘텐츠·채널·완료 여부만 기록합니다(환자 식별정보 없음).
        </p>
      </div>

      {records.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <HistoryIcon className="h-6 w-6 text-slate-300" />
          <div>
            <p className="text-sm font-semibold text-slate-600">아직 발송한 안내가 없습니다.</p>
            <p className="mt-1 text-xs text-slate-400">콘텐츠를 선택하여 환자에게 안내를 보내보세요.</p>
          </div>
          <Link
            href="/"
            className="mt-1 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-brand-blue transition-colors hover:bg-blue-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2"
          >
            환자 안내 콘텐츠 보기
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">발송 시각</th>
                <th className="px-4 py-3">콘텐츠</th>
                <th className="px-4 py-3">채널</th>
                <th className="px-4 py-3">완료 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.logId}>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(r.performedAt)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.contentTitle}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {CHANNEL_LABEL[r.channel]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.completed ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                        <SendCheckIcon className="h-3.5 w-3.5" /> 완료
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-400">미완료</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
