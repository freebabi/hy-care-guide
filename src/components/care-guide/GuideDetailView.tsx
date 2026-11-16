import { useRef } from "react";
import { classificationReviewReason } from "@/lib/care-guide/classification";
import {
  REVIEW_STATUS_LABEL,
  SOURCE_KIND_LABEL,
  MEDICAL_REVIEW_PENDING_NOTE,
  isMedicalReviewPending,
  isOfficial,
  reviewBadgeClass,
  reviewStatusOf,
} from "@/lib/care-guide/review";
import { guideJourneyIds, guideTopicIds } from "@/lib/care-guide/search";
import DetailSections from "./DetailSections";
import MedicalReviewChip from "./MedicalReviewChip";
import GuideFigure from "./GuideFigure";
import { IMAGE_APPROVAL_LABEL, imagesOfContent } from "@/lib/care-guide/image-assets";
import { fileHref } from "@/lib/care-guide/file-url";
import { journeyLabel, topicLabel } from "@/lib/care-guide/taxonomy";
import type { GuideCategory, GuideContent } from "@/lib/care-guide/types";
import { CategoryIcon, ClockIcon, PhoneIcon, PinIcon, WarningIcon } from "./icons";

/**
 * before/during/after 필드는 카테고리마다 의미가 달라 섹션 제목을
 * "검사·치료 전/당일/후"로 고정하면 입원·퇴원·기타 콘텐츠에서 어색해집니다.
 * 카테고리별로 자연스러운 라벨을 매핑합니다.
 */
export const PHASE_LABELS: Record<GuideCategory, { before: string; during: string; after: string }> = {
  검사: { before: "검사 전", during: "검사 당일", after: "검사 후" },
  수술: { before: "수술 전", during: "수술 당일", after: "수술 후" },
  입원: { before: "입원 중 확인사항", during: "입원 중 안내", after: "입원 중 주의사항" },
  퇴원: { before: "퇴원 준비", during: "퇴원 당일", after: "퇴원 후 생활" },
  기타: { before: "안내", during: "안내", after: "참고사항" },
};

/** "영상의학과 02-000-1234" 같은 문의 문구에서 전화번호만 뽑아 tel: 링크를 만듭니다. */
function extractPhoneNumber(text: string): string | null {
  const match = text.match(/(0\d{1,2}-\d{3,4}-\d{4})/);
  return match ? match[0] : null;
}

const AUDIENCE_LABEL = { patient: "환자", guardian: "보호자", both: "환자·보호자" } as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** 긴 안내를 위한 목차. 기본은 접어 두어 화면이 길어지지 않게 하고, 항목을 누르면 해당 위치로 이동한 뒤 다시 접힙니다. */
function TableOfContents({
  items,
  variant,
}: {
  items: Array<{ id: string; title: string }>;
  variant: "staff" | "patient";
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={ref} className="group rounded-xl border border-slate-200 bg-slate-50">
      <summary
        className={`flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 px-4 font-bold text-slate-800 ${
          variant === "patient" ? "text-sm" : "text-xs"
        }`}
      >
        <span>목차 · 눌러서 바로 이동 ({items.length})</span>
        <span aria-hidden="true" className="text-slate-500 transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <nav aria-label="이 안내의 목차" className="px-4 pb-3">
        <ul className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (ref.current) ref.current.open = false;
                  scrollToId(item.id);
                }}
                className={`rounded-full border border-slate-200 bg-white px-3 font-semibold text-slate-700 transition-colors hover:border-brand-blue/40 hover:bg-blue-soft/60 hover:text-brand-blue-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 ${
                  variant === "patient" ? "min-h-[40px] text-sm" : "min-h-[32px] text-xs"
                }`}
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}

function Section({
  title,
  bodyClassName,
  children,
  id,
  variant,
  tag: Tag = "h3",
}: {
  tag?: "h2" | "h3";
  title: string;
  bodyClassName: string;
  children: React.ReactNode;
  id?: string;
  variant: "staff" | "patient";
}) {
  return (
    <div>
      <Tag id={id} className={`scroll-mt-20 font-bold text-slate-900 ${variant === "patient" ? "text-lg" : "text-base"}`}>
        {title}
      </Tag>
      <div className={`mt-1.5 whitespace-pre-line leading-relaxed text-slate-700 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export default function GuideDetailView({
  guide,
  relatedGuides = [],
  variant = "staff",
  onSelectRelated,
  headingLevel = "h2",
}: {
  guide: GuideContent;
  relatedGuides?: GuideContent[];
  variant?: "staff" | "patient";
  onSelectRelated?: (contentId: string) => void;
  /** 전체 화면 페이지에서는 "h1", 팝업(모달) 안에서는 "h2" */
  headingLevel?: "h1" | "h2";
}) {
  const Title = headingLevel;
  const sectionTag = headingLevel === "h1" ? "h2" : "h3";
  const phaseLabels = { ...PHASE_LABELS[guide.category], ...guide.phaseLabelOverride };
  // 환자용 화면은 고령 환자도 읽기 편하도록 본문 텍스트를 16px(text-base) 이상으로 키웁니다.
  const bodyTextClass = variant === "patient" ? "text-base" : "text-sm";
  const phoneNumber = guide.contact ? extractPhoneNumber(guide.contact) : null;
  const detail = guide.detail;
  const official = isOfficial(guide);
  const status = reviewStatusOf(guide);
  const notice = detail ? detail.notice : guide.importantNotice;
  const faq = detail ? detail.faq : guide.faq;
  const tocItems = [
    ...(detail ? detail.sections.map((s) => ({ id: `detail-${s.id}`, title: s.title })) : []),
    ...(faq && faq.length > 0 ? [{ id: "sec-faq", title: "자주 묻는 질문" }] : []),
    ...(relatedGuides.length > 0 ? [{ id: "sec-related", title: "관련 안내" }] : []),
  ];
  /** 기존(전·당일·후) 형식 콘텐츠에서 지정한 위치 바로 뒤에 이미지를 넣습니다. */
  const imagesAt = (placement: "summary" | "notice" | "before" | "during" | "after") =>
    (guide.images ?? [])
      .filter((img) => img.placement === placement)
      .map((img) => <GuideFigure key={`${placement}-${img.assetId}`} assetId={img.assetId} variant={variant} />);
  const usedImages = imagesOfContent(guide);
  const hasLegacy = Boolean(guide.importantNotice || guide.before || guide.during || guide.after || guide.faq?.length);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-brand-blue">
            <CategoryIcon category={guide.category} className="h-3.5 w-3.5" />
            {guide.categoryLabelOverride ?? guide.category} · {guide.subcategory}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
            <ClockIcon className="h-3.5 w-3.5" /> 예상 읽기 시간 {guide.estimatedReadMinutes}분
          </span>
          {variant === "staff" && <MedicalReviewChip guide={guide} showCompleted />}
        </div>
        <Title className="mt-2 text-xl font-extrabold leading-snug text-slate-900">{guide.title}</Title>
      </div>

      {variant === "patient" && !official && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-relaxed text-amber-950">
          이 안내는 아직 병원의 공식 검토·승인이 끝나지 않은 자료입니다. 정확한 내용은 담당 의료진에게 확인해 주세요.
        </p>
      )}

      {variant === "staff" && isMedicalReviewPending(guide) && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-700">{MEDICAL_REVIEW_PENDING_NOTE}</p>
      )}

      {variant === "staff" && (
        <details className="group rounded-xl border border-slate-200 bg-white text-xs text-slate-700">
          <summary className="flex min-h-[48px] cursor-pointer list-none flex-wrap items-center gap-2 px-4 py-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-bold ring-1 ${reviewBadgeClass(status)}`}
            >
              검토 상태 · {REVIEW_STATUS_LABEL[status]}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 font-bold ring-1 ${
                official ? "bg-emerald-50 text-emerald-800 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-300"
              }`}
            >
              {official ? "승인 완료 · 공식 안내" : "미승인 · 공식 안내 아님"}
            </span>
            <span className="ml-auto font-semibold text-brand-blue-dark">
              담당 부서·출처·버전 이력 보기 <span aria-hidden="true">▾</span>
            </span>
          </summary>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3.5">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
            {[
              ["담당 부서", guide.ownerDepartment],
              ["내용 확인 담당 부서", guide.reviewerDepartment],
              ["콘텐츠 버전", `v${guide.version}`],
              ["최초 등록일", guide.createdAt],
              ["최종 수정일", guide.lastUpdated],
              ["최종 검토일", guide.lastReviewedAt],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-semibold text-slate-500">{label}</dt>
                <dd className="mt-0.5 font-semibold text-slate-900">{value ?? <span className="font-normal text-slate-500">미기록</span>}</dd>
              </div>
            ))}
          </dl>
          {(guide.sourceDocuments ?? []).length > 0 && (
            <details className="group rounded-lg bg-slate-50 px-3 py-2">
              <summary className="flex min-h-[32px] cursor-pointer items-center font-bold text-slate-700">
                출처 {(guide.sourceDocuments ?? []).length}건 보기
              </summary>
              <ul className="mt-2 flex flex-col gap-1.5">
                {(guide.sourceDocuments ?? []).map((src) => (
                  <li key={src.title} className="leading-relaxed">
                    <span
                      className={`mr-1.5 rounded px-1.5 py-0.5 font-semibold ${
                        src.kind === "legacy-seed" ? "bg-rose-50 text-rose-800" : "bg-blue-soft text-brand-blue-dark"
                      }`}
                    >
                      {src.kind ? SOURCE_KIND_LABEL[src.kind] : "출처"}
                    </span>
                    {src.url ? (
                      <a href={src.url} target="_blank" rel="noreferrer" className="font-semibold text-brand-blue underline underline-offset-2">
                        {src.title}
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-800">{src.title}</span>
                    )}
                    {src.note && <span className="text-slate-600"> — {src.note}</span>}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {(guide.sourceFiles ?? []).length > 0 && (
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="font-bold text-slate-700">첨부된 원본 파일</p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {(guide.sourceFiles ?? []).map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    <a href={fileHref(f.dataUrl)} download={f.name} className="font-semibold text-brand-blue underline underline-offset-2">
                      {f.name}
                    </a>
                    <span className="text-slate-600"> · {Math.max(1, Math.round(f.size / 1024))}KB</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <details className="rounded-lg bg-slate-50 px-3 py-2">
            <summary className="flex min-h-[32px] cursor-pointer items-center font-bold text-slate-700">버전 이력 ({(guide.versionHistory ?? []).length}건)</summary>
            {(guide.versionHistory ?? []).length === 0 ? (
              <p className="mt-2 leading-relaxed text-slate-600">
                기록된 이력이 없습니다. 현재 v{guide.version}이며, 이후 관리자가 수정·승인·폐기할 때마다 이곳에 쌓입니다.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-1.5">
                {(guide.versionHistory ?? []).map((h) => (
                  <li key={`${h.version}-${h.date}-${h.summary}`} className="leading-relaxed">
                    <span className="mr-1.5 font-bold text-slate-900">v{h.version}</span>
                    <span className="text-slate-600">{h.date}</span> · {h.summary}
                    {h.requestId && <span className="text-slate-600"> (개선 요청 {h.requestId} 반영)</span>}
                  </li>
                ))}
              </ul>
            )}
          </details>
          <div className="flex flex-col gap-2 rounded-lg bg-slate-50 px-3 py-2">
          {guideJourneyIds(guide).length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-700">여정</span>
              {guideJourneyIds(guide).map((id) => (
                <span key={id} className="rounded-full bg-white px-2.5 py-1 font-semibold text-brand-blue-dark ring-1 ring-brand-blue/20">
                  {journeyLabel(id)}
                </span>
              ))}
            </div>
          )}
          {guideTopicIds(guide).length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-700">주제</span>
              {guideTopicIds(guide).map((id) => (
                <span key={id} className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 ring-1 ring-slate-300">
                  {topicLabel(id)}
                </span>
              ))}
            </div>
          )}
          {classificationReviewReason(guide) && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 font-semibold leading-relaxed text-amber-900 ring-1 ring-amber-200">
              분류 검토 대상 · {classificationReviewReason(guide)}
            </p>
          )}
          </div>
          </div>
        </details>
      )}

      <p
        className={`flex flex-wrap items-center gap-x-2 gap-y-1.5 text-slate-700 ${variant === "patient" ? "text-sm" : "text-xs"}`}
      >
        <span className="font-bold text-slate-900">이런 분께 필요해요</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold">{AUDIENCE_LABEL[guide.audience ?? "both"]}</span>
        {guideJourneyIds(guide).map((id) => (
          <span key={id} className="rounded-full bg-blue-soft px-2.5 py-1 font-semibold text-brand-blue-dark">
            {journeyLabel(id)}
          </span>
        ))}
      </p>

      {tocItems.length >= 4 && <TableOfContents items={tocItems} variant={variant} />}

      <Section variant={variant} tag={sectionTag} title="한눈에 보는 안내" bodyClassName={bodyTextClass}>
        <p>{guide.summary}</p>
      </Section>
      {imagesAt("summary")}

      {notice && (
        <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-amber-800">꼭 확인해주세요</p>
            <p className={`mt-1 whitespace-pre-line leading-relaxed text-amber-900 ${bodyTextClass}`}>{notice}</p>
          </div>
        </div>
      )}
      {imagesAt("notice")}

      {detail ? (
        <DetailSections detail={detail} variant={variant} bodyClass={bodyTextClass} headingTag={sectionTag} />
      ) : (
        <>
          {guide.before && (
            <Section variant={variant} tag={sectionTag} title={phaseLabels.before} bodyClassName={bodyTextClass}>
              {guide.before}
            </Section>
          )}
          {imagesAt("before")}
          {guide.during && (
            <Section variant={variant} tag={sectionTag} title={phaseLabels.during} bodyClassName={bodyTextClass}>
              {guide.during}
            </Section>
          )}
          {imagesAt("during")}
          {guide.after && (
            <Section variant={variant} tag={sectionTag} title={phaseLabels.after} bodyClassName={bodyTextClass}>
              {guide.after}
            </Section>
          )}
          {imagesAt("after")}
        </>
      )}

      {faq && faq.length > 0 && (
        <Section variant={variant} tag={sectionTag} id="sec-faq" title="자주 묻는 질문" bodyClassName={bodyTextClass}>
          <ul className="flex flex-col gap-2.5">
            {faq.map((item) => (
              <li key={item.question} className="rounded-lg bg-slate-50 px-3.5 py-2.5">
                <p className="flex gap-1.5 font-semibold text-slate-800">
                  <span className="text-brand-teal">Q.</span> {item.question}
                </p>
                <p className="mt-1 flex gap-1.5 text-slate-600">
                  <span className="text-slate-500">A.</span> {item.answer}
                </p>
                {item.assetId && <GuideFigure assetId={item.assetId} variant={variant} />}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(guide.location || guide.contact) && (
        <div className={`flex flex-col gap-1.5 rounded-xl bg-slate-50 px-4 py-3.5 text-slate-600 ${bodyTextClass}`}>
          {guide.location && (
            <p className="flex items-center gap-2">
              <PinIcon className="h-4 w-4 shrink-0 text-slate-500" /> {guide.location}
            </p>
          )}
          {guide.contact && (
            <p className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 shrink-0 text-slate-500" />
              {phoneNumber ? (
                <a
                  href={`tel:${phoneNumber}`}
                  className="rounded underline underline-offset-2 transition-colors hover:text-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                >
                  {guide.contact}
                </a>
              ) : (
                guide.contact
              )}
            </p>
          )}
        </div>
      )}

      {relatedGuides.length > 0 && (
        <Section variant={variant} tag={sectionTag} id="sec-related" title="관련 안내" bodyClassName={bodyTextClass}>
          <ul className="flex flex-col gap-1.5">
            {relatedGuides.map((related) => (
              <li key={related.contentId}>
                {onSelectRelated ? (
                  <button
                    type="button"
                    onClick={() => onSelectRelated(related.contentId)}
                    className="inline-flex min-h-[36px] items-center rounded text-left font-semibold text-brand-blue underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40"
                  >
                    {related.title}
                  </button>
                ) : (
                  <span className="font-semibold text-slate-700">{related.title}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {usedImages.length > 0 && (
        <section aria-labelledby="source-check" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <h3 id="source-check" className={`font-bold text-slate-900 ${variant === "patient" ? "text-base" : "text-sm"}`}>
            원본 자료 확인
          </h3>
          {variant === "staff" ? (
            <>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">
                이 안내의 그림은 병원 서비스전략팀이 제작한 안내자료를 웹용으로 줄인 복사본입니다. 원본 파일은 별도 보관 폴더에 있으며
                이 화면에서는 원본 파일 내려받기를 제공하지 않습니다. 그림을 누르면 크게 볼 수 있습니다.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {usedImages.map((img) => (
                  <li key={img.id} className="rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">
                    <p className="font-bold text-slate-900">{img.description}</p>
                    <p>
                      원본 파일: <span className="font-semibold">{img.sourceFile}</span> · {img.sourceDate}
                    </p>
                    <p>
                      {IMAGE_APPROVAL_LABEL[img.approval]} · 최종 검토일 {img.lastReviewedAt} · 웹 파일 {img.id}.jpg
                    </p>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              이 안내의 그림은 한양대학교병원이 만든 안내자료입니다. 그림 속 내용과 다른 점이 있거나 궁금한 점은 담당 의료진에게 확인해
              주세요.
            </p>
          )}
        </section>
      )}

      {variant === "staff" && detail && hasLegacy && (
        <details className="rounded-xl border border-rose-200 bg-rose-50/50 px-4 py-3 text-xs">
          <summary className="cursor-pointer font-bold text-rose-900">
            기존 원문 보기 (출처 미확인 · 삭제하지 않고 보존)
          </summary>
          <div className="mt-3 flex flex-col gap-3 leading-relaxed text-slate-800">
            {guide.importantNotice && <p><b>꼭 확인해주세요</b> {guide.importantNotice}</p>}
            {guide.before && <p className="whitespace-pre-line"><b>{phaseLabels.before}</b>{"\n"}{guide.before}</p>}
            {guide.during && <p className="whitespace-pre-line"><b>{phaseLabels.during}</b>{"\n"}{guide.during}</p>}
            {guide.after && <p className="whitespace-pre-line"><b>{phaseLabels.after}</b>{"\n"}{guide.after}</p>}
            {(guide.faq ?? []).map((f) => (
              <p key={f.question} className="whitespace-pre-line"><b>Q. {f.question}</b>{"\n"}A. {f.answer}</p>
            ))}
          </div>
        </details>
      )}

      {variant === "patient" && (
        <p className={`border-t border-slate-100 pt-4 leading-relaxed text-slate-600 ${bodyTextClass}`}>
          환자분의 상태에 따라 안내가 다를 수 있습니다. 궁금한 점은 위 문의처로 연락하시거나
          담당 의료진에게 확인해 주세요.
        </p>
      )}
    </div>
  );
}
