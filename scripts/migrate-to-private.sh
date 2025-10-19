#!/bin/bash

# Скрипт для переноса истории в приватный репозиторий
echo "🚀 Начинаем перенос истории в приватный репозиторий..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корня проекта kanban_react"
    exit 1
fi

# Создаем временную папку для клонирования
TEMP_DIR="temp-migration-$(date +%s)"
mkdir "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📦 Клонируем текущий репозиторий с полной историей..."
git clone --mirror https://github.com/8Lou/kanban_react.git kanban-mirror

cd kanban-mirror

echo "🔄 Настраиваем новый remote для приватного репозитория..."
git remote set-url origin https://github.com/8Lou/kanban-react-private.git

echo "⬆️ Пушим всю историю в приватный репозиторий..."
git push --mirror

cd ../../
rm -rf "$TEMP_DIR"

echo "✅ Перенос завершен!"
echo "🔍 Проверьте приватный репозиторий: https://github.com/8Lou/kanban-react-private"
echo "📋 Убедитесь, что вся история коммитов перенеслась"