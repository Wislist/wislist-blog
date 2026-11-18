---
title: "SpringAOP"
date: 2024-04-09 00:00:00

categories:
  - 框架
tags:
  - Spring
  - AOP
  - 动态代理
---

# SpringAOP

## AOP

面向切面编程，面向特定的方法编程  
在不变更原先代码的前提下，去实现一个新的功能或者是功能增强

**实现** ： 动态代理。在管理bean对象的过程中，主要通过底层的动态代理机制，对特定的方法进行编程

我们通过AOP入门程序完成了业务方法执行耗时的统计，那其实AOP的功能远不止于此，常见的应用场景如下：

  * 记录系统的操作日志
  * 权限控制
  * 事务管理：我们前面所讲解的Spring事务管理，底层其实也是通过AOP来实现的，只要添加@Transactional注解之后，AOP程序自动会在原始方法运行前先来开启事务，在原始方法运行完毕之后提交或回滚事务


AOP面向切面编程的一些优势：

  * 代码无侵入：没有修改原始的业务方法，就已经对原始的业务方法进行了功能的增强或者是功能的改变

  * 减少了重复代码

  * 提高开发效率

  * 维护方便


## AOP核心概念

**1\. 连接点：JoinPoint** ，可以被AOP控制的方法（暗含方法执行时的相关信息）

**2\. 通知：Advice** ，指哪些重复的逻辑，也就是共性功能（最终体现为一个方法）

在AOP面向切面编程当中，我们只需要将这部分重复的代码逻辑抽取出来单独定义。抽取出来的这一部分重复的逻辑，也就是共性的功能。

**3\. 切入点：PointCut** ，匹配连接点的条件，通知仅会在切入点方法执行时被应用

在通知当中，我们所定义的共性功能到底要应用在哪些方法上？此时就涉及到了切入点pointcut概念。切入点指的是匹配连接点的条件。通知仅会在切入点方法运行时才会被应用。

​ 在aop的开发当中，我们通常会通过一个切入点表达式来描述切入点(后面会有详解)。

**4\. 切面：Aspect** ，描述通知与切入点的对应关系（通知+切入点）

**5\. 目标对象：Target** ，通知所应用的对象

![image-20240409162821797](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240409162821797.png)

## AOP进阶

主要分为4个部分：

  1. 通知类型
  2. 通知顺序
  3. 切入点表达式
  4. 连接点


### 通知类型

一种功能最为强大的通知类型：Around环绕通知。

```java
@Around("execution(* com.itheima.service.*.*(..))")
public Object recordTime(ProceedingJoinPoint pjp) throws Throwable {
    //记录方法执行开始时间
    long begin = System.currentTimeMillis();
    //执行原始方法    Object result =
    pjp.proceed();
    //记录方法执行结束时间
    long end = System.currentTimeMillis();
    //计算方法执行耗时
    log.info(pjp.getSignature()+"执行耗时: {}毫秒",end-begin);
    return result;
}
```

Spring中AOP的通知类型：

  * **@Around** ：环绕通知，此注解标注的通知方法在目标方法前、后都被执行
  * **@Before** ：前置通知，此注解标注的通知方法在目标方法前被执行


![image-20240409164343985](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240409164343985.png)

  * **@After** ：后置通知，此注解标注的通知方法在目标方法后被执行，无论是否有异常都会执行
  * **@AfterReturning** ： 返回后通知，此注解标注的通知方法在目标方法后被执行，有异常不会执行
  * **@AfterThrowing** ： 异常后通知，此注解标注的通知方法发生异常后执行