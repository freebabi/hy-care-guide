"use client";

import Link from "next/link";
import { findPatientById } from "@/lib/care-guide/patients-data";
import { getHistoryForPatient, getRecordByToken } from "@/lib/care-guide/notification-service";
import { loadGuides } from "@/lib/care-guide/cms-store";
import { useClientValue } from "@/lib/care-guide/use-client-value";
import type { GuideContent, Patient, SentRecord } from "@/lib/care-guide/types";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import PatientHeader from "./PatientHeader";

interface MyGuidesData {
  patient: Patient | null;
  records: SentRecord[];
  guides: GuideContent[];
}

function loadMyGuidesData(token: string): MyGuidesData {
  const record = getRecordByToken(token);
  if (!record) return { patient: null, records: [], guides: [] };
  const patient = findPatientById(record.patientId) ?? null;
  return {
    patient,
    records: patient ? getHistoryForPatient(patient.patientId) : [],
    guides: loadGuides(),
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function MyGuidesClient({ token }: { token: string }) {
  const { patient, records, guides } = useClientValue(
    () => loadMyGuidesData(token),
    { patient: null, records: [], guides: [] } as MyGuidesData,
    [token],
  );

  if (!patient) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
        유효하지 않은 안내 링크입니다.
      </div>
    );
  }

  return (
    <div>
      <Link href={`/g/${token}`} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-slate-500">
        <ChevronLeftIcon className="h-4 w-4" /> 오늘의 안내
      </Link>
      <PatientHeader patientName={patient.name} />
      <p className="mb-3 text-lg font-bold text-slate-800">내가 받은 안내</p>

      {records.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-8 text-center text-sm text-slate-500">
          아직 받은 안내가 없습니다.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {records.map((record) =>
            record.contentIds.map((contentId) => {
              const guide = guides.find((g) => g.contentId === contentId);
              if (!guide) return null;
              return (
                <Link
                  key={`${record.recordId}-${contentId}`}
                  href={`/g/${record.token}/guides/${contentId}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3.5"
                >
                  <span>
                    <span className="block text-xs text-slate-400">{formatDate(record.sentAt)}</span>
                    <span className="block text-[15px] font-semibold text-slate-800">{guide.title}</span>
                  </span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-300" />
                </Link>
              );
            }),
          )}
        </div>
      )}
    </div>
  );
}
