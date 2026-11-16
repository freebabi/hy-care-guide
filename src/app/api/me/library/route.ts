import { NextResponse } from "next/server";
import { jsonOk, requireUser } from "@/lib/server/api";
import { getLibrary } from "@/lib/server/user-data";
import { isDurable } from "@/lib/server/store";

export const dynamic = "force-dynamic";

/** 내 보관함(즐겨찾기·최근 본 자료·자료 묶음). 로그인한 본인의 데이터만 돌려줍니다. */
export async function GET() {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;
  return jsonOk({ ...(await getLibrary(auth.uid)), durable: isDurable() });
}
