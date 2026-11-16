import { NextResponse } from "next/server";
import {
  cleanContentId,
  cleanText,
  jsonError,
  jsonOk,
  looksLikePersonalData,
  readBody,
  requireUser,
  sameOrigin,
  storeErrorResponse,
} from "@/lib/server/api";
import { findPendingDeliveries } from "@/lib/server/guides";
import { MAX_BUNDLE_ITEMS, deleteBundle, saveBundle } from "@/lib/server/user-data";

export const dynamic = "force-dynamic";

/** 자료 묶음 저장(id가 있으면 본인의 묶음 수정, 없으면 새로 만들기). 항상 본인만 볼 수 있는 개인 묶음입니다. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const body = await readBody(request);
  if (!body) return jsonError("요청 형식이 올바르지 않습니다.", 400);

  const title = cleanText(body.title, 60);
  const description = cleanText(body.description, 300);
  if (title.length < 2) return jsonError("자료 묶음 제목을 2자 이상 입력해 주세요.", 400);
  if (looksLikePersonalData(`${title} ${description}`)) {
    return jsonError("제목·설명에 주민등록번호나 전화번호처럼 보이는 숫자가 있습니다. 환자 정보는 입력하지 마세요.", 400);
  }

  const rawIds = Array.isArray(body.contentIds) ? body.contentIds : [];
  const contentIds = Array.from(new Set(rawIds.map(cleanContentId).filter((v): v is string => Boolean(v))));
  if (contentIds.length === 0) return jsonError("안내자료를 1건 이상 선택해 주세요.", 400);
  if (contentIds.length > MAX_BUNDLE_ITEMS) return jsonError(`한 묶음에는 최대 ${MAX_BUNDLE_ITEMS}건까지 담을 수 있습니다.`, 400);

  // 자료 묶음은 환자에게 건넬 자료를 모으는 것이므로, 의료진 검토 대기 중인 안내는 담을 수 없습니다.
  try {
    const pending = await findPendingDeliveries(contentIds);
    if (pending.length > 0) return jsonError(`의료진 검토 대기 중인 안내는 자료 묶음에 담을 수 없습니다: ${pending.slice(0, 3).join(", ")}`, 409);
  } catch (e) {
    return storeErrorResponse(e);
  }

  const rawRelated = Array.isArray(body.related) ? body.related : [];
  const related = rawRelated
    .map((r) => {
      const o = r as { contentId?: unknown; title?: unknown };
      const id = cleanContentId(o?.contentId);
      const t = cleanText(o?.title, 200);
      return id && t && contentIds.includes(id) ? { contentId: id, title: t } : null;
    })
    .filter((v): v is { contentId: string; title: string } => Boolean(v))
    .slice(0, MAX_BUNDLE_ITEMS);

  const id = typeof body.id === "string" ? cleanText(body.id, 60) : undefined;
  try {
    const bundle = await saveBundle(auth.uid, auth.user.name, { id, title, description, contentIds, related });
    if (!bundle) return jsonError("수정할 자료 묶음을 찾을 수 없습니다.", 404);
    return jsonOk({ bundle });
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "저장하지 못했습니다.", 400);
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return jsonError("허용되지 않은 요청입니다.", 403);
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  const id = cleanText(new URL(request.url).searchParams.get("id"), 60);
  if (!id) return jsonError("삭제할 자료 묶음이 지정되지 않았습니다.", 400);
  const removed = await deleteBundle(auth.uid, id);
  return removed ? jsonOk({ ok: true }) : jsonError("자료 묶음을 찾을 수 없습니다.", 404);
}
