# Gap Analysis — hy-care-guide (Check Phase)

> **Summary**: PRD/Plan 대비 구현 갭 분석. Match Rate 82% (static-only), Critical 2 / Important 7 / Minor 6.
>
> **Created**: 2026-09-17
> **Status**: Review
> **Phase**: Check (PDCA)

---

## 1. 분석 개요

| 항목 | 내용 |
|---|---|
| 분석 대상 | HY CARE GUIDE (한양 케어가이드) Phase 1 |
| 기준 문서 | `docs/00-pm/hy-care-guide.prd.md`, `docs/01-plan/features/hy-care-guide.plan.md` |
| Design 문서 | 없음 — 별도 Design 문서가 존재하지 않아 PRD + Plan을 스펙 기준으로 사용 |
| 구현 경로 | `src/app/`, `src/components/care-guide/`, `src/lib/care-guide/` |
| 분석 방식 | 정적 분석(코드 전수 판독) + `npm run lint` / `npm run build` 실제 실행 |
| 미검증 영역 | 런타임/서버 실행 검증 없음 (뷰포트 실측, 50개 slug 실제 열람 테스트 미수행) |

---

## 2. Match Rate 산정식

static-only 기준(서버 실행 없음) 가중치를 적용합니다.

```
Overall = (Structural x 0.2) + (Functional x 0.4) + (Contract x 0.4)
        = (100 x 0.2) + (90 x 0.4) + (65 x 0.4)
        = 20.0 + 36.0 + 26.0
        = 82.0%
```

| 축 | 점수 | 가중치 | 기여도 | 산출 근거 |
|---|:---:|:---:|:---:|---|
| Structural | 100% | 0.2 | 20.0 | Plan 16개 항목 전부 대응 코드 존재 (16/16) |
| Functional | 90% | 0.4 | 36.0 | 항목별 깊이 점수 합 1445 / 16항목 = 90.3% |
| Contract | 65% | 0.4 | 26.0 | 내부 계약 8건 중 PASS 4 / Partial 2 / FAIL 2 = 5.0/8 = 62.5% -> 65% |
| **Overall** | **82%** | 1.00 | **82.0** | 90% 게이트 미달 |

### 2.1 Functional 항목별 깊이 점수

| # | Plan 작업 항목 | 구조 | 기능 | 근거 |
|:--:|---|:--:|:--:|---|
| 1 | 콘텐츠·발송이력 타입 정의 | O | 100 | `lib/care-guide/types.ts` — `GuideContent`(18 필드), `SendLogEntry`, `DeliveryChannel`, `Department`, `StageCode`, `FaqItem` |
| 2 | 콘텐츠 시드 50건 | O | 100 | `guides-data.ts` — 검사15/수술10/입원9/퇴원8/기타8 = 50 정확, slug 50개 전부 유니크, 전부 `status:"게시"` |
| 3 | localStorage 유틸 + SSR-safe 훅 | O | 100 | `storage.ts`(`typeof window` 가드 + try/catch), `use-client-value.ts`, `use-guides.ts` |
| 4 | origin 동적 해석 | O | 95 | `constants.ts:20` `window.location.origin`; `c/[slug]/page.tsx:10-16` Host 헤더 |
| 5 | SMS/카카오 문구 생성 | O | 90 | `notification-service.ts:40,60` + `eulOrReul` 조사 처리, 실제 발송 API 미호출 |
| 6 | 4개 메뉴 레이아웃/반응형 내비 | O | 100 | `(staff)/layout.tsx`, `StaffNav.tsx` — md 브레이크포인트 + 햄버거 |
| 7 | 직원 홈 검색/필터 | O | 100 | `(staff)/page.tsx:30-44` — 검색어(제목/요약/서브카테고리) + 카테고리 + 진료과 + 여정단계, 게시만, empty state |
| 8 | 미리보기 모달 | O | 100 | `GuidePreviewModal.tsx` + `GuideDetailView.tsx` — 단계별(카테고리별 라벨), FAQ, 위치/연락처, 관련안내 |
| 9 | 발송 어시스턴트 3채널 | O | 75 | QR 탭 버그는 해결(`recordSendPrep`가 `notifyCopied`/`handleDownloadQr`에만 존재). 단 클립보드 실패 경로가 여전히 기록 |
| 10 | 환자용 `/c/[slug]` | O | 85 | 게시검사 2곳, `tel:`(`GuideDetailView.tsx:128`), OG(`generateMetadata`), 환자 본문 `text-base` |
| 11 | CMS 화면 | O | 60 | `(staff)/cms/page.tsx` + `GuideFormModal.tsx` — 본문 섹션 편집 불가 |
| 12 | 발송 이력 화면 | O | 95 | `(staff)/history/page.tsx` — 4개 컬럼만, PII 없음, empty state, `overflow-x-auto` |
| 13 | 통계 대시보드 | O | 65 | 카테고리/채널 집계는 실데이터(`summarizeLog`), 상단 KPI는 하드코딩 목업 |
| 14 | PII 제로 점검 | O | 95 | 010-/주민번호 패턴 없음, 환자명 없음, 연락처는 `02-000-XXXX` 플레이스홀더 |
| 15 | 반응형 검증 | O | 85 | 테이블 `overflow-x-auto`+`min-w`, 환자 `max-w-md`, 반응형 그리드 — 정적 확인만 |
| 16 | lint/build 검증 | O | 100 | 둘 다 exit 0 |

### 2.2 Contract(내부 계약) 검증

HTTP API가 없는 프로젝트이므로 `PRD 스펙 <-> lib 계층 <-> 소비 컴포넌트` 3자 계약으로 평가했습니다.

| # | 계약 | 판정 | 비고 |
|:--:|---|:---:|---|
| 1 | `/c/[slug]` URL 계약 (slug만, PII 없음, 쿼리 파라미터 없음) | PASS | PRD 3.3 충족 |
| 2 | `SendLogEntry` 4필드 <-> 이력 테이블 4컬럼 | PASS | `completed` 상수화로 경미한 드리프트 |
| 3 | localStorage 키 `hycg.guides.v2` 쓰기/읽기 일관성 | PASS | CMS 쓰기, 홈/환자/대시보드 읽기 |
| 4 | localStorage 키 `hycg.sendlog.v2` 쓰기/읽기 일관성 | PASS | 서비스 쓰기, 이력/대시보드 읽기 |
| 5 | origin 계약 (클라 `window.location.origin` / 서버 Host / env 폴백) | PARTIAL | 루트 `metadataBase`는 빌드시점 폴백, `.env.example` 부재 |
| 6 | 게시 상태 계약 (서버 시드 기준 vs 클라 localStorage 기준) | PARTIAL | 두 계층이 불일치 가능 (I2 참조) |
| 7 | 복사 행동 <-> 이력 기록 계약 | FAIL | 클립보드 실패 시에도 완료 기록 (C1 참조) |
| 8 | `GuideContent` 스키마 <-> CMS 폼 필드 커버리지 | FAIL | 18필드 중 5필드 편집 불가 (I1 참조) |

PASS 4.0 + PARTIAL 1.0 + FAIL 0 = 5.0 / 8 = 62.5% -> **65%**

---

## 3. lint / build 결과

| 명령 | Exit Code | 결과 |
|---|:---:|---|
| `npm run lint` | 0 | 통과. 출력 없음(경고/오류 0건) |
| `npm run build` | 0 | 통과. 경고/오류 0건. Next.js 16.3.4 (Turbopack), TypeScript 검사 통과 |

생성된 라우트 (6개):

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /c/[slug]
├ ○ /cms
├ ○ /dashboard
└ ○ /history

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

`/c/[slug]`가 동적(ƒ)인 것은 `headers()`로 요청 Host를 읽기 때문으로, 의도된 동작입니다.
**PRD 성공기준 7번 및 Plan 16번 항목 충족.**

---

## 4. Critical 이슈 (2건)

### C1 — 클립보드 실패 시 허위 "완료" 이력 기록

- **위치**: `src/components/care-guide/staff/SendAssistantModal.tsx:22-30`
- **위반 요구사항**: PRD 4장 "정확한 발송 이력 — 발송 이력·통계는 사용자가 실제로 취한 행동(복사·다운로드)만 반영해야 한다" / PRD 6장 성공기준 5번 "허위/누락 기록 없음" / Plan 9번 "실제 클릭 시에만 이력 기록"

```ts
async function handleClick() {
  try {
    await navigator.clipboard.writeText(text);
    onCopied();
  } catch {
    onCopied();   // <-- 실패 경로에서도 동일하게 호출
  }
}
```

`onCopied()`는 "복사되었습니다" 토스트를 띄우는 동시에 `recordSendPrep(guide, channel)`을 호출해 `completed: true` 이력을 남깁니다(`notification-service.ts:86-97`). 비보안 origin(HTTP), 권한 거부, 구형 브라우저에서 `navigator.clipboard.writeText`가 reject되면 **실제로는 아무것도 복사되지 않았는데 사용자에게는 성공 토스트가 보이고 이력에는 완료 1건이 추가**됩니다. 이미 수정된 "QR 탭 열면 이력 남던 버그"와 동일한 결함 계열입니다.

- **수정 방향**: 성공 시에만 `onCopied()` 호출. 실패 시 실패 토스트 + 수동 선택/복사 폴백(textarea select) 제공.

### C2 — 통계 대시보드 상단에 조작된 지표 노출

- **위치**: `src/app/(staff)/dashboard/page.tsx:10-22` 정의, `91-95` 렌더
- **위반 요구사항**: PRD 6장 성공기준 5번 "발송 이력·통계가 실제 사용자 행동과 정확히 일치한다(허위/누락 기록 없음)" / PRD 3.1 통계 메뉴 정의는 "카테고리별·채널별 준비 건수 집계(이번 브라우저 세션 기준)"뿐이며 KPI 카드는 범위 외

```ts
const MOCK_KPI = [
  { label: "최근 30일 안내 준비 건수", value: "1,284건" },
  { label: "콘텐츠 링크 클릭률", value: "82%" },
  { label: "링크 재방문율", value: "34%" },
];
```

이 3개 값이 페이지 최상단 `StatCard` 3개를 차지하며, **카드 자체에는 "예시" 표기가 없습니다**. 예시임을 알리는 문구는 페이지 상단 본문(`86-88행`)에만 있고, "(예시)" 라벨은 콘텐츠 순위 카드 제목에만 붙어 있습니다. 병원 직원용 도구에서 이 숫자는 실제 운영 지표로 읽힙니다. `MOCK_TOP_CONTENT`(16-22행) 역시 하드코딩 값입니다.

- **수정 방향**: `MOCK_KPI` / `MOCK_TOP_CONTENT` 제거, 또는 각 카드에 "예시 데이터" 배지를 개별 부착.

---

## 5. Important 이슈 (7건)

### I1 — CMS 폼에서 본문 핵심 섹션을 편집할 수 없음

- **위치**: `src/components/care-guide/staff/GuideFormModal.tsx` (전체)
- **위반 요구사항**: PRD 6장 성공기준 4번 "CMS에서 수정한 내용이 저장되고, 같은 브라우저에서 새로고침·환자 화면에 반영된다" / PRD 3.4 콘텐츠 필드 정의 / Plan 11번
- **내용**: 폼이 제공하는 필드는 제목, 카테고리, 서브카테고리, slug, 진료과, 여정단계, 읽기시간, 요약, 주의사항, 위치, 문의, 검토필요, 게시여부입니다. `GuideContent`의 `before` / `during` / `after` / `faq` / `relatedContentIds` **5개 필드에 대한 입력 UI가 없습니다.** 기존 검사 콘텐츠를 수정하면 검사 전/당일/후 안내와 FAQ는 원본 값이 그대로 유지되고, 신규 등록 콘텐츠는 이 섹션들을 **영구히 가질 수 없습니다**. 가장 실질적인 안내 본문이 CMS 범위 밖입니다.

### I2 — 게시 상태 판정이 서버/클라이언트로 이원화 (미게시 제목 유출)

- **위치**: `src/app/c/[slug]/page.tsx:30-34` vs `src/components/care-guide/patient/ContentPageClient.tsx:14`
- **위반 요구사항**: PRD 3.3 "게시 상태가 아닌 콘텐츠는 존재하지 않는 슬러그와 동일하게 처리한다"
- **내용**: 서버 `generateMetadata`는 `findGuideBySlug(slug)`로 **시드 데이터만** 조회하고, 클라이언트는 `loadGuides()`로 **localStorage**를 조회합니다. CMS에서 콘텐츠를 비게시로 전환하면 클라이언트 본문은 "안내를 찾을 수 없습니다"를 표시하지만, 서버가 만든 `<title>`·`description`·OG 카드는 여전히 **실제 콘텐츠 제목과 요약을 노출**합니다. 카카오톡/문자 링크 미리보기에 미게시 콘텐츠 제목이 새어 나갑니다.

### I3 — 환자 페이지 본문이 클라이언트 전용, 서버 HTML이 비어 있음

- **위치**: `src/components/care-guide/patient/ContentPageClient.tsx:10`
- **위반 요구사항**: PRD 3.3 환자용 콘텐츠 페이지 / PRD 6장 성공기준 1번 "전부 `/c/[slug]`에서 정상 열람된다"
- **내용**: `useClientValue<GuideContent[]>(loadGuides, [])`의 seed가 빈 배열이므로 SSR 시점에 `guides.length === 0`이 되어 `return null`로 빠집니다(17-25행). 결과적으로 서버가 보내는 HTML에 본문이 전혀 없고, 하이드레이션 전까지 **빈 화면**이 보이며 로딩 상태 표시도 없습니다. JS 비활성 환경·크롤러는 본문을 읽을 수 없습니다. (OG 메타태그는 서버 생성이므로 링크 미리보기 자체는 동작)

### I4 — `tel:` 링크가 실제로 걸 수 없는 플레이스홀더 번호

- **위치**: `src/lib/care-guide/guides-data.ts` — `contact` 필드 11건 (`02-000-1234`, `02-000-3333`, `02-000-4444`, `02-000-5555`, `02-000-0119`, `02-000-6666` x3, `02-000-7777`, `02-000-8888`)
- **위반 요구사항**: PRD 3.3 "연락처는 `tel:` 링크로 감싸 클릭 시 바로 전화 연결이 가능해야 한다"
- **내용**: `extractPhoneNumber`(`GuideDetailView.tsx:18-21`)가 이 형식을 정상 매칭해 `tel:` 링크를 생성하므로, 환자가 탭하면 **존재하지 않는 번호로 발신을 시도**합니다. 이미 수정된 "SMS 링크가 가짜 도메인 가리키던 문제"와 동일한 결함 계열이며, 환자 대면 배포 전 차단 사유입니다.

### I5 — Noto Sans KR을 latin 서브셋만 로드 (한글 글리프 없음)

- **위치**: `src/app/layout.tsx:6-10`
- **위반 요구사항**: PRD 3.3 "고령 환자 가독성" / PRD 4장 반응형·가독성 취지
- **내용**: `Noto_Sans_KR({ subsets: ["latin"], weight: ["400","500","700","900"] })` — 한국어 폰트를 latin 서브셋으로만 받아 **웹폰트에 한글 글리프가 포함되지 않습니다.** 화면의 거의 모든 한글이 시스템 폴백 폰트로 렌더되고, 지정한 500/700/900 웨이트가 의도대로 적용되지 않습니다. `globals.css:104-105`의 폴백 체인에 `"Noto Sans KR"`이 있어 일부 완화되나, 로드한 웹폰트는 사실상 무용합니다.
- **수정 방향**: `subsets: ["latin", "korean"]`.

### I6 — CMS slug 검증 부재 (형식/중복 무검사)

- **위치**: `src/components/care-guide/staff/GuideFormModal.tsx:87`
- **위반 요구사항**: PRD 3.3 `/c/[slug]` 고정 URL 계약 / PRD 6장 성공기준 1번
- **내용**: `slug: form.slug.trim() || slugify(form.title)` — 사용자가 직접 입력한 slug는 `slugify`를 거치지 않고 **원문 그대로** 저장됩니다. 공백·`/`·특수문자가 포함되면 라우트가 깨지고, **기존 slug와 중복되어도 검증하지 않아** `find((g) => g.slug === slug)`가 먼저 나온 항목만 반환하며 뒤 항목은 영구히 접근 불가가 됩니다(섀도잉). 시드 50건은 전부 유니크하지만 신규 등록에 대한 보호 장치가 없습니다.

### I7 — `.env.example` 부재 및 `NEXT_PUBLIC_SITE_URL` 미문서화

- **위치**: `src/app/layout.tsx:16` (`metadataBase: new URL(FALLBACK_ORIGIN)`), `src/lib/care-guide/constants.ts:15-17`, 루트 `.env`(빈 파일, `.gitignore`의 `.env*`로 제외됨)
- **위반 요구사항**: PRD 4장 "배포 독립성 — 배포 도메인이 무엇이든 자동으로 올바른 주소를 가리켜야 한다(하드코딩 금지)" / Phase 2 환경변수 컨벤션(`.env.example` 템플릿 필수)
- **내용**: `.env`가 비어 있고 `.env.example`이 없어 `NEXT_PUBLIC_SITE_URL`이 어디에도 문서화되지 않았습니다. Vercel이 아닌 환경에 배포하면 `FALLBACK_ORIGIN`이 `http://localhost:3000`으로 확정되어 루트 `metadataBase`가 localhost를 가리킵니다. `/c/[slug]`는 요청 Host를 별도로 쓰므로 영향이 없지만, 루트 레이아웃 메타데이터는 잘못된 기준 URL을 갖습니다.

---

## 6. Minor 이슈 (6건 요약)

| # | 내용 | 위치 |
|:--:|---|---|
| M1 | 데드/중복 코드: `buildKakaoMessageText`가 export되어 있으나 미사용이고 동일 문자열을 모달에서 인라인 재구현. `findGuideById` 미사용, `GuideCard.showStatus` prop 전달처 없음 | `notification-service.ts:69`, `SendAssistantModal.tsx:56`, `guides-data.ts:899`, `GuideCard.tsx:16` |
| M2 | `SendLogEntry.completed`가 항상 `true`로 하드코딩되고 이력 화면은 플래그와 무관하게 녹색 체크 + "완료" 스타일을 무조건 렌더 — "완료 여부" 컬럼이 변할 수 없음 | `notification-service.ts:91`, `history/page.tsx:51-52` |
| M3 | `getRequestOrigin`이 `x-forwarded-proto`를 무시하고 호스트 문자열로 프로토콜을 추정(프록시 뒤 평문 HTTP에서 https 오판). 또한 `getClientOrigin`과 떨어져 라우트 파일에 인라인 | `c/[slug]/page.tsx:10-16` |
| M4 | `sm:` 접두사 없는 `grid-cols-2` 사용으로 360px에서도 2열 고정. 180행은 자식이 1개인데 2열 그리드 | `GuideFormModal.tsx:109,180` |
| M5 | CMS 제목 검색 결과가 0건일 때 빈 `tbody`만 남고 empty state 없음 | `cms/page.tsx:65-109` |
| M6 | 모달에 Escape/배경 클릭 닫기는 있으나 포커스 트랩·포커스 복원·body 스크롤 락 없음(접근성) | `modals/Modal.tsx` |

---

## 7. PRD 6장 성공 기준 판정

| # | 성공 기준 | 판정 | 근거 |
|:--:|---|:---:|---|
| 1 | 50개 콘텐츠가 5개 카테고리 요건대로 등록, 전부 `/c/[slug]`에서 정상 열람 | Met | 카테고리 수량 정확, slug 50개 유니크, 전부 게시, 라우트 ƒ 생성. 단 런타임 전수 열람 미검증(I3 참조) |
| 2 | 검색->미리보기->발송 어시스턴트까지 막힘없이 조작 | Met | `page.tsx:144` -> `GuidePreviewModal:38` -> `SendAssistantModal` 3채널 |
| 3 | 개인정보 노출 검사 전수 통과 | Met | 010-/주민번호 패턴 0건, 환자명 0건, `guides-data.ts:540`의 "등록번호"는 안내 문구, `SendLogEntry` PII 없음, URL은 slug만 |
| 4 | CMS 수정 내용 저장 + 새로고침·환자 화면 반영 | Partial | `upsertGuide`->localStorage->`loadGuides` 경로는 동작. 단 본문 5필드 편집 불가(I1), 서버 메타데이터는 시드만 참조(I2) |
| 5 | 발송 이력·통계가 실제 행동과 정확히 일치 | **Not Met** | C1(허위 기록) + C2(조작 지표) |
| 6 | 모바일·태블릿 레이아웃 파손/가로스크롤 없음 | Partial | 완화 조치 확인(테이블 `overflow-x-auto`+`min-w`, md 햄버거, 반응형 그리드). 단 정적 확인만, M4 존재 |
| 7 | `npm run lint`, `npm run build` 모두 통과 | Met | 둘 다 exit 0, 경고/오류 0건 |

**4 Met / 2 Partial / 1 Not Met** -> 성공기준 충족률 (4 x 1.0 + 2 x 0.5) / 7 = **71%**

---

## 8. 갭 분류

- **Missing (설계 O / 구현 X)**: 목업 없는 실제 통계, CMS 본문 섹션 편집, 클립보드 실패 처리
- **Added (설계 X / 구현 O)**: `MOCK_KPI`·`MOCK_TOP_CONTENT` 대시보드 카드, `globals.css`의 Toss 스타일 컬러 토큰
- **Changed (설계 != 구현)**: `completed`가 상수 `true`로 축소, 게시 상태 판정이 두 데이터 소스로 이원화

---

## 9. 권장 조치

### 즉시 조치 (90% 게이트 통과 경로)

1. **C1, C2 수정** — 유일한 Not Met 기준(5번)의 원인이며 둘 다 국소적 수정. 이것만으로 약 88% 도달 예상.
2. **I2 수정** — `generateMetadata`와 `ContentPageClient`가 동일한 상태 소스를 공유하도록 하거나, 서버 메타데이터를 시드 외 상태에서 일반 문구로 처리.
3. **I1 수정** — `GuideFormModal`에 `before`/`during`/`after`/`faq`/`relatedContentIds` 입력 추가 -> 성공기준 4번 마감.

### 배포 전 필수

4. **I4** — `02-000-XXXX` 연락처를 실제 병원 번호로 교체, 또는 `needsClinicalReview === false`일 때만 `tel:` 링크 활성화.
5. **I5** — 폰트 서브셋에 `"korean"` 추가.
6. **I7** — `.env.example` 커밋 및 `NEXT_PUBLIC_SITE_URL` 문서화.

### 검증 보강

7. Playwright로 360/430/768px 뷰포트 통과 + `/c/[slug]` 50개 slug 스모크 테스트 실행 -> 성공기준 1번·6번을 Partial에서 Met으로 전환.

---

## 10. 관련 문서

- PRD: [hy-care-guide.prd.md](../00-pm/hy-care-guide.prd.md)
- Plan: [hy-care-guide.plan.md](../01-plan/features/hy-care-guide.plan.md)
- Design: 없음 (본 사이클에서 미작성)
