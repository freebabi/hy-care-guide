import type { Patient } from "./types";

/**
 * 프로토타입용 가상 환자 데이터입니다. 실제 환자 정보가 아닙니다.
 * 실 서비스 전환 시 EMR 연계를 통해 조회되어야 하며, 프론트엔드에
 * 직접 저장/노출되어서는 안 됩니다.
 */
export const PATIENTS: Patient[] = [
  {
    patientId: "p01",
    name: "김OO",
    registrationNumber: "00219311",
    department: "영상의학과",
    stage: "ct-scheduled",
    scheduledAt: "2026-09-18T14:00:00+09:00",
  },
  {
    patientId: "p02",
    name: "이OO",
    registrationNumber: "00304122",
    department: "소화기내과",
    stage: "gastroscopy-scheduled",
    scheduledAt: "2026-09-17T09:30:00+09:00",
  },
  {
    patientId: "p03",
    name: "박OO",
    registrationNumber: "00118845",
    department: "외과",
    stage: "surgery-scheduled",
    scheduledAt: "2026-09-19T08:00:00+09:00",
  },
  {
    patientId: "p04",
    name: "최OO",
    registrationNumber: "00287631",
    department: "내과",
    stage: "discharge-scheduled",
    scheduledAt: "2026-09-16T11:00:00+09:00",
  },
  {
    patientId: "p05",
    name: "정OO",
    registrationNumber: "00356290",
    department: "소화기내과",
    stage: "colonoscopy-scheduled",
    scheduledAt: "2026-09-20T10:00:00+09:00",
  },
  {
    patientId: "p06",
    name: "한OO",
    registrationNumber: "00147782",
    department: "정형외과",
    stage: "surgery-scheduled",
    scheduledAt: "2026-09-22T08:30:00+09:00",
  },
  {
    patientId: "p07",
    name: "윤OO",
    registrationNumber: "00399104",
    department: "영상의학과",
    stage: "mri-scheduled",
    scheduledAt: "2026-09-17T16:20:00+09:00",
  },
  {
    patientId: "p08",
    name: "서OO",
    registrationNumber: "00265517",
    department: "순환기내과",
    stage: "admitted",
  },
];

export function findPatientById(patientId: string): Patient | undefined {
  return PATIENTS.find((p) => p.patientId === patientId);
}
