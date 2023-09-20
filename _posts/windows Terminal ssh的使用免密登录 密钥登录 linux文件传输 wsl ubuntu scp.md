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