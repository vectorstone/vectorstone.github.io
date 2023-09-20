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
根本原因就是,家用宽带的80和443端口被封禁了,所以我用的不是标准的端口而是自定义的11445
所以需要在nginx配置文件里面,设置请求头里面的host加上端口号,如下:
```nginx
proxy_set_header Host $host:11445;
```

# 模拟验证

我对比了下内网和外网访问的时候,/api/models和/api/conversations这两个在不同网络环境下的差异  
看下面的图片  
[![image](https://user-images.githubusercontent.com/39456045/246604104-3ac12fc8-3204-41d1-a1c2-16fb73bbf7de.png)](https://user-images.githubusercontent.com/39456045/246604104-3ac12fc8-3204-41d1-a1c2-16fb73bbf7de.png)
# 情况说明
内网的访问的时候,请求头里面的host 是 192.168.8.1:8899  
而公网环境访问的时候,请求头里面的host是 [www.xxxxx.xyz](http://www.xxxxx.xyz) (我的域名)
# 可能的原因
所以我怀疑,公网访问的时候后面默认的是80或者443的端口
也就是host可能是 [www.xxxxx.xyz:80](http://www.xxxxx.xyz:80) 或者www.xxxxx.xyz:443 只不过80或443是默认的端口,所以省略了
但是我的服务器的用的是家用的普通的宽带,80和443端口被封禁了,我用的是11445这个端口
# 尝试办法
所以我修改了nginx配置文件里面的转发请求头相关的配置
```nginx
# 修改前
proxy_set_header Host $host;

# 修改后
proxy_set_header Host $host:11445;
```
# 效果验证

可以看到network里面的状态是200了  
而且网页上也可以加载出来历史对话记录了  

[![image](https://user-images.githubusercontent.com/39456045/246604083-e146da39-cf18-4978-bf5b-5761c12e6627.png)](https://user-images.githubusercontent.com/39456045/246604083-e146da39-cf18-4978-bf5b-5761c12e6627.png)  
![image](https://user-images.githubusercontent.com/39456045/246604181-ab92fb80-88ff-4cb5-b781-513b40b8ba23.png)
# 完整的nginx的配置文件
```nginx
```nginx
upstream pandora_gpt {
	server 127.0.0.1:8899;
}

server {

  listen 11445 ssl;
  listen [::]:11445 ssl;
  
  server_name localhost;
  
  # resolve 400 Request Header Or Cookie Too Large
  large_client_header_buffers 4 32k;
  
  #/etc/nginx/conf.d/
  ssl_certificate xxxx.pem;
  ssl_certificate_key xxxx.key;

  charset utf-8;

        # 配置静态资源
        location ~* ^/(.*\.(js|css|png|otf|woff))$ {
            # 配置缓存
            #proxy_cache my_cache;
            proxy_cache_valid 200 1d;
            proxy_cache_key $host$uri$is_args$args;
            proxy_ignore_headers Cache-Control;
            proxy_ignore_headers Set-Cookie;

            # 关闭认证
            auth_basic off;

            # 转发请求头配置
            proxy_set_header Host $host:11445;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            add_header Content-Security-Policy "upgrade-insecure-requests;connect-src *";
			proxy_set_header X-Forwarded-Proto $scheme; # 6/17 18 08 增加

            # 代理请求到后端服务器
            proxy_pass http://pandora_gpt;
        }

        location / {
			#关闭验证
            auth_basic off;
			#转发请求头配置
            proxy_set_header Host $host:11445;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            add_header Content-Security-Policy "upgrade-insecure-requests;connect-src *";
			proxy_set_header X-Forwarded-Proto $scheme; # 6/17 18 08 增加
            #代理请求到后端服务器
			proxy_pass http://pandora_gpt;
        }

        # 处理非静态资源的 /api 开头的所有资源
        location ~* ^/api {
            # 禁用缓存
            proxy_no_cache 1;
            proxy_cache_bypass 1;

            # 认证配置
            auth_basic "auth";
            auth_basic_user_file /etc/config/htpasswd;

            # 请求头配置
            proxy_set_header Host $host:11445;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            add_header Content-Security-Policy "upgrade-insecure-requests;connect-src *";
			proxy_set_header X-Forwarded-Proto $scheme; # 6/17 18 08 增加

            # 转发服务配置
            proxy_pass http://pandora_gpt;
        }

        # gitlab    
        location /gitlab/ {
            #auth_basic "auth";
            #auth_basic_user_file /etc/config/htpasswd;
            #rewrite ^/*.html$ /ad/*.html break;     
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			proxy_set_header X-Forwarded-Proto $scheme; # 6/17 18 08 增加
            proxy_pass http://192.168.8.141:10008;
            } 
}
```
```