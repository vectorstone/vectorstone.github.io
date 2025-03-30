---
layout: post
title: MacOs下orbstack 虚拟机软件的使用
subtitle: MacOs下orbstack 虚拟机软件的使用
date: 2025-03-30
author: Gavin
header-img: https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/k380.png
catalog: true
tags:
  - macos
  - docker
  - 虚拟机
  - orbstack
---
MacOS下优雅使用docker的方式
[下载地址](https://orbstack.dev/download)

```sh
# 查看当前系统的docker环境  查看下面命令输出的Context是不是orbstack
docker version

# 切换docker context环境到orbstack
docker context use orbstack

# 切换docker context环境到原来的context
docker context use linux/docker

# 迁移原来的docker Desktop里面的容器到orbstack
orb migrate docker -f

# 配置docker的源文件
orb config docker

# 进入虚拟机
orb 

# 回到mac的终端环境
mac

# 在macos的终端环境里面执行虚拟机的命令
orb sudo apt update

# 文件也是互通的

# ssh的使用  ssh 用户名@虚拟机名称@orb
ssh gavin@ubuntu@orb
```