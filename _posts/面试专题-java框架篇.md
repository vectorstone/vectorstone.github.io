---
layout: post
title: 面试专题-java框架篇
subtitle: 面试专题-java框架篇
date: 2023-09-12
author: Gavin
header-img: img/post-bg-alibaba.jpg
catalog: true
tags:
  - 博客
  - 面试 Java
---
# 面试专题-java框架篇

## 1. spring常见问题

### 1.1. spring是什么?

在不同的语境中，Spring 所代表的含义是不同的。下面我们就分别从“广义”和“狭义”两个角度，对 Spring 进行介绍。

**广义的 Spring：Spring 技术栈**

广义上的 Spring 泛指以 Spring Framework 为核心的 Spring 技术栈。

经过十多年的发展，Spring 已经不再是一个单纯的应用框架，而是逐渐发展成为一个由多个不同子项目（模块）组成的成熟技术，例如 Spring Framework、Spring MVC、SpringBoot、Spring Cloud、Spring Data、Spring Security 等，其中 Spring Framework 是其他子项目的基础。

这些子项目涵盖了从企业级应用开发到云计算等各方面的内容，能够帮助开发人员解决软件发展过程中不断产生的各种实际问题，给开发人员带来了更好的开发体验。

**狭义的 Spring：Spring Framework**

狭义的 Spring 特指 Spring Framework，通常我们将它称为 Spring 框架。

Spring 框架是一个分层的、面向切面的 Java 应用程序的一站式轻量级解决方案，它是 Spring 技术栈的核心和基础，是为了解决企业级应用开发的复杂性而创建的。

Spring 有两个最核心模块： IoC 和 AOP。

**IoC**：Inverse of Control 的简写，译为“控制反转”，指把创建对象过程交给 Spring 进行管理。

**AOP**：Aspect Oriented Programming 的简写，译为“面向切面编程”。AOP 用来封装多个类的公共行为，将那些与业务无关，却为业务模块所共同调用的逻辑封装起来，减少系统的重复代码，降低模块间的耦合度。另外，AOP 还解决一些系统层面上的问题，比如日志、事务、权限等。

### 1.2. 谈谈你对AOP的理解

全称:面向切面编程

系统是由许多不同的组件所组成的，每一个组件各负责一块特定功能。除了实现自身核心功能之外，这些组件还经常承担着额外的职责。例如日志、事务管理和安全等其他的核心服务经常融入到自身具有核心业务逻辑的组件中去。这些系统服务经常被称为横切关注点，因为它们会跨越系统的多个组件。

当我们需要为分散的对象引入公共行为的时候，OOP则显得无能为力。也就是说，OOP允许你定义从上到下的关系，但并不适合定义从左到右的关系。例如日志功能。

日志代码往往水平地散布在所有对象层次中，而与它所散布到的对象的核心功能毫无关系。

在OOP设计中，它导致了大量代码的重复，而不利于各个模块的重用。

AOP:将程序中的交叉业务逻辑(比如安全，日志，事务等)，封装成一个切面，然后注入到目标对象(具体业务逻辑)中去。AOP可以对某个对象或某些对象的功能进行增强，比如对象中的方法进行增强，可以在执行某个方法之前额外的做一些事情，在某个方法执行之后额外的做一些事情

### 1.3. 谈谈你对IOC的理解

IoC 是 Inversion of Control 的简写，译为“控制反转”，它不是一门技术，而是一种设计思想，是一个重要的面向对象编程法则，能够指导我们如何设计出松耦合、更优良的程序。

Spring 通过 IoC 容器来管理所有 Java 对象的实例化和初始化，控制对象与对象之间的依赖关系。我们将由 IoC 容器管理的 Java 对象称为 Spring Bean，它与使用关键字 new 创建的 Java 对象没有任何区别。

IoC 容器是 Spring 框架中最重要的核心组件之一，它贯穿了 Spring 从诞生到成长的整个过程

### 1.4. Spring Boot、 Spring MVC和Spring有什么区别

spring是一个IOC容器，用来管理Bean，使用依赖注入实现控制反转，可以很方便的整合各种框架，提供AOP机制弥补OOP的代码重复问题、更方便将不同类不同方法中的共同处理抽取成切面、自动注入给方法执行，比如日志、异常等

springmvc是spring对web框架的一个解决方案，提供了一个总的前端控制器Servlet，用来接收请求，然后定义了一套路由策略(url到handle的映射)及适配执行handle，将handle结果使用视图解析技术生成视图展现给前端

springboot是spring提供的一个快速开发工具包，让程序员能更方便、更快速的开发spring+springmvc应用，简化了配置(约定了默认配置)，整合了一系列的解决方案(starter机制)、redis.mongodb.es，可以开箱即用

### 1.5. spring bean 生命周期![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/88efd300-827b-4037-bbc5-60b065137e51.png)

bean对象创建（调用无参构造器） 给bean对象设置属性 bean的后置处理器（初始化之前） bean对象初始化（需在配置bean时指定初始化方法） bean的后置处理器（初始化之后） bean对象就绪可以使用 bean对象销毁（需在配置bean时指定销毁方法） IOC容器关闭

### 1.6. spring事务传播机制有哪些?

事务的传播行为一般发生在事务嵌套的场景中。如：有一个事务的方法里面调用了另外一个有事务的方法。这时会产生事务边界控制问题。即两个方式是各自作为事务提交还是内层事务合并到外层事务一起提交。

|传播机制|含义|
|---|---|
|REQUIRED|默认值，支持当前事务，如果没有事务会创建一个新的事务|
|SUPPORTS|支持当前事务，如果没有事务的话以非事务方式执行|
|MANDATORY|支持当前事务，如果没有事务抛出异常|
|REQUIRES_NEW|创建一个新的事务并挂起当前事务|
|NOT_SUPPORTED|以非事务方式执行，如果当前存在事务则将当前事务挂起|
|NEVER|以非事务方式进行，如果存在事务则抛出异常|
|NESTED|如果当前存在事务，则在嵌套事务内执行。如果当前没有事务，则进行与REQUIRED类似的操作|
NESTED嵌套事务,基于JDBC3.0中的savePoint技术实现的
### **1.7. 循环依赖**

请解释一下spring中的三级缓存三级缓存分别是什么? 三个Map有什么异同? 什么是循环依赖?请你谈谈? 看过spring源码吗? 如何检测是否存在循环依赖? 实际开发中见过循环依赖的异常吗? 多例的情况下,循环依赖问题为什么无法解决?什么是循环依赖?

![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/d06bdf10-6793-4930-92fc-c099501fc164.png)

两种注入方式对循环依赖的影响?

官方解释[https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-dependency-resolution](https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#beans-dependency-resolution)循环依赖如果主要使用构造函数注入，则有可能创建无法解析的循环依赖场景（circular dependency scenario）。例如：类A通过构造函数注入需要类B的实例，类B通过构造函数注入需要类A的实例。如果为类A和类B配置bean以相互注入，Spring IoC容器将在运行时检测此循环引用，并抛出BeanCurrentlyInCreationException。一种可能的解决方案是编辑某些类的源代码，由setter而不是构造函数进行配置。或者，避免构造函数注入，只使用setter注入。换句话说，虽然不推荐，可以使用setter注入来配置循环依赖项（circular dependencies）。与典型情况（没有循环依赖）不同，bean A和bean B之间的循环依赖迫使一个bean在完全初始化之前注入另一个bean（典型的鸡和蛋场景）

相关概念

实例化:堆内存中申请空间![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/583828c6-6c67-4e4e-8b32-554848f10516.png)

初始化:对象属性赋值![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/9db1ae60-1538-4393-be56-5d4c92b760cf.png)

三级缓存名称对象名含义

一级缓存singletonObjects存放已经经历了完整生命周期的Bean对象

二级缓存earlySingletonObjects存放早期暴露出来的Bean对象，Bean的生命周期未结束（属性还未填充完)

三级缓存singletonFactories存放可以生成Bean的工厂四个关键方法

![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/cc0e1357-7bb1-4a6f-9782-ec9a0e41d4e1.png)

package org.springframework.beans.factory.support;  
...  
public class DefaultSingletonBeanRegistry extends SimpleAliasRegistry implements SingletonBeanRegistry {  
    ...  
    /**   
    单例对象的缓存:bean名称—bean实例，即:所谓的单例池。  
    表示已经经历了完整生命周期的Bean对象  
    第一级缓存  
    */  
    private final Map<String, Object> singletonObjects = new ConcurrentHashMap<>(256);  
    /**  
    早期的单例对象的高速缓存: bean名称—bean实例。  
    表示 Bean的生命周期还没走完（Bean的属性还未填充）就把这个 Bean存入该缓存中也就是实例化但未初始化的 bean放入该缓存里  
    第二级缓存  
    */  
    private final Map<String, Object> earlySingletonObjects = new HashMap<>(16);  
    /**  
    单例工厂的高速缓存:bean名称—ObjectFactory  
    表示存放生成 bean的工厂  
    第三级缓存  
    */  
    private final Map<String, ObjectFactory<?>> singletonFactories = new HashMap<>(16);  
}

debug源代码过程

需要22个断点(可选)

1，A创建过程中需要B，于是A将自己放到三级缓里面，去实例化B

2，B实例化的时候发现需要A，于是B先查一级缓存，没有，再查二级缓存，还是没有，再查三级缓存，找到了A然后把三级缓存里面的这个A放到二级缓存里面，并删除三级缓存里面的A

3，B顺利初始化完毕，将自己放到一级缓存里面(此时B里面的A依然是创建中状态)

然后回来接着创建A，此时B已经创建结束，直接从一级缓存里面拿到B，然后完成创建，并将A自己放到一级缓存里面。

总结

1，Spring创建 bean主要分为两个步骤，创建原始bean对象，接着去填充对象属性和初始化。

2，每次创建 bean之前，我们都会从缓存中查下有没有该bean，因为是单例，只能有一个。

3，当创建 A的原始对象后，并把它放到三级缓存中，接下来就该填充对象属性了，这时候发现依赖了B，接着就又去创建B，同样的流程，创建完B填充属性时又发现它依赖了A又是同样的流程，不同的是：这时候可以在三级缓存中查到刚放进去的原始对象A。

所以不需要继续创建，用它注入 B，完成 B的创建既然 B创建好了，所以 A就可以完成填充属性的步骤了，接着执行剩下的逻辑，闭环完成

Spring解决循环依赖依靠的是Bean的"中间态"这个概念，而这个中间态指的是**已经实例化但还没初始化的状态—>半成品**。实例化的过程又是通过构造器创建的，如果A还没创建好出来怎么可能提前曝光，所以构造器的循环依赖无法解决

其他问题

问题1:为什么构造器注入属性无法解决循环依赖问题?

由于spring中的bean的创建过程为先实例化 再初始化(在进行对象实例化的过程中不必赋值)将实例化好的对象暴露出去,供其他对象调用,然而使用构造器注入,必须要使用构造器完成对象的初始化的操作,就会陷入死循环的状态

问题2:一级缓存能不能解决循环依赖问题? 不能

在三个级别的缓存中存储的对象是有区别的 一级缓存为完全实例化且初始化的对象 二级缓存实例化但未初始化对象 如果只有一级缓存,如果是并发操作下,就有可能取到实例化但未初始化的对象,就会出现问题

问题3:二级缓存能不能解决循环依赖问题?

理论上二级缓存可以解决循环依赖问题,但是需要注意,为什么需要在三级缓存中存储匿名内部类(ObjectFactory),原因在于 需要创建代理对象 eg:现有A类,需要生成代理对象 A是否需要进行实例化(需要) 在三级缓存中存放的是生成具体对象的一个匿名内部类,该类可能是代理类也可能是普通的对象,而使用三级缓存可以保证无论是否需要是代理对象,都可以保证使用的是同一个对象,而不会出现,一会儿使用普通bean 一会儿使用代理类

## 2. SpringBoot

**Springboot**自动装配原理

自动配置原理:

1 )、SpringBoot启动的时候加载主配置类,开启了自动配置功能@EnableAutoConfiguration

2 )、@EnableAutoConfiguration 作用:

利用EnableAutoConfigurationlmportSelector给容器中导入一些组件

可以查看selectlmports()方法中的内容;

List<String> configurations = getCandidateConfigurations(annotationMetadata, attributes)  
//获取候选的配置

![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/8ed7661e-aacf-47b8-a849-56c677b3c59f.png)扫描所有jar类路径下 META-INF/spring.factories ![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/dca5254f-8f8a-4490-bc66-16451a05ab9f.png)

将扫描到文件中内容封装到properties对象中, 从properties中获取到 EnableAutoConfiguration.class类名的值 将其添加到容器中 ![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/51c82ad9-bcf0-42a6-b5d0-92d665edf2e1.png)也就是如下截图中内容加载进来了![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/1f3c37bc-7654-41bd-a5cf-35c36252dd06.png)

每一个xxxAutoConfiguration类都是容器中的一个组件,均会被加载到容器中,用他们来实现自动配置3)、每一个自动配置类进行自动装配功能 以 HttpEncodingAutoConfiguration 为例解释

@Configuration(proxyBeanMethods = false)  //声明该类是一个配置类  
/**  
启动指定类ServerProperties 的ConfigurationProperties功能  
ConfigurationProperties的功能:将配置文件中对应的值和ServerProperties进行绑定 并将ServerProperties加入到spring容器中  
*/  
@EnableConfigurationProperties(ServerProperties.class)   
/**  
ConditionalOnXXX是有spring提供的一个@Condition注解 称之为条件注解 条件成立,整个配置文件中内容会生效  
判断当前是否是一个web应用,如果是,则当前配置类生效  
*/  
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)  
/**  
判断当前项目有没有该类  
*/  
@ConditionalOnClass(CharacterEncodingFilter.class)  
/**  
判断配置文件中是否存在某个配置 server.servlet.encoding.enabled  
如果不存在,判断也是成立 即使配置文件中配置文件中不做以上配置,默认也是enable 生效的  
*/  
@ConditionalOnProperty(prefix = "server.servlet.encoding", value = "enabled", matchIfMissing = true)  
public class HttpEncodingAutoConfiguration {  
    private final Encoding properties;  
    //只有一个有参构造器,从容器中获取properties对象的值 并且该值被上面定义的properties进行了绑定映射  
    public HttpEncodingAutoConfiguration(ServerProperties properties) {  
        this.properties = properties.getServlet().getEncoding();  
    }  
    @Bean  //往容器中提交组件 这个组件的某些值需要从properties中获取  
    @ConditionalOnMissingBean  
    public CharacterEncodingFilter characterEncodingFilter() {  
        CharacterEncodingFilter filter = new OrderedCharacterEncodingFilter();  
        filter.setEncoding(this.properties.getCharset().name());  //从配置文件中设置的信息获取具体值  
        filter.setForceRequestEncoding(this.properties.shouldForce(Encoding.Type.REQUEST));  
        filter.setForceResponseEncoding(this.properties.shouldForce(Encoding.Type.RESPONSE));  
        return filter;  
    }

一旦配置类生效,该配置类就会向容器中添加各种组件,这些组件的属性是从对应的properties类中获取的,该类中每一个属性都是和springboot配置文件绑定的

总结

Springboot在启动的时候会调用run方法，run方法会执行refreshContext()方法刷新容器，会在类路径下找到springboot-boot-autoconfigure/springboot-boot-autoconfigure.jar/META-INF/spring-factories候选文件，该文件中记录中众多的自动配置类，容器会根据我们是否引入依赖是否书写配置文件的情况，将满足条件的Bean注入到容器中，于是就实现了springboot的自动装配

springboot常用注解

@SpringBootApplication  
@EnableAutoConfiguration  
@AutoConfigurationPackage  
@Import()  
//条件判断注解  
@AutoConfiguration  
@ConditionalOnClass  
@ConditionalOnMissingBean

## 3. SpringMVC

![img](https://obsidiantuchuanggavin.oss-cn-beijing.aliyuncs.com/img/6b837012-60e8-4b3b-a56c-2ce457e34acf.jpg)

1、用户向服务器发送请求，请求被SpringMVC的前端控制器DispatcherServlet截获。

2、DispatcherServlet对请求的URL（统一资源定位符）进行解析，得到URI(请求资源标识符)，然后根据该URI，调用HandlerMapping获得该Handler配置的所有相关的对象，包括Handler对象以及Handler对象对应的拦截器，这些对象都会被封装到一个HandlerExecutionChain对象当中返回。

3、DispatcherServlet根据获得的Handler，选择一个合适的HandlerAdapter。HandlerAdapter的设计符合面向对象中的单一职责原则，代码结构清晰，便于维护，最为重要的是，代码的可复制性高。HandlerAdapter会被用于处理多种Handler，调用Handler实际处理请求的方法。

4、提取请求中的模型数据，开始执行Handler(Controller)。在填充Handler的入参过程中，根据配置，spring将帮助做一些额外的工作消息转换：将请求的消息，如json、xml等数据转换成一个对象，将对象转换为指定的响应信息。数据转换：对请求消息进行数据转换，如String转换成Integer、Double等。 数据格式化：对请求的消息进行数据格式化，如将字符串转换为格式化数字或格式化日期等。数据验证：验证数据的有效性如长度、格式等，验证结果存储到BindingResult或Error中。

5、Handler执行完成后，向DispatcherServlet返回一个ModelAndView对象，ModelAndView对象中应该包含视图名或视图模型。

6、根据返回的ModelAndView对象，选择一个合适的ViewResolver(视图解析器)返回给DispatcherServlet。

7、ViewResolver结合Model和View来渲染视图。

8、将视图渲染结果返回给客户端。以上8个步骤，DispatcherServlet、HandlerMapping、HandlerAdapter和ViewResolver等对象协同工作，完成SpringMVC请求—>响应的整个工作流程，这些对象完成的工作对于开发者来说都是不可见的，开发者并不需要关心这些对象是如何工作的，开发者，只需要在Handler(Controller)当中完成对请求的业务处理。

## 4. mybatis经典问题

#{}和${}的区别是什么?

- #{}是预编译处理、是占位符，${}是字符串替换、 是拼接符。
    
- Mybatis在处理#{}时，会将sql中的#{}替换为?号，调用PreparedStatement来赋值;
    
- Mybatis在处理${}时，就是把${}替换成变量的值，调用Statement来赋值;
    
- #{}的变量替换是在DBMS中、变量替换后，#{}对应的变量自动加上单引号
    
- ${}的变量替换是在DBMS外、变量替换后，${}对应的变量不会加上单引号
    
- 使用#{}可以有效的防止SQL注入，提高系统安全性。
    

一级缓存 二级缓存区别

一级缓存：是基于数据库会话的，并且默认开启。一级缓存的作用域为SqlSession。在同一个SqlSession中，执行相同的sql语句，那么第一次就会去数据库中进行查询，并写到缓存中，如果我们后面还想去访问数据库查询，就直接去一级缓存中获取就可以了。

二级缓存：是基于全局的，不能默认开启，开启时需要手动配置。二级缓存的作用域为SqlSessionFactory，是一个映射器级别的缓存，针对不同namespace的映射器。一个会话中，查询一条数据，这个数据会被放到一级缓存中，但是一旦这个会话关闭，一级缓存中的数据就会被保存到二级缓存。新的会话查询信息就会参照二级缓存中存储的信息。