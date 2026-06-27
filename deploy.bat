@echo off
chcp 65001 >nul
title 大学生成长职途助手 - 一键部署

echo ================================================
echo   大学生成长职途助手 - 一键部署脚本
echo ================================================
echo.

:: 检查Node.js
echo [1/5] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js (>=18.0.0)
    echo        下载地址: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=1-3 delims=." %%a in ('node --version') do (
    set NODE_MAJOR=%%a
)
set NODE_MAJOR=%NODE_MAJOR:v=%
if %NODE_MAJOR% lss 18 (
    echo [错误] Node.js版本过低，请升级至18.0.0以上
    pause
    exit /b 1
)
echo [OK] Node.js版本: %NODE_MAJOR%.x.x

:: 检查Python
echo.
echo [2/5] 检查Python环境...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python
    echo        下载地址: https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python已安装

:: 安装后端依赖
echo.
echo [3/5] 安装后端依赖...
cd backend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo [错误] 后端依赖安装失败
        pause
        exit /b 1
    )
    echo [OK] 后端依赖安装完成
) else (
    echo [OK] 后端依赖已存在
)

:: 初始化数据库
echo.
echo [4/5] 初始化数据库...
node init-db.js
if %errorlevel% neq 0 (
    echo [错误] 数据库初始化失败
    pause
    exit /b 1
)
echo [OK] 数据库初始化完成

:: 启动服务
echo.
echo [5/5] 启动服务...
echo.
echo ================================================
echo   服务启动中，请稍候...
echo ================================================
echo.
echo 后端服务: http://localhost:3001
echo 前端页面: http://localhost:8080/index.html
echo.

:: 启动后端
start "后端服务" cmd /k "cd %cd% && npm start"

:: 返回上级目录并启动前端
cd ..
start "前端服务" cmd /k "cd %cd% && python -m http.server 8080"

echo.
echo ================================================
echo   服务已启动！
echo.
echo   后端API: http://localhost:3001
echo   前端页面: http://localhost:8080/index.html
echo.
echo   测试账号:
echo   - 用户名: 13900139999
echo   - 密码: 123456
echo ================================================
pause