---
layout: post
title: 作业上传及查看平台的使用
subtitle: 作业上传及查看平台的使用
date: 2023-09-07
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
---
https://zhuanlan.zhihu.com/p/550073316
ssh -p 8022 192.168.3.45

```sh
# 进入ubuntu的命令
proot-distro login ubuntu
# 退出ubuntu的命令
logout
```

如果想要进入termux的时候默认的进入Ubuntu里面可以按照如下的操作进行: 
这个是在termux的环境里面,不是在ubuntu的环境里面操作的
1.在 ~目录下创建一个.profile的配置文件
```sh
cd ~
vim .profile

######################
proot-distro login ubuntu
######################

:wq
```

![](imgs/Pasted%20image%2020230924225303.png)
下面的这个命令可以更换termux的源
```sh
termux-change-repo
```
![](imgs/Pasted%20image%2020230924232154.png)

进入到Ubuntu的系统之后执行下面的命令就可以安装docker了
```sh
apt update
apt install docker.io -y
```
![](imgs/Pasted%20image%2020230925092303.png)