import { NextResponse } from "next/server";
import { jsonOk, requireAdmin, storeErrorResponse } from "@/lib/server/api";
import { loadDoc } from "@/lib/server/guides";
import { loadRequestDoc } from "@/lib/server/requests";
import { getStorageStatus } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** 저장 상태(관리자 전용): 실제 저장 폴더 지정·쓰기 가능 여부와 저장된 항목 수. 폴더 경로 자체는 알려 주지 않습니다. */
export async function GET() {
  const auth = await requireAdmin();
  if (auth instanceof NextResponse) return auth;
  const status = getStorageStatus();
  try {
    const [g, r] = await Promise.all([loadDoc(), loadRequestDoc()]);
    return jsonOk({ status, counts: { guideChanges: g.records.length, requests: r.requests.length }, dataOk: true });
  } catch (e) {
    if (e instanceof Error && e.name === "StoreCorruptError") {
      return jsonOk({ status, counts: null, dataOk: false, dataMessage: "저장된 CMS 데이터를 읽을 수 없습니다. 파일은 그대로 보존되어 있습니다. 서버 관리자에게 문의하세요." });
    }
    return storeErrorResponse(e);
  }
}
