---
title: "MPP"
date: 2024-09-03 00:00:00

categories:
  - 框架
tags:
  - MyBatis-Plus
  - ORM
  - SpringBoot
---

### MPplus

无侵入式的mp

UserMapper继承BaseMapper 要指定实体类

![image-20240912213910234](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912213910234.png)

#### 常见注解

MBplus通过扫描实体类，并基于反射获取实体类信息作为数据库表信息

（约定大于配置）

不符合约定：

  * @TableName: 用来指定表名


![image-20240912215200263](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912215200263.png)

  * @TableId（value , type ）： 用来指定表中的关键字段信息


![image-20240912215316995](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912215316995.png)

  * @TableField(“‘转义字符’” ， exist = false （不是数据库字段）)： 用来指定表中的普通字段信息


未指定id默认为雪花算法

#### 常见配置

![image-20240912222008335](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912222008335.png)

#### 核心功能

##### 条件构造器

mbps支持各种复杂的where条件，可以满足日常开发的所有需求

![image-20240912225902277](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912225902277.png)

![image-20240912231207273](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912231207273.png)

```java
QueryWrapper<User> wrapper = new QueryWrapper<>()
                .select("id","username","info","balance")
                .like("username","o")
                .ge("balance",1000);
List<User> users = userMapper.selectList(wrapper);
```

```java
User user = new User();
QueryWrapper<User> wrapper = new QueryWrapper<>().eq("username","jack");
userMapper.update(user,wrapper);
```

![image-20240912231944568](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912231944568.png)

使用UpdateWrapper

![image-20240912232020584](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912232020584.png)

用lambda操作后灵活性提高

![image-20240912232236672](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912232236672.png)

#### 自定义sql

利用Wrapper来构建复杂的where条件，用sql语句写剩下的部分

  * 基于wrapper构建where条件


![image-20240912234958664](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912234958664.png)

  * 在mapper方法参数中用Param注解声明wrapper变量名称，必须是ew


![image-20240912234952195](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912234952195.png)

  * 自定义sql语句 并利用wraper条件


![image-20240912235151666](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240912235151666.png)