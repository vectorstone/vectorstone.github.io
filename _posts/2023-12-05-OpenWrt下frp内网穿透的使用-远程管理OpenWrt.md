---
layout: post
title: 远程管理OpenWrt
subtitle: 远程管理OpenWrt
date: 2023-12-05
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
---
# OpenWrt下frp内网穿透的使用-远程管理OpenWrt
首先要有一台云服务器
## 确认OpenWrt上客户端的版本
一般需要客户端的版本和服务端的版本最好是一致的,但是目前来看版本不一致的话也是可以使用的所以问题不大
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020240203181352.png)

## 下载frp客户端的软件
windows里面设置排除病毒查杀的文件夹

github地址：[github.com/fatedier/frp](https://github.com/fatedier/frp) 下载相应的 Release 版本

可以通过下面的命令查看自己的服务器的系统的架构
```sh
uname -a
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020231206225817.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020231205224916.png)
0.52.3客户端的配置文件
```sh
serverAddr = "服务器主机ip"
serverPort = 7000
auth.method = "token"
auth.token = "231205test"
[[proxies]]
name = "test-tcp"
type = "tcp"
localIP = "127.0.0.1"
localPort = 3389
remotePort = 7004
```

0.52.3服务端配置文件
```sh
bindPort = 7000
auth.method = "token"
auth.token = "231205test"
```

```sh
scp -r D:\Desktop\frp_0.52.3_linux_amd64.tar.gz ubuntu@117.50.199.75:/opt/
```

```sh
tar -zxvf frp_0.52.3_linux_amd64
```
## 配置frps配置文件
创建启动脚本
```sh
#!/bin/bash
nohup /opt/frp_0.47.0_linux_amd64/frps -c frps.ini >/dev/null 2>&1 &
```

```sh
chmod +x /opt/frp_0.47.0_linux_amd64/start.sh
```

启动frp服务端
```sh
cd /opt/frp_0.54.0_linux_amd64
. startFrps.sh
```

查看服务端启动状态
```sh
ps -ef | grep frp
```
出现下图的第一个证明已经启动成功了
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020240203184753.png)
## 开放云服务器相关的端口
```sh
sudo ufw allow 8000/tcp
sudo ufw disable
```

## OpenWrt中frp客户端的配置

## windows客户端的启用
出现下面的这个图片说明已经启动ok了
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020240203184826.png)