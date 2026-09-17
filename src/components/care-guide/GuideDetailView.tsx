import type { GuideCategory, GuideContent } from "@/lib/care-guide/types";
import { CategoryIcon, ClockIcon, PhoneIcon, PinIcon, WarningIcon } from "./icons";

/**
 * before/during/after 필드는 카테고리마다 의미가 달라 섹션 제목을
 * "검사·치료 전/당일/후"로 고정하면 입원·퇴원·기타 콘텐츠에서 어색해집니다.
 * 카테고리별로 자연스러운 라벨을 매핑합니다.
 */
const PHASE_LABELS: Record<GuideCategory, { before: string; during: string; after: string }> = {
  검사: { before: "검사 전", during: "검사 당일", after: "검사 후" },
  수술: { before: "수술 전", during: "수술 당일", after: "수술 후" },
  입원: { before: "입원 중 확인사항", during: "입원 중 안내", after: "입원 중 주의사항" },
  퇴원: { before: "퇴원 준비", during: "퇴원 당일", after: "퇴원 후 생활" },
  기타: { before: "안내", during: "안내", after: "참고사항" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <div className="mt-1.5 text-sm leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

export default function GuideDetailView({
  guide,
  relatedGuides = [],
  variant = "staff",
  onSelectRelated,
}: {
  guide: GuideContent;
  relatedGuides?: GuideContent[];
  variant?: "staff" | "patient";
  onSelectRelated?: (contentId: string) => void;
}) {
  const phaseLabels = PHASE_LABELS[guide.category];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-bold text-brand-blue">
            <CategoryIcon category={guide.category} className="h-3.5 w-3.5" />
            {guide.category} · {guide.subcategory}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            <ClockIcon className="h-3.5 w-3.5" /> 예상 읽기 시간 {guide.estimatedReadMinutes}분
          </span>
        </div>
        <h2 className="mt-2 text-xl font-extrabold leading-snug text-slate-900">{guide.title}</h2>
      </div>

      <Section title="한눈에 보는 안내">
        <p>{guide.summary}</p>
      </Section>

      {guide.importantNotice && (
        <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <p className="text-xs font-bold text-amber-800">꼭 확인해주세요</p>
            <p className="mt-1 text-sm leading-relaxed text-amber-900">{guide.importantNotice}</p>
          </div>
        </div>
      )}

      {guide.before && <Section title={phaseLabels.before}>{guide.before}</Section>}
      {guide.during && <Section title={phaseLabels.during}>{guide.during}</Section>}
      {guide.after && <Section title={phaseLabels.after}>{guide.after}</Section>}

      {guide.faq && guide.faq.length > 0 && (
        <Section title="자주 묻는 질문">
          <ul className="flex flex-col gap-2.5">
            {guide.faq.map((item) => (
              <li key={item.question} className="rounded-lg bg-slate-50 px-3.5 py-2.5">
                <p className="flex gap-1.5 text-sm font-semibold text-slate-800">
                  <span className="text-brand-teal">Q.</span> {item.question}
                </p>
                <p className="mt-1 flex gap-1.5 text-sm text-slate-600">
                  <span className="text-slate-400">A.</span> {item.answer}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(guide.location || guide.contact) && (
        <div className="flex flex-col gap-1.5 rounded-xl bg-slate-50 px-4 py-3.5 text-sm text-slate-600">
          {guide.location && (
            <p className="flex items-center gap-2">
              <PinIcon className="h-4 w-4 shrink-0 text-slate-400" /> {guide.location}
            </p>
          )}
          {guide.contact && (
            <p className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4 shrink-0 text-slate-400" /> {guide.contact}
            </p>
          )}
        </div>
      )}

      {relatedGuides.length > 0 && (
        <Section title="관련 안내">
          <ul className="flex flex-col gap-1.5">
            {relatedGuides.map((related) => (
              <li key={related.contentId}>
                {onSelectRelated ? (
                  <button
                    type="button"
                    onClick={() => onSelectRelated(related.contentId)}
                    className="text-left text-sm font-semibold text-brand-blue underline-offset-2 hover:underline"
                  >
                    {related.title}
                  </button>
                ) : (
                  <span className="text-sm font-semibold text-slate-700">{related.title}</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {variant === "staff" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
          <span>버전 {guide.version} · 최종 수정 {guide.lastUpdated}</span>
          {guide.needsClinicalReview && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-bold text-amber-700">
              <WarningIcon className="h-3.5 w-3.5" /> 병원 공식 검토 필요(프로토타입 예시 문구)
            </span>
          )}
        </div>
      ) : (
        <p className="border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-400">
          본 안내는 프로토타입 예시이며, 실제 진료 지침과 다를 수 있습니다. 궁금한 점은 위 문의처로
          연락하시거나 담당 의료진에게 확인해주세요.
        </p>
      )}
    </div>
  );
}
