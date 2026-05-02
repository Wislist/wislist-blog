---
title: "Web基础"
date: 2023-12-02 00:00:00
tags: []
categories: []
---

# Web基础

Web由数十亿个通过有线和无线网络连接的客户机和服务器组成。web客户端向web服务器发出请求。web服务器接收请求，查找资源并将响应返回给客户端。当服务器响应请求时，它通常向客户机发送某种类型的内容。客户端通过web浏览器向服务器发送请求。服务器通常用一组用HTML(超文本标记语言)编写的指令向浏览器发送响应。所有浏览器都知道如何向客户端显示HTML页面。

![image-20231010163601811](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010163601811.png)

**网站** 是静态文件(网页)的集合，如HTML页面、图像、图形等。Web应用程序是在服务器上具有动态功能的Web站点。谷歌、Facebook、Twitter都是网络应用程序的例子。

## HTTP

  * HTTP是客户端和服务器在网络上使用的一种通信协议。
  * 它类似于其他互联网协议，如SMTP(简单邮件传输协议)和FTP(文件传输协议)，但有一个根本的区别。
  * HTTP是一种无状态协议，即每个连接只支持一个请求。这意味着使用HTTP，客户端连接到服务器发送一个请求，然后断开连接。这种机制允许更多的用户在一段时间内连接到给定的服务器。
  * 客户端发送一个HTTP请求，服务器使用HTTP向客户端返回一个HTML页面。


![image-20231010163825106](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010163825106.png)

## HTTP Methods

HTTP请求可以使用多种方法，但最常用的方法是**Get** 和**Post** 。方法名告诉服务器正在发出的请求的类型，以及如何格式化消息的其余部分。

![image-20231010163936889](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010163936889.png)

**GET和POST的区别**

GET：

  * 数据以报头的形式发送到服务器
  * Get请求只能发送有限数量的数据
  * Get请求不安全，因为数据暴露在URL中
  * Get请求可以添加书签，效率更高。


POST：

  * 数据在请求体中发送
  * 可以发送大量的数据
  * Post请求是安全的，因为数据没有暴露在URL中
  * POST请求不能被添加书签。


**PUT和POST的区别**

  * POST到URL在服务器定义的URL上创建子资源，而PUT到URL在客户端定义的URL上创建/替换整个资源。
  * POST创建了一个子资源，因此POST到/books将创建一个位于/books资源下的资源。如。/书/ 1。发送两次相同的post请求将创建两个资源。
  * PUT用于在客户端已知的URL上创建或替换资源。
  * 当客户端在创建资源之前已经知道url时，必须对CREATE使用PUT。
  * 如果已知url已经存在，则PUT将替换该资源，因此发送两次相同的请求不会产生任何影响。换句话说，对PUT的调用是幂等的


# Servlet

Servlet技术用于创建web应用程序。Servlet技术使用Java语言创建**web应用程序** 。

**Web应用程序** 是驻留在Web服务器上并构建**动态Web页面** 的辅助应用程序。动态页面可以是随机选择要显示的图片的页面，甚至可以是显示当前时间的页面

由于Servlet技术使用Java，因此使用Servlet制作的web应用程序是安全的、可扩展的和健壮的。

![image-20231010171126172](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010171126172.png)

## CGI (Common Gateway Interface)通用网关接口

在servlet出现之前，CGI(公共网关接口)编程被用于创建web应用程序。以下是CGI程序的工作原理

  * 用户单击一个链接，该链接的URL指向动态页面，而不是静态页面。
  * URL决定执行哪个CGI程序。
  * Web服务器在单独的操作系统外壳中运行CGI程序。外壳包括操作系统环境和执行CGI程序代码的过程。
  * CGI响应被发送回Web服务器，Web服务器将响应封装在HTTP响应中，并将其发送回Web浏览器。


![image-20231010171425448](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010171425448.png)

这就导致了负载会很高

**使用servlet的优点**

  * 更少的响应时间，因为每个请求在单独的线程中运行。
  * servlet是可伸缩的。
  * servlet是健壮的、面向对象的。
  * servlet是平台独立的。


![image-20231010171539872](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010171539872.png)

# Servlet API

Servlet API由两个重要的包组成，它们封装了所有重要的类和接口，即:

  * **javax.servlet**
  * **javax.servlet.http**


### Some Important Classes and Interfaces of `javax.servlet`![image-20231010171636311](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010171636311.png)

### Some Important Classes and Interface of `javax.servlet.http`

![image-20231010171702285](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010171702285.png)

## Servlet Interface

在Java中，使用接口来开发servlet。这个接口被称为servlet接口。该接口由所有接口实现。servlet接口用于init()、service()和destroy()方法的声明。这些方法在servlet的生命周期中由服务器调用。servlet调用getServletConfig()方法来初始化参数。getServletInfo()方法用于提供重要信息

Servlet接口只提供了五个方法。在这五个方法中，三个是**Servlet生命周期** 方法，其余两个是**非生命周期方法** 。

![image-20231010172222526](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010172222526.png)

### Servlet接口方法

![image-20231010172327043](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010172327043.png)

# HttpServlet class

**HttpServlet也是一个抽象类。** 这个类给出了Servlet接口的各种service()方法的实现。

要创建servlet，我们应该创建一个继承HttpServlet抽象类的类。我们要创建的Servlet类不能覆盖service()方法。我们的servlet类将只覆盖**doGet()**和/或** doPost()**方法。

**HttpServlet** 类的service()方法从请求流中**监听Http方法(GET, POST等)**，并根据Http方法类型调用** doGet()**或** doPost()**方法。

![image-20231010191812315](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010191812315.png)

HttpServlet接口的方法有：

![image-20231010192826683](C:\\Users\\29292\\AppData\\Roaming\\Typora\\typora-user-images\\image-20231010192826683.png)