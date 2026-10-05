@echo off
REM ============================================================
REM  Local preview server for the AumNamah website.
REM  Double-click this file to start testing.
REM
REM  IMPORTANT: always start the server this way (with router.php).
REM  Running plain "php -S localhost:8000" will NOT work - the
REM  /blog pretty URLs will fall back to showing the homepage.
REM ============================================================

cd /d "%~dp0"

echo.
echo  Starting local server...
echo.
echo    Homepage : http://localhost:8000/
echo    Blog     : http://localhost:8000/blog
echo    Admin    : http://localhost:8000/Admin-Login.html
echo.
echo  Press Ctrl+C to stop.
echo.

php -S localhost:8000 router.php
