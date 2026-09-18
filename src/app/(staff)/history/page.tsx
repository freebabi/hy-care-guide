"use client";

import { getSendLog } from "@/lib/care-guide/notification-service";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import { CHANNEL_LABEL } from "@/lib/care-guide/types";
import { SendCheckIcon } from "@/components/care-guide/icons";

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
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          아직 발송 준비 이력이 없습니다.
        </p>
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
