---
title: 作业上传功模块功能开发
Date: 2023-09-06
tags:
  - vue elementUI 权限管理
author: Gavin
---
# Lessen Learn
## 跨域问题
遇到的跨域的问题可以参考这个
[spring security POST请求 报403 Forbidden](https://www.cnblogs.com/hankuikui/p/14024637.html)

前端里面上传文件的路径地址不能直接写带有http协议的那个地址http://localhost:8800/api/oss/upload
要写成这样 :
开发环境: /dev-api/api/oss/upload
生产环境下需要写成: /prod-api/api/oss/upload
否则会存在跨域的问题(controller里面也可以配置@CrossOrigin这个注解)
推荐的方法是通过网关的过滤器来统一的解决跨域的问题,但是因为这个项目没有通过网关,所以没法使用网关过滤器的方式来解决跨域的问题

#思考 
为什么尚融宝的文件上传里面url可以直接写成带http协议的而权限管理的项目里面无法写成带http协议的
下面的这个代码是权限管理项目的vue.config.js文件里面,changeOrigin这个选项是前端进行了统一的跨域的配置,所以文件上传的路径只写uri就可以获取前端项目统一跨域的增益,不需要自己额外的在后端里面配置允许跨域的配置了
```js
proxy: {  
  '/prod-api': { // 匹配所有以 '/prod-api'开头的请求路径  
    target: 'http://localhost:8800',  
    changeOrigin: true, // 支持跨域  
    pathRewrite: { // 重写路径: 去掉路径中开头的'/dev-api'  
      '^/prod-api': ''  
    }  
  }  
}
```

尚融宝的项目里面的跨域是通过网关过滤器统一的进行配置的,所以前端页面里面的地址可以随便的写,后端会进行统一的处理
## 上传文件失败(没有获取到Access Token)
linux里面的 /etc/profile 或者 ~/.bashrc里面需要将阿里云的token设置进去否则会报错(最后也报错了,但是重启了下服务器就好了)
```sh
# 用户的配置文件
vim ~/.bashrc
source ~/.bashrc
# 系统的配置文件
vim /etc/profile
source /etc/profile
```
## 上传文件提示Request Entity Too Large
application.dev.profile里面刷要配置上传文件大小的设置
nginx里面也需要设置上传文件大小的设置
否则上传超过1m的文件的时候会包request entity to large的问题
application.yaml里面的相关的配置
```java
spring:  
  servlet:  
    multipart:  
      # 一次请求的所有文件表单项文件总大小  
      max-request-size: 50MB  
      # 单个文件表单项文件大小限制 10MB      max-file-size: 10MB
```

nginx里面的配置
```nginx
client_max_body_size 20m;
```
配置的位置入下图所示
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230909183447.png)

## 前端里面的捕获响应的拦截器的工作的原理
前端里面捕获后端的响应的拦截器的那部分再好好的研究下,看看到底是怎们回事(因为oss的接口在使用swagger2测试的时候是没有问题的,但是前端里面上传文件的时候就会有问题,这个时候的认证与授权的过滤器里面已经放行了oss的这个接口了)最后还是在授权的配置类里面加oss上传文件的接口放行之后才没有问题

homework-front/src/utils/request.js:53
这个里面有配置拦截器的整个的过程
请求的拦截器,主要的作用就是将token放置到请求头里面
响应的拦截器,主要的作用就是将响应体里面的data数据取出来
```js
import axios from 'axios'  
import { MessageBox, Message } from 'element-ui'  
import store from '@/store'  
import { getToken } from '@/utils/auth'  
  
// create an axios instance  
const service = axios.create({  
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url  
  // withCredentials: true, // send cookies when cross-domain requests  timeout: 5000 // request timeout  
})  
  
// request interceptor  
service.interceptors.request.use(  
  config => {  
    // do something before request is sent  
  
    // if (store.getters.token) {    //   // let each request carry token    //   // ['X-Token'] is a custom headers key    //   // please modify it according to the actual situation    //   config.headers['X-Token'] = getToken()    // }  
    const token = store.getters.token  
    if (token) {  
      config.headers['token'] = token  
    }  
    return config  
  },  
  error => {  
    // do something with request error  
    console.log(error) // for debug  
    return Promise.reject(error)  
  }  
)  
  
// response interceptor  
service.interceptors.response.use(  
  /**  
   * If you want to get http information such as headers or status   * Please return  response => response  */  
  /**   * Determine the request status by custom code   * Here is just an example   * You can also judge the status by HTTP Status Code   */  response => {  
    console.log(response.data);  
    const res = response.data  
  
    // if the custom code is not 20000, it is judged as an error.  
    if (res.code !== 200) {  
      Message({  
        message: res.message || 'Error',  
        type: 'error',  
        duration: 5 * 1000  
      })  
  
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;  
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {  
        // to re-login  
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {  
          confirmButtonText: 'Re-Login',  
          cancelButtonText: 'Cancel',  
          type: 'warning'  
        }).then(() => {  
          store.dispatch('user/resetToken').then(() => {  
            location.reload()  
          })  
        })  
      }  
      return Promise.reject(new Error(res.message || 'Error'))  
    } else {  
      return res  
    }  
  },  
  error => {  
    console.log('err' + error) // for debug  
    Message({  
      message: error.message,  
      type: 'error',  
      duration: 5 * 1000  
    })  
    return Promise.reject(error)  
  }  
)  
  
export default service
```
## 上传文件可以成功(数据库里有新增的数据),但是页面里面提示错误
最主要的原因是响应返回的code不一样,Result成功的响应的code是200,R成功的响应的code是0,而文件上传里面成功后的回调函数里面是通过判断响应的code是否为0来决定提示成功还是失败的
所以oss里面返回的统一结果集需要写成 R的那个,不能是result

Result里面的正常的ok的响应的结果:
```json
{
	"code": 0,
	"data": {},
	"message": ""
}
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230909191501.png)


R里面的正常的ok的响应的结果是:
```json
{
	"code": 0,
	"data": {},
	"message": ""
}
```

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230909191433.png)


![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230909191527.png)

其实最主要的原因是: 
在文件上传成功后的函数里面,response是直接去的响应,没有经过request里面的响应的拦截器
然后判断的code是否为0,Result里面的code是200,所以走了上传失败的那个else
homework-front/src/views/system/sysUpload/list.vue:164
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230909191910.png)

## 前端里面注册的表单的校验的使用方法
这里面也有通过正则表达式来校验username里面不能含有中文的代码
homework-front/src/views/login/index.vue:116
```js
export default {  
  name: 'Login',  
  data() {  
  
    var validatePass = (rule, value, callback) => {  
      if (value === '') {  
        callback(new Error('Please input the password'));  
      } else {  
        /* if (this.ruleForm.description !== '') {  
          this.$refs.ruleForm.validateField('description');        } */        callback();  
      }  
    };  
    var validatePass2 = (rule, value, callback) => {  
      if (value === '') {  
        callback(new Error('Please input the password again'));  
      } else if (value !== this.ruleForm.password) {  
        callback(new Error('Two inputs don\'t match!'));  
      } else {  
        callback();  
      }  
    };  
    //使用正则表达式来判断头像的url里面是否包含中文  
    var validateHeadurl = (rule,value,callback) => {  
      var patrn=/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;  
      if(patrn.exec(value)){  
        callback(new Error('请输入头像图片的链接'))  
      } else {  
        callback()  
      }  
    };  
  
    //注册的时候的用户名的校验的规则  
    const validateUsername = (rule, value, callback) => {  
      var patrn=/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;  
      if (value.length < 5) {  
        callback(new Error('请输入至少5个字符的用户名'))  
      } else if(patrn.exec(value)){  
        callback(new Error('用户名中不可以包含中文'))  
      } else {  
        callback()  
      }  
    };  
  
    const validateName = (rule, value, callback) => {  
      if (value.length === 0) {  
        callback(new Error('请输入用户名'))  
      }  else {  
        callback()  
      }  
    };  
  
    const validatePassword = (rule, value, callback) => {  
      if (value.length < 6) {  
        callback(new Error('请输入至少6个字符的密码'))  
      } else {  
        callback()  
      }  
    };  
    const validateGroup = (rule, value, callback) => {  
      var patrn = /[0-9]*/gi;  
      if (!patrn.exec(value)) {  
        callback(new Error('请输入数字组号'))  
      } else {  
        callback()  
      }  
    };  
    return {  
      dialogFormVisible: true,  
      //-----------------表单校验相关的  
      ruleForm: {  
        username: '',  
        password: '', //使用password替换pass,匹配后端的password字段  
        description: '', //使用description替换checkPass,用户表里面并没有这个checkPass的字段  
        name: '',  
        headUrl: '',  
        // phone: 0 //使用phone来作为组别  
      },  
      rules: {  
        username: [{required: true,validator: validateUsername,trigger: 'blur'}],  
        name: [{required: true,validator: validateName,trigger: 'blur'}],  
        password: [{required: true,validator: validatePass, trigger: 'blur'}],  
        description: [{required: true,validator: validatePass2, trigger: 'blur'}],  
        headUrl: [{validator: validateHeadurl,trigger: 'blur'}],  
        phone: [{required: true,validator: validateGroup,trigger: 'blur'}]  
      },  
      //----------------  
      dialogRoleVisible: false,  
      sysUser: {},  
      loginForm: {  
        username: 'admin',  
        password: '111111'  
      },  
      loginRules: {  
        //由于注册的时候username和登录的时候的username使用的是同一套的校验的规则,导致之前有的同学的注册的时候有中文的字符  
        //结果修改完校验的规则之后,登录的时候提示不能有中文字符,导致不能登录了  
        // username: [{required: true, trigger: 'blur', validator: validateUsername}],  
        username: [{required: true, trigger: 'blur'}],  
        password: [{required: true, trigger: 'blur', validator: validatePassword}]  
      },  
      loading: false,  
      passwordType: 'password',  
      redirect: undefined,  
    }  
      },  
  watch: {  
    $route: {  
      handler: function(route) {  
        this.redirect = route.query && route.query.redirect  
      },  
      immediate: true  
    }  
  },  
  methods: {  
    resetForm(){  
      this.ruleForm = {}  
    },  
    submitForm(){  
  
      this.$refs["registryForm"].validate((valid, msg) => {  
        if (valid) {  
          console.log("submit");  
          console.log(this.ruleForm);  
          api.addUser(this.ruleForm).then(res => {  
            this.$message.success(res.message || 'succeed')  
            this.dialogRoleVisible = false  
          })  
        } else {  
          console.log("error submit!!");  
          console.log(msg);  
          for (let key in msg) {  
            alert(msg[key][0].message);  
            return false;  
          }  
        }  
      });  
  
    },  
    handleregister(){  
      this.dialogRoleVisible = true  
    },  
    showPwd() {  
      if (this.passwordType === 'password') {  
        this.passwordType = ''  
      } else {  
        this.passwordType = 'password'  
      }  
      this.$nextTick(() => {  
        this.$refs.password.focus()  
      })  
    },  
    handleLogin() {  
      this.$refs.loginForm.validate(valid => {  
        if (valid) {  
          this.loading = true  
          this.$store.dispatch('user/login', this.loginForm).then(() => {  
            this.$router.push({ path: this.redirect || '/' })  
            this.loading = false  
          }).catch(() => {  
            this.loading = false  
          })  
        } else {  
          console.log('error submit!!')  
          return false  
        }  
      })  
    }  
  }  
}
```

## 文件上传的时候,可以增加判断,不符合要求禁止上传
比如按照要求我们需要用户在上传文件之前需要填写本次作业的名称,那么就可以通过
before-upload 这个函数,在里面校验此时的作业的名称是否为空,如果为空的话就return fasle,这样就无法完成上传的动作了
```js
<el-upload class="upload-demo" drag :action="uploadPath"  
:data="{module: homeworkName }"  
:on-preview="handlePreview" :on-success="uploadSuccess"  
  :on-error="uploadError" multiple style="margin-top: 10px"  
:before-upload="checkHomeworkName">  
  <i class="el-icon-upload"></i>  
  <div class="el-upload__text">  
    Drop file here or <em>click to upload</em>  
  </div>  
  <div class="el-upload__tip" slot="tip">  
    jpg/png files with a size less than 5MB  
  </div>  
</el-upload>

. . . . . . 
	
checkHomeworkName(file){  
  //上传文件之前的钩子,参数为上传的文件,如果返回false或者返回promise且被reject,则停止上传  
  if (this.homeworkName.length === 0){  
    //如果没有选择任何的作业的名称,则弹出提示信息并阻止上传  
    this.$message.warning('请选择本次上传的图片的作业的名称,否则无法上传');  
    return false;  
  }  
}
```
## 正则表达式判断字符串里面是否包含中文
如果用户的头像的地址链接里面含有中文的话,就将其替换为一个默认的头像的地址
```java
//有的人不删除提示的那个内容,所以增加一个判断头像的链接中是否包含中文  
Pattern p = Pattern.compile("[\u4E00-\u9FA5|\\！|\\，|\\。|\\（|\\）|\\《|\\》|\\“|\\”|\\？|\\：|\\；|\\【|\\】]");  
Matcher m = p.matcher(sysUser.getHeadUrl());  
  
if (StringUtils.isBlank(sysUser.getHeadUrl()) || m.find()){  
    //如果用户没有设置头像的链接的话,那么就给设置一个默认值  
    sysUser.setHeadUrl("https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/20180629210546_CQARA.jpeg");  
}
```

## 快速的查询谁没有交作业
```java
//zhf肄业,不查询他的数据  
List<Classmates> classmateslist = classmatesService.list(Wrappers.lambdaQuery(Classmates.class)  
        .notIn(Classmates::getName,"zhf"));  
// List<SysImages> imagesList = userImagesMapper.selectList(null);  
  
//只查询当天的作业,添加到下面的这个集合中的作业都是不会查询的,后期可以通过前端里面checkbox的方式将需要查询提交情况的作业直接传过来,这样就不需要在代码里面进行硬编码了
List<String> outOfDateHomework = new ArrayList<>();  
outOfDateHomework.add("电商架构图");  
outOfDateHomework.add("电商表关系图");  
outOfDateHomework.add("分布式加锁解锁流程图");  
outOfDateHomework.add("缓存数据的访问流程");  
List<Homework> homework = homeworkMapper.selectList(Wrappers.lambdaQuery(Homework.class)  
        .notIn(Homework::getName,outOfDateHomework));  
  
// List<SysUser> sysUsers = sysUserMapper.selectList(null);  
Map<String, String> map = new HashMap<>();  
//怎么遍历呢  
classmateslist.forEach(classmates -> {  
    String username = classmates.getName();  
    homework.forEach(h -> {  
        String homeworkName = h.getName();  
        Integer count = userImagesMapper.selectCount(Wrappers.lambdaUpdate(SysImages.class).eq(SysImages::getUsername, username)  
                .eq(SysImages::getImageName,homeworkName));  
        if (count == 0){  
            //如果查询不到结果那么就是没有交作业  
            boolean b = map.containsKey(username);  
            if(b){  
                //进来这里面说明之前的有其他的作业没交,直接追加  
                String s = map.get(username);  
                map.put(username,s + " , "+ homeworkName);  
            }else{  
                //第一次查询到他有作业没交  
                map.put(username,homeworkName);  
            }  
        }  
    });  
});  
Set<Map.Entry<String, String>> entries = map.entrySet();  
for (Map.Entry<String, String> entry : entries) {  
    System.out.println(entry.getKey() + " : " +entry.getValue());  
}
```
## 前端里面也有类似的stream API的写法 lambda
homework-front/src/views/system/sysShow/list.vue:70
比如下面的这个方法里面的例子,我们可以通过这个map将homeworkList里面的每个对象的名字都取出来
```java
handleCheckAllChange(val) {  
  console.log(val)  
  // this.checkedCities = val ? cityOptions : [];  
  
  // this.checkedCities = val ? this.homeworkList : []; 这个状态全选的是对象,而我们只想要里面的name  
  this.checkedCities = val ? this.homeworkList.map(item => item.name) : [];  
  console.log(this.checkedCities)  
  this.isIndeterminate = false;  
},
```

## spring security里面密码加盐的操作
参考的文章:[Spring Boot 中密码加密的两种姿势](http://www.javaboy.org/2020/0521/springsecurity-passwordencoder.html)
spring security里面提供了一个比加盐更加牛逼的密码加密器,具体的实现的步骤如下
1.要将原有的实现的密码加密器注释掉
![](imgs/Pasted%20image%2020230913201935.png)
2.新增一个密码加密器的配置类
```java
@Configuration  
public class MyBcryptPasswordEncoderConfig {  
    @Bean  
    PasswordEncoder passwordEncoder() {  
        return new BCryptPasswordEncoder(10);  
    }  
}
```
3.在注册的业务代码里面修改密码加密的逻辑
```java
// 注入新的配置的密码加密器
@Autowired  
PasswordEncoder passwordEncoder;
. . . . . .
@Override  
public void addUser(SysUser sysUser) {
. . . . . .
//对密码进行加密
String encryptPassword = passwordEncoder.encode(sysUser.getPassword());
//将加密后的密码设置到新增的用户里面
sysUser.setPassword(encryptPassword);
. . . . . .
}
```
4.实现的效果如下:
这两个用户的明文的密码都是: 123456
可以实现明文密码一样,但是加密出来的结果不一样
![](imgs/Pasted%20image%2020230913202212.png)

还有另外的一种方式没有试过: 
[SpringBoot Security密码加盐](https://cloud.tencent.com/developer/article/2198817)

# 项目上线部署的流程
启动service-system后端的命令
```java
nohup java -jar /home/gavin/exercise/service-system.jar>springboot.log 2>&1 &
```

```
nohup java -jar /home/gavin/exercise/system-service.jar>springboot.log 2>&1 &
```

```sh
npm run build:prod # 打包的时候运行的命令
npm run dev # 生产环境下的运行的命令
```

启用内网穿透的命令
```sh
# windows下的frpc的文件的目录
cd D:\ruanjianbao\frp_0.51.3_windows_amd64\
frpc.exe -c frpc.ini
# linux下的frpc的文件的目录(gavin-server)
cd /opt/frp_0.51.3_linux_amd64
./frpc -c ./frpc.ini
```

frp内网穿透的客户端(Gavin-Server)的配置文件
```sh
[common]
# 云服务器ip
server_addr = 124.222.220.45
# frps服务端和frpc客户端通讯的端口
server_port = 7000
# 密码
token = sh0309
[web]
type = http
# local_ip = 192.168.8.141 # 写这个ip试过也是可以的
local_ip = 127.0.0.1
# 本地需要暴露的服务的端口
local_port = 80
# 云服务器的ip或者云服务器的域名
custom_domains = 124.222.220.45
```

gavin-server不需要端口转发也是可以直接的使用frp进行内网的穿透的

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230909084122.png)
Gavin-server上面的nginx的配置
```nginx
	server {                                                                          
	listen 80;   
	#listen [::]:80;	
	#server_name localhost;
	#server_name 192.168.8.141; # 如果不使用内网穿透的话,必须是本机的ip,否则404
	server_name 124.222.220.45; # 使用了内网穿透的,所以必须是frp server主机的ip,否则404
	#server_name 0.0.0.0;
	#server_name _;

  
client_max_body_size 20m;
                       
	location / {                                                      
			#root /var/www/html;                                            
			root /usr/share/nginx/html;                                            
			index index.html index.htm;                               
	}
 
 	location /blog/ {                                                      
			#root /www/vod;                                            
			#index index.html index.htm;
      #proxy_pass http://127.0.0.1:8090/;
      #rewrite ^/blog /                               
	}
 
  location /prod-api/ {                                                      
  		#root /www/vod;                                            
  		#index index.html index.htm;
		#return 200 "test";
      proxy_pass http://127.0.0.1:8800/;                               
  }
  
                                                           
	error_page 500 502 503 504 /50x.html;                             
	location = /50x.html{                                             
			root html;                                                
	}                                                                 
}
```

tecent上面的nginx的配置文件
```nginx
server {                                                                          
	listen 80;                                                        
	server_name 124.222.220.45;
  
client_max_body_size 20m;
                       
	location / {                                                      
			root /var/www/html;                                            
			index index.html index.htm;                               
	}
# blog的这个不用管
 	location /blog/ {                                                      
			#root /www/vod;                                            
			#index index.html index.htm;
      #proxy_pass http://127.0.0.1:8090/;
      #rewrite ^/blog /                               
	}
 
  location /prod-api/ {                                                      
  		#root /www/vod;                                            
  		#index index.html index.htm;
      proxy_pass http://127.0.0.1:8800/;                               
  }
  
 
	error_page 500 502 503 504 /50x.html;                             
	location = /50x.html{                                             
			root html;                                                
	}                                                                 
}

	server {
		listen 80;
		server_name api.gmall.com;
		
		location / {
			proxy_pass http://192.168.216.1:8888;
		}
	}
	server {
		listen 80;
		server_name manager.gmall.com;
		
		location / {
			proxy_pass http://192.168.216.1:1000;
		}
	}

```

tencent /var/www/html
# Bug Fix And New Feature List
- [x] oss接口没有鉴权与认证,所以需要进行一个是否登录的判断,如果没有登录(也就是获取到的token为空的话需要抛出异常)

- [x] 新增用户的接口也没有进行认证和授权(主要是放开给注册使用的),可以不用管
- [x] 问题提交：
- [x] 没有密码，注册成功，登录失败，提示需要密码
- [x] 注册成功，登录失败，提示账号名太短
- [x] 无法删除自己注册的无用的账户---普通学上用户是没有删除其他用户的权限的,自己的也不行,必须管理员来删除
- [x] 图片轮播的功能 
- [x] sysUpload里面的第22行的位置的提示文件大小限制的字需要修改一下(下图中的是已经修改过的)
![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230908082653.png)
- [x] 文件上传的页面里面作业的名称改成下拉式的,而且是必选项目,数据库里面可以设置一个可选的选项
- [ ] 授权的这个东西好好的研究下
- [x] 修改一下文件保存的路径,不要使用作业名称+姓名的方式,统一改成作业名称的方式
- [x] 查询哪些同学没有交作业(前端和后端一起完善)

# New Feature issue
作业上传及查看平台版本更新: 
1.完善了注册页面表单校验的相关的规则(例如,用户名长度以及不能包含中文等等)
2.上传文件页面,如果不选择作业的名称的话无法上传文件
3.增加了首页的图片轮播的功能,可以快速的预览各位同学的作业(可以点击放大)
4.增加了未提交作业同学信息的查看(如果统计有误的话可以反馈给我)
项目前端仓库地址: https://github.com/vectorstone/homeworkUploadFront.git/
项目后端仓库地址: https://github.com/vectorstone/homeworkUploadBackend.git/
欢迎start,谢谢

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230912084354.png)

![](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/Pasted%20image%2020230911112435.png)
push comment: 
230909 new feature issue: 1.improve the registry page rule;2. fix upload page bugs; 3.create the images show function; 4.creage the page that can query classmates who didn't submit homework