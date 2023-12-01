---
layout: post
title: VMware安装OpenWrt
subtitle: VMware安装OpenWrt
date: 2023-12-01
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
  - OpenWrt
  - VMware
---
# 固件及StartWind V2V Convert软件
[固件推荐](https://www.right.com.cn/forum/thread-4053752-1-1.html)
[StartWind V2V Convert软件下载](https://www.alipan.com/s/q77N2E5vh1r)
# 镜像转换
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231535.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231609.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231723.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231738.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231748.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231803.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231817.png)
# 创建虚拟机
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231838.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231859.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231913.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231931.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231940.png)


# 配置虚拟机
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201231954.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232014.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232035.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232048.png) ^0nsywz

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232109.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232121.png)
# 配置OpenWrt IP地址
查看windows下VMware给宿主机分配的IP地址
```sh
ipconfig/all
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232227.png)

虚拟机中输入: 
```sh
vi /etc/config/network
```

修改如下的两个地方
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232327.png)

```sh
esc # 退出编辑模式
:wq # 保存并退出
reboot # 重启OpenWrt
```

浏览器地址栏输入http://192.168.111.100 即可访问OpenWrt的后台管理页面
默认的用户名和密码: 
root
password
# 创建snapshot

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232515.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020231201232534.png)