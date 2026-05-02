---
title: "IoC思想"
date: 2024-08-30 00:00:00
tags: []
categories: []
---

## IoC

### IoC（Inversion of control ）

控制反转/反转控制，是一种编程思想。

在传统的开发中，我们通常是在类A中手动通过new来创建一个B的对象出来

使用IoC思想：不通过new关键字来创建对象，而是通过IoC容器(例如spring框架)来帮助我们来实例化对象。我们需要什么对象，就去IoC容器里面取就行了

使用IoC思想进行开发，这使我们失去了管理、创建对象的权利，但是好处就是不用考虑这个对象是否未创建，符合“万物皆对象”的思想

**为啥叫做控制反转？**

  * 控制：对象创建（实例化、管理）的权利
  * 反转：控制权交于外部环境（IoC容器）


![image-20240830185807358](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830185807358.png)

**使用IoC对我们有什么帮助？**

其思想就是使两方之间不要相互依赖，由第三方的容器来管理相关资源

1.对象之间的耦合度降低  
2.资源变的容易管理，使用spring容器提供的话很容易就可以实现一个单例

现有一个正对User的操作，利用Serviece和Dao两层结构进行开发

在没有使用IoC思想的情况下，Service层想使用Dao层的具体实现的话，需要通过new关键字在UserServerImpl中手动new出一个IUserDao的具体实现类UserDaoImpl(不能直接new接口)

![image-20240830191422501](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830191422501.png)

这种是可以实现的，但是在开发中，我们会频繁收到新的需求，针对IUserDao接口中开发另一个具体实现类。因为Server层依赖了`IUserDao`的具体实现，所以我们需要修改UserDaoImpl中new的对象。如果只是修改一个还好，但是如果很多地方都引用IUserDao的具体实现的话，要改起来就麻烦了

![image-20240830191753931](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830191753931.png)

所以我们使用IoC思想，我们将对象的控制权转交给IoC容器去管理，我们在使用的时候直接去向IoC容器要就可以了

![image-20240830191854969](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830191854969.png)