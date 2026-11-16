"use client";

import { ArrowLeft, FileDown, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import GuideDetailView from "@/components/care-guide/GuideDetailView";
import Modal from "@/components/care-guide/modals/Modal";
import { todayKst } from "@/lib/care-guide/format";
import { postActivity, useLibrary } from "@/lib/care-guide/me-api";
import { canDeliverToPatient, isOfficial } from "@/lib/care-guide/review";
import { useRole } from "@/lib/care-guide/role";
import type { GuideContent } from "@/lib/care-guide/types";
import { useGuides } from "@/lib/care-guide/use-guides";

/**
 * 인쇄용 화면.
 * - ‘프린터로 인쇄’와 ‘PDF 파일로 저장’은 둘 다 브라우저의 인쇄 창을 사용합니다. 차이는 인쇄 창에서 고르는 ‘대상’뿐이며,
 *   화면이 자동으로 PDF 파일을 만들어 내려받지는 않습니다(그래서 두 버튼에 각각 안내를 붙였습니다).
 * - 안내 내용은 환자용 상세 화면과 같은 컴포넌트를 그대로 써서 원본 내용을 바꾸지 않습니다.
 */
type Paper = "a4-portrait" | "a4-landscape" | "a3-portrait" | "a3-landscape";
type Margin = "normal" | "narrow";

// zoom: A3는 A4의 약 1.41배 크기라, 글자·이미지도 같은 비율로 키워 A4와 같은 읽기 편한 크기로 인쇄합니다.
const PAPERS: Array<{ id: Paper; label: string; css: string; maxMm: number | null; zoom: number }> = [
  { id: "a4-portrait", label: "A4 세로", css: "A4 portrait", maxMm: null, zoom: 1 },
  { id: "a4-landscape", label: "A4 가로", css: "A4 landscape", maxMm: 235, zoom: 1 },
  { id: "a3-portrait", label: "A3 세로", css: "A3 portrait", maxMm: null, zoom: 1.414 },
  { id: "a3-landscape", label: "A3 가로", css: "A3 landscape", maxMm: 270, zoom: 1.414 },
];
const MARGINS: Record<Margin, { label: string; css: string }> = {
  normal: { label: "보통 (위아래 14mm · 좌우 12mm)", css: "14mm 12mm" },
  narrow: { label: "좁게 (8mm)", css: "8mm" },
};
const PREF_KEY = "hycg.print.prefs.v1";

/** 지연 로딩 이미지는 화면 아래쪽에 있으면 인쇄 때 비어 나올 수 있어, 인쇄 전에 모두 불러오고 기다립니다. */
async function loadAllImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll("img"));
  imgs.forEach((img) => {
    img.loading = "eager";
  });
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          window.setTimeout(done, 10_000);
        }),
    ),
  );
}

const field =
  "min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-sm focus-visible:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30";

export default function PrintComposePage() {
  const { guides } = useGuides();
  const role = useRole();
  const { data: library, status } = useLibrary();
  const [params, setParams] = useState<{ ids: string[]; title: string; bundle: string | null } | null>(null);
  const [paper, setPaper] = useState<Paper>("a4-portrait");
  const [margin, setMargin] = useState<Margin>("normal");
  const [pageBreaks, setPageBreaks] = useState(true);
  const [color, setColor] = useState(true);
  const [pdfHelp, setPdfHelp] = useState(false);
  const [preparing, setPreparing] = useState(false);
  // 저장된 설정을 다 읽은 뒤에만 저장을 시작합니다(읽기 전에 기본값으로 덮어쓰지 않도록).
  const [prefsReady, setPrefsReady] = useState(false);
  const recorded = useRef(false);
  const sheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParams({
      ids: (p.get("ids") ?? "").split(",").filter(Boolean),
      title: p.get("title") ?? "",
      bundle: p.get("bundle"),
    });
    try {
      const saved = JSON.parse(window.localStorage.getItem(PREF_KEY) ?? "null") as { paper?: Paper; margin?: Margin; pageBreaks?: boolean; color?: boolean } | null;
      if (saved) {
        if (PAPERS.some((x) => x.id === saved.paper)) setPaper(saved.paper as Paper);
        if (saved.margin && saved.margin in MARGINS) setMargin(saved.margin);
        if (typeof saved.pageBreaks === "boolean") setPageBreaks(saved.pageBreaks);
        if (typeof saved.color === "boolean") setColor(saved.color);
      }
    } catch {
      // 저장된 설정을 읽지 못해도 기본값으로 동작합니다.
    }
    setPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!prefsReady) return;
    try {
      window.localStorage.setItem(PREF_KEY, JSON.stringify({ paper, margin, pageBreaks, color }));
    } catch {
      // 설정 저장 실패는 무시합니다.
    }
  }, [prefsReady, paper, margin, pageBreaks, color]);

  const bundle = params?.bundle ? library.bundles.find((b) => b.id === params.bundle) : undefined;
  const waitingForBundle = Boolean(params?.bundle) && status !== "ready";
  const ids = bundle ? bundle.contentIds : (params?.ids ?? []);
  const title = bundle ? bundle.title : params?.title.trim() || "안내자료 모음";
  const description = bundle?.description ?? "";

  const byId = useMemo(() => new Map(guides.map((g) => [g.contentId, g])), [guides]);
  const viewable = ids
    .map((id) => byId.get(id))
    .filter((g): g is GuideContent => Boolean(g) && (g!.status === "게시" || role === "ADMIN"));
  // 의료진 검토 대기 자료는 주소(ids)나 저장된 묶음에 들어 있어도 인쇄·PDF에 넣지 않습니다.
  const list = viewable.filter((g) => canDeliverToPatient(g));
  const waitingExcluded = viewable.length - list.length;
  const unofficial = list.filter((g) => !isOfficial(g));

  // 인쇄용 화면을 열면 ‘인쇄 준비’ 이력으로 한 번 남깁니다(실제 인쇄 여부는 브라우저가 알려 주지 않습니다).
  useEffect(() => {
    if (recorded.current || list.length === 0 || waitingForBundle) return;
    recorded.current = true;
    void postActivity({
      type: "print",
      title,
      bundleId: bundle?.id,
      related: list.map((g) => ({ contentId: g.contentId, title: g.title })),
    });
  }, [list, title, bundle, waitingForBundle]);

  async function runPrint() {
    setPdfHelp(false);
    setPreparing(true);
    if (sheetRef.current) await loadAllImages(sheetRef.current);
    setPreparing(false);
    // 상태 반영이 끝난 뒤 인쇄 창을 엽니다.
    window.setTimeout(() => window.print(), 50);
  }

  const back = bundle ? `/compose?bundle=${encodeURIComponent(bundle.id)}` : "/compose";
  const spec = PAPERS.find((p) => p.id === paper) ?? PAPERS[0];
  // 선택한 용지·여백을 인쇄 설정(@page)으로 지정합니다. 가로·A3 용지는 글줄이 너무 길어지지 않도록 본문 폭을 제한합니다.
  const pageCss = `@page { size: ${spec.css}; margin: ${MARGINS[margin].css}; }
@media print { .print-sheet { ${spec.zoom !== 1 ? `zoom: ${spec.zoom};` : ""} ${spec.maxMm ? `max-width: ${spec.maxMm}mm; margin-left: auto; margin-right: auto;` : ""} } ${
    color ? ".print-color, .print-color * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }" : ""
  } ${pageBreaks ? "" : ".print-break { break-before: auto !important; }"} }`;

  return (
    <div className="flex flex-col gap-6">
      <style>{pageCss}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={back}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          구성 화면으로
        </Link>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 print:hidden sm:p-5" aria-label="인쇄 설정">
        <h2 className="text-sm font-bold text-slate-900">인쇄 설정</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            용지
            <select value={paper} onChange={(e) => setPaper(e.target.value as Paper)} className={field}>
              {PAPERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700">
            여백
            <select value={margin} onChange={(e) => setMargin(e.target.value as Margin)} className={field}>
              {(Object.keys(MARGINS) as Margin[]).map((m) => (
                <option key={m} value={m}>
                  {MARGINS[m].label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={pageBreaks} onChange={(e) => setPageBreaks(e.target.checked)} className="h-4 w-4" />
            자료마다 새 쪽에서 시작
          </label>
          <label className="flex min-h-[44px] items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={color} onChange={(e) => setColor(e.target.checked)} className="h-4 w-4" />
            색상·배경 인쇄
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
            <button
              type="button"
              onClick={runPrint}
              disabled={list.length === 0 || preparing}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark disabled:opacity-50"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              {preparing ? "이미지 준비 중…" : "프린터로 인쇄"}
            </button>
            <p className="text-xs leading-relaxed text-slate-600">종이로 출력합니다. 인쇄 창에서 사용할 프린터를 선택하세요.</p>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3">
            <button
              type="button"
              onClick={() => setPdfHelp(true)}
              disabled={list.length === 0 || preparing}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-brand-blue/50 bg-white px-5 text-sm font-bold text-brand-blue-dark hover:bg-blue-soft disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" aria-hidden="true" />
              PDF 파일로 저장
            </button>
            <p className="text-xs leading-relaxed text-slate-600">파일로 보관합니다. 인쇄 창에서 ‘PDF로 저장’을 선택해야 합니다(아래 안내).</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          선택한 용지 크기가 인쇄 창에 자동으로 적용됩니다. 인쇄 창에서 ‘배율’은 100%(기본값), ‘머리글·바닥글’은 끄는 것을 권장합니다. 이 화면에는 환자 정보가 포함되지 않습니다.
        </p>
      </section>

      {!waitingForBundle && params && waitingExcluded > 0 && (
        <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700 print:hidden">
          의료진 검토 대기 자료 {waitingExcluded}건은 인쇄·PDF에서 제외했습니다. 검토 완료 후 사용할 수 있습니다.
        </p>
      )}

      {waitingForBundle || !params ? (
        <p className="py-10 text-center text-sm text-slate-600 print:hidden">불러오는 중입니다…</p>
      ) : list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-700 print:hidden">
          인쇄할 안내자료가 없습니다. ‘안내자료 구성’에서 자료를 먼저 선택해 주세요.
        </p>
      ) : (
        <article
          ref={sheetRef}
          className="print-sheet print-color rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 print:rounded-none print:border-0 print:p-0"
        >
          <header className="border-b border-slate-200 pb-5">
            <p className="text-xs font-semibold tracking-wide text-slate-500">한양대학교병원 환자 안내 · HY CARE GUIDE</p>
            <h1 className="mt-1 text-2xl font-extrabold leading-snug text-slate-900">{title}</h1>
            {description && <p className="mt-2 text-sm leading-relaxed text-slate-700">{description}</p>}
            <p className="mt-2 text-xs text-slate-500">
              {todayKst()} · 안내자료 {list.length}건
            </p>
            {unofficial.length > 0 && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold leading-relaxed text-amber-950">
                공식 검토·승인이 끝나지 않은 자료가 {unofficial.length}건 포함되어 있습니다. 환자에게 전달하기 전에 담당 부서의 확인을 받아 주세요.
              </p>
            )}
            <ol className="mt-4 list-decimal pl-5 text-sm leading-relaxed text-slate-800">
              {list.map((g) => (
                <li key={g.contentId}>{g.title}</li>
              ))}
            </ol>
          </header>

          {list.map((g, i) => (
            <section key={g.contentId} className="print-guide print-break pt-8" aria-label={g.title}>
              <p className="mb-2 text-xs font-bold text-slate-500">
                {i + 1} / {list.length}
              </p>
              <GuideDetailView guide={g} relatedGuides={[]} variant="patient" headingLevel="h2" />
            </section>
          ))}
        </article>
      )}

      {pdfHelp && (
        <Modal onClose={() => setPdfHelp(false)} ariaLabel="PDF 파일로 저장하는 방법" maxWidthClassName="sm:max-w-md">
          {(requestClose) => (
            <div className="p-6">
              <h2 className="text-lg font-extrabold text-slate-900">PDF 파일로 저장하는 방법</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                이 화면은 PDF 파일을 자동으로 만들어 내려받지 않습니다. 브라우저의 인쇄 창을 열어 아래 순서로 저장해 주세요.
              </p>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-800">
                <li>아래 ‘인쇄 창 열기’를 누릅니다.</li>
                <li>
                  인쇄 창의 <b>대상(프린터)</b>에서 <b>‘PDF로 저장’</b>(또는 ‘Microsoft Print to PDF’)을 고릅니다.
                </li>
                <li>용지 크기가 ‘{spec.label}’로 되어 있는지 확인하고 ‘저장’을 누릅니다.</li>
              </ol>
              <div className="mt-5 flex justify-end gap-2">
                <button type="button" onClick={requestClose} className="min-h-[44px] rounded-full border border-slate-200 px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  닫기
                </button>
                <button type="button" onClick={runPrint} className="min-h-[44px] rounded-full bg-brand-blue px-5 text-sm font-bold text-white hover:bg-brand-blue-dark">
                  인쇄 창 열기
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
