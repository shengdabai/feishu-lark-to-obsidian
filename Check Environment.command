#!/bin/zsh
cd "$(dirname "$0")" || exit 1
node src/index.mjs --check
echo ""
echo "按任意键关闭..."
read -n 1
