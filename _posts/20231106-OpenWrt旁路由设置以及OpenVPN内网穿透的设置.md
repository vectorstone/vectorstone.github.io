---
layout: post
title: OpenWrt旁路由设置以及OpenVPN内网穿透的设置
subtitle: 作业上传及查看平台的使用
date: 2023-11-06
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
---
# 旁路由的设置

![](imgs/Pasted%20image%2020231106130739.png)

下面的自定义服务器那里面可以填写主路由的ip地址 例如下面的设置里面就是192.168.8.1
![](imgs/Pasted%20image%2020231106130856.png)

高级设置里面把DHCP的功能禁用掉(也就是不在此接口提供DHCP服务勾选上)
![](imgs/Pasted%20image%2020231106130920.png)

其他的保持原样不要动就好了
![](imgs/Pasted%20image%2020231106131045.png)

后面还有防火墙的设置
![](imgs/Pasted%20image%2020231112224256.png)
# openvpn的设置
此时没有公网ip了,所以需要借助于frp内网穿透的功能来实现openvpn的功能
腾讯云里面放行7006端口,1panel里面也要放行7006端口
1panel的地址如下:
http://124.222.220.45:23127/6d3c1aa3ea

wan口的DDNS域名或者IP地址这个地方就填写openwrt的内网的地址192.168.8.55
![](imgs/Pasted%20image%2020231106131322.png)

然后.ovpn的配置文件里面需要修改一下remote的ip地址和端口,改成frps服务器的ip地址和端口
也就是下面的配置文件里面的remote对应的后面的内容
```sh
client
dev tun
proto tcp4
remote 124.222.220.45 7006
resolv-retry infinite
nobind
persist-key
persist-tun
verb 3
<ca>
. . . . . 
```

然后就可以正常的使用openvpn的功能了,就是速度稍微有点慢

# 终端的设置(非侵入式的)
这个方式不好,需要每一个都自己手动的来设置ip地址和网关的地址,非常的繁琐
例如windows里面的设置这样来

![](imgs/Pasted%20image%2020231113190650.png)

![](imgs/Pasted%20image%2020231112224214.png)

# 终端的设置(侵入式的)
理论上只需要将主路由的DHCP里面的网关修改为旁路由的ip即可,但是因为我是主路由桥接的网络,所以DHCP里面没有修改网关的设置

# 非旁路由默认的设置

![](imgs/Pasted%20image%2020231114231453.png)