# Gold Standard · Content (콘텐츠 골드)

> 실제 강의 결과물 수준을 **텍스트 형태·밀도·출처 부착 방식**으로 예시. 도메인은 가공("AI 빵집"). 사용자는 자기 도메인에 맞게 표현만 차용.

## 구성

- `bullet-examples.md` — bullet-text·bullet-detail 골드 예시 15개
- `svg-design-examples.md` — SVG 9 아키타입별 1개씩, 내용 맞춤 예시
- `demo-kit-example.md` — 실습 튜토리얼 골드 키트 (3단계 구조)

## 용도

lecture-writer·bullet-writer·svg-designer·demo-kit-builder가 **Few-shot 예시**로 의무 로드. 단, 토큰 절감 위해 구조 요약 JSON만 전달하는 O7 정책 준수 (전체 본문 그대로 주입 금지).

## 도메인 적응 (C9')

사용자 도메인이 빵집이 아니더라도:
- bullet 문자 수·이모지 사용·대비 구조는 동일 기준
- SVG 아키타입 분포·색상 팔레트 동일
- 출처 ID `[src:N]` 부착 밀도 동일

**도메인 특화 표현**(예: "빵집", "SNS")은 **치환 대상**. 에이전트가 첫 1강 작성 후 회의에서 자체 보정.

## 참조
- `samples/_gold-standard/structure/` — 구조 골드 (레이아웃·밀도)
- `.claude/rules/quality-method.md` K2 유사도 검증
