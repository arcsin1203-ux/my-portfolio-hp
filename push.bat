@echo off
cd /d %~dp0

git status -s > tmp_status.txt
for %%A in (tmp_status.txt) do if %%~zA==0 (
    echo 変更がありません
    del tmp_status.txt
    pause
    exit /b 0
)

echo === 変更されたファイル ===
git status -s
del tmp_status.txt
echo.

:RETRY
set /p COMMENT=コミットメッセージを入力してください: 
echo.
echo 入力されたメッセージ: "%COMMENT%"
set /p CONFIRM=このメッセージでよろしいですか？ (y/n): 

if /i "%CONFIRM%"=="y" (
    git add .
    git commit -m "%COMMENT%"
    git push
) else (
    echo メッセージを再入力してください。
    echo.
    goto RETRY
)