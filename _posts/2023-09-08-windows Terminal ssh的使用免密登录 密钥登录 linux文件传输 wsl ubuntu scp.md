---
layout: post
title: windows Terminal ssh的使用免密登录以及文件传输
subtitle: windows Terminal ssh的使用免密登录以及文件传输
date: 2023-09-07
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
  - ssh
  - windowsTerminal
  - 密钥登录
  - wsl
  - Ubuntu
  - scp
---
# 密钥登录
[参考文章](https://juejin.cn/s/windows%20terminal%20ssh%E8%BF%9C%E7%A8%8B%E7%99%BB%E5%BD%95%E5%AF%86%E7%A0%81)

```sh
cat C:\Users\Gavin\.ssh\id_rsa.pub | ssh root@124.222.220.45 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

```sh
cat C:\Users\Gavin\.ssh\id_rsa.pub | ssh root@107.173.83.141 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

```sh
cat C:\Users\Gavin\.ssh\id_rsa.pub | ssh root@192.168.100.2 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

```sh
cat C:\Users\Gavin\.ssh\id_rsa.pub | ssh root@192.168.8.141 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

```sh
cat ~/.ssh/id_rsa.pub | ssh ubuntu@117.50.199.75 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

会提示输入密码: 输入正确的密码后就可以使用下面的命令免密登录了
```bash
ssh -i ~/.ssh/id_rsa root@124.222.220.45
```

```bash
ssh -i ~/.ssh/id_rsa root@192.168.8.141
```

虚拟机里面的iStore
```bash
ssh -i ~/.ssh/id_rsa root@192.168.216.111
```

配置好ssh密钥之后就可以新创建配置,后续只需要选择对应的配置就可以直接登录了
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230822180837.png)

# 文件传输
需要记忆ip,感觉有点麻烦
servername就是服务器的ip地址
上传本地文件到服务器：
```bash
scp /path/filename username@servername:/path/
```

从服务器上下载文件：
```bash
scp username@servername:/path/filename /var/www/local_dir（本地目录）
```

从服务器下载整个目录:
```bash
scp -r username@servername:/var/www/remote_dir/（远程目录） /var/www/local_dir（本地目录）
```

上传目录到服务器：
```bash
scp -r local_dir username@servername:remote_dir
```

# PowerShell设置别名
[参考文章](https://blog.vvzero.com/2019/07/22/set-user-alias-for-windows-PowerShell/)

查看PowerShell配置文件路径
```sh
echo $profile
# C:\Users\Gavin\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

如果不存在这个文件就创建,编码选择UTF-8
然后新增如下的内容,注意单引号不要丢了
```
function gmall { cd 'D:\OneDrive\AtGuiGu\07 Tutor Documents\08谷粒商城\gmall-0309\' }
```

以管理员身份打开 PowerShell，执行 `Set-ExecutionPolicy RemoteSigned`
然后重新启动PowerShell就可以使用别名了

# 问题
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020231111103821.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020231111105142.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020231111105339.png)

```json
{
    "$help": "https://aka.ms/terminal-documentation",
    "$schema": "https://aka.ms/terminal-profiles-schema",
    "actions": 
    [
        {
            "command": "find",
            "keys": "ctrl+shift+f"
        },
        {
            "command": 
            {
                "action": "splitPane",
                "split": "auto",
                "splitMode": "duplicate"
            },
            "keys": "alt+shift+d"
        },
        {
            "command": "paste",
            "keys": "ctrl+v"
        },
        {
            "command": 
            {
                "action": "copy",
                "singleLine": false
            },
            "keys": "ctrl+c"
        }
    ],
    "copyFormatting": "none",
    "copyOnSelect": false,
    "defaultProfile": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
    "newTabMenu": 
    [
        {
            "type": "remainingProfiles"
        }
    ],
    "profiles": 
    {
        "defaults": 
        {
            "backgroundImage": "C:\\bash-bg2.jpg",
            "backgroundImageOpacity": 0.5,
            "colorScheme": "Andromeda",
            "font": 
            {
                "face": "FiraCode Nerd Font Mono"
            },
            "opacity": 70,
            "useAcrylic": true
        },
        "list": 
        [
            {
                "commandline": "%SystemRoot%\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
                "font": 
                {
                    "face": "FiraCode Nerd Font"
                },
                "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
                "hidden": false,
                "name": "Windows PowerShell"
            },
            {
                "commandline": "%SystemRoot%\\System32\\cmd.exe",
                "font": 
                {
                    "face": "FiraCode Nerd Font"
                },
                "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
                "hidden": false,
                "name": "Command Prompt"
            },
            {
                "guid": "{b453ae62-4e3d-5e58-b989-0a998ec441b8}",
                "hidden": false,
                "name": "Azure Cloud Shell",
                "source": "Windows.Terminal.Azure"
            },
            {
                "commandline": "ssh -i ~/.ssh/id_rsa root@124.222.220.45",
                "guid": "{94d9c660-953e-44ab-9247-2b0382d61a5c}",
                "hidden": false,
                "name": "tencent",
                "tabTitle": "tencent"
            },
            {
                "commandline": "ssh -i ~/.ssh/id_rsa root@107.173.83.141",
                "guid": "{5cfcc6f3-ef08-45bc-9515-40e14c9b224e}",
                "hidden": false,
                "icon": "D:\\OneDrive\\05\u58c1\u7eb8\\02\u5934\u50cf\\\u6b62\u75bc\u836f.png",
                "name": "RackNerd"
            },
            {
                "commandline": "cd D:\\OneDrive\\AtGuiGu\\07 Tutor Documents\\08\u8c37\u7c92\u5546\u57ce\\gmall-0309\\",
                "guid": "{719acec4-3fa5-4259-9359-94056e7bc824}",
                "hidden": false,
                "name": "git mall"
            },
            {
                "font": 
                {
                    "face": "FiraCode Nerd Font Mono"
                },
                "guid": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
                "hidden": false,
                "name": "PowerShell",
                "source": "Windows.Terminal.PowershellCore"
            },
            {
                "commandline": "ssh -i ~/.ssh/id_rsa root@192.168.8.141",
                "guid": "{836954d1-7925-4ba9-a61e-7fa3d2cd952a}",
                "hidden": false,
                "name": "Gavin server"
            },
            {
                "commandline": "ssh -i ~/.ssh/id_rsa root@192.168.8.1",
                "guid": "{4b60c34d-3835-4655-83f3-7b6509671bff}",
                "hidden": false,
                "name": "OpenWrt"
            },
            {
                "commandline": "ssh -i ~/.ssh/id_rsa root@192.168.216.111",
                "guid": "{9d0c2e11-bef8-44bc-9fbf-e1ebef862077}",
                "hidden": false,
                "name": "vmiStore"
            },
            {
                "commandline": "ssh -i ~/.ssh/id_rsa ubuntu@117.50.199.75",
                "guid": "{c803f1de-bb0c-47d2-99d5-170d43f96885}",
                "hidden": false,
                "name": "ucloud",
                "tabTitle": "tencent"
            }
        ]
    },
    "schemes": 
    [
        {
            "background": "#262A33",
            "black": "#000000",
            "blue": "#2472C8",
            "brightBlack": "#666666",
            "brightBlue": "#2472C8",
            "brightCyan": "#0FA8CD",
            "brightGreen": "#05BC79",
            "brightPurple": "#BC3FBC",
            "brightRed": "#CD3131",
            "brightWhite": "#E5E5E5",
            "brightYellow": "#09DA0F",
            "cursorColor": "#FFFFFF",
            "cyan": "#0FA8CD",
            "foreground": "#E5E5E5",
            "green": "#05BC79",
            "name": "Andromeda",
            "purple": "#BC3FBC",
            "red": "#CD3131",
            "selectionBackground": "#FFFFFF",
            "white": "#E5E5E5",
            "yellow": "#09DA0F"
        },
        {
            "background": "#0C0C0C",
            "black": "#0C0C0C",
            "blue": "#0037DA",
            "brightBlack": "#767676",
            "brightBlue": "#3B78FF",
            "brightCyan": "#61D6D6",
            "brightGreen": "#16C60C",
            "brightPurple": "#B4009E",
            "brightRed": "#E74856",
            "brightWhite": "#F2F2F2",
            "brightYellow": "#F9F1A5",
            "cursorColor": "#FFFFFF",
            "cyan": "#3A96DD",
            "foreground": "#CCCCCC",
            "green": "#13A10E",
            "name": "Campbell",
            "purple": "#881798",
            "red": "#C50F1F",
            "selectionBackground": "#FFFFFF",
            "white": "#CCCCCC",
            "yellow": "#C19C00"
        },
        {
            "background": "#012456",
            "black": "#0C0C0C",
            "blue": "#0037DA",
            "brightBlack": "#767676",
            "brightBlue": "#3B78FF",
            "brightCyan": "#61D6D6",
            "brightGreen": "#16C60C",
            "brightPurple": "#B4009E",
            "brightRed": "#E74856",
            "brightWhite": "#F2F2F2",
            "brightYellow": "#F9F1A5",
            "cursorColor": "#FFFFFF",
            "cyan": "#3A96DD",
            "foreground": "#CCCCCC",
            "green": "#13A10E",
            "name": "Campbell Powershell",
            "purple": "#881798",
            "red": "#C50F1F",
            "selectionBackground": "#FFFFFF",
            "white": "#CCCCCC",
            "yellow": "#C19C00"
        },
        {
            "background": "#000000",
            "black": "#0C0C0C",
            "blue": "#0037DA",
            "brightBlack": "#767676",
            "brightBlue": "#3B78FF",
            "brightCyan": "#61D6D6",
            "brightGreen": "#16C60C",
            "brightPurple": "#B4009E",
            "brightRed": "#E74856",
            "brightWhite": "#F2F2F2",
            "brightYellow": "#F9F1A5",
            "cursorColor": "#FFFFFF",
            "cyan": "#3A96DD",
            "foreground": "#FFFFFF",
            "green": "#13A10E",
            "name": "Color Scheme 11",
            "purple": "#881798",
            "red": "#C50F1F",
            "selectionBackground": "#FFFFFF",
            "white": "#CCCCCC",
            "yellow": "#C19C00"
        },
        {
            "background": "#000000",
            "black": "#0C0C0C",
            "blue": "#0037DA",
            "brightBlack": "#767676",
            "brightBlue": "#3B78FF",
            "brightCyan": "#61D6D6",
            "brightGreen": "#16C60C",
            "brightPurple": "#B4009E",
            "brightRed": "#E74856",
            "brightWhite": "#F2F2F2",
            "brightYellow": "#F9F1A5",
            "cursorColor": "#FFFFFF",
            "cyan": "#3A96DD",
            "foreground": "#FFFFFF",
            "green": "#13A10E",
            "name": "Color Scheme 12",
            "purple": "#881798",
            "red": "#C50F1F",
            "selectionBackground": "#FFFFFF",
            "white": "#CCCCCC",
            "yellow": "#C19C00"
        },
        {
            "background": "#282C34",
            "black": "#282C34",
            "blue": "#61AFEF",
            "brightBlack": "#5A6374",
            "brightBlue": "#61AFEF",
            "brightCyan": "#56B6C2",
            "brightGreen": "#98C379",
            "brightPurple": "#C678DD",
            "brightRed": "#E06C75",
            "brightWhite": "#DCDFE4",
            "brightYellow": "#E5C07B",
            "cursorColor": "#FFFFFF",
            "cyan": "#56B6C2",
            "foreground": "#DCDFE4",
            "green": "#98C379",
            "name": "One Half Dark",
            "purple": "#C678DD",
            "red": "#E06C75",
            "selectionBackground": "#FFFFFF",
            "white": "#DCDFE4",
            "yellow": "#E5C07B"
        },
        {
            "background": "#FAFAFA",
            "black": "#383A42",
            "blue": "#0184BC",
            "brightBlack": "#4F525D",
            "brightBlue": "#61AFEF",
            "brightCyan": "#56B5C1",
            "brightGreen": "#98C379",
            "brightPurple": "#C577DD",
            "brightRed": "#DF6C75",
            "brightWhite": "#FFFFFF",
            "brightYellow": "#E4C07A",
            "cursorColor": "#4F525D",
            "cyan": "#0997B3",
            "foreground": "#383A42",
            "green": "#50A14F",
            "name": "One Half Light",
            "purple": "#A626A4",
            "red": "#E45649",
            "selectionBackground": "#FFFFFF",
            "white": "#FAFAFA",
            "yellow": "#C18301"
        },
        {
            "background": "#002B36",
            "black": "#002B36",
            "blue": "#268BD2",
            "brightBlack": "#073642",
            "brightBlue": "#839496",
            "brightCyan": "#93A1A1",
            "brightGreen": "#586E75",
            "brightPurple": "#6C71C4",
            "brightRed": "#CB4B16",
            "brightWhite": "#FDF6E3",
            "brightYellow": "#657B83",
            "cursorColor": "#FFFFFF",
            "cyan": "#2AA198",
            "foreground": "#839496",
            "green": "#859900",
            "name": "Solarized Dark",
            "purple": "#D33682",
            "red": "#DC322F",
            "selectionBackground": "#FFFFFF",
            "white": "#EEE8D5",
            "yellow": "#B58900"
        },
        {
            "background": "#FDF6E3",
            "black": "#002B36",
            "blue": "#268BD2",
            "brightBlack": "#073642",
            "brightBlue": "#839496",
            "brightCyan": "#93A1A1",
            "brightGreen": "#586E75",
            "brightPurple": "#6C71C4",
            "brightRed": "#CB4B16",
            "brightWhite": "#FDF6E3",
            "brightYellow": "#657B83",
            "cursorColor": "#002B36",
            "cyan": "#2AA198",
            "foreground": "#657B83",
            "green": "#859900",
            "name": "Solarized Light",
            "purple": "#D33682",
            "red": "#DC322F",
            "selectionBackground": "#FFFFFF",
            "white": "#EEE8D5",
            "yellow": "#B58900"
        },
        {
            "background": "#000000",
            "black": "#000000",
            "blue": "#3465A4",
            "brightBlack": "#555753",
            "brightBlue": "#729FCF",
            "brightCyan": "#34E2E2",
            "brightGreen": "#8AE234",
            "brightPurple": "#AD7FA8",
            "brightRed": "#EF2929",
            "brightWhite": "#EEEEEC",
            "brightYellow": "#FCE94F",
            "cursorColor": "#FFFFFF",
            "cyan": "#06989A",
            "foreground": "#D3D7CF",
            "green": "#4E9A06",
            "name": "Tango Dark",
            "purple": "#75507B",
            "red": "#CC0000",
            "selectionBackground": "#FFFFFF",
            "white": "#D3D7CF",
            "yellow": "#C4A000"
        },
        {
            "background": "#FFFFFF",
            "black": "#000000",
            "blue": "#3465A4",
            "brightBlack": "#555753",
            "brightBlue": "#729FCF",
            "brightCyan": "#34E2E2",
            "brightGreen": "#8AE234",
            "brightPurple": "#AD7FA8",
            "brightRed": "#EF2929",
            "brightWhite": "#EEEEEC",
            "brightYellow": "#FCE94F",
            "cursorColor": "#000000",
            "cyan": "#06989A",
            "foreground": "#555753",
            "green": "#4E9A06",
            "name": "Tango Light",
            "purple": "#75507B",
            "red": "#CC0000",
            "selectionBackground": "#FFFFFF",
            "white": "#D3D7CF",
            "yellow": "#C4A000"
        },
        {
            "background": "#300A24",
            "black": "#171421",
            "blue": "#0037DA",
            "brightBlack": "#767676",
            "brightBlue": "#08458F",
            "brightCyan": "#2C9FB3",
            "brightGreen": "#26A269",
            "brightPurple": "#A347BA",
            "brightRed": "#C01C28",
            "brightWhite": "#F2F2F2",
            "brightYellow": "#A2734C",
            "cursorColor": "#FFFFFF",
            "cyan": "#3A96DD",
            "foreground": "#FFFFFF",
            "green": "#26A269",
            "name": "Ubuntu-18.04-ColorScheme",
            "purple": "#881798",
            "red": "#C21A23",
            "selectionBackground": "#FFFFFF",
            "white": "#CCCCCC",
            "yellow": "#A2734C"
        },
        {
            "background": "#300A24",
            "black": "#171421",
            "blue": "#0037DA",
            "brightBlack": "#767676",
            "brightBlue": "#08458F",
            "brightCyan": "#2C9FB3",
            "brightGreen": "#26A269",
            "brightPurple": "#A347BA",
            "brightRed": "#C01C28",
            "brightWhite": "#F2F2F2",
            "brightYellow": "#A2734C",
            "cursorColor": "#FFFFFF",
            "cyan": "#3A96DD",
            "foreground": "#FFFFFF",
            "green": "#26A269",
            "name": "Ubuntu-22.04-ColorScheme",
            "purple": "#881798",
            "red": "#C21A23",
            "selectionBackground": "#FFFFFF",
            "white": "#CCCCCC",
            "yellow": "#A2734C"
        },
        {
            "background": "#000000",
            "black": "#000000",
            "blue": "#000080",
            "brightBlack": "#808080",
            "brightBlue": "#0000FF",
            "brightCyan": "#00FFFF",
            "brightGreen": "#00FF00",
            "brightPurple": "#FF00FF",
            "brightRed": "#FF0000",
            "brightWhite": "#FFFFFF",
            "brightYellow": "#FFFF00",
            "cursorColor": "#FFFFFF",
            "cyan": "#008080",
            "foreground": "#C0C0C0",
            "green": "#008000",
            "name": "Vintage",
            "purple": "#800080",
            "red": "#800000",
            "selectionBackground": "#FFFFFF",
            "white": "#C0C0C0",
            "yellow": "#808000"
        }
    ],
    "themes": []
}
```