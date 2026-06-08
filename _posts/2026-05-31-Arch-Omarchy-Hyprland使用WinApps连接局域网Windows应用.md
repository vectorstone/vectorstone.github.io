---
layout: post
title: Arch Omarchy Hyprland 使用 WinApps 连接局域网 Windows 应用
subtitle: 在 Linux 桌面中启动局域网 Windows Professional 上的应用
date: 2026-05-31
author: Gavin
header-img: img/post-bg-art.jpg
catalog: true
tags:
  - Arch Linux
  - Omarchy
  - Hyprland
  - WinApps
  - FreeRDP
  - Windows
  - RemoteApp
---

# 背景

我现在的主力桌面是 Arch Linux + Omarchy + Hyprland，但是局域网里面还有一台 Windows Professional 设备，有些应用还是只能在 Windows 里面跑。

我的目标不是用 Wine 在 Linux 本地运行 Windows 程序，而是希望在 Linux 桌面上像启动本地应用一样打开 Windows 机器里的程序窗口。

这次用到的是这个项目：

[winapps-org/winapps](https://github.com/winapps-org/winapps)

WinApps 的核心思路是：

```text
Linux 桌面入口 / .desktop
        ↓
WinApps 脚本
        ↓
FreeRDP
        ↓
局域网 Windows Professional 的 RDP / RemoteApp
        ↓
Windows 应用窗口显示在 Linux 桌面上
```

所以它本质上是远程桌面/RemoteApp 方案，不是 Wine，也不是把 exe 复制到 Linux 上执行。

# 当前环境

这篇文章记录的是我当前设备上实际跑通的配置。其他人想 1:1 复现，环境差异越小越好。

## Linux 设备

```text
发行版: Arch Linux rolling
内核: Linux omarchy 7.0.9-arch2-1
桌面环境: Omarchy
窗口管理器: Hyprland
Hyprland 版本: 0.55.2
会话类型: Wayland
XDG_SESSION_TYPE=wayland
XDG_CURRENT_DESKTOP=Hyprland
DESKTOP_SESSION=omarchy
WAYLAND_DISPLAY=wayland-1
DISPLAY=:0
```

Hyprland 版本信息：

```text
Hyprland 0.55.2
commit: 39d7e209c79d451efab1b21151d5938289da838d
```

## Windows 设备

```text
系统版本: Windows Professional
网络位置: 同一局域网
局域网 IP: 192.168.6.105
RDP 端口: 3389
```

注意：Windows Home 版不适合这个方案，因为它默认不提供完整的 Remote Desktop Host 能力。Windows Professional 是符合要求的。

## WinApps / FreeRDP

```text
WinApps 安装方式: user install
WinApps backend: manual
FreeRDP: 3.26.0
FreeRDP 路径: /usr/bin/xfreerdp3
netcat: GNU netcat 0.7.1
netcat 路径: /home/linuxbrew/.linuxbrew/bin/nc
dialog: 1.3-20260107
```

我这里因为 `sudo pacman` 需要交互密码，所以最后使用 Linuxbrew 安装缺失依赖。

# 依赖安装

WinApps README 里面给 Arch 的依赖安装方式大概是：

```bash
sudo pacman -Syu --needed curl dialog freerdp git iproute2 libnotify openbsd-netcat
```

我当前机器上系统已经有：

```text
curl 8.20.0-7
git 2.54.0-1
iproute2 7.0.0-1
libnotify 0.8.8-1
```

缺的是：

```text
dialog
freerdp
openbsd-netcat / netcat
```

因为不想在这次操作里处理 sudo 交互，所以我用了 Homebrew：

```bash
brew install freerdp netcat dialog
```

安装后验证：

```bash
xfreerdp --version
# This is FreeRDP version 3.26.0

nc -h
# GNU netcat 0.7.1

dialog --version
# Version: 1.3-20260107
```

# Windows 侧准备

Windows 机器需要先做这些事：

1. 确认系统是 Windows Professional。
2. 打开「远程桌面」。
3. 防火墙允许 Remote Desktop / TCP 3389。
4. 登录账号必须有真实密码，不能只用 Windows Hello PIN。
5. 运行 WinApps 的 Windows 侧注册表和脚本。

我从 WinApps 仓库里准备了这些文件：

```text
RDPApps.reg
install.bat
TimeSync.ps1
NetProfileCleanup.ps1
```

放在 Linux 本地的目录是：

```bash
~/Downloads/winapps-windows-setup/
```

然后把这个目录复制到 Windows 机器上，在 Windows 里右键：

```text
install.bat → 以管理员身份运行
```

运行完成后重启 Windows。

注意：manual / 局域网已有 Windows 机器的方式不需要 `Container.reg`，那个是 Docker / Podman 后端用的。

# Linux 侧安装 WinApps

我把项目克隆到了：

```bash
~/src/winapps
```

也就是：

```bash
git clone https://github.com/winapps-org/winapps.git ~/src/winapps
```

配置目录：

```bash
mkdir -p ~/.config/winapps
```

我没有把密码直接写在 `winapps.conf` 里，而是使用 `RDP_ASKPASS` 从单独文件读取密码。

密码文件：

```bash
~/.config/winapps/rdp-password
```

权限：

```bash
chmod 600 ~/.config/winapps/rdp-password
```

# 最终可用的 WinApps 配置

配置文件路径：

```bash
~/.config/winapps/winapps.conf
```

我的最终配置如下，用户名和密码请换成自己的：

```ini
RDP_USER="你的 Windows 用户名"
RDP_PASS=""
RDP_ASKPASS="bash -c 'cat ~/.config/winapps/rdp-password'"
RDP_DOMAIN=""
RDP_IP="192.168.6.105"
RDP_PORT="3389"

WAFLAVOR="manual"
RDP_SCALE="100"

RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
RDP_FLAGS_NON_WINDOWS=""
RDP_FLAGS_WINDOWS=""

DEBUG="true"
AUTOPAUSE="off"
AUTOPAUSE_TIME="300"

FREERDP_COMMAND="/usr/bin/xfreerdp3"

PORT_TIMEOUT="5"
RDP_TIMEOUT="30"
APP_SCAN_TIMEOUT="60"
BOOT_TIMEOUT="120"

HIDEF="on"
REMOVABLE_MEDIA="/run/media"
```

配置文件权限：

```bash
chmod 600 ~/.config/winapps/winapps.conf
```

这里几个关键点：

- `WAFLAVOR="manual"`：表示使用已有的局域网 Windows RDP server。
- `RDP_IP="192.168.6.105"`：这是我的 Windows 机器 IP。
- `FREERDP_COMMAND` 强制指定 `xfreerdp`，原因后面会说。
- `+home-drive`：把 Linux 的 home 目录映射到 Windows 里的 `\\tsclient\home`。
- `/kbd:remap:0x1d=0x38,remap:0x38=0x1d`：用于处理我在 Omarchy 里交换左 Ctrl / 左 Alt 的问题。

# 安装和启动

先测试 RDP 端口：

```bash
nc -z -w 5 192.168.6.105 3389
```

如果没有报错，说明端口能通。

测试完整 RDP：

```bash
xfreerdp /u:"你的 Windows 用户名" /v:192.168.6.105:3389 /cert:tofu
```

然后运行 WinApps 安装：

```bash
cd ~/src/winapps
bash ./setup.sh --user
```

安装成功后可以启动完整 Windows 桌面：

```bash
winapps windows
```

启动资源管理器：

```bash
winapps explorer
```

手动启动任意 exe：

```bash
winapps manual "C:\Windows\System32\notepad.exe"
```

# 问题 1：EXISTING 'USER' WINAPPS INSTALLATION

## 现象

执行：

```bash
winapps-install-user
```

出现：

```text
ERROR: EXISTING 'USER' WINAPPS INSTALLATION.
A previous WinApps installation was detected for the current user.
Please remove the existing WinApps installation using winapps-setup --user --uninstall.
```

## 原因

WinApps 安装器会检查这些路径：

```bash
~/.local/bin/winapps
~/.local/bin/winapps-src
```

我一开始为了方便，提前创建了：

```bash
~/.local/bin/winapps
~/.local/bin/winapps-setup
```

这两个 symlink 触发了安装器的已有安装检测。

## 解决办法

删除提前创建的 symlink 和失败安装留下的源码目录：

```bash
rm ~/.local/bin/winapps
rm ~/.local/bin/winapps-setup
rm -rf ~/.local/bin/winapps-src
```

然后重新安装：

```bash
cd ~/src/winapps
bash ./setup.sh --user
```

# 问题 2：RDP 端口明明开着，但安装器报 NETWORK CONFIGURATION ERROR

## 现象

独立测试端口是通的：

```bash
nc -z -w 5 192.168.6.105 3389
# OK
```

但 WinApps 安装器里报：

```text
ERROR: NETWORK CONFIGURATION ERROR.
Failed to establish a connection with Windows at '192.168.6.105:3389'.
```

## 原因

WinApps 里面的检查逻辑是：

```bash
timeout "$PORT_TIMEOUT" nc -z "$RDP_IP" "$RDP_PORT"
```

我这里用的是 Homebrew 安装的 GNU netcat：

```text
GNU netcat 0.7.1
```

这个版本在执行：

```bash
nc -z 192.168.6.105 3389
```

时可能会一直等待远端关闭连接，导致外层 `timeout` 判定失败。

但是加上 `-w` 就正常：

```bash
nc -z -w 5 192.168.6.105 3389
```

## 解决办法

我做了一个 WinApps 专用 `nc` 兼容包装器：

```bash
mkdir -p ~/.local/lib/winapps-compat
```

```bash
cat > ~/.local/lib/winapps-compat/nc <<'EOS'
#!/usr/bin/env bash
real_nc="/home/linuxbrew/.linuxbrew/bin/nc"

if [[ "$#" -ge 3 && "$1" == "-z" ]]; then
  shift
  if [[ "${1:-}" == "-w" && "$#" -ge 4 ]]; then
    shift 2
  elif [[ "${1:-}" == -w* && "$#" -ge 3 ]]; then
    shift
  fi

  host="${1:-}"
  port="${2:-}"

  if [[ -n "$host" && -n "$port" ]]; then
    exec bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$host" "$port"
  fi
fi

exec "$real_nc" "$@"
EOS
```

```bash
chmod +x ~/.local/lib/winapps-compat/nc
```

然后把已安装 WinApps 副本里的端口检查从：

```bash
timeout 10 nc -z "$RDP_IP" "$RDP_PORT"
```

改成：

```bash
timeout 10 "$HOME/.local/lib/winapps-compat/nc" -z "$RDP_IP" "$RDP_PORT"
```

对应文件：

```bash
~/.local/bin/winapps-src/bin/winapps
~/.local/bin/winapps-src/setup.sh
```

注意：这个是针对我当前 Homebrew GNU netcat 的兼容修复。如果你直接用 Arch 的 `openbsd-netcat`，可能不需要这个 patch。

# 问题 3：Backspace 在 Windows 窗口里不生效

## 现象

Windows 窗口可以打开，但是部分键盘输入不正常，例如 Backspace 没反应。

## 原因

我一开始在 `RDP_FLAGS` 里加过：

```ini
/kbd:unicode
```

这个参数对中文/非英文输入可能有帮助，但在我的 FreeRDP + Hyprland + WinApps 组合里，它会影响 Backspace 这类控制键。

## 解决办法

从 `RDP_FLAGS` 里移除：

```ini
/kbd:unicode
```

也就是不要写成：

```ini
RDP_FLAGS="/cert:tofu /sound /microphone +home-drive /kbd:unicode"
```

而是先保持：

```ini
RDP_FLAGS="/cert:tofu /sound /microphone +home-drive"
```

修改后杀掉旧的 RDP 会话：

```bash
winapps killrdp
```

再重新启动：

```bash
winapps windows
```

# 问题 4：Omarchy 里交换了 Alt/Ctrl，但 Windows 窗口里不生效

## 现象

我的 Omarchy / Hyprland 配置里有：

```ini
kb_layout = us
kb_options = compose:caps,ctrl:swap_lalt_lctl
```

也就是本机把左 Alt 和左 Ctrl 交换了。

但是在 WinApps 打开的 Windows 窗口里，这个交换没有按预期生效。

## 原因

Hyprland 的 `kb_options` 是本地 XKB 层的映射，而 FreeRDP 会把键盘事件转换成 RDP scancode / Windows 虚拟键再传给远端 Windows。

所以本机的 XKB modifier 交换不一定会完整传递到 Windows。

FreeRDP 里左 Ctrl / 左 Alt 对应的 scancode 是：

```text
0x1d -> Left Ctrl
0x38 -> Left Alt
```

## 解决办法

在 FreeRDP 层再做一次 remap：

```ini
/kbd:remap:0x1d=0x38,remap:0x38=0x1d
```

最终写进 `RDP_FLAGS`：

```ini
RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
```

注意这里要使用短 scancode：

```text
0x1d
0x38
```

不要写成长 scancode：

```text
0x001d
0x0038
```

后面这个会导致 FreeRDP 参数解析失败。

# 问题 5：只弹出 Using default removeable media path: /run/media，但窗口不出现

## 现象

启动：

```bash
winapps windows
```

没有打开窗口，只看到一条通知：

```text
Using default removeable media path: /run/media
```

## 原因

这条通知本身不是错误，它只是 WinApps 告诉你默认使用了：

```bash
/run/media
```

真正的问题在后面。

我当时有两个叠加问题。

第一个是我把 `FREERDP_COMMAND` 清空了：

```ini
FREERDP_COMMAND=""
```

WinApps 在 Wayland 下会自动优先选择：

```bash
sdl-freerdp
```

但是在我的环境里，`sdl-freerdp` 启动后马上退出，没有正常显示窗口。

第二个是键盘 remap 写成了 FreeRDP 不接受的形式：

```ini
/kbd:remap:0x001d=0x0038,remap:0x0038=0x001d
```

FreeRDP 报错：

```text
Command line parsing failed at 'kbd'
```

## 解决办法

强制使用已验证可用的 `xfreerdp`：

```ini
FREERDP_COMMAND="/usr/bin/xfreerdp3"
```

并把 remap 改成短 scancode：

```ini
RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
```

为了不再看到默认 removable media 的提示，也可以显式写上：

```ini
REMOVABLE_MEDIA="/run/media"
```


# 附录：Windows 侧脚本、SCP 传输命令和本机辅助脚本

前面主流程已经能跑通。为了方便别人完全复现，这里把本次实际用到但前文没有完整展开的脚本和配置集中贴出来。所有密码、用户名都保留为占位符或示例，不要把自己的真实密码写进博客或仓库。

## 用 SCP 把 Windows 侧配置包传到 Windows

我的 Linux 主机局域网 IP 是：

```text
192.168.6.184
```

Windows 主机局域网 IP 是：

```text
192.168.6.105
```

### 方式 1：在 Windows PowerShell 里从 Linux 拉取

这个方式更符合“把 Linux 上的目录下载到 Windows 中”。前提是 Linux 机器开启了 SSH 服务，并且 Windows 自带的 OpenSSH Client 可用。

在 Windows PowerShell 中执行：

```powershell
scp -r gavin@192.168.6.184:/home/gavin/Downloads/winapps-windows-setup "$env:USERPROFILE\Downloads"
```

拉取完成后，在 Windows 里进入：

```powershell
cd "$env:USERPROFILE\Downloads\winapps-windows-setup"
```

然后右键 `install.bat`，选择“以管理员身份运行”。

### 方式 2：在 Linux 里推送到 Windows

这个方式要求 Windows 启用 OpenSSH Server，并允许 SSH 登录。

```bash
scp -r ~/Downloads/winapps-windows-setup "WindowsUser@192.168.6.105:C:/Users/WindowsUser/Downloads/"
```

把 `WindowsUser` 换成你的 Windows 用户名。如果使用微软账号登录 Windows，OpenSSH 用户名可能和显示名不完全一致，需要以 Windows 实际 SSH 登录用户名为准。

## Windows 侧配置包内容

本次目录是：

```bash
~/Downloads/winapps-windows-setup/
```

包含：

```text
README.txt
install.bat
RDPApps.reg
NetProfileCleanup.ps1
TimeSync.ps1
```

### ~/Downloads/winapps-windows-setup/README.txt

```text
WinApps Windows-side setup for an existing Windows Professional LAN machine

1. Enable Remote Desktop in Windows Settings.
2. Ensure Windows Firewall allows Remote Desktop TCP 3389.
3. Use a real Windows account password; RDP does not accept Windows Hello PIN-only login.
4. Copy this folder to the Windows machine.
5. Right-click install.bat and choose "Run as administrator".
6. Reboot Windows after the script completes.
7. On Arch, run: winapps-configure-local
8. Then run: winapps-test-rdp
9. If the full RDP session works, run: winapps-install-user

Do not use Container.reg for this LAN/manual setup.
```

### ~/Downloads/winapps-windows-setup/install.bat

```bat
@echo off
title WinApps Setup Wizard

:: Check for administrative privileges
fltmc >nul 2>&1 || (
    echo [INFO] Script not running as administrator. Attempting to relaunch with elevation...
    powershell -Command "Start-Process '%~f0' -Verb runAs"
    exit /b
)

echo ============================================
echo             WinApps Setup Wizard
echo ============================================
echo.
echo [INFO] Starting setup...

:: Apply RDP and system configuration tweaks
echo [INFO] Importing "RDPApps.reg"...
if exist "%~dp0RDPApps.reg" (
    reg import "%~dp0RDPApps.reg" >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] Imported "RDPApps.reg".
    ) else (
        echo [ERROR] Failed to import "RDPApps.reg".
    )
) else (
    echo [ERROR] "RDPApps.reg" not found. Skipping...
)

:: Allow Remote Desktop connections through the firewall
echo [INFO] Allowing Remote Desktop connections through the firewall...
powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass ^
  -Command "if (Get-Command Enable-NetFirewallRule -ErrorAction SilentlyContinue) { try { Enable-NetFirewallRule -DisplayGroup 'Remote Desktop' -ErrorAction Stop; exit 0 } catch { exit 1 } } else { exit 2 }" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Firewall changes applied successfully.
) else (
    :: Fallback to using 'netsh' to make the firewall modification
    netsh advfirewall firewall set rule group="remote desktop" new enable=Yes >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] Firewall changes applied successfully.
    ) else (
        echo [ERROR] Failed to apply firewall changes.
        echo         Please manually enable Remote Desktop via 'Settings --> System --> Remote Desktop'.
    )
)

:: Configure the system clock to use UTC instead of local time
if exist "%~dp0Container.reg" (
    echo [INFO] Importing "Container.reg"...
    reg import "%~dp0Container.reg" >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] Imported "Container.reg".
    ) else (
        echo [ERROR] Failed to import "Container.reg".
    )
) else (
    echo [WARNING] "Container.reg" not found. Skipping...
)

:: Create a startup task to clean up stale network profiles
echo [INFO] Creating network profile cleanup task...

:: Initialise values required to create the startup task
set "scriptpath=%windir%\NetProfileCleanup.ps1"
set "taskname=WinApps_NetworkProfileCleanup"
set "command=powershell.exe -ExecutionPolicy Bypass -File ""%scriptpath%"""

:: Copy the script to the Windows directory
copy /Y "%~dp0NetProfileCleanup.ps1" "%scriptpath%" >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to copy "NetProfileCleanup.ps1" to "%windir%".
) else (
    schtasks /create /tn "%taskname%" /tr "%command%" /sc onstart /ru "SYSTEM" /rl HIGHEST /f >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] Created scheduled task "%taskname%".
    ) else (
        echo [ERROR] Failed to create scheduled task "%taskname%".
    )
)

REM Create time sync task to be run by the user at login
copy %~dp0\TimeSync.ps1 %windir%
set "taskname2=TimeSync"
set "command2=powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File \"%windir%\TimeSync.ps1\""

schtasks /query /tn "%taskname2%" >nul
if %ERRORLEVEL% equ 0 (
    echo %DATE% %TIME% Task "%taskname2%" already exists, skipping creation.
) else (
    schtasks /create /tn "%taskname2%" /tr "%command2%" /sc onlogon /rl HIGHEST /f
    if %ERRORLEVEL% equ 0 (
        echo %DATE% %TIME% Scheduled task "%taskname2%" created successfully.
    ) else (
        echo %DATE% %TIME% Failed to create scheduled task %taskname2%.
    )
)
```

### ~/Downloads/winapps-windows-setup/RDPApps.reg

```reg
Windows Registry Editor Version 5.00

    ; Enable Remote Desktop
    ; NOTE: The relevant firewall rule must be added separately with either:
    ;   Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
    ;   or
    ;   netsh advfirewall firewall set rule group="remote desktop" new enable=Yes
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server]
    "fDenyTSConnections"=dword:00000000

    ; Require Network Level Authentication (NLA) for Remote Desktop
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp]
    "UserAuthentication"=dword:00000001

    ; Disable RemoteApp allowlist so all applications can be used in Remote Desktop sessions
    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Terminal Server\TSAppAllowList]
    "fDisabledAllowList"=dword:00000001

    ; Allow unlisted programs to be run in Remote Desktop sessions
    [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services]
    "fAllowUnlistedRemotePrograms"=dword:00000001

    ; Disable Windows 11 top-of-screen window snapping toolbar (snap bar)
    [HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced]
    "EnableSnapBar"=dword:00000000

    ; Disable automatic administrator logon at startup
    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]
    "AutoAdminLogon"="0"

    ; Always use the server's keyboard layout
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Keyboard Layout]
    "IgnoreRemoteKeyboardLayout"=dword:00000001

    ; Disable "Do you want your PC to be discoverable" prompt after each host system reboot
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Network\NewNetworkWindowOff]
```

### ~/Downloads/winapps-windows-setup/NetProfileCleanup.ps1

```powershell
# Get the current network profile name
$currentProfile = (Get-NetConnectionProfile).Name

# Get all profiles from the registry
$profilesKey = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\NetworkList\Profiles"
$profiles = Get-ChildItem -Path $profilesKey

foreach ($profile in $profiles) {
    $profilePath = "$profilesKey\$($profile.PSChildName)"
    $profileName = (Get-ItemProperty -Path $profilePath).ProfileName

    # Remove profiles that don't match the current one
    if ($profileName -ne $currentProfile) {
        Remove-Item -Path $profilePath -Recurse
        Write-Host "Deleted profile: $profileName"
    }
}

# Change the current profile name to "WinApps"
$profiles = Get-ChildItem -Path $profilesKey
foreach ($profile in $profiles) {
    $profilePath = "$profilesKey\$($profile.PSChildName)"
    $profileName = (Get-ItemProperty -Path $profilePath).ProfileName

    if ($profileName -eq $currentProfile) {
        # Update the profile name
        Set-ItemProperty -Path $profilePath -Name "ProfileName" -Value "WinApps"
        Write-Host "Renamed profile to: WinApps"
    }
}
```

### ~/Downloads/winapps-windows-setup/TimeSync.ps1

```powershell
# Script to monitor if there is a sleep_marker created by WinApps (indicating the Linux host was suspended) in order to trigger a time sync as the time in the Windows VM will otherwise drift while Linux is suspended.

# Define the path to monitor. Make sure this matches the location for the sleep_marker in the Winapps script (need to match the APPDATA path).
$filePath = "\\tsclient\home\.local\share\winapps\sleep_marker"
$networkPath = "\\tsclient\home"

# Function to check and handle file
function Monitor-File {
    while ($true) {
        # Check if network location is available
        try {
            $null = Test-Path -Path $networkPath -ErrorAction Stop
            # Check if file exists
            if (Test-Path -Path $filePath) {
                # Run time resync silently
                w32tm /resync

                # Remove the file
                Remove-Item -Path $filePath -Force
            }
        }
        catch {
            # Network location not available, continue monitoring silently
        }

        # Wait 5 minutes before next check
        Start-Sleep -Seconds 3000
    }
}

# Start monitoring silently
Monitor-File
```


## Linux 侧辅助配置和脚本

下面这些是本次为了避免手动输入、避免暴露密码、规避 GNU netcat 行为差异而创建的辅助脚本。它们不是 WinApps 官方必须步骤，但如果想复现我当前机器的效果，可以照着建。

### ~/.config/winapps/winapps.conf.template

```ini
##################################
#   WINAPPS CONFIGURATION FILE   #
#   LAN Windows Pro / manual mode #
##################################

# Fill via: winapps-configure-local
RDP_USER="YOUR_WINDOWS_USERNAME"
RDP_PASS=""
RDP_ASKPASS="bash -c 'cat ~/.config/winapps/rdp-password'"
RDP_DOMAIN=""
RDP_IP="YOUR_WINDOWS_LAN_IP"
RDP_PORT="3389"

# Existing Windows machine on LAN.
WAFLAVOR="manual"

# Supported values: 100, 140, 180.
RDP_SCALE="100"

# /cert:tofu trusts first seen cert; +home-drive exposes Linux $HOME as \\tsclient\home.
# /kbd remap keeps left Ctrl/Alt behavior consistent with Omarchy ctrl:swap_lalt_lctl.
RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
RDP_FLAGS_NON_WINDOWS=""
RDP_FLAGS_WINDOWS=""

DEBUG="true"
AUTOPAUSE="off"
AUTOPAUSE_TIME="300"

# Arch pacman installed FreeRDP 3.26.0 on this machine.
FREERDP_COMMAND="/usr/bin/xfreerdp3"

PORT_TIMEOUT="5"
RDP_TIMEOUT="30"
APP_SCAN_TIMEOUT="60"
BOOT_TIMEOUT="120"

# If maximized RemoteApp windows are misaligned in Hyprland, change to "off".
HIDEF="on"

REMOVABLE_MEDIA="/run/media"
```

### ~/.local/bin/winapps-configure-local

```bash
#!/usr/bin/env bash
set -euo pipefail
CONFIG="$HOME/.config/winapps/winapps.conf"
PASSFILE="$HOME/.config/winapps/rdp-password"
TEMPLATE="$HOME/.config/winapps/winapps.conf.template"
mkdir -p "$HOME/.config/winapps"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Missing template: $TEMPLATE" >&2
  exit 1
fi
if [[ -f "$CONFIG" ]]; then
  cp -p "$CONFIG" "$CONFIG.bak.$(date +%Y%m%d-%H%M%S)"
  echo "Backed up existing config."
fi
read -r -p "Windows LAN IP: " ip
read -r -p "Windows username: " user
read -r -s -p "Windows password: " pass
echo
if [[ -z "$ip" || -z "$user" || -z "$pass" ]]; then
  echo "IP, username and password are required." >&2
  exit 2
fi
python3 - "$TEMPLATE" "$CONFIG" "$ip" "$user" <<'PY'
import pathlib, sys
src, dst, ip, user = map(str, sys.argv[1:])
text = pathlib.Path(src).read_text()
text = text.replace('YOUR_WINDOWS_LAN_IP', ip)
text = text.replace('YOUR_WINDOWS_USERNAME', user)
pathlib.Path(dst).write_text(text)
PY
printf '%s' "$pass" > "$PASSFILE"
chmod 600 "$CONFIG" "$PASSFILE"
echo "Wrote $CONFIG and password file with mode 600."
echo "Next: winapps-test-rdp"
```

### ~/.local/bin/winapps-test-rdp

```bash
#!/usr/bin/env bash
set -euo pipefail
CONFIG="$HOME/.config/winapps/winapps.conf"
if [[ ! -f "$CONFIG" ]]; then
  echo "Missing $CONFIG. Run: winapps-configure-local" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$CONFIG"
FREERDP="${FREERDP_COMMAND:-xfreerdp}"
if [[ ! -x "$FREERDP" ]] && ! command -v "$FREERDP" >/dev/null 2>&1; then
  echo "FreeRDP command not found: $FREERDP" >&2
  exit 2
fi
if [[ -z "${RDP_IP:-}" || -z "${RDP_USER:-}" ]]; then
  echo "RDP_IP and RDP_USER must be set in $CONFIG" >&2
  exit 3
fi
PORT="${RDP_PORT:-3389}"
echo "Checking TCP $RDP_IP:$PORT ..."
nc -z -w "${PORT_TIMEOUT:-5}" "$RDP_IP" "$PORT"
echo "Port open. Launching full RDP test. Close the Windows session window when done."
if [[ -n "${RDP_ASKPASS:-}" ]]; then
  export FREERDP_ASKPASS="$RDP_ASKPASS"
  exec $FREERDP /u:"$RDP_USER" /d:"${RDP_DOMAIN:-}" /v:"$RDP_IP:$PORT" /cert:tofu /scale:"${RDP_SCALE:-100}"
else
  exec $FREERDP /u:"$RDP_USER" /p:"$RDP_PASS" /d:"${RDP_DOMAIN:-}" /v:"$RDP_IP:$PORT" /cert:tofu /scale:"${RDP_SCALE:-100}"
fi
```

### ~/.local/bin/winapps-install-user

```bash
#!/usr/bin/env bash
set -euo pipefail
CONFIG="$HOME/.config/winapps/winapps.conf"
if [[ ! -f "$CONFIG" ]]; then
  echo "Missing $CONFIG. Run: winapps-configure-local" >&2
  exit 1
fi
export PATH="$HOME/.local/lib/winapps-compat:$PATH"
cd "$HOME/src/winapps"
exec bash ./setup.sh --user
```

### ~/.local/bin/winapps-add-apps

```bash
#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.local/lib/winapps-compat:$PATH"
cd "$HOME/src/winapps"
exec bash ./setup.sh --user --add-apps
```

### ~/.local/lib/winapps-compat/nc

```bash
#!/usr/bin/env bash
# Compatibility wrapper for winapps-org/winapps port checks.
# Handles: nc -z host port [or nc -z -w N host port] with quick connect semantics.
real_nc="/home/linuxbrew/.linuxbrew/bin/nc"
if [[ "$#" -ge 3 && "$1" == "-z" ]]; then
  shift
  if [[ "${1:-}" == "-w" && "$#" -ge 4 ]]; then
    shift 2
  elif [[ "${1:-}" == -w* && "$#" -ge 3 ]]; then
    shift
  fi
  host="${1:-}"
  port="${2:-}"
  if [[ -n "$host" && -n "$port" ]]; then
    exec bash -c 'exec 3<>"/dev/tcp/$1/$2"' _ "$host" "$port"
  fi
fi
exec "$real_nc" "$@"
```


## 还需要确认的配置是否都已经展示？

本次复现涉及的关键配置已经都在文中展示：

- Windows 侧：`install.bat`、`RDPApps.reg`、`NetProfileCleanup.ps1`、`TimeSync.ps1`。
- Linux 侧：`winapps.conf` 最终配置、`winapps.conf.template` 模板、RDP 密码文件路径、WinApps 辅助脚本、GNU netcat 兼容包装器。
- Hyprland 侧：当前只依赖已有的 `kb_options = compose:caps,ctrl:swap_lalt_lctl`，没有额外新增 Hyprland window rule。

唯一不应该展示的是实际 Windows 登录密码；文章中只保留了密码文件路径和读取方式。


# 问题 6：WinApps 里面没有声音

## 现象

Windows 窗口可以正常打开，键盘输入也已经修好，但是 WinApps / Windows 会话里播放视频或系统声音时，Linux 这边听不到声音。

当时的 WinApps 配置是：

```ini
FREERDP_COMMAND="/home/linuxbrew/.linuxbrew/bin/xfreerdp"
RDP_FLAGS="/cert:tofu /sound /microphone +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
```

## 排查过程

先确认 Linux 本机音频栈是正常的：

```bash
systemctl --user status pipewire pipewire-pulse wireplumber
pactl info
wpctl status
```

本机状态：

```text
pipewire.service active
pipewire-pulse.service active
wireplumber.service active
Server Name: PulseAudio (on PipeWire 1.6.5)
Default Sink: alsa_output.pci-0000_00_1f.3.analog-stereo
```

也就是说，Linux 桌面本身不是没有声音，PipeWire / PulseAudio 兼容层都在工作。

再看 FreeRDP 的音频支持：

```bash
xfreerdp /help | grep -i -E 'sound|audio|alsa|pulse'
```

Homebrew 版 FreeRDP 显示可用的音频输出主要是：

```text
Audio Output Redirection: /sound:sys:oss,dev:1,format:1
Audio Output Redirection: /sound:sys:alsa
```

安装时的 FreeRDP 日志里也能看到它加载过 ALSA 后端：

```text
Loaded alsa backend for rdpsnd
Loading Dynamic Virtual Channel rdpsnd
```

但是关键问题在这里：

```bash
ldd /home/linuxbrew/.linuxbrew/bin/xfreerdp | grep -i -E 'asound|pulse|pipewire'
```

Homebrew 版 `xfreerdp` 链接的是 Homebrew 自己的 ALSA 库：

```text
libasound.so.2 => /home/linuxbrew/.linuxbrew/opt/alsa-lib/lib/libasound.so.2
```

而系统的 PipeWire ALSA 配置在 Arch 系统路径里：

```text
pipewire-alsa 1:1.6.5-1
/usr/share/alsa/alsa.conf.d/50-pipewire.conf
/usr/share/alsa/alsa.conf.d/99-pipewire-default.conf
```

所以推断是：Homebrew FreeRDP 虽然开启了 `/sound`，也加载了 ALSA backend，但是它使用的 Homebrew `alsa-lib` 没有稳定进入系统 PipeWire 的默认音频链路，导致 RDP 声音没有实际输出到桌面默认声卡。

## 中间调整过的依赖包

一开始为了绕开 sudo，装的是 Homebrew 版本：

```bash
brew install freerdp netcat dialog
```

对应版本：

```text
freerdp 3.26.0
netcat 0.7.1
dialog 1.3-20260107
```

为了解决声音问题，改为安装 Arch 官方仓库里的 FreeRDP：

```bash
sudo pacman -S --needed freerdp
```

当时 pacman 实际安装/补齐的包包括：

```text
freerdp 2:3.26.0-1
libcbor 0.14.0-1
libfido2 1.17.0-1
sdl3_ttf 3.2.2-3
```

系统中和音频相关、已经存在并参与工作的包：

```text
pipewire-alsa 1:1.6.5-1
alsa-utils 1.2.15.2-2
```

安装完成后，Arch 官方 FreeRDP 的实际命令不是 `/usr/bin/xfreerdp`，而是：

```bash
/usr/bin/xfreerdp3
/usr/bin/sdl-freerdp3
```

验证：

```bash
/usr/bin/xfreerdp3 --version
```

输出：

```text
This is FreeRDP version 3.26.0 (3f6d7cb1f)
```

再看链接库：

```bash
ldd /usr/bin/xfreerdp3 | grep -i -E 'asound|pulse|pipewire'
```

结果：

```text
libasound.so.2 => /usr/lib/libasound.so.2
libpulse.so.0 => /usr/lib/libpulse.so.0
libpulsecommon-17.0.so => /usr/lib/pulseaudio/libpulsecommon-17.0.so
```

这说明系统版 FreeRDP 使用的是 Arch 系统音频库，可以正常接入 PipeWire / PulseAudio 兼容层。

## 最终解决办法

把 WinApps 配置从 Homebrew FreeRDP 切到 Arch 官方 FreeRDP：

```ini
FREERDP_COMMAND="/usr/bin/xfreerdp3"
```

同时不要只写泛化的 `/sound`，而是明确使用 ALSA default。由于当前系统安装了 `pipewire-alsa`，`default` 会进入 PipeWire：

```ini
RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
```

完整关键配置变成：

```ini
FREERDP_COMMAND="/usr/bin/xfreerdp3"
RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
```

然后重启 WinApps 会话：

```bash
winapps killrdp
winapps windows
```

## 验证结果

启动后实际进程已经变成系统版 FreeRDP：

```text
/usr/bin/xfreerdp3 /cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d ...
```

播放 Windows 里的声音时，Linux 侧能看到 PipeWire sink input：

```bash
pactl list short sink-inputs
```

输出类似：

```text
162  64  161  PipeWire  s16le 2ch 44100Hz
```

实际测试结果：WinApps 里面的声音可以听到了。

## 这个问题的结论

这次无声音不是 Windows 端没开声音，也不是 WinApps 没传 `/sound`，而是 Homebrew 版 FreeRDP 的音频库链路和当前 Arch / PipeWire 环境不够匹配。

稳定方案是：

```ini
FREERDP_COMMAND="/usr/bin/xfreerdp3"
RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
```

Homebrew 版 `freerdp` 可以暂时保留作为回滚，但 WinApps 实际使用系统版 `/usr/bin/xfreerdp3`。

# 最终验证

最终启动：

```bash
winapps windows
```

Hyprland 里可以看到窗口：

```text
Window -> Windows RDP Session [192.168.6.105]
class: Microsoft Windows
title: Windows RDP Session [192.168.6.105]
xwayland: 1
```

对应的 FreeRDP 进程：

```text
/usr/bin/xfreerdp3 \
  /cert:tofu \
  /sound:sys:alsa,dev:default \
  +home-drive \
  /kbd:remap:0x1d=0x38,remap:0x38=0x1d \
  /d: \
  /u:你的 Windows 用户名 \
  /scale:100 \
  +auto-reconnect \
  +dynamic-resolution \
  /wm-class:"Microsoft Windows" \
  /t:"Windows RDP Session [192.168.6.105]" \
  /v:192.168.6.105:3389
```

此时：

- Windows 桌面窗口可以正常打开。
- Backspace 正常。
- 左 Ctrl / 左 Alt 的行为和我在 Omarchy 里的交换习惯一致。
- Linux home 目录能通过 `\\tsclient\home` 映射到 Windows。

# 常用命令

启动完整 Windows 桌面：

```bash
winapps windows
```

启动资源管理器：

```bash
winapps explorer
```

手动启动记事本：

```bash
winapps manual "C:\Windows\System32\notepad.exe"
```

杀掉 FreeRDP 会话：

```bash
winapps killrdp
```

查看 WinApps 日志：

```bash
tail -200 ~/.local/share/winapps/winapps.log
```

查看 FreeRDP 进程：

```bash
pgrep -a -f freerdp
```

查看 Hyprland 里的窗口：

```bash
hyprctl clients
```

# 总结

WinApps 在 Arch + Omarchy + Hyprland 上是可以跑通的，但它不是完全开箱即用。

我这次踩到的坑主要来自三个地方：

1. Wayland / Hyprland 下 FreeRDP 客户端选择问题。
2. Homebrew GNU netcat 和 WinApps 端口检查逻辑不兼容。
3. 键盘输入在 XKB、FreeRDP scancode、Windows 虚拟键之间的映射差异。

最终稳定方案是：

```ini
WAFLAVOR="manual"
FREERDP_COMMAND="/usr/bin/xfreerdp3"
RDP_FLAGS="/cert:tofu /sound:sys:alsa,dev:default +home-drive /kbd:remap:0x1d=0x38,remap:0x38=0x1d"
REMOVABLE_MEDIA="/run/media"
```

如果你也是 Arch / Omarchy / Hyprland，并且 Windows 设备是局域网里的 Windows Professional，可以按这篇文章基本 1:1 复现。
