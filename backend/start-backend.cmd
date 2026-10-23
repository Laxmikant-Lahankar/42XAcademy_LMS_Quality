@echo off
rem Starts the 42X LMS backend on http://localhost:8080/api
rem Uses a JDK 21 from %USERPROFILE%\.jdks if one is there (the system Java may be older).

for /d %%D in ("%USERPROFILE%\.jdks\jdk-21*") do set "JAVA_HOME=%%D"

if not defined JAVA_HOME (
  echo JAVA_HOME is not set. Install JDK 21 or set JAVA_HOME to a JDK 21 folder.
  pause
  exit /b 1
)

echo Using Java from %JAVA_HOME%
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause
