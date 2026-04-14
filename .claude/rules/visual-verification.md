# Visual Verification (시각 검증 방법론)

> SVG 인포그래픽의 요소 겹침·이탈 같은 시각 문제를 **자동으로 사전 발견**하기 위한 방법론. 좌표 분석(정적)만으로는 놓치는 실제 렌더링 문제를 잡아냅니다.

## 왜 필요한가

좌표 분석으로는 다음을 놓칩니다:
- 이모지 실제 렌더 크기 (font-size 16이라도 OS·브라우저별로 픽셀 다름)
- 텍스트 자동 줄바꿈 (긴 한국어가 `<text>` 박스 밖으로 흘러넘침)
- 배경 장식(dot-grid, vignette, bgcanvas) 침투로 인한 대비 부족
- 애니메이션 정지 상태에서 보이지 않는 요소
- transform 좌표 계산 오류로 요소가 viewBox 밖 이탈
- z-index/render-order로 인한 의도치 않은 겹침
- 폰트 폴백(Pretendard 미로딩 시 시스템 폰트)으로 인한 너비 변화

→ **결론**: 실제 렌더를 캡처해서 봐야 함.

## 4단계 방법론

### Stage 1 · Render-Time Capture (필수)

**도구**: Playwright (Chromium headless)

**스크립트**: `.claude/scripts/capture-ppt-slides.mjs`

**사용**:
```bash
npm install --save-dev playwright && npx playwright install chromium
node .claude/scripts/capture-ppt-slides.mjs \
  --dir output/<slug>/01강_*/PPT \
  --out _viz_review
```

**산출물**: `_viz_review/part-NN/slide-XX.png` — 각 슬라이드의 section-visual 영역만 캡처

**언제**: html-renderer 완료 직후 자동 실행. (현재는 수동, 향후 워크플로우 통합)

### Stage 2 · AI Vision Audit (자동 1차 검수)

**도구**: Claude (multimodal). Read 도구로 PNG 직접 열람 가능.

**프롬프트 템플릿** (`.claude/prompts/visual-audit.md` 별도 권장):
```
다음 SVG 캡처를 시각적으로 분석해 주세요.

체크 항목:
- 텍스트 ↔ 텍스트 겹침
- 텍스트가 도형 경계 밖으로 삐져나감
- 이모지가 도형 중앙 이탈
- 화살표가 목표 도형과 연결되지 않음
- 배경 장식(원·점·선)이 텍스트 가독성 침해
- 자동 줄바꿈으로 단어 끊김
- 잔존 SVG 요소(이전 버전 잔재)
- 좌측·우측·상단·하단 잔재 도형

각 이슈를 위치(좌표 추정)·심각도(🔴/🟡/🟢)와 함께 보고.
```

**자동화 스니펫** (Agent에게 위임):
```
모든 _viz_review/part-NN/slide-XX.png를 순회하며 위 프롬프트로 평가.
이슈 발견 시 visual-audit-report.md에 저장.
```

### Stage 3 · `getBBox()` 실측 검증 (구현 완료 · 2026-04-13)

브라우저 `getBBox()` API는 텍스트의 **실제 렌더링 픽셀 영역**을 반환합니다. 이를 이용해 좌표 추측의 한계를 우회.

**스크립트**: `.claude/scripts/svg-self-verify.mjs`

```bash
node .claude/scripts/svg-self-verify.mjs <html> [slide_idx]
```

**검출 항목** (JSON 리포트):
- `overlaps`: 같은 SVG 내 텍스트끼리 픽셀 박스 겹침 (2px padding 기준)
- `overflow`: 텍스트가 부모 `<rect>` 박스 밖으로 나감
- `outside_viewbox`: 텍스트가 viewBox 영역 이탈

**효과**: AI 추측 영역 0%. 한국어 폰트 폭 차이도 정확히 측정.

### Stage 3.5 · svg-designer 자가 검증 루프 (필수 적용)

`svg-designer` 에이전트는 SVG 생성·수정 후 **반드시** 위 스크립트를 실행하여 통과까지 반복.

```
SVG 작성 → svg-self-verify → 통과? → 다음
                    ↓ FAIL
              충돌 좌표 정밀 조정 → 재검증 (최대 3회)
                    ↓ 3회 실패
                SVG 단순화 (텍스트·도형 수 감소)
```

자세한 운영 규칙은 `.claude/agents/svg-designer.md` 자가 검증 루프 섹션 참조.

### Stage 4 · Diff 비교 (회귀 방지)

**도구**: Pixelmatch 또는 ImageMagick `compare`

**용도**: 변경 후 캡처를 이전 버전 캡처와 비교 → diff PNG 생성. 의도치 않은 변화 식별.

```bash
# 예시 (ImageMagick)
compare _viz_review_prev/part-01/slide-03.png \
        _viz_review/part-01/slide-03.png \
        _viz_review_diff/part-01-slide-03.png
```

**언제**: 회차 v2, v3 갱신 시 회귀 검증용.

## Phase 0 연계 (2026-04-13 도입)

Phase 0-E "회귀 사례 브리핑"은 **이 파일 하단 "발견 사례 누적"에서 최근 N건을 발췌**하여 `_design/regression-briefing.md`로 저장한다. svg-designer / html-renderer 에이전트는 생성 시작 전 이 브리핑을 의무적으로 읽는다. 상세: `.claude/rules/ppt-design-pre-flight.md`.

## 통합 워크플로우 (권장)

`.claude/workflows/ppt-generation.md`에 통합할 단계:

```
6. HTML Rendering
6.5. Visual Capture (Playwright)        ← 신규 자동 단계
6.6. AI Vision Audit (Claude vision)    ← 신규 자동 단계
6.7. Issue Auto-Fix (svg-designer 에이전트 호출 / 발견된 이슈만)
6.8. Re-Capture & Verify
7. QA Validation (정적 + 시각 통합)
8. Thumbnails Update
9. Git Commit + Push
```

## 단기 적용 (이번 프로젝트)

회차 생성 직후 수동 절차:

```bash
# 1. 캡처
node .claude/scripts/capture-ppt-slides.mjs \
  --dir output/<slug>/<회차폴더>/PPT

# 2. 사용자 또는 Claude가 _viz_review/ 폴더 PNG 순회 검토

# 3. 발견된 이슈를 svg-designer 에이전트에 위임 수정

# 4. 재캡처 → 재검토
```

## 장기 자동화 로드맵

- [ ] **6.5 단계 워크플로우 통합**: html-renderer 완료 시 자동 캡처
- [ ] **AI Vision Audit 에이전트 신설**: `.claude/agents/visual-auditor.md` — 캡처를 받아 자동 평가
- [ ] **`assets/verify-svg-layout.mjs` 스크립트 작성**: 정적 좌표 검증
- [ ] **Pre-commit Hook**: 시각 캡처 미수행 시 커밋 차단
- [ ] **CI 통합**: GitHub Actions에서 캡처 + Vision 검증 자동화 (PR 코멘트로 보고)

## 발견 사례 누적 (회귀 방지 사례집)

이 섹션은 이번 프로젝트에서 발견된 실제 이슈를 기록합니다. 향후 동일 패턴 사전 차단용.

### 2026-04-13 (2차 · CSS-vs-SVG transform 충돌 발견)

**🚨 가장 중요한 발견**: CSS `transform` 속성이 SVG `transform` 속성을 **완전히 덮어씀**.

```html
<!-- 이 코드는 (210, 100) 위치로 가지 않습니다! -->
<g transform="translate(210 100)" class="svg-pulse">...</g>
```

이유: `svg-pulse` 클래스의 `@keyframes`에 `transform: scale(...)` 정의 → CSS spec에 따라 SVG transform 속성을 오버라이드 → 요소가 좌상단(0, 0) 부근으로 이동. 이게 우리가 며칠간 못 잡은 모든 깨짐의 **근본 원인**.

**해결**: 모든 SVG 애니메이션 클래스 일괄 제거. `.claude/scripts/strip-svg-animations.mjs` 사용.

```bash
node .claude/scripts/strip-svg-animations.mjs <PPT_DIR>
```

**규칙 강화**:
- `svg-design.md` 불변 0조: SVG 요소에 애니메이션 클래스 금지
- 정말 필요하면 외부(transform) + 내부(animation) 그룹 분리

**진단 방법**: Playwright `getBoundingClientRect()`로 실제 렌더 좌표 측정. 예시 스크립트:
```javascript
const rect = el.getBoundingClientRect();
// translate(210 100)인데 rect.x가 viewBox 좌상단 부근이면 → CSS override 의심
```

### 2026-04-13 (1차)
- **Part 01 slide-03**: 빅넘버 영역 위에 잔존 카드 박스 — 좌표 분석에서는 통과했지만 실제로는 z-order 충돌
- **Part 01 slide-10**: BRIDGE에 이전 버전 배지 SVG 요소 잔존 — 새 디자인 추가 시 옛 요소 미삭제
- **Part 02 slide-01**: section-title에 시간 표기("30분") 잔존 — 콘텐츠 정책 변경(시간 제거)이 SVG·bullet에는 미반영
- **Part 06 slide-03**: KOREN 경고 박스가 URL 바와 겹침 — 좌표 이동만으로는 안 됨, 요소 자체 재배치 필요
- **Part 06 slide-04~06**: 시간 표기(10min/20min) 잔존 + 좌측 잔재 도형 — 디자인 일관성 정책 미반영

**패턴 정리**:
1. 콘텐츠 정책 변경(시간 제거 등) 시 **PPT 슬라이드 bullet/SVG 텍스트도 동시 갱신** 필요
2. SVG 재생성·수정 시 **이전 버전 요소 잔재** 잘 발생 → 캡처로만 발견 가능
3. **배경 장식 침투**(dot-grid, 동심원)는 좌표상 안전해도 시각적으로 침해

## 참조

- `.claude/scripts/capture-ppt-slides.mjs` — 캡처 스크립트
- `.claude/rules/qa-checklist.md` — B3 시각 검증 통합 항목
- `.claude/agents/svg-designer.md` — SVG 수정 책임 에이전트
- `.claude/workflows/ppt-generation.md` — 워크플로우 (6.5 단계 통합 예정)
