@echo off
chcp 65001 > nul
title გადაარჩინე ჭიამაია - Save the Ladybug
echo ======================================================
echo   🐞 გადაარჩინე ჭიამაია (Save the Ladybug)
echo   ბრაუზერში გაშვება...
echo ======================================================

REM პირდაპირ ბრაუზერში გახსნა:
start "" "index.html"

REM თუ Node.js დაყენებულია, შესაძლებელია ლოკალური სერვერის გაშვებაც:
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js ნაპოვნია. ეშვება ლოკალური სერვერი: http://localhost:3000
    node server.js
) else (
    echo თამაში გაიხსნა თქვენს ნაგულისხმევ ბრაუზერში.
    pause
)
