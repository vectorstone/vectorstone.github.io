---
layout: post
title: OpenWrt Passwall Sing-box升级1.5beta
subtitle: OpenWrt Passwall Sing-box升级1.5beta
date: 2023-09-16
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
  - passwall
  - OpenWrt
---
# 背景
自己在用的OpenWrt里面的passwall插件里面的Hysteria版本还停留在1.3.4阶段,研究了一下给他升级到1.5版本

## 下载相关的依赖
有大佬已经将passwall相关的依赖全部整理好了,路径如下: 
https://github.com/xiaorouji/openwrt-passwall/releases

主要是下载这三个,注意看清楚自己的软路由的系统的架构,我的是x86的,每个人的可能有点不一样
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020230916195906.png)

## 解压这个依赖包
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020230916200400.png)

```sh
& 'C:\Program Files\7-Zip\7z.exe' x .\passwall_packages_ipk_x86_64.zip -mcp=936
```

## 上传文件到OpenWrt服务器上
将上面下载的两个文件和最后解压出来的所有的文件统一上传到OpenWrt的服务器上
```sh
mkdir /tmp/passUpdate
```

## 升级安装
```sh
opkg install *.ipk
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/Pasted%20image%2020230916202221.png)

出问题了,留个坑
iStoreOS
https://www.istoreos.com/