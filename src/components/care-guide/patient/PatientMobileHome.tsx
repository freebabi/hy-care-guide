"use client";

import Link from "next/link";
import { findPatientById } from "@/lib/care-guide/patients-data";
import { getRecordByToken } from "@/lib/care-guide/notification-service";
import { loadGuides } from "@/lib/care-guide/cms-store";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import type { GuideContent, Patient, SentRecord } from "@/lib/care-guide/types";
import { CategoryIcon, ChevronRightIcon } from "../icons";
import PatientHeader from "./PatientHeader";

interface HomeData {
  record: SentRecord | null;
  patient: Patient | null;
  guides: GuideContent[];
}

function loadHomeData(token: string): HomeData {
  const record = getRecordByToken(token) ?? null;
  const patient = record ? findPatientById(record.patientId) ?? null : null;
  const guides = record ? loadGuides() : [];
  return { record, patient, guides };
}

export default function PatientMobileHome({ token }: { token: string }) {
  const { record, patient, guides } = useClientValue(
    () => loadHomeData(token),
    { record: null, patient: null, guides: [] } as HomeData,
    [token],
  );

  if (!record || !patient) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        유효하지 않거나 만료된 안내 링크입니다. 병원에 문의해주세요.
      </div>
    );
  }

  const sentGuides = record.contentIds
    .map((id) => guides.find((g) => g.contentId === id))
    .filter((g): g is GuideContent => Boolean(g));
  const primary = sentGuides[0];
  const others = sentGuides.slice(1);

  return (
    <div>
      <PatientHeader patientName={patient.name} />
      <p className="mb-5 text-lg font-bold text-slate-800">오늘 필요한 안내를 확인해주세요.</p>

      {primary && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold text-brand-teal">오늘의 안내</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">{primary.title}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{primary.summary}</p>
          <Link
            href={`/g/${token}/guides/${primary.contentId}`}
            className="mt-4 block rounded-full bg-brand-blue py-3 text-center text-base font-bold text-white"
          >
            안내 확인하기
          </Link>
        </div>
      )}

      {others.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-bold text-slate-700">함께 확인하면 좋은 안내</p>
          <div className="flex flex-col gap-2">
            {others.map((g) => (
              <Link
                key={g.contentId}
                href={`/g/${token}/guides/${g.contentId}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="flex items-center gap-2 text-[15px] font-semibold text-slate-800">
                  <CategoryIcon category={g.category} className="h-4 w-4 text-slate-400" />
                  {g.title}
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href={`/g/${token}/my-guides`}
        className="block rounded-xl border border-slate-300 bg-white py-3 text-center text-base font-bold text-slate-700"
      >
        내가 받은 안내
      </Link>
    </div>
  );
}
