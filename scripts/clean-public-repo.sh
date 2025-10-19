#!/bin/bash

# ВНИМАНИЕ: Этот скрипт удалит весь исходный код из текущего репозитория!
# Запускать ТОЛЬКО после подтверждения успешного переноса в приватный репо!

echo "⚠️  ВНИМАНИЕ: Этот скрипт удалит исходный код из публичного репозитория!"
echo "🔍 Убедитесь, что приватный репозиторий kanban-react-private содержит всю историю"
echo ""
read -p "Продолжить? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Операция отменена"
    exit 1
fi

echo "🧹 Очищаем публичный репозиторий от исходного кода..."

# Создаем новую ветку orphan для очистки
git checkout --orphan temp-clean

# Удаляем все файлы кроме .git
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

# Создаем README для публичного репо
cat > README.md << 'EOF'
# Kanban Board ТОС - Deployed Site

🚀 **Live Demo:** https://8lou.github.io/kanban_react/

This repository contains only the deployed version of the Kanban Board application.

## About

Intelligent Kanban board implementing Theory of Constraints (TOC) principles for maximizing throughput and eliminating multitasking.

## Source Code

The source code is maintained in a private repository for security reasons.

## Features

- ✅ Constraint identification (Drum & Rope)
- ✅ Full-kit gates with validation
- ✅ Flow buffer with indicators
- ✅ 50% time estimates enforcement
- ✅ Automatic prioritization
- ✅ Buffer status reports
- ✅ Standardization templates

---

**Developed using Theory of Constraints principles for maximum throughput and waste elimination.**
EOF

# Коммитим изменения
git add README.md
git commit -m "Convert to deployment-only repository"

# Заменяем main ветку
git branch -D main 2>/dev/null || true
git branch -m main

# Пушим изменения
git push -f origin main

echo "✅ Публичный репозиторий очищен и готов только для деплоя"
echo "🔗 Исходный код теперь в: https://github.com/8Lou/kanban-react-private"