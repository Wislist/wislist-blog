---
title: "mybatis学习笔记（day3）"
date: 2023-12-21 00:00:00

categories:
  - 框架
tags:
  - MyBatis
  - 配置
  - 映射
---

# mybatis学习(day3)

## SqlMapConfig配置文件

SqlMapConfig.xml中配置的内容和顺序如下

  * **properties（属性）**
  * settings（全局配置参数）
  * **typeAliases（类型别名）**
  * typeHandlers（类型处理器）
  * _objectFactory（对象工厂）_
  * _plugins（插件）_
  * environments（环境集合属性对象）
    * environment（环境子属性对象）
      * transactionManager（事务管理）
      * dataSource（数据源）
  * **mappers（映射器）**


(注：粗体是重点，斜体不常用)

## properties(属性)

将数据库连接参数单独配置在db.properties中，只需要在SqlMapConfig.xml中加载db.properties的属性值。在SqlMapConfig.xml中就不需要对数据库连接参数硬编码。

将数据库连接参数只配置在db.properties中。原因：方便对参数进行统一管理，**其它xml可以引用该db.properties** 。

```properties
jdbc.driver=com.mysql.jdbc.Driverjdbc.url=jdbc:mysql://120.25.162.238:3306/mybatis001?characterEncoding=utf-8jdbc.username=rootjdbc.password=123
```

在sqlMapConfig.xml加载属性文件：

就可以更改为：

```xml
<?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE configuration        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"        "http://mybatis.org/dtd/mybatis-3-config.dtd">
    <configuration>
        <!-- 和spring整合后 environments配置将废除-->
        <environments default="development">
            <environment id="development">
                <!-- 使用jdbc事务管理，事务控制由mybatis-->
                <transactionManager type="JDBC" />
                <!-- 数据库连接池,由mybatis管理-->
                <dataSource type="POOLED">
                    <property name="driver" value="com.mysql.cj.jdbc.Driver" />
                    <property name="url" value="jdbc:mysql://localhost:3306/users?characterEncoding=utf-8" />
                    <property name="username" value="root" />
                    <property name="password" value="root" />
                </dataSource>
            </environment>
        </environments>
        <!-- 加载映射文件-->
        <mappers>
            <mapper resource="Mapper/User.xml"/>
            <mapper resource="Mapper/UserMapper.xml"/>
        </mappers>
    </configuration>
```

可以在environments 前加入 properties

`<properties resource="db.properties"> <!--properties中还可以配置一些属性名和属性值 --> <!-- <property name="jdbc.driver" value=""/> --> </properties>`

```xml
<properties resource="db.properties">
    <!--properties中还可以配置一些属性名和属性值  -->
    <!-- <property name="jdbc.driver" value=""/> -->
</properties>
<!-- 和spring整合后 environments配置将废除-->
<environments default="development">
    <environment id="development">
        <!-- 使用jdbc事务管理，事务控制由mybatis-->
        <transactionManager type="JDBC" />
        <!-- 数据库连接池,由mybatis管理-->
        <dataSource type="POOLED">
            <property name="driver" value="${jdbc.driver}" />
            <property name="url" value="${jdbc.url}" />
            <property name="username" value="${jdbc.username}" />
            <property name="password" value="${jdbc.password}" />
        </dataSource>
    </environment>
</environments>
```

注意： MyBatis 将按照下面的顺序(优先级)来加载属性：

  * 在`properties`元素体内定义的属性首先被读取。
  * 然后会读取`properties`元素中resource或url加载的属性，它会覆盖已读取的同名属性。
  * 最后读取`parameterType`传递的属性，它会覆盖已读取的同名属性。


建议：

  * 不要在`properties`元素体内添加任何属性值，只将属性值定义在properties文件中。
  * 在properties文件中定义属性名要有一定的特殊性，如：XXXXX.XXXXX.XXXX


## settings(全局参数配置)

mybatis框架在运行时可以调整一些运行参数,比如：开启二级缓存、开启延迟加载…

全局参数将会影响mybatis的运行行为。具体参考官网：

> [mybatis-settings](<http://www.mybatis.org/mybatis-3/configuration.html#settings>)

## typeAliases(类型别名)

在mapper.xml中，定义很多的statement，statement需要`parameterType`指定输入参数的类型、需要`resultType`指定输出结果的映射类型。

如果在指定类型时输入类型全路径，不方便进行开发，可以针对`parameterType`或`resultType`指定的类型定义一些别名，在mapper.xml中通过别名定义，方便开发。

  * mybatis默认支持别名


> 参考 [typeAliases](<http://www.mybatis.org/mybatis-3/configuration.html#typeAliases>)

  * 自定义别名
    * 单个别名定义
    * 批量定义别名（常用）


```xml
<!-- 别名定义 -->
<typeAliases>
    <!-- 针对单个别名定义    type：类型的路径    alias：别名     -->
    <!-- <typeAlias type="cn.itcast.mybatis.po.User" alias="user"/> -->
    <!-- 批量别名定义    指定包名，mybatis自动扫描包中的po类，自动定义别名，别名就是类名（首字母大写或小写都可以）    -->
    <package name="com.iot.mybatis.po"/>
</typeAliases>
```

## typeHandlers(类型处理器)

mybatis中通过typeHandlers完成jdbc类型和java类型的转换。例如：

```sql
<select id="findUserById" parameterType="int" resultType="user">
    select * from user where id = #{id}
</select>
```

mybatis自带的类型处理器基本上满足日常需求，不需要单独定义。

![image-20231221004409489](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231221004409489.png)

几个要重点掌握的

## mappers(映射配置)（非常重要）

  * 通过resource加载单个映射文件


```xml
<!--通过resource方法一次加载一个映射文件 --><mapper resource="mapper/UserMapper.xml"/>
```

  * 通过mapper接口加载单个mapper


```xml
<!-- 通过mapper接口加载单个 映射文件        遵循一些规范：需要将mapper接口类名和mapper.xml映射文件名称保持一致，且在一个目录中        上边规范的前提是：使用的是mapper代理方法         -->
<mapper class="com.iot.mybatis.mapper.UserMapper"/>
```

目录示例

```
com.iot.mybatis.mapper------------------package包           |----UserMapper.java           |----UserMapper.xml
```

  * 批量加载mapper(推荐使用)


```xml
<!-- 批量加载mapper		指定mapper接口的包名，mybatis自动扫描包下边所有mapper接口进行加载		遵循一些规范：需要将mapper接口类名和mapper.xml映射文件名称保持一致，且在一个目录 中		上边规范的前提是：使用的是mapper代理方法		 -->
<package name="com.iot.mybatis.mapper"/>
```