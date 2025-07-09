виртуальный музей

как запустить:
1. npm install
2. npm run dev (или npm run build на прод)

3d сцена на three.js, можно ходить wasd, мышкой крутить, кликать по экспонатам чтобы описание появлялось

модели лежат в public/models, не все используются, можно свои добавить если надо

файлы в src/core:
VirtualMuseum.ts — тут всё собирается, главный класс
PlayerController.ts — управление камерой, ходьба
Exhibit.ts — отдельный экспонат
ExhibitManager.ts — добавляет/удаляет экспонаты
LightingSystem.ts — свет
UIManager.ts — показывает описание и подсказки
InteractionHandler.ts — клики мышкой, выбор экспоната
ModelLoader.ts — грузит glb модели

технологии:
three.js — для 3d графики
vite — чтобы быстро запускать и собирать проект
typescript — типы
html/css — просто страница и стили
npm — чтобы ставить зависимости и запускать скрипты




