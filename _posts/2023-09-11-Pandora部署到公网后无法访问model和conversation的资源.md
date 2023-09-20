---
layout: post
title: Pandora部署到公网后无法访问model和conversation的资源
subtitle: Pandora部署到公网后无法访问model和conversation的资源
date: 2023-09-19
author: Gavin
header-img: img/post-bg-unix-linux.jpg
catalog: true
tags:
  - 博客
  - pandora
  - chatgpt
  - ai
  - 反向代理
  - nginx
---
潘多拉 (Pandora)，一个让你呼吸顺畅的 ChatGPT。
潘多拉实现了网页版 ChatGPT 的主要操作。后端优化，绕过 Cloudflare，速度喜人。
项目地址:  https://github.com/zhile-io/pandora
# 现象
之前只是在内网的环境里面部署使用,使用的比较的愉快,但是当我想把这个服务暴露到公网的时候,遇到了对话的历史记录无法加载出来的情况

# 根本原因
根本原因就是,我家里的宽带的80和443端口被封禁了,我用的不是标准的端口 11445
所以需要在nginx配置文件里面,设置请求头里面的host加上端口号
proxy_set_header Host $host:11445;

试了半天,终于试出来了,我知道问题出在哪里了

# 模拟验证

我对比了下内网和外网访问的时候,/api/models和/api/conversations这两个在不同网络环境下的差异  
看下面的图片  
[![image](https://user-images.githubusercontent.com/39456045/246604104-3ac12fc8-3204-41d1-a1c2-16fb73bbf7de.png)](https://user-images.githubusercontent.com/39456045/246604104-3ac12fc8-3204-41d1-a1c2-16fb73bbf7de.png)

# 情况说明

内网的访问的时候,请求头里面的host 是 192.168.8.1:8899  
而公网环境访问的时候,请求头里面的host是 [www.xxxxx.xyz](http://www.xxxxx.xyz) (我的域名)

# 可能的原因

所以我怀疑,公网访问的时候后面默认的是80的端口,也就是host可能是 [www.xxxxx.xyz:80](http://www.xxxxx.xyz:80) 或者www.xxxxx.xyz:443 只不过80或443省略了  
问题就在于,我的服务器的用的是家用的普通的宽带,80和443端口被封禁了

# 尝试办法

所以我修改了nginx配置文件里面的转发请求头相关的配置

## 修改前

`proxy_set_header Host $host;`

## 修改后

`proxy_set_header Host $host:11445;`

# 效果验证

可以看到network里面的状态是200了  
而且网页上也可以加载出来历史对话记录了  

[![image](https://user-images.githubusercontent.com/39456045/246604083-e146da39-cf18-4978-bf5b-5761c12e6627.png)](https://user-images.githubusercontent.com/39456045/246604083-e146da39-cf18-4978-bf5b-5761c12e6627.png)  
[![image](https://user-images.githubusercontent.com/39456045/246604181-ab92fb80-88ff-4cb5-b781-513b40b8ba23.png)](https://user-images.githubusercontent.com/39456045/246604181-ab92fb80-88ff-4cb5-b781-513b40b8ba23.png)