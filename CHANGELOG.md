# Changelog

## [1.0.0] · 2026-04-14 · 첫 릴리스

### 추가
- 4가지 input 모드 (참고자료·목차·완성 스크립트·프레임워크) × 3가지 오디언스 + 커스텀
- 파자마보스 테마 (`assets/themes/pajamaboss/`) · tokens.json SSOT
- 6인 전문가 가상 회의 (`expert-council` · 고정 5 + 가변 도메인 1)
- 휴먼인루프 3단계 게이트 (H1~H4) · AskUserQuestion 5지선다
- K1 3중 검증 (자동·시각·인간)
- E1~E3 오류 처리 표준
- 토큰 단계별 Budget (회의 60k · 스크립트 40k · 렌더 25k · 검증 15k)
- voice-lock 톤 잠금 · 2~N강 의무 일관성
- 웹 딥서치 규약 · 1차 출처 5건+ · `[src:N]` 출처 ID
- 강의별 독립 폴더 (`output/<slug>/`)
- Notion MCP 선택적 업로드 (graceful skip)
- 샘플 1세트 · `samples/mode-1-references/` (가상 빵집 도메인)
- 구조 골드 · `samples/_gold-standard/structure/`

### 이식 출처
aiMarketer 프로젝트의 `.claude/` 규칙·에이전트·공통 에셋을 범용화하여 이식. 공공강의 특화 자산은 `branding/public-lecture/`로 압축 보존.

### 알려진 제한
- 한국어 전용 (v2.0에서 다국어)
- 콘텐츠 골드 1세트만 (도메인 적응은 런타임 회의로 보정)
- Playwright 시각 검증 수동 (v1.1에서 자동)
- 팀 협업 시나리오 미지원 (v2.0)
