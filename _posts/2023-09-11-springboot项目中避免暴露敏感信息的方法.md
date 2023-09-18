---
layout: post
title: jasypt加密工具的使用
subtitle: jasypt加密工具
date: 2023-09-07
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
---
# 通过yml读取系统环境变量的方式
[解决在项目开源中可能暴露敏感信息的问题](https://www.autumnclouds.cn/articles/178)
这种方式不光可以避免在项目中暴露我们的用户名和密码,甚至可以避免暴露我们的服务器的ip地址
## windows
右键`此电脑` -> `属性` -> `高级系统设置` -> `环境变量`进入到环境变量配置界面

**配置完系统的环境变量之后一定要重启idea或者是系统,让环境变量生效**

远程版本
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://${REMOTE_HOST:localhost}:3306/autumn_cloud?characterEncoding=utf-8&useSSL=false
    username: ${REMOTE_MYSQL_USERNAME:root}
    password: ${REMOTE_MYSQL_PASSWORD:root}
  redis:  
  host: ${REMOTE_HOST:localhost} 
  port: 6379 
  password: ${REMOTE_REDIS_PASSWORD:root}
```

本地版本
```yaml
spring:
  datasource:
    driver-class-name: com.mysql.jdbc.Driver
    url: jdbc:mysql://${LOCAL_HOST:localhost}:3306/autumn_cloud?characterEncoding=utf-8&useSSL=false
    username: ${LOCAL_MYSQL_USERNAME:root}
    password: ${LOCAL_MYSQL_PASSWORD:root}
  redis:  
  host: ${LOCAL_HOST:localhost} 
  port: 6379 
  password: ${LOCAL_REDIS_PASSWORD:root}
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230913203902.png)

## linux里面设置对应的环境变量
**同样设置完成后需要刷新,让设置的环境变量生效**
```sh
source ~/etc/profile
source ~/.bashrc
source ~/.zashrc
```

```sh
REMOTE_HOST=xxx
REMOTE_MYSQL_USERNAME=xxx
REMOTE_MYSQL_PASSWORD=xxx
REMOTE_REDIS_PASSWORD=xxx

LOCAL_MYSQL_USERNAME=xxx
LOCAL_MYSQL_PASSWORD=xxx
LOCAL_HOST=xxx
LOCAL_REDIS_PASSWORD=xxx
```

# 方法通过jasypt加密工具来对用户名和密码进行加密
[springboot配置文件中的配置项加密&jasypt的使用](https://blog.csdn.net/java_t_t/article/details/132242017)
这种方式只能加密我们的用户名和密码,不能对ip地址加密再读取,会报错
## 系统环境变量里面设置加密使用的密钥
设置完记得要重启idea或者是系统
JASYPT_PASS
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230914111911.png)

```sh
export JASYPT_PASS=xxx
```
## 引入依赖
我测试使用的springboot的版本是2.3.6
```xml
<!-- jasypt-spring-boot-starter -->  
<dependency>  
    <groupId>com.github.ulisesbocchio</groupId>  
    <artifactId>jasypt-spring-boot-starter</artifactId>  
    <version>3.0.5</version>  
</dependency>
```

## 获取加密后的密文
```java
@Autowired  
private StringEncryptor encryptor;  
@Test  
void test4(){  
    List<String> properties = new ArrayList<>();  
    properties.add("需要加密的用户名1");  
    properties.add("需要加密的密码1");  
    properties.add("需要加密的用户名2");  
    properties.add("需要解密的密码2");  
    properties.forEach(property -> {  
        System.out.println(property + " = " + encryptor.encrypt(property));  
    });  
}
// 输出后的格式类似与这个样子
//xxxx = XC2ObTM80vSAsUNA5uTAjMp4OEg09wYpXsVXJS1xm62fZN3dcdocryBJpa6qbMTm
```
## 修改配置文件
```yaml
# 读取系统的环境变量,加载jasypt的加解密密钥
jasypt:  
  encryptor:  
    password: ${JASYPT_PASS}

spring:
  # 配置MySQL的datasource链接的信息
  datasource:  
    driver-class-name: com.mysql.cj.jdbc.Driver  
    url: jdbc:mysql://124.222.220.45:32768/account_book?serverTimezone=Asia/Shanghai  
    username: ENC(+UqVvXNR//wSI0Qp1xAh/PLrJKYjgnhAoyL5BAvngMvInTuxcijGEkaqtjjfUN8d)  
    password: ENC(vqUawoWuP0ai73FSET+uU4hQN8gELwUediXJ41S86h2zc6G09JV8VqkwdE/89tn0Ntt3uu8kjao8dfuFf4qtHg==)  
#    type: com.zaxxer.hikari.HikariDataSource  
  # 配置Redis的链接的信息
  redis:  
    host: 124.222.220.45  
    port: 6379  
    password: ENC(XC2ObTM80vSAsUNA5uTAjMp4OEg09wYpXsVXJS1xm62fZN3dcdocryBJpa6qbMTm)
```
