@echo off
echo Запускаем Editor Studio...
echo Браузер откроется автоматически!
echo (Не закрывайте это окно, пока хотите использовать редактор)

:: Проверяем, установлены ли зависимости
if not exist "node_modules\" (
    echo Устанавливаем зависимости...
    call npm install
)

:: Запускаем сервер
call npm run dev
