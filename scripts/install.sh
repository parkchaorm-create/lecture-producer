#!/usr/bin/env bash
# lecture-producer · macOS / Linux 원클릭 설치
# 사용: curl -fsSL https://raw.githubusercontent.com/parkchaorm-create/lecture-producer/master/scripts/install.sh | bash

set -e

YEL='\033[1;33m'; GRN='\033[0;32m'; RED='\033[0;31m'; CYA='\033[0;36m'; DIM='\033[2m'; RST='\033[0m'

echo ""
echo -e "${YEL}🎓 lecture-producer 원클릭 설치${RST}"
echo -e "${DIM}─────────────────────────────────────────────────────${RST}"

# 1. 사전 조건
echo ""
echo -e "${CYA}[1/4] 사전 조건 확인...${RST}"
ok=1
if command -v node >/dev/null 2>&1; then
  echo -e "  ${GRN}✓ Node.js $(node --version)${RST}"
else
  echo -e "  ${RED}✗ Node.js 없음${RST} · https://nodejs.org"
  ok=0
fi
if command -v git >/dev/null 2>&1; then
  echo -e "  ${GRN}✓ $(git --version)${RST}"
else
  echo -e "  ${RED}✗ Git 없음${RST} · https://git-scm.com"
  ok=0
fi
if [ $ok -eq 0 ]; then
  echo -e "\n${YEL}사전 조건을 먼저 설치 후 다시 실행하세요.${RST}"
  exit 1
fi

# 2. 설치 위치
echo ""
echo -e "${CYA}[2/4] 설치 위치 선택...${RST}"
default_dir="$HOME/lecture-producer"
if [ -t 0 ]; then
  read -p "  설치 폴더 [$default_dir]: " dir
else
  dir=""
fi
dir=${dir:-$default_dir}
if [ -d "$dir" ]; then
  if [ -t 0 ]; then
    read -p "  이미 존재 · 덮어쓸까요? (y/N): " overwrite
  else
    overwrite="n"
  fi
  if [ "$overwrite" != "y" ]; then
    echo -e "${YEL}취소됨.${RST}"; exit 0
  fi
  rm -rf "$dir"
fi

# 3. Git clone
echo ""
echo -e "${CYA}[3/4] 저장소 복제...${RST}"
git clone https://github.com/parkchaorm-create/lecture-producer.git "$dir"
if [ ! -f "$dir/package.json" ]; then
  echo -e "  ${RED}✗ 복제 실패${RST}"; exit 1
fi

# 4. dashboard.sh 생성
echo ""
echo -e "${CYA}[4/4] 편의 스크립트 생성...${RST}"
cat > "$dir/dashboard.sh" <<'EOF'
#!/usr/bin/env bash
cd "$(dirname "$0")"
URL="http://127.0.0.1:3737"
if [ "$(uname)" = "Darwin" ]; then
  (sleep 1; open "$URL") &
elif command -v xdg-open >/dev/null 2>&1; then
  (sleep 1; xdg-open "$URL") &
fi
exec node dashboard/server.mjs
EOF
chmod +x "$dir/dashboard.sh"
echo -e "  ${GRN}✓ dashboard.sh 생성${RST}"

# 완료 안내
echo ""
echo -e "${GRN}✅ 설치 완료!${RST}"
echo -e "${DIM}─────────────────────────────────────────────────────${RST}"
echo -e "📁 프로젝트 폴더: ${dir}"
echo ""
echo -e "🚀 ${YEL}실행 방법 (택 1):${RST}"
echo -e "   A. cd \"$dir\" && ./dashboard.sh"
echo -e "   B. cd \"$dir\" && npm run dashboard"
echo ""
echo -e "🌐 접속 주소: ${CYA}http://127.0.0.1:3737${RST}"
echo -e "${DIM}📖 사용법: README.md 또는 dashboard/README.md 참고${RST}"
echo ""
