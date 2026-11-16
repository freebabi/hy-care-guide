import { NextResponse } from "next/server";
import { cleanContentId, cleanText, jsonError, jsonOk, readBody, requireUser, sameOrigin, storeErrorResponse } from "@/lib/server/api";
import { findPendingDeliveries } from "@/lib/server/guides";
import { addActivity, listActivity } from "@/lib/server/user-data";
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/care-guide/me-types";
import { isDurable } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** 내 활용 이력 조회. 일반 직원·관리자 모두 ‘본인의 이력’만 받습니다. */
export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const p = new URL(request.url).searchParams;
  const type = p.get("type");
  const items = await listActivity(auth.uid, {
    type: ACTIVITY_TYPES.includes(type as ActivityType) ? (type as ActivityType) : undefined,
    from: p.get("from") ?? undefined,
    to: p.get("to") ?? undefined,
    q: p.get("q") ?? undefined,
    order: p.get("order") === "asc" ? "asc" : "desc",
  });
  return jsonOk({ items, durable: isDurable() });
}

/** 클라이언트가 직접 알려야 하는 이력만 받습니다. (열람·구성은 서버가 자동으로 기록하므로 여기서 받지 않습니다.) */
const CLIENT_TYPES = ["download", "print", "provided", "message-prep"] as const;

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request);
  const type = body?.type as (typeof CLIENT_TYPES)[number] | undefined;
  if (!body || !type || !CLIENT_TYPES.includes(type)) return jsonError("기록할 수 없는 이력 유형입니다.", 400);
  const title = cleanText(body.title, 200);
  if (!title) return jsonError("제목이 필요합니다.", 400);

  const related = (Array.isArray(body.related) ? body.related : [])
    .map((r) => {
      const o = r as { contentId?: unknown; title?: unknown };
      const id = cleanContentId(o?.contentId);
      const t = cleanText(o?.title, 200);
      return id && t ? { contentId: id, title: t } : null;
    })
    .filter((v): v is { contentId: string; title: string } => Boolean(v))
    .slice(0, 60);

  // 인쇄·내려받기·환자 안내·제공 기록은 "환자에게 건네는" 동작이므로, 의료진 검토 대기 중인 콘텐츠는 서버가 막습니다(화면 버튼과 별개).
  try {
    const pending = await findPendingDeliveries([cleanContentId(body.contentId) ?? "", ...related.map((r) => r.contentId)].filter(Boolean));
    if (pending.length > 0) {
      return jsonError(`의료진 검토 대기 중인 안내는 환자 안내·인쇄·제공 기록으로 남길 수 없습니다: ${pending.slice(0, 3).join(", ")}`, 409);
    }
  } catch (e) {
    return storeErrorResponse(e);
  }

  const entry = await addActivity(auth.uid, auth.user.name, {
    type,
    title,
    contentId: cleanContentId(body.contentId) ?? undefined,
    bundleId: typeof body.bundleId === "string" ? cleanText(body.bundleId, 60) || undefined : undefined,
    related: related.length ? related : undefined,
  });
  return jsonOk({ entry }, 201);
}
