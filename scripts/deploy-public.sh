#!/bin/bash

# Скрипт для временного публичного деплоя
echo "🚀 Начинаем деплой..."

# Сборка проекта
npm run build

# Временно делаем репозиторий публичным (через GitHub CLI)
gh repo edit --visibility public

# Деплоим
npm run deploy

# Возвращаем приватность
gh repo edit --visibility private

echo "✅ Деплой завершен! Репозиторий снова приватный."