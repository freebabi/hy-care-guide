import "server-only";
import { readFileBuffer, sha256Hex, writeFileAtomic } from "./store";

/**
 * 첨부 파일(안내문 원본·개선 요청 첨부) 저장.
 * 브라우저가 보낸 data URL을 검사해 서버의 데이터 폴더에 파일로 저장하고, 목록 응답에는 파일 내용 대신 내려받기 주소만 넣습니다.
 * (목록이 무거워지지 않게 하고, 내려받기는 로그인·권한 확인을 거치게 하기 위함입니다.)
 */
export const ATTACHMENT_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "application/pdf": "pdf",
};
export const MAX_ATTACHMENT_BYTES = 1024 * 1024;

export class AttachmentError extends Error {}

const FILE_ID = /^[0-9a-f]{16}$/;
const OWNER_ID = /^[A-Za-z0-9_-]{1,40}$/;

export function isFileId(v: string): boolean {
  return FILE_ID.test(v);
}

/** 파일의 첫 바이트가 선언한 형식과 맞는지(확장자·MIME만 바꾼 위장 파일 차단) */
function magicMatches(type: string, bytes: Buffer): boolean {
  if (type === "image/png") return bytes.length > 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (type === "image/jpeg") return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "application/pdf") return bytes.length > 5 && bytes.subarray(0, 5).toString("latin1") === "%PDF-";
  return false;
}

export function parseDataUrl(dataUrl: string): { type: string; bytes: Buffer } {
  const m = /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(dataUrl);
  if (!m) throw new AttachmentError("첨부 파일 형식이 올바르지 않습니다.");
  const type = m[1];
  if (!ATTACHMENT_TYPES[type]) throw new AttachmentError("PNG, JPG, PDF 파일만 첨부할 수 있습니다.");
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length === 0) throw new AttachmentError("빈 파일은 첨부할 수 없습니다.");
  if (bytes.length > MAX_ATTACHMENT_BYTES) throw new AttachmentError("파일은 1MB 이하만 첨부할 수 있습니다.");
  if (!magicMatches(type, bytes)) throw new AttachmentError("파일 내용이 선언한 형식과 다릅니다.");
  return { type, bytes };
}

function cleanFileName(name: unknown): string {
  const raw = typeof name === "string" ? name : "";
  // 경로 구분자·제어문자 제거(다운로드 이름으로만 쓰이며 저장 경로에는 쓰이지 않습니다).
  return raw.normalize("NFC").replace(/[\\/\0-\x1f"<>|:*?]/g, "_").trim().slice(0, 120) || "첨부파일";
}

function relPath(scope: "guides" | "requests", ownerId: string, fileId: string, type: string): string {
  if (!OWNER_ID.test(ownerId) || !FILE_ID.test(fileId)) throw new AttachmentError("잘못된 파일 경로입니다.");
  return `cms/files/${scope}/${ownerId}/${fileId}.${ATTACHMENT_TYPES[type]}`;
}

export interface StoredAttachment {
  fileId: string;
  name: string;
  type: string;
  size: number;
}

/** data URL을 검사해 저장합니다. 같은 내용이면 같은 파일 ID가 되어 중복 저장하지 않습니다. */
export async function saveAttachment(scope: "guides" | "requests", ownerId: string, name: unknown, dataUrl: string): Promise<StoredAttachment> {
  const { type, bytes } = parseDataUrl(dataUrl);
  const fileId = sha256Hex(bytes).slice(0, 16);
  await writeFileAtomic(relPath(scope, ownerId, fileId, type), bytes);
  return { fileId, name: cleanFileName(name), type, size: bytes.length };
}

/** 저장된 파일 읽기. 없으면 null. */
export async function readAttachmentFile(scope: "guides" | "requests", ownerId: string, fileId: string): Promise<{ type: string; bytes: Buffer } | null> {
  if (!OWNER_ID.test(ownerId) || !FILE_ID.test(fileId)) return null;
  for (const type of Object.keys(ATTACHMENT_TYPES)) {
    const bytes = await readFileBuffer(relPath(scope, ownerId, fileId, type));
    if (bytes) return { type, bytes };
  }
  return null;
}

export function guideFileUrl(contentId: string, fileId: string): string {
  return `/api/guides/${contentId}/files/${fileId}`;
}

export function requestFileUrl(requestId: string): string {
  return `/api/requests/${requestId}/attachment`;
}

/** `/api/guides/<id>/files/<fileId>` 형태면 파일 ID를 돌려줍니다(내가 만든 주소만 인정). */
export function parseGuideFileUrl(contentId: string, url: string): string | null {
  const prefix = `/api/guides/${contentId}/files/`;
  if (!url.startsWith(prefix)) return null;
  const id = url.slice(prefix.length);
  return FILE_ID.test(id) ? id : null;
}

/** 다운로드 응답 헤더: 내용 추측 금지, 문서는 내려받기로, 이미지는 이 화면 안에서만 표시 */
export function fileResponse(file: { type: string; bytes: Buffer }, name: string, inlineAllowed: boolean): Response {
  const asciiName = name.replace(/[^\x20-\x7e]/g, "_");
  const disposition = inlineAllowed && file.type.startsWith("image/") ? "inline" : "attachment";
  return new Response(new Uint8Array(file.bytes), {
    status: 200,
    headers: {
      "Content-Type": file.type,
      "Content-Length": String(file.bytes.length),
      "Content-Disposition": `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "private, no-store",
    },
  });
}
