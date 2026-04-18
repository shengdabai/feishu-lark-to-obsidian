#!/bin/zsh
cd "/Users/adam/Desktop/Feishu To Obsidian" || exit 1
npm run export
echo ""
echo "按任意键关闭..."
read -n 1
