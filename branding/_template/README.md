# Branding Template

신규 오디언스(예: `b2b-saas`, `kids-coding`)를 추가할 때 이 폴더를 통째로 복사해서 사용.

## 절차
1. `cp -r branding/_template branding/<your-audience>`
2. `tone-guide.md`의 R1~R7 규칙을 오디언스에 맞게 수정
3. `glossary.md`의 금지어·권장어·외래어 표기 채우기
4. `persona.md`에 페르소나 4개 슬롯 (나이대·사전지식·동기·환경) 작성
5. `.claude/rules/audience-profiles.md`의 매트릭스에 새 오디언스 등록

## 필수 파일
- `tone-guide.md` — 어조·금지/권장 표현·문장 길이
- `glossary.md` — 용어 사전
- `persona.md` — 4개 페르소나 슬롯
- `README.md` — 이 오디언스 요약
