"use client";

import Link from "next/link";
import { getHistory, CHANNEL_LABEL } from "@/lib/care-guide/notification-service";
import { GUIDES } from "@/lib/care-guide/guides-data";
import { useClientValue } from "@/lib/care-guide/use-client-value";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function guideTitle(contentId: string) {
  return GUIDES.find((g) => g.contentId === contentId)?.title ?? contentId;
}

export default function HistoryPage() {
  const records = useClientValue(getHistory, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">발송 이력</h1>
        <p className="mt-1 text-sm text-slate-500">환자에게 전달한 안내 발송 기록입니다.</p>
      </div>

      {records.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          아직 발송 이력이 없습니다.{" "}
          <Link href="/" className="font-semibold text-brand-blue">
            환자 안내에서 보내보기
          </Link>
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3">발송 일시</th>
                <th className="px-4 py-3">환자</th>
                <th className="px-4 py-3">전달 안내</th>
                <th className="px-4 py-3">채널</th>
                <th className="px-4 py-3">담당자</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.recordId}>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(r.sentAt)}</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{r.patientName}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.contentIds.map((id) => guideTitle(id)).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {CHANNEL_LABEL[r.channel]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.sentBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
