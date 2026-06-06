#!/bin/zsh
cd "$(dirname "$0")" || exit 1
npm run export
echo ""
echo "按任意键关闭..."
read -n 1
