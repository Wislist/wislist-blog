---
title: "Servlet"
date: 2023-12-02 00:00:00

categories:
  - JavaWeb
tags:
  - Servlet
  - 生命周期
  - JavaWeb
---

# Servlet

  * servlet 是javaee的规范之一 也就是接口
  * servlet是javaweb三大组件之一 三大组件：Servlet程序 Filter过滤器 Listener监听器
  * servlet是运行在服务器上的小程序 **可以用来接收客服端发送过来的请求，并响应数据给客户端**


## 手动实现

  * 编写一个类去实现Servlet接口
  * 实现service方法 处理请求 并响应数据
  * 到web.xml中去配置servlet程序的访问地址


**一、到web-inf中的web.xml中配置**

![image-20231004162006055](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231004162006055.png)

**解释什么是xml：**  
一、XML是被设计用来描述数据的，重点是什么是数据，如何存放数据。

二、这是一种扩展性标识语言文件，是用于标记电子文件使其具有结构性的标记语言，通常无法直接打开。

**二、写标签**

![image-20231004163640856](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231004163640856.png)

常见的error：

  * url-pattern 没有以斜杠打头


![image-20231004164719285](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231004164719285.png)

  * servletname配置错误


## 为啥在servlet配置后访问对应url就能访问地址

![image-20231006154507476](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231006154507476.png)

## Servlet生命周期

  * 执行Servlet构造器方法
  * 执行int初始化方法


第一、二步，是在和第一次访问的时候 创建servlet程序会调用

  * 执行service方法


第三步，每次访问都会被调用

  * 执行destroy销毁方法


第四步，在web工程停止的时候被调用 

### 通过继承HttpServlet实现Servlet程序

一般在实际项目开发中，都是使用继承HttpSerclet类的方式来去实现Servlet程序

  * 编写一个类去extends HttpServlet类
  * 根据业务需求需要重写doGet或者doPost方法
  * 到web.xml中的配置Servlet程序的访问地址