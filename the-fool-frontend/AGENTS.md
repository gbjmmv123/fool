# 愚者教会前端

Nuxt 3 SPA (SSR disabled). Users take a 17-question personality quiz, get sorted into one of 8 departments, and explore the Church of the Fool themed around Lord of Mysteries (诡秘之主).

## Tech Stack

| Category | Choice |
|---|---|
| Framework | Nuxt 3 (`srcDir: 'app/'`, `ssr: false`) |
| Language | TypeScript (strict) |
| UI | Vue 3 |
| Composables | VueUse (`@vueuse/core`) |
| Styling | UnoCSS (presetWind3 + presetAttributify + presetIcons) |
| State | `useState` + composables (no Pinia) |
| HTTP | `$fetch` wrapped in `services/` |
| Image Export | `html-to-image` + `vue-advanced-cropper` |

Commands: `npm run dev` / `npm run build` / `npm run preview`

## Architecture Rules

1. **Pages compose, don't implement**: Complex logic lives in composables, pages just wire things up.
2. **All pages run inside `default.vue` shell**: Includes TopNav + NuxtPage + ModalContainer. Don't write your own top-level layout.
3. **Use `MainContent.vue`** for page content wrapping.
4. **CSS variables only**: Use `--dt-*` tokens (defined in `styles/vars.css`). Never hardcode colors. Legacy `--c-*` aliases exist but don't add new ones.
5. **Modals via `useDialog` + `ModalContainer`**: Promise-based API. Never inline modals in pages.
6. **User state comes from backend bootstrap**: Don't derive user state client-side. Use `useBootstrap().state`.
7. **`useState` keys must have `church-` prefix**: Prevents SSR hydration collisions.
8. **localStorage only in `import.meta.client`**: Never access localStorage on server side.
9. **No direct `$fetch` in components**: All HTTP calls go through `services/`.
10. **CSS variables use `--dt-*` namespace**: `--c-*` are legacy compatibility aliases.

## Directory Structure

```
app/
  layouts/
    default.vue       # Shell: TopNav + NuxtPage + ModalContainer
    none.vue          # Bare layout (for login, staff pages)
  pages/
    index.vue         # Homepage: hero + welcome flow + 8-department cards
    about.vue         # About page: intro text → line reveal → Amon tail
    exam/index.vue    # Exam: intro → 16 normal questions + 1 Amon final
    exam/result.vue   # Result: loading → cinematic → story → detail card
    department/my.vue # My department with officer profile + member list
    departments.vue   # All 8 departments accordion
    amon.vue          # Amon family secret zone (requires amon trigger)
    support.vue       # User-to-staff chat (Arrodes mirror)
    badge.vue         # ID badge generator + export
    login.vue         # Login page: auto-generate userId → redirect to /
    dev/amon-test.vue # Dev-only: test Amon modes
    dev/cards.vue     # Dev-only: test department cards
    __staff/support.vue # Staff admin console (password-protected)
  components/
    main/             # MainContent, MainTitle, Breadcrumb
    nav/              # TopNav, TopNavItem, MobileNavDrawer
    modal/            # ModalDialog (shell), ModalContainer, + all modal types
    home/             # ChurchIntroCard, HomeExamEntryCard, HomeOverviewCard, etc.
    about/            # AboutIntroParagraph, AboutLineReveal, AboutAmonTail
    exam/             # ExamQuestionCard, ExamProgress, ExamSubmitBar, etc.
    result/           # ResultShareCard, ResultDetailCard, ResultStoryScene, etc.
    department/       # DepartmentAccordion, OfficerProfileCard, MemberList, etc.
    badge/            # BadgeCard, BadgeForm
    support/          # SupportButton, SupportPanel, SupportMessageList, SupportComposer
    staff/            # StaffConversationList, StaffMessageList, StaffComposer, StaffFeedbackList
    shared/           # PlaceholderCard
  composables/        # All business logic (see table below)
  services/           # api.ts + domain wrappers (user, exam, department, support, feedback, staff)
  types/              # TypeScript types + page-meta.d.ts
  utils/              # env, examScoring, scroll, storage, time
  middleware/         # access.global.ts (route guards)
  data/               # Static data: questions.ts (17 questions), departments.ts (8 departments)
  styles/             # vars.css (design tokens), global.css
  public/static/avatars/  # 10 avatar PNGs for department officers + default
```

## Route Table

| Route | Page | Key Meta |
|---|---|---|
| `/` | Homepage | bootstrap entry, snap-scroll sections |
| `/about` | About Church of the Fool | line reveal animation |
| `/exam` | Entrance Exam | 17 questions, draft saving |
| `/exam/result` | Exam Result | `requiresExamResult: true` |
| `/department/my` | My Department | officer profile + members |
| `/departments` | All Departments | `wideLayout: true`, accordion |
| `/amon` | Amon Family | `requiresAmon: true` |
| `/support` | Support Chat | Arrodes mirror, polling |
| `/badge` | ID Badge | config + export |
| `/login` | Login | `layout: 'none'`, auto-redirect |
| `/__staff/support` | Staff Console | `layout: 'none'`, password `xinyu1110` |
| `/dev/amon-test` | Dev: Amon Test | no restrictions |
| `/dev/cards` | Dev: Cards Test | no restrictions |

Page meta fields (`app/types/page-meta.d.ts`): `showTopNav`, `wideLayout`, `requiresExamResult`, `requiresAmon`, `showSupport`, `requiresStaff`

## Global State Model

```ts
interface UserBootstrapState {
  userId: string
  nickname: string | null
  isNewUser: boolean
  hasCompletedExam: boolean
  hasDepartment: boolean
  departmentId: string | null
  departmentName: string | null
  joinedAmonFamily: boolean
  latestExamResultId: string | null
  homepageMessageType: 'name' | 'urge_exam' | 'welcome_back' | 'none'
}
```

## Composables Quick Reference

| Composable | Purpose |
|---|---|
| `useUserIdentity` | Generate/read/store userId in localStorage |
| `useBootstrap` | Fetch bootstrap state, expose `state/loading/error/initialized/refresh/patchState` |
| `useDialog` | Promise-based modal API (open/close various dialog types) |
| `useReducedMotion` | Combined system `prefers-reduced-motion` + local opt-in |
| `useHomeView` | Derive homepage modules + welcome dialog intent from bootstrap |
| `useExamDraft` | Debounced draft save/restore/clear + version check |
| `useExamFlow` | Question loading, answering, validation, submission, navigation |
| `useExamResultStory` | Result page: Loading → Story → Detail flow control |
| `useDepartmentView` | My department + all departments data fetching |
| `useAmonMode` | Amon visual & feature toggle (derived from bootstrap + route) |
| `useSupport` | Support chat: send/pull/poll/unread/toggle |
| `useBadgeConfig` | Badge card config + avatar crop + html-to-image export |
| `useStaffAuth` | Staff password unlock (`xinyu1110`), stored in localStorage |
| `useStaffConsole` | Staff: conversation list, message polling, reply |
| `useStaffFeedback` | Staff: feedback list loading |

## LocalStorage Keys

| Key | Purpose |
|---|---|
| `church_user_id` | User ID (`uid_${ts}_${rand6}`), generated once |
| `church_exam_draft` | Exam draft: `{ version, answers, updatedAt }` |
| `church_exam_draft_updated_at` | Draft timestamp |
| `church_last_welcome_key` | Welcome dialog dedup: `${userId}:${type}:${date}` |
| `church_reduced_motion_opt_in` | Reduced motion opt-in (`'1'`) |
| `church_support_draft` | Support composer draft |
| `church_support_last_seen_id` | Support chat last read message ID |
| `church_staff_unlocked` | Staff console unlocked state (`'1'`) |

## Dialog System

Three layers: `ModalDialog` (shell) → `ModalContainer` (mount) → `useDialog` (API)

```ts
openNameInputDialog(): Promise<{ nickname: string } | null>  // Blocking, no Esc close
openWelcomeDialog(message: string): Promise<void>
openAlertDialog(options: { title?: string; message: string }): Promise<void>
openConfirmDialog(options: { title: string; message: string }): Promise<'confirm' | 'cancel'>
openShareCardDialog(examResult: ExamResultResponse): Promise<void>
openAvatarCropDialog(file: File): Promise<{ dataUrl: string } | null>
openBadgeWechatSaveDialog(dataUrl: string): Promise<void>
openStaffPasswordDialog(): Promise<string | null>
closeDialog(key: string): void
```

Body scroll lock uses reference counting (multiple stacked modals only lock once).

## Exam System

17 questions in `app/data/questions.ts`:

- **q1–q16**: Normal questions. Each option has weights mapped to 8 department IDs.
- **q17**: Amon final question. Special type `amon-final`, determines `storyId` (1=好呀好呀, 2=列奥德罗, 3=纸人替身).

Scoring (`app/utils/examScoring.ts`): Sum weights per department → highest score wins.

Departments are 8 (not 9 as in early versions): `justice`, `hangedman`, `sun`, `magician`, `moon`, `hermit`, `star`, `judgement`.

## CSS Design Tokens

Defined in `app/styles/vars.css`. Main namespace `--dt-*`:

```css
/* Text */
--dt-text-title / --dt-text-heading / --dt-text-body / --dt-text-muted

/* Background */
--dt-bg-base / --dt-bg-elevated / --dt-bg-hover

/* Border & State */
--dt-border-default / --dt-border-active / --dt-border-highlight
--dt-border-disabled / --dt-border-subtle
--dt-state-danger / --dt-state-success

/* Shape */
--dt-radius-card / --dt-shadow-card

/* Mirror surface (Arrodes support UI) */
--dt-mirror-base / --dt-mirror-tint / --dt-mirror-edge
--dt-mirror-highlight / --dt-mirror-shimmer / --dt-mirror-text / --dt-mirror-shadow
```

`.theme-amon` overrides specific tokens for the Amon family visual mode (scoped to `MainContent`, not `body`).

## Route Guards (`middleware/access.global.ts`)

- `requiresExamResult`: Redirects to `/` if `resultId` query param is missing.
- `requiresAmon`: Redirects to `/` if not joined Amon family (client-side only, SSR would misread defaults).

## Staff Console

- Password: hardcoded `xinyu1110`, checked client-side via `useStaffAuth`.
- Unlocked state persisted in `localStorage` (`church_staff_unlocked`).
- Two tabs: Messages (conversation list + chat) and User Feedback.

## Reduced Motion

When `useReducedMotion()` is true:
- About page shows full text immediately (skip line reveal)
- Result page skips cinematic story, goes direct to detail
- Amon watermark doesn't float
- Exam unanswered highlight becomes static red border
