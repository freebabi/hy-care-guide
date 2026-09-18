# Gap Analysis — hy-care-guide (Check Phase, Re-run)

> **Summary**: PRD/Plan 대비 구현 갭 재분석. Match Rate 90% (static-only), Critical 0 / Important 3 / Minor 6.
>
> **Created**: 2026-09-18
> **Status**: Review
> **Phase**: Check (PDCA)
> **선행 분석**: [hy-care-guide.analysis.md](./hy-care-guide.analysis.md) (2026-09-17, Match Rate 82%)

---

## 1. 분석 개요

| 항목 | 내용 |
|---|---|
| 분석 대상 | HY CARE GUIDE (한양 케어가이드) Phase 1 |
| 기준 문서 | `docs/00-pm/hy-care-guide.prd.md`, `docs/01-plan/features/hy-care-guide.plan.md` |
| Design 문서 | 없음 — PRD + Plan을 스펙 기준으로 사용 |
| 구현 경로 | `src/app/`, `src/components/care-guide/`, `src/lib/care-guide/` |
| 분석 방식 | 정적 분석(코드 전수 판독) + `npm run lint` / `npm run build` 실제 실행 |
| 미검증 영역 | 런타임/서버 실행 검증 없음 (뷰포트 실측, 50개 slug 실제 열람 테스트 미수행) |
| 선행 조치 | 커밋 `0265443`(QR 탭 허위 기록 수정), `6ee58a2`(C1/C2/I6/I7 수정) 반영 후 재분석 |

---

## 2. Match Rate 산정식

이전 분석과 동일한 가중치를 적용합니다.

```
Overall = (Structural x 0.2) + (Functional x 0.4) + (Contract x 0.4)
        = (100 x 0.2) + (93.75 x 0.4) + (81.25 x 0.4)
        = 20.0 + 37.5 + 32.5
        = 90.0%
```

| 축 | 점수 | 가중치 | 기여도 | 산출 근거 | 이전(82%) 대비 |
|---|:---:|:---:|:---:|---|:---:|
| Structural | 100% | 0.2 | 20.0 | Plan 16개 항목 전부 대응 코드 존재 (16/16) | 변화 없음 |
| Functional | 93.75% | 0.4 | 37.5 | 항목별 깊이 점수 합 1500 / 16항목 = 93.75% | +3.45pt |
| Contract | 81.25% | 0.4 | 32.5 | 내부 계약 8건 중 PASS 6 / Partial 1 / FAIL 1 = 6.5/8 = 81.25% | +18.75pt |
| **Overall** | **90%** | 1.00 | **90.0** | 90% 게이트 **통과** | **+8.0pt** |

### 2.1 Functional 항목별 깊이 점수 (변동분만 근거 재기재)

| # | Plan 작업 항목 | 구조 | 기능 (이전→현재) | 근거 |
|:--:|---|:--:|:--:|---|
| 1 | 콘텐츠·발송이력 타입 정의 | O | 100 (동일) | 변경 없음 |
| 2 | 콘텐츠 시드 50건 | O | 100 (동일) | 변경 없음 |
| 3 | localStorage 유틸 + SSR-safe 훅 | O | 100 (동일) | 변경 없음 |
| 4 | origin 동적 해석 | O | 95 (동일) | 변경 없음 |
| 5 | SMS/카카오 문구 생성 | O | 90 (동일) | 변경 없음 |
| 6 | 4개 메뉴 레이아웃/반응형 내비 | O | 100 (동일) | 변경 없음 |
| 7 | 직원 홈 검색/필터 | O | 100 (동일) | 변경 없음 |
| 8 | 미리보기 모달 | O | 100 (동일) | 변경 없음 |
| 9 | 발송 어시스턴트 3채널 | O | **100 (75→100)** | `SendAssistantModal.tsx` — `CopyButton`이 `onCopied`/`onFailed`로 분리되어 클립보드 실패 시 `notifyCopyFailed()`만 호출하고 `recordSendPrep`은 성공 시에만 실행됨(C1 해결 확인) |
| 10 | 환자용 `/c/[slug]` | O | 85 (동일) | I2·I3·I4 모두 미해결 — 점수 유지 |
| 11 | CMS 화면 | O | **65 (60→65)** | `GuideFormModal.tsx:89-97` slug가 `slugify()`를 거치고 `existingSlugs` 중복 검사 추가(I6 해결). 단 `before`/`during`/`after`/`faq`/`relatedContentIds` 입력 UI는 여전히 없음(I1 미해결) — 본질적 결함이 남아 소폭만 상향 |
| 12 | 발송 이력 화면 | O | 95 (동일) | 변경 없음 |
| 13 | 통계 대시보드 | O | **90 (65→90)** | `dashboard/page.tsx` `StatCard`에 `isExample` prop 추가, `MOCK_KPI` 3장 전체에 "예시 데이터" 배지 부착(C2 해결). 카테고리/채널 집계는 기존과 동일하게 실데이터 |
| 14 | PII 제로 점검 | O | 95 (동일) | I4(연락처 플레이스홀더) 미해결 — 점수 유지 |
| 15 | 반응형 검증 | O | 85 (동일) | M4 미해결 — 점수 유지 |
| 16 | lint/build 검증 | O | 100 (동일) | 둘 다 exit 0 재확인 |

합계 1500 / 16 = **93.75%**

### 2.2 Contract(내부 계약) 검증

| # | 계약 | 이전 판정 | 현재 판정 | 비고 |
|:--:|---|:---:|:---:|---|
| 1 | `/c/[slug]` URL 계약 (slug만, PII 없음, 쿼리 파라미터 없음) | PASS | PASS | 변경 없음 |
| 2 | `SendLogEntry` 4필드 <-> 이력 테이블 4컬럼 | PASS | PASS | 변경 없음 (`completed` 상수화 드리프트는 M2로 별도 관리) |
| 3 | localStorage 키 `hycg.guides.v2` 쓰기/읽기 일관성 | PASS | PASS | 변경 없음 |
| 4 | localStorage 키 `hycg.sendlog.v2` 쓰기/읽기 일관성 | PASS | PASS | 변경 없음 |
| 5 | origin 계약 (클라 `window.location.origin` / 서버 Host / env 폴백) | PARTIAL | **PASS** | `.env.example` 추가로 `NEXT_PUBLIC_SITE_URL` 문서화 완료(I7 해결). 루트 `metadataBase`가 빌드시점 폴백이라는 근본 설계는 동일하지만, 이는 코드 주석과 `.env.example`에 명시된 의도된 동작이며 `/c/[slug]`는 요청 Host를 별도로 사용하므로 실질 영향 없음 |
| 6 | 게시 상태 계약 (서버 시드 기준 vs 클라 localStorage 기준) | PARTIAL | PARTIAL | 미해결 (I2) — `generateMetadata`는 `findGuideBySlug`(시드)만 조회, `ContentPageClient`는 `loadGuides()`(localStorage) 조회 |
| 7 | 복사 행동 <-> 이력 기록 계약 | FAIL | **PASS** | C1 해결 — 클립보드 실패 시 `recordSendPrep` 미호출 확인 |
| 8 | `GuideContent` 스키마 <-> CMS 폼 필드 커버리지 | FAIL | FAIL | 미해결 (I1) — 18필드 중 5필드(`before`/`during`/`after`/`faq`/`relatedContentIds`) 여전히 편집 불가 |

PASS 6.0 + PARTIAL 1.0 + FAIL 0 = 6.5 / 8 = **81.25%**

---

## 3. lint / build 결과 (재실행)

| 명령 | Exit Code | 결과 |
|---|:---:|---|
| `npm run lint` | 0 | 통과. 출력 없음(경고/오류 0건) |
| `npm run build` | 0 | 통과. 경고/오류 0건. Next.js 16.3.4 (Turbopack), TypeScript 검사 통과 |

생성된 라우트 (6개, 이전과 동일):

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /c/[slug]
├ ○ /cms
├ ○ /dashboard
└ ○ /history
```

**PRD 성공기준 7번 및 Plan 16번 항목 충족 (유지).**

---

## 4. Critical 이슈 — 0건 (2건 모두 해결)

### ~~C1 — 클립보드 실패 시 허위 "완료" 이력 기록~~ → **해결**

- **검증 위치**: `src/components/care-guide/staff/SendAssistantModal.tsx:22-40`
- **현재 코드**:
  ```ts
  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
      onCopied();
    } catch {
      onFailed();
    }
  }
  ```
  `onFailed` 경로는 `notifyCopyFailed()`만 호출하여 실패 토스트만 띄우고 `recordSendPrep`을 호출하지 않음. `onCopied`(→`notifyCopied`, 89행)만 `recordSendPrep(guide, channel)`을 호출하므로 실제 복사 성공 시에만 이력이 남는다. **커밋 `6ee58a2`로 해결 확인.**

### ~~C2 — 통계 대시보드 상단에 조작된 지표 노출~~ → **해결**

- **검증 위치**: `src/app/(staff)/dashboard/page.tsx:24-38, 98-102`
- **현재 코드**: `StatCard`에 `isExample` prop이 추가되었고, `MOCK_KPI.map((kpi) => <StatCard key={kpi.label} {...kpi} isExample />)`로 3개 카드 전부에 "예시 데이터" 배지(`bg-amber-50 text-amber-700`)가 개별 부착됨. 페이지 상단 설명 문구(92-95행)도 유지되어 이중으로 고지한다. **커밋 `6ee58a2`로 해결 확인.**

---

## 5. Important 이슈 (4건 잔존 — 이전 7건 중 2건 해결, 1건 오탐 제외)

### I1 — CMS 폼에서 본문 핵심 섹션을 편집할 수 없음 (**미해결**)

- **위치**: `src/components/care-guide/staff/GuideFormModal.tsx` (전체, 108-282행)
- **재확인 결과**: 폼 필드는 여전히 제목/카테고리/서브카테고리/slug/진료과/여정단계/읽기시간/요약/주의사항/위치/문의/검토필요/게시여부뿐이다. `GuideContent`의 `before`/`during`/`after`/`faq`/`relatedContentIds` 5개 필드에 대한 입력 UI가 여전히 없다. 내용·해결 방향 이전 분석과 동일.

### I2 — 게시 상태 판정이 서버/클라이언트로 이원화 (**미해결**)

- **위치**: `src/app/c/[slug]/page.tsx:28-34`(`generateMetadata`, `findGuideBySlug` 사용) vs `src/components/care-guide/patient/ContentPageClient.tsx:10-14`(`loadGuides()` 사용)
- **재확인 결과**: 두 파일 모두 이전과 동일한 로직. `generateMetadata`는 시드 데이터(`guides-data.ts`)만 조회하고, 클라이언트는 CMS가 쓰는 localStorage를 조회한다. CMS에서 비게시로 전환해도 서버가 만드는 `<title>`/`description`/OG 카드는 시드 값을 그대로 노출한다.

### I3 — 환자 페이지 본문이 클라이언트 전용, 서버 HTML이 비어 있음 (**미해결**)

- **위치**: `src/components/care-guide/patient/ContentPageClient.tsx:17-25`
- **재확인 결과**: `guides.length > 0 && !guide` 조건에서만 "찾을 수 없음" 메시지를 보여주고, `guides.length === 0`(SSR/첫 렌더 시 seed 배열)일 때는 `if (!guide) return null;`(25행)로 빠져 로딩 상태 없이 빈 화면을 반환한다. 코드 변경 없음.

### I4 — `tel:` 링크가 실제로 걸 수 없는 플레이스홀더 번호 (**미해결**)

- **위치**: `src/lib/care-guide/guides-data.ts` — `contact` 필드 11건 그대로 (`02-000-1234` 외 10건, 라인 28/398/469/672/707/757/808/841/873/890)
- **재확인 결과**: 전화번호 플레이스홀더 변경 없음. `GuideDetailView.tsx`의 `extractPhoneNumber`가 여전히 이 패턴을 매칭해 `tel:` 링크를 생성한다.

### ~~I5 — Noto Sans KR을 latin 서브셋만 로드~~ → **오탐(False Positive), 재분류하지 않음**

- 이전 분석에서 "한글 서브셋 부재"로 지적되었으나, 조사 결과 `next/font/google`의 `Noto_Sans_KR`은 `subsets` 옵션에 `"korean"` 값 자체가 존재하지 않으며, `"latin"` 서브셋 빌드에도 전체 한글(Hangul) 유니코드 범위가 이미 포함되어 있음이 확인되었다. `src/app/layout.tsx:6-10`의 현재 설정(`subsets: ["latin"]`)은 정상 동작이며 수정이 불필요하다. 본 재분석에서는 이슈 목록에서 제외한다.

### ~~I6 — CMS slug 검증 부재 (형식/중복 무검사)~~ → **해결**

- **검증 위치**: `src/components/care-guide/staff/GuideFormModal.tsx:85-98`, `src/app/(staff)/cms/page.tsx:126-128`, `src/app/(staff)/page.tsx:162`
- **현재 코드**: `handleSubmit`이 `slugify(form.slug.trim() || form.title)`로 사용자가 입력한 slug도 정규화하고, `existingSlugs.includes(slug)`로 중복 시 `setSlugError`를 띄워 저장을 막는다. `cms/page.tsx`와 `(staff)/page.tsx`는 편집 대상 자신을 제외한 `existingSlugs` 배열을 각각 계산해 `GuideFormModal`에 전달한다. **커밋 `6ee58a2`로 해결 확인.**

### ~~I7 — `.env.example` 부재~~ → **해결**

- **검증 위치**: 루트 `.env.example` (신규 파일, 375바이트)
- **현재 내용**: `NEXT_PUBLIC_SITE_URL` 변수와 그 역할(비-Vercel 배포 시에만 필요, `/c/[slug]`는 영향 없음)을 설명하는 주석 포함. **해결 확인.**

---

## 6. Minor 이슈 (6건, 전건 미해결 — 이전 분석과 동일)

| # | 내용 | 위치 | 재확인 결과 |
|:--:|---|---|---|
| M1 | `buildKakaoMessageText` export 미사용(모달에서 인라인 재구현), `findGuideById` 미사용, `GuideCard.showStatus` prop 전달처 없음 | `notification-service.ts:69`, `SendAssistantModal.tsx:66`, `guides-data.ts:899`, `GuideCard.tsx:16` | 변경 없음 |
| M2 | `SendLogEntry.completed`가 항상 `true`로 하드코딩, 이력 화면이 플래그와 무관하게 무조건 "완료" 렌더 | `notification-service.ts:92`, `history/page.tsx:51-52` | 변경 없음 |
| M3 | `getRequestOrigin`이 `x-forwarded-proto` 미사용, 호스트 문자열로 프로토콜 추정 | `c/[slug]/page.tsx:10-16` | 변경 없음 |
| M4 | `sm:` 접두사 없는 `grid-cols-2` 사용(360px에서도 2열 고정) | `GuideFormModal.tsx:124,199` | 변경 없음(라인 번호만 이동) |
| M5 | CMS 제목 검색 결과 0건일 때 empty state 없음 | `cms/page.tsx:66-109` | 변경 없음 |
| M6 | 모달 포커스 트랩·포커스 복원·body 스크롤 락 없음 | `modals/Modal.tsx` | 변경 없음 |

---

## 7. PRD 6장 성공 기준 재판정

| # | 성공 기준 | 이전 판정 | 현재 판정 | 근거 |
|:--:|---|:---:|:---:|---|
| 1 | 50개 콘텐츠 등록, 전부 `/c/[slug]` 정상 열람 | Met | Met | 변경 없음(I3로 인한 SSR 빈 화면 리스크는 잔존하나 최종 렌더는 정상) |
| 2 | 검색→미리보기→발송 어시스턴트 조작 | Met | Met | 변경 없음 |
| 3 | 개인정보 노출 검사 전수 통과 | Met | Met | 변경 없음 |
| 4 | CMS 수정 내용 저장 + 새로고침·환자 화면 반영 | Partial | Partial | I1(본문 5필드 미편집), I2(서버 메타데이터 이원화) 모두 미해결 — 판정 유지 |
| 5 | 발송 이력·통계가 실제 행동과 정확히 일치 | **Not Met** | **Met** | C1, C2 모두 해결 확인 |
| 6 | 모바일·태블릿 레이아웃 파손/가로스크롤 없음 | Partial | Partial | M4 잔존 — 판정 유지 |
| 7 | `npm run lint`, `npm run build` 모두 통과 | Met | Met | 재실행 확인, 둘 다 exit 0 |

**5 Met / 2 Partial / 0 Not Met** → 성공기준 충족률 (5 x 1.0 + 2 x 0.5) / 7 = **85.7%** (이전 71%에서 +14.7pt)

---

## 8. 갭 분류 (갱신)

- **Missing (설계 O / 구현 X)**: CMS 본문 섹션(`before`/`during`/`after`/`faq`/`relatedContentIds`) 편집 UI
- **Added (설계 X / 구현 O)**: `MOCK_KPI`·`MOCK_TOP_CONTENT` 대시보드 카드 (단, 이제는 "예시 데이터" 배지로 명시되어 PRD의 "허위/누락 기록 없음" 원칙은 충족)
- **Changed (설계 != 구현)**: `completed`가 상수 `true`로 축소(M2, Minor로 격하 유지), 게시 상태 판정이 서버 시드 / 클라 localStorage 두 소스로 이원화(I2, 미해결)

---

## 9. 권장 조치 (갱신)

이미 90% 게이트를 통과했으므로, 아래는 배포 전 필수 항목 위주로 재정렬합니다.

### 배포 전 필수 (환자 대면 리스크)

1. **I4** — `02-000-XXXX` 연락처를 실제 병원 번호로 교체, 또는 `needsClinicalReview === false`이고 실제 번호가 확인된 콘텐츠에서만 `tel:` 링크 활성화.
2. **I2** — `generateMetadata`가 클라이언트와 동일한 게시 상태 소스를 참조하도록 하거나, 최소한 시드 기준으로도 비게시 판정이 가능하도록 서버 측 상태 확인 로직 추가. 미게시 콘텐츠의 제목/요약이 OG 카드로 유출되는 경로를 차단해야 함.
3. **I1** — `GuideFormModal`에 `before`/`during`/`after`/`faq`/`relatedContentIds` 입력 UI 추가. PRD 성공기준 4번을 Met으로 전환하는 마지막 조각.

### 품질 개선

4. **I3** — `ContentPageClient`에 로딩 스켈레톤 또는 서버 컴포넌트 전환을 검토해 SSR 빈 화면 제거.
5. **M2, M4, M5, M6** — 이력 화면 완료 플래그 표현, 폼 그리드 반응형, CMS 검색 empty state, 모달 접근성(포커스 트랩) 보강.
6. **M1, M3** — 데드 코드 정리, `x-forwarded-proto` 반영.

### 검증 보강

7. Playwright로 360/430/768px 뷰포트 통과 + `/c/[slug]` 50개 slug 스모크 테스트 실행 → 성공기준 1번·6번을 Partial에서 Met으로 전환.

---

## 10. 이전 분석 대비 요약

| 구분 | 이전(2026-09-17) | 현재(2026-09-18) |
|---|:---:|:---:|
| Match Rate | 82% | **90%** |
| Critical | 2 | **0** |
| Important | 7 | **4** (I1, I2, I3, I4 잔존) |
| Minor | 6 | 6 (전건 미해결) |
| 성공기준 충족률 | 71% | **85.7%** |
| lint/build | 0 / 0 | 0 / 0 |

**Important 이슈 상세 변동**: 이전 7건(I1~I7) 중 I6·I7은 해결 확인, I5는 조사 결과 오탐(False Positive)으로 확인되어 목록에서 제외했습니다. 남은 Important는 **I1, I2, I3, I4 (4건)**입니다.

- **해결 확인**: C1, C2, I6, I7 (4건)
- **오탐으로 재분류(이슈 아님)**: I5 (1건)
- **미해결**: I1, I2, I3, I4 (Important 4건), M1~M6 (Minor 6건)

---

## 11. 관련 문서

- PRD: [hy-care-guide.prd.md](../00-pm/hy-care-guide.prd.md)
- Plan: [hy-care-guide.plan.md](../01-plan/features/hy-care-guide.plan.md)
- 선행 분석(2026-09-17, 82%): [hy-care-guide.analysis.md](./hy-care-guide.analysis.md)
- Design: 없음 (본 사이클에서 미작성)
