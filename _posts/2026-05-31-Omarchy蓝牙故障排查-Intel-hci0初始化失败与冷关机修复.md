---
layout: post
title: Omarchy 蓝牙故障排查：Intel hci0 初始化失败与冷关机修复
subtitle: 从 Omarchy 蓝牙入口失效一路定位到 btusb / firmware 初始化超时
date: 2026-05-31
author: Gavin
header-img: img/post-bg-art.jpg
catalog: true
tags:
  - Arch Linux
  - Omarchy
  - Bluetooth
  - BlueZ
  - Linux Kernel
  - Troubleshooting
---

# 背景

这次遇到的问题是：Omarchy 里面的 Bluetooth 功能看起来坏掉了。

表现上像是桌面蓝牙入口不可用，或者打开之后没有任何可管理的蓝牙设备。但这类问题不能一上来就判断是 Omarchy、Waybar 或 bluetui 的问题，因为 Linux 桌面蓝牙链路很长：

```text
Omarchy / Waybar 蓝牙入口
        ↓
bluetui / bluetoothctl
        ↓
BlueZ / bluetoothd
        ↓
D-Bus: org.bluez
        ↓
内核 bluetooth / btusb / btintel
        ↓
USB 蓝牙子设备 / 固件
```

这篇文章记录这次完整排查过程：一开始怀疑 Omarchy 蓝牙前端，最后定位到 Intel 蓝牙适配器 `hci0` 在内核初始化阶段超时，最终通过冷关机恢复。

# 当前环境

本次环境：

```text
发行版: Arch Linux rolling
桌面: Omarchy / Hyprland
内核: Linux 7.0.9-arch2-1
蓝牙协议栈: bluez 5.86-6
蓝牙前端: bluetui 0.8.1-2
蓝牙硬件: Intel Wireless 3165 集成蓝牙子设备
USB ID: 8087:0a2a
```

相关包状态：

```bash
pacman -Q bluez bluez-utils bluetui linux linux-firmware linux-firmware-intel
```

排查时看到：

```text
linux 7.0.9.arch2-1
linux-firmware 20260519-1
linux-firmware-intel 20260519-1
bluez 5.86-6
bluetui 0.8.1-2
```

一开始系统里没有 `bluez-utils`，也就是没有 `bluetoothctl`。这会影响诊断工具和部分桌面组件，但它不是这次蓝牙失效的最终根因。

# 第一层：先确认是不是 Omarchy 前端坏了

Omarchy 的蓝牙入口可以从源码脚本直接看出来：

```bash
cat $(which omarchy-launch-bluetooth)
```

内容很短：

```bash
#!/bin/bash

rfkill unblock bluetooth
exec omarchy-launch-or-focus-tui bluetui
```

也就是说，Omarchy 蓝牙按钮本质上做了两件事：

1. `rfkill unblock bluetooth`
2. 启动 `bluetui`

Waybar 里的蓝牙点击事件也是指向这个脚本：

```json
"on-click": "omarchy-launch-bluetooth"
```

所以如果 `bluetui` 已安装、脚本存在、Waybar 配置没错，那问题就不应该停留在 UI 层。

检查命令：

```bash
command -v omarchy-launch-bluetooth
command -v bluetui
pacman -Q bluetui bluez
```

结果说明：

```text
omarchy-launch-bluetooth 存在
bluetui 存在
bluez 已安装
```

Omarchy 前端这一层基本排除。

# 第二层：确认服务是否正常

蓝牙服务状态：

```bash
systemctl status bluetooth.service
systemctl is-enabled bluetooth.service
systemctl is-active bluetooth.service
```

结果：

```text
bluetooth.service: enabled
bluetooth.service: active
bluetoothd: Running
Bluetooth management interface initialized
```

这说明 `bluetoothd` 本身正在运行。

再看是否被 rfkill 禁用：

```bash
rfkill list bluetooth
```

结果：

```text
hci0: Bluetooth
    Soft blocked: no
    Hard blocked: no
```

这一步也很关键：蓝牙没有被软件禁用，也没有被硬件开关禁用。

到这里为止，表面上看：

```text
Omarchy 入口正常
bluetui 已安装
bluetooth.service 正常
rfkill 未阻塞
```

但蓝牙仍然不能用，说明问题更底层。

# 第三层：BlueZ 是否真的拿到了控制器

BlueZ 对桌面暴露蓝牙设备靠 D-Bus。正常情况下应该能看到类似：

```text
/org/bluez/hci0
```

检查命令：

```bash
busctl tree org.bluez
```

异常结果：

```text
└─ /org
  └─ /org/bluez
```

这里只有 BlueZ 根节点，没有 `/org/bluez/hci0`。

这说明问题不是「前端看不到设备」，而是：

```text
BlueZ 自己也没有可用的蓝牙控制器
```

后来安装 `bluez-utils` 后，用 `bluetoothctl` 验证也是同样结论：

```bash
bluetoothctl show
```

输出：

```text
No default controller available
```

这句话基本把问题从 Omarchy / bluetui / Waybar 层，推到了 BlueZ 与内核设备层。

# 第四层：内核是否识别到了 hci0

继续看内核模块：

```bash
lsmod | grep -Ei 'btusb|bluetooth|btintel|btbcm|btrtl|btmtk'
```

可以看到相关模块已加载：

```text
btusb
btintel
btbcm
btrtl
btmtk
bluetooth
```

再看 rfkill，也能看到 `hci0`：

```text
hci0: Bluetooth
```

也就是说，内核不是完全看不到蓝牙设备。设备路径也能找到：

```bash
readlink -f /sys/class/bluetooth/hci0
```

对应到 USB 设备：

```text
/sys/devices/pci0000:00/0000:00:14.0/usb1/1-10/1-10:1.0/bluetooth/hci0
```

USB 设备属性：

```bash
cat /sys/bus/usb/devices/1-10/idVendor
cat /sys/bus/usb/devices/1-10/idProduct
```

结果：

```text
idVendor=8087
idProduct=0a2a
```

这对应 Intel 蓝牙子设备。

到这里的状态很微妙：

```text
内核能看到 hci0
rfkill 能看到 hci0
但是 BlueZ 没有 /org/bluez/hci0
bluetoothctl 没有 controller
```

这种状态通常说明：设备枚举出来了，但初始化没有真正完成。

# 关键证据：hci0 初始化超时

真正的关键证据来自内核日志：

```bash
journalctl -k -b | grep -Ei 'bluetooth|btusb|btintel|hci0|usb 1-10'
```

里面反复出现这些错误：

```text
Bluetooth: hci0: command 0x0c03 tx timeout
Bluetooth: hci0: Resetting usb device.
Bluetooth: hci0: sending initial HCI reset failed (-110)
Bluetooth: hci0: Entering manufacturer mode failed (-110)
Bluetooth: hci0: Reading Intel device address failed (-110)
Bluetooth: hci0: Reading Intel version command failed (-110)
```

这里的核心是 `tx timeout` 和 `-110`。

`-110` 在 Linux 里通常对应 timeout。也就是说内核向蓝牙控制器发 HCI 命令，设备没有按预期响应。

这解释了为什么前面所有上层状态都很矛盾：

- `bluetooth.service` 可以正常启动，因为 `bluetoothd` 本身没坏。
- `rfkill` 能看到 `hci0`，因为内核枚举到了蓝牙 host。
- 但 BlueZ 没有 controller，因为 `hci0` 初始化失败，不能变成一个可管理的蓝牙控制器。

# 中间发现：缺少 bluez-utils

排查中还发现系统没有安装 `bluez-utils`：

```bash
pacman -Q bluez-utils
```

输出：

```text
error: package 'bluez-utils' was not found
```

用户日志里也有对应提示：

```text
elephant: bluetoothctl not found. disabling
```

所以我补装了它：

```bash
pkexec pacman -S --needed --noconfirm bluez-utils
```

安装后：

```bash
command -v bluetoothctl
pacman -Q bluez-utils
```

结果：

```text
/usr/bin/bluetoothctl
bluez-utils 5.86-6
```

但这一步只修复了诊断工具缺失和某些桌面组件依赖问题，没有解决 controller 不存在的问题。

安装后继续验证：

```bash
bluetoothctl show
```

仍然是：

```text
No default controller available
```

所以 `bluez-utils` 缺失是一个伴随问题，不是根因。

# 尝试过的运行时修复

## 1. 重启 bluetooth.service

```bash
systemctl restart bluetooth.service
```

服务重启成功：

```text
bluetooth.service active
bluetoothd running
```

但 D-Bus 仍然没有 `/org/bluez/hci0`：

```bash
busctl tree org.bluez
```

仍然只有：

```text
/org/bluez
```

无效。

## 2. rfkill unblock

```bash
rfkill unblock bluetooth
rfkill list bluetooth
```

结果确认未阻塞：

```text
Soft blocked: no
Hard blocked: no
```

无效。

## 3. 重载 btusb 模块

尝试卸载并重新加载蓝牙 USB 驱动：

```bash
systemctl stop bluetooth.service
pkexec modprobe -r btusb
pkexec modprobe btusb
systemctl start bluetooth.service
```

命令执行成功，但内核日志继续报：

```text
Bluetooth: hci0: command 0x0c03 tx timeout
Bluetooth: hci0: sending initial HCI reset failed (-110)
```

无效。

## 4. USB 设备 unbind / bind 热复位

蓝牙设备对应 USB 路径是 `1-10`，所以尝试热拔插式复位：

```bash
systemctl stop bluetooth.service
pkexec sh -c 'echo 1-10 > /sys/bus/usb/drivers/usb/unbind'
sleep 4
pkexec sh -c 'echo 1-10 > /sys/bus/usb/drivers/usb/bind'
sleep 5
systemctl start bluetooth.service
```

USB unbind / bind 成功，`hci0` 编号也刷新过，但 BlueZ 依旧没有 controller：

```bash
bluetoothctl show
```

仍然：

```text
No default controller available
```

内核仍然继续报 HCI reset timeout。

这一步说明：普通的运行时 USB 复位也不能让这个蓝牙子设备恢复。

# 关联升级记录

查看 pacman 日志：

```bash
grep -E 'upgraded (linux|linux-firmware|bluez)' /var/log/pacman.log
```

可以看到问题发生前有一批升级：

```text
bluez: 5.86-5 -> 5.86-6
linux: 7.0.3.arch1-2 -> 7.0.9.arch2-1
linux-firmware: 20260410-1 -> 20260519-1
linux-firmware-intel: 20260410-1 -> 20260519-1
```

蓝牙故障是在这批升级后的开机中出现的。

这不一定证明 BlueZ 是直接原因。结合内核日志，更像是下面几者之一：

1. Intel 蓝牙子设备在某次启动中卡死；
2. 新内核 / 新 firmware 与旧硬件的初始化路径触发了问题；
3. 蓝牙控制器处于一种普通 reboot / 模块重载不能完全清掉的异常状态。

# 最终修复：冷关机

运行时重启服务、重载 btusb、USB unbind/bind 都失败之后，最后执行真正冷关机：

```bash
systemctl poweroff
```

关机后等待一段时间，再重新开机。

这一步之后蓝牙恢复正常。

冷关机有效，说明这次问题大概率不是配置错误，而是硬件控制器 / firmware 状态卡死。普通热重启或驱动热复位没有彻底切断设备供电，蓝牙子设备还留在坏状态里；冷关机让设备真正掉电，重新上电后初始化恢复。

# 最终结论

这次 Omarchy 蓝牙故障的根因链路是：

```text
Intel 3165 蓝牙 USB 子设备 hci0 初始化超时
        ↓
内核 HCI reset / manufacturer mode / address 读取失败
        ↓
BlueZ 没有拿到可用 controller
        ↓
D-Bus org.bluez 没有 /org/bluez/hci0
        ↓
bluetoothctl 显示 No default controller available
        ↓
Omarchy / bluetui / Waybar 看起来像蓝牙功能坏了
```

真正有效的修复动作是：

```text
冷关机 → 等待 → 重新开机
```

同时补装 `bluez-utils` 是必要的系统补全动作：

```bash
pkexec pacman -S --needed bluez-utils
```

它让 `bluetoothctl` 可用，也避免依赖 `bluetoothctl` 的组件报 `bluetoothctl not found`，但它不是解决 `hci0` 初始化超时的关键。

# 以后再遇到类似问题的排查顺序

以后 Linux 桌面蓝牙坏了，可以按这个顺序排查：

## 1. 看服务

```bash
systemctl status bluetooth.service
systemctl is-active bluetooth.service
```

如果服务没启动，先处理 BlueZ 服务。

## 2. 看 rfkill

```bash
rfkill list bluetooth
```

如果 soft blocked：

```bash
rfkill unblock bluetooth
```

如果 hard blocked，要检查 BIOS、快捷键、硬件开关。

## 3. 看 BlueZ 是否有 controller

```bash
busctl tree org.bluez
bluetoothctl show
```

正常应该看到 `/org/bluez/hci0` 或 controller 信息。

如果 `bluetoothctl show` 是：

```text
No default controller available
```

就不要继续纠结桌面 UI，应该往内核和硬件层排查。

## 4. 看内核日志

```bash
journalctl -k -b | grep -Ei 'bluetooth|btusb|btintel|hci0'
```

如果出现：

```text
hci0: command ... tx timeout
sending initial HCI reset failed (-110)
Reading Intel device address failed (-110)
```

基本可以判断是控制器初始化失败。

## 5. 尝试运行时恢复

```bash
systemctl restart bluetooth.service
```

如果无效：

```bash
systemctl stop bluetooth.service
sudo modprobe -r btusb
sudo modprobe btusb
systemctl start bluetooth.service
```

如果还无效，可以尝试 USB unbind / bind，但要先确认设备路径：

```bash
readlink -f /sys/class/bluetooth/hci0
```

然后对相应 USB 设备做复位。

## 6. 最后做冷关机

如果内核一直报 HCI timeout，而服务、rfkill、模块重载都无效，直接做冷关机：

```bash
systemctl poweroff
```

关机后等待 30 秒再开机。

这次就是这一步最终解决问题。

# 一个经验判断

Linux 桌面蓝牙问题不要只看桌面表现。

如果是 Omarchy / Waybar / bluetui 的问题，通常表现是入口打不开、命令缺失、配置错、前端报错。

但如果 `bluetoothctl show` 已经显示：

```text
No default controller available
```

同时内核里有：

```text
hci0 ... tx timeout
```

那就不是 UI 问题，而是控制器没有真正活过来。

这类问题的关键不是「重启蓝牙服务」，而是让底层蓝牙硬件重新初始化；当热复位无效时，冷关机往往比继续改配置更有效。
