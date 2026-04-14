# Sample · Mode 1 (참고자료 + 기획서)

가상 도메인 "AI 빵집 마케팅 풀코스" 샘플.

## 용도

처음 `/produce-lecture`를 쓰는 사용자가 **어떤 input 파일을 준비해야 하는지** 즉시 이해하도록 설계된 reference 세트.

## 포함 파일

```
samples/mode-1-references/
├── README.md                              # 이 파일
├── input/
│   ├── brief/
│   │   └── lecture-brief.md               # 강의 기획서 (빵집 AI 마케팅)
│   ├── mode-1-references/
│   │   └── reference-list.md              # 참고 사이트·도구 리스트
│   └── materials/
│       └── README.md                      # 이미지·데이터 placeholder
└── expected-output/
    ├── _meta.json                         # 생성될 메타 예시
    ├── script_parts/ACT1/part-01.md       # 1강 스크립트 샘플 (첫 300자)
    └── ppt-skeleton.html                  # PPT 1강 스켈레톤 마크업
```

## 사용 방법

1. `cp -r samples/mode-1-references/input/* input/`
2. `/produce-lecture --slug ai-bakery-course`
3. 휴먼인루프 3게이트에서 승인 → 최종 산출물은 `output/ai-bakery-course/`

## 주의
- 실제 실행 시 WebSearch로 최신 정보 자동 수집
- 빵집은 가공의 도메인이며 저작권·PII 없음
- 첫 실행 시 예상 소요: 15~30분 (Opus 기준)
