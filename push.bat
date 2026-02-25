@echo off
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