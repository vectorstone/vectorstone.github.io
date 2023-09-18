---
layout: post
title: Centos7 VMware虚拟机根分区扩容
subtitle: Centos7 VMware虚拟机根分区扩容
date: 2023-06-29
author: Gavin
header-img: img/post-bg-map.jpg
catalog: true
tags:
  - VMware
  - Centos7
  - 分区扩容
---
# vmware里面扩容
1.虚拟机的快照删掉,否则无法扩容
2.虚拟机需处于关机状态
满足以上两个条件,虚拟机里面的expand扩容选项才可以使用
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629225318.png)

扩容到自己想要的大小

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629225359.png)

# LVM根分区扩容
## 查看当前分区状况

```bash
# 查看当前分区空间的大小
df -TH
# 查看分区状态
lsblk
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629182838.png)

可以看出根目录在/dev/sda2的位置,有点麻烦,但是也不是不行

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629182816.png)

## 创建分区
```bash
fdisk /dev/sda
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629223357.png)

输入p 查看当前的分区状态
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629223420.png)

## 删除sda2和sda3

接下来要删除sda2和sda3,然后再重建分区,这里要计算好start 和 end

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629223536.png)

```bash
d
2
d
3
p
```

连续删除sda2和sda3
再输入p可以看到,只剩一个sda1了

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629223612.png)

## 重建sda2

```bash
n
p
2
回车
79691775
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629223826.png)

## 重建sda3

```bash
n
p
3
回车
回车
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629223920.png)

## 保存
输入w保存

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629224113.png) ^z4zkjx

## 重启
```bash
reboot
```

时间稍微有点久,几分钟,多等一会

## 刷新状态
xfs格式
```bash
xfs_growfs /dev/sda2
xfs_growfs /dev/sda3
```
ext格式
```bash
resize2fs /dev/sda2
resize2fs /dev/sda3
```

下面的这个情况先别慌,继续往下走

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629224418.png)

## 查看分区状况

```bash
# 查看分区状况
lsblk
```
这是之前的
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629182816.png)
这是现在的
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629224533.png)
可以看到,swap分区不见了

## swap交换分区自动挂载

```bash
# 进行分区
# fdisk /dev/sda
# 格式化
mkswap /dev/sda3
```

记录下来这个uuid后面会用,如果没记录也没事,使用blkid可以再查出来

```text
UUID=4268872a-0822-4c4f-bb98-f5bbb5ea3bb4
```

```bash
# 查看硬盘的uuid
blkid
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629224649.png)

挂载分区
```bash
# 挂载分区 swapon /dev/sda3 挂载  swapof /deva/sda3 卸载
swapon /dev/sda3
```

```bash
# 修改配置文件,这样重启后依旧可以挂载
vim /etc/fstab
```

将UUID改成sda3新的UUID

修改前

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629223152.png)

修改后

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629225007.png)

## 重启后测试

```bash
reboot
```

再次查看磁盘状况
```bash
lsblk
```

大功告成
根目录扩容成功,swap分区也回来了
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230629225122.png)