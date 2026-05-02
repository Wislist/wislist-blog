---
title: "mybatis学习笔记（day1）"
date: 2023-12-19 00:00:00
tags: []
categories: []
---

# mybatis学习笔记（day1）

## 为啥不用JDBC？

首先我们知道jdbc的步骤是：

  1. 加载数据库驱动
  2. 创建并获取数据库链接
  3. 创建jdbc statement对象
  4. 设置sql语句
  5. 设置sql语句中的参数(使用preparedStatement)
  6. 通过statement执行sql并获取结果
  7. 对sql执行结果进行解析处理
  8. 释放资源(resultSet、preparedstatement、connection)


我们可以看出，我们频繁的对数据库进行连接和关闭操作（当我们打开datagrip的时候，也要等一下数据库才出来），这很不效率。

设想：使用数据库连接池管理数据库连接

**什么是数据库连接池？**

数据库连接池是一个存储已经建立的数据库连接并使其可以重复使用的技术，可以减少程序每次建立数据库连接所花费的时间。

使用数据库连接池可以将已经建立的连接保存在连接池中，当有新的数据请求到来时，可以从连接池中获取已创建的空闲连接来使用，从而避免了频繁创建和释放数据库连接的操作，提高了系统的性能，减少了系统的开销。

将sql直接编入java语言中，其实非常不安全而且给维护造成很大影响。

**设想：将sql语句配置在xml文件中，即使sql编号，不需要对java代码进行重新编译，直接修改xml文件就好**

向preparedStatement中设置参数，对占位符号位置和设置参数值，硬编码在java代码中，不利于系统维护。

**设想：将sql语句及占位符号和参数全部配置在xml中。**

从resultSet中遍历结果集数据时，存在硬编码，将获取表的字段进行硬编码，不利于系统维护。

**设想：将查询的结果集，自动映射成java对象。**

### 参考代码
[code]
    package com.iot.mybatis.jdbc;//import java.sql.*;import java.sql.Connection;import java.sql.DriverManager;import java.sql.PreparedStatement;import java.sql.ResultSet;import java.sql.SQLException;/** * Created by Administrator on 2016/2/21. */public class JdbcTest {    public static void main(String[] args) {        //数据库连接        Connection connection = null;        //预编译的Statement，使用预编译的Statement提高数据库性能        PreparedStatement preparedStatement = null;        //结果集        ResultSet resultSet = null;        try {            //加载数据库驱动            Class.forName("com.mysql.jdbc.Driver");            //通过驱动管理类获取数据库链接            connection =  DriverManager.getConnection("jdbc:mysql://120.25.162.238:3306/mybatis001?characterEncoding=utf-8", "root", "123");            //定义sql语句 ?表示占位符            String sql = "select * from user where username = ?";            //获取预处理statement            preparedStatement = connection.prepareStatement(sql);            //设置参数，第一个参数为sql语句中参数的序号（从1开始），第二个参数为设置的参数值            preparedStatement.setString(1, "王五");            //向数据库发出sql执行查询，查询出结果集            resultSet =  preparedStatement.executeQuery();            //遍历查询结果集            while(resultSet.next()){                System.out.println(resultSet.getString("id")+"  "+resultSet.getString("username"));            }        } catch (Exception e) {            e.printStackTrace();        }finally{            //释放资源            if(resultSet!=null){                try {                    resultSet.close();                } catch (SQLException e) {                    // TODO Auto-generated catch block                    e.printStackTrace();                }            }            if(preparedStatement!=null){                try {                    preparedStatement.close();                } catch (SQLException e) {                    // TODO Auto-generated catch block                    e.printStackTrace();                }            }            if(connection!=null){                try {                    connection.close();                } catch (SQLException e) {                    // TODO Auto-generated catch block                    e.printStackTrace();                }            }        }    }}
[/code]

## mybatis介绍

mybatis是一个持久层的框架，是apache下的顶级项目。

mybatis托管到goolecode下，再后来托管到github下([https://github.com/mybatis/mybatis-3/releases)。](<https://github.com/mybatis/mybatis-3/releases\)%E3%80%82>)

mybatis让程序将主要精力放在sql上，通过mybatis提供的映射方式，自由灵活生成（半自动化，大部分需要程序员编写sql）满足需要sql语句。

mybatis可以将向 preparedStatement中的输入参数自动进行输入映射，将查询结果集灵活映射成java对象。（输出映射）

### 框架原理

![image-20231219004632507](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231219004632507.png)

## mybatis框架执行过程

1、配置mybatis的配置文件，SqlMapConfig.xml（名称不固定）

2、通过配置文件，加载mybatis运行环境，创建SqlSessionFactory会话工厂(SqlSessionFactory在实际使用时按单例方式)

3、通过SqlSessionFactory创建SqlSession。SqlSession是一个面向用户接口（提供操作数据库方法），实现对象是线程不安全的，建议sqlSession应用场合在方法体内。

4、调用sqlSession的方法去操作数据。如果需要提交事务，需要执行SqlSession的commit()方法。

5、释放资源，关闭SqlSession

## mybatis开发dao的方法

1.原始dao 的方法

  * 需要程序员编写dao接口和实现类
  * 需要在dao实现类中注入一个SqlSessionFactory工厂


2.mapper代理开发方法（建议使用）

只需要程序员编写mapper接口（就是dao接口）。 程序员在编写mapper.xml(映射文件)和mapper.java需要遵循一个开发规范：

  * mapper.xml中namespace就是mapper.java的类全路径。
  * mapper.xml中statement的id和mapper.java中方法名一致。
  * mapper.xml中statement的parameterType指定输入参数的类型和mapper.java的方法输入参数类型一致
  * mapper.xml中statement的resultType指定输出结果的类型和mapper.java的方法返回值类型一致。


SqlMapConfig.xml配置文件：可以配置properties属性、别名、mapper加载。

## 输入映射和输出映射

  * 输入映射：
    * parameterType：指定输入参数类型可以简单类型、pojo、hashmap。
    * 对于综合查询，建议parameterType使用包装的pojo，有利于系统扩展。
  * 输出映射：
    * resultType：查询到的列名和resultType指定的pojo的属性名一致，才能映射成功。
    * reusltMap：可以通过resultMap 完成一些高级映射。如果查询到的列名和映射的pojo的属性名不一致时，通过resultMap设置列名和属性名之间的对应关系（映射关系）。可以完成映射。
      * 高级映射： 将关联查询的列映射到一个pojo属性中。（一对一） 将关联查询的列映射到一个List中。（一对多）


## 动态sql

  * 动态sql：（重点）
    * if判断（掌握）
    * where
    * foreach
    * sql片段（掌握）


## 代码（我是用maven来加载jar包的）

![image-20231219151719266](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231219151719266.png)

![image-20231219151729117](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231219151729117.png)

一些jar包（有什么功能不知道 默认导入的 核心jar包是mybatis sql-driver 我的mysql是8.0.32版本的 junit 单元测试）

![image-20231219151907279](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231219151907279.png)

新建项目的时候选的是maven 默认格式 可以自己把config写出来 也可以在mian下面的文件resource中写 但是要注意 写了config要将该文件设置为资源文件 这个是必须的 普通文件程序不会去看

MybatisFirst 是测试用的 po文件夹里写的是类 数据库字段是什么就写什么

**sqlmap下的User.xml**
[code] 
    <?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE mapper        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"        "http://mybatis.org/dtd/mybatis-3-mapper.dtd"><!-- namespace 命名空间，作用就是对sql进行分类化管理,理解为sql隔离 注意：使用mapper代理方法开发，namespace有特殊重要的作用 --><mapper namespace="test">    <!-- 在映射文件中配置很多sql语句 -->    <!--需求:通过id查询用户表的记录 -->    <!-- 通过select执行数据库查询     id:标识映射文件中的sql，称为statement的id     将sql语句封装到mappedStatement对象中，所以将id称为statement的id     parameterType:指定输入参数的类型     #{}标示一个占位符,     #{value}其中value表示接收输入参数的名称，如果输入参数是简单类型，那么#{}中的值可以任意。     resultType：指定sql输出结果的映射的java对象类型，select指定resultType表示将单条记录映射成java对象     -->    <select id="findUserById" parameterType="int" resultType="po.User">        SELECT * FROM  users.user  WHERE userId =#{value}    </select>    <!-- 根据用户名称模糊查询用户信息，可能返回多条	resultType：指定就是单条记录所映射的java对象类型	${}:表示拼接sql串，将接收到参数的内容不加任何修饰拼接在sql中。	使用${}拼接sql，引起 sql注入	${value}：接收输入参数的内容，如果传入类型是简单类型，${}中只能使用value	 -->    <select id="findUserByName" parameterType="java.lang.String" resultType="po.User">        SELECT * FROM users.user WHERE username LIKE '%${value}%'    </select></mapper>
[/code]

**SqlMapConfig.xml**
[code] 
    <?xml version="1.0" encoding="UTF-8" ?><!DOCTYPE configuration        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"        "http://mybatis.org/dtd/mybatis-3-config.dtd"><configuration>    <!-- 和spring整合后 environments配置将废除-->    <environments default="development">        <environment id="development">            <!-- 使用jdbc事务管理，事务控制由mybatis-->            <transactionManager type="JDBC" />            <!-- 数据库连接池,由mybatis管理-->            <dataSource type="POOLED">                <property name="driver" value="com.mysql.cj.jdbc.Driver" />                <property name="url" value="jdbc:mysql://localhost:3306/users?characterEncoding=utf-8" />                <property name="username" value="root" />                <property name="password" value="root" />            </dataSource>        </environment>    </environments>    <!--特别说明： resource为当前文件夹存User.xml的路径 一定要写 -->    <!-- 加载映射文件-->    <mappers>        <mapper resource="sqlmap/User.xml"/>    </mappers></configuration>
[/code]

原因现在还未知，可能和映射有关 涉及到bean的知识？

**log4j.properties**
[code] 
    # Global logging configurationlog4j.rootLogger=DEBUG, stdout# Console output...log4j.appender.stdout=org.apache.log4j.ConsoleAppenderlog4j.appender.stdout.layout=org.apache.log4j.PatternLayoutlog4j.appender.stdout.layout.ConversionPattern=%5p [%t] - %m%n
[/code]

**first文件的MybatisFirst**
[code] 
    package first;import org.junit.jupiter.api.Test;import po.User;import org.apache.ibatis.io.Resources;import org.apache.ibatis.session.SqlSession;import org.apache.ibatis.session.SqlSessionFactory;import org.apache.ibatis.session.SqlSessionFactoryBuilder;import java.io.IOException;import java.io.InputStream;import java.util.List;/** * Created by Administrator on 2016/2/23. */public class MybatisFirst {    //根据id查询用户信息，得到一条记录结果    @Test    public void findUserByIdTest() throws IOException{        // mybatis配置文件        String resource = "SqlMapConfig.xml";        // 得到配置文件流        InputStream inputStream =  Resources.getResourceAsStream(resource);        //创建会话工厂，传入mybatis配置文件的信息        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);        // 通过工厂得到SqlSession        SqlSession sqlSession = sqlSessionFactory.openSession();        // 通过SqlSession操作数据库        // 第一个参数：映射文件中statement的id，等于=namespace+"."+statement的id        // 第二个参数：指定和映射文件中所匹配的parameterType类型的参数        // sqlSession.selectOne结果 是与映射文件中所匹配的resultType类型的对象        // selectOne查询出一条记录        User user = sqlSession.selectOne("test.findUserById", 1);        System.out.println(user);        // 释放资源        sqlSession.close();    }    // 根据用户名称模糊查询用户列表    @Test    public void findUserByNameTest() throws IOException {        // mybatis配置文件        String resource = "SqlMapConfig.xml";        // 得到配置文件流        InputStream inputStream = Resources.getResourceAsStream(resource);        // 创建会话工厂，传入mybatis的配置文件信息        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder()                .build(inputStream);        // 通过工厂得到SqlSession        SqlSession sqlSession = sqlSessionFactory.openSession();        // list中的user和映射文件中resultType所指定的类型一致        List<User> list = sqlSession.selectList("test.findUserByName", "小明");        System.out.println(list);        sqlSession.close();    }}
[/code]

**po文件的User**
[code] 
    package po;import java.util.Date;public class User {    //属性名要和数据库表的字段对应    private int id;    private String username;// 用户姓名    private String sex;// 性别    private Date birthday;// 生日    private String address;// 地址    public int getId() {        return id;    }    public void setId(int id) {        this.id = id;    }    public String getUsername() {        return username;    }    public void setUsername(String username) {        this.username = username;    }    public String getSex() {        return sex;    }    public void setSex(String sex) {        this.sex = sex;    }    public Date getBirthday() {        return birthday;    }    public void setBirthday(Date birthday) {        this.birthday = birthday;    }    public String getAddress() {        return address;    }    public void setAddress(String address) {        this.address = address;    }    @Override    public String toString() {        return "User [id=" + id + ", username=" + username + ", sex=" + sex                + ", birthday=" + birthday + ", address=" + address + "]";    }}
[/code]

![image-20231219153205927](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231219153205927.png)

一般出现sql语句输出 和 结果返回 一般是成功了 注意：比较常见的问题是读不到你的Mybatis.xml文件 一定一定要将config文件设置为资源文件

## 入门程序二

添加、删除、更新用户

将下面的添加到xml中
[code] 
    <!-- 添加用户    parameterType：指定输入 参数类型是pojo（包括 用户信息）    #{}中指定pojo的属性名，接收到pojo对象的属性值，mybatis通过OGNL获取对象的属性值    --><insert id="insertUser" parameterType="com.iot.mybatis.po.User">    <!--     将插入数据的主键返回，返回到user对象中     SELECT LAST_INSERT_ID()：得到刚insert进去记录的主键值，只适用与自增主键     keyProperty：将查询到主键值设置到parameterType指定的对象的哪个属性     order：SELECT LAST_INSERT_ID()执行顺序，相对于insert语句来说它的执行顺序     resultType：指定SELECT LAST_INSERT_ID()的结果类型      -->    <selectKey keyProperty="id" order="AFTER" resultType="java.lang.Integer">      SELECT LAST_INSERT_ID()    </selectKey>    INSERT INTO user (username,birthday,sex,address)values (#{username},#{birthday},#{sex},#{address})    <!--        使用mysql的uuid（）生成主键        执行过程：        首先通过uuid()得到主键，将主键设置到user对象的id属性中        其次在insert执行时，从user对象中取出id属性值         -->    <!--  <selectKey keyProperty="id" order="BEFORE" resultType="java.lang.String">        SELECT uuid()    </selectKey>    insert into user(id,username,birthday,sex,address) value(#{id},#{username},#{birthday},#{sex},#{address}) --></insert><!-- 删除 用户    根据id删除用户，需要输入 id值     --><delete id="deleteUser" parameterType="java.lang.Integer">    delete from user where id=#{id}</delete><!-- 根据id更新用户分析：需要传入用户的id需要传入用户的更新信息parameterType指定user对象，包括 id和更新信息，注意：id必须存在#{id}：从输入 user对象中获取id属性值 --><update id="updateUser" parameterType="com.iot.mybatis.po.User">    update user set username=#{username},birthday=#{birthday},sex=#{sex},address=#{address}    where id=#{id}</update>
[/code]

**程序代码**
[code] 
    // 添加用户信息  @Test  public void insertUserTest() throws IOException {      // mybatis配置文件      String resource = "SqlMapConfig.xml";      // 得到配置文件流      InputStream inputStream = Resources.getResourceAsStream(resource);      // 创建会话工厂，传入mybatis的配置文件信息      SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder()              .build(inputStream);      // 通过工厂得到SqlSession      SqlSession sqlSession = sqlSessionFactory.openSession();      // 插入用户对象      User user = new User();      user.setUsername("王小军");      user.setBirthday(new Date());      user.setSex("1");      user.setAddress("河南郑州");      sqlSession.insert("test.insertUser", user);      // 提交事务      sqlSession.commit();      // 获取用户信息主键      System.out.println(user.getId());      // 关闭会话      sqlSession.close();  }  // 根据id删除 用户信息  @Test  public void deleteUserTest() throws IOException {      // mybatis配置文件      String resource = "SqlMapConfig.xml";      // 得到配置文件流      InputStream inputStream = Resources.getResourceAsStream(resource);      // 创建会话工厂，传入mybatis的配置文件信息      SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder()              .build(inputStream);      // 通过工厂得到SqlSession      SqlSession sqlSession = sqlSessionFactory.openSession();      // 传入id删除 用户      sqlSession.delete("test.deleteUser", 29);      // 提交事务      sqlSession.commit();      // 关闭会话      sqlSession.close();  }  // 更新用户信息  @Test  public void updateUserTest() throws IOException {      // mybatis配置文件      String resource = "SqlMapConfig.xml";      // 得到配置文件流      InputStream inputStream = Resources.getResourceAsStream(resource);      // 创建会话工厂，传入mybatis的配置文件信息      SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder()              .build(inputStream);      // 通过工厂得到SqlSession      SqlSession sqlSession = sqlSessionFactory.openSession();      // 更新用户信息      User user = new User();      //必须设置id      user.setId(27);      user.setUsername("王大军");      user.setBirthday(new Date());      user.setSex("2");      user.setAddress("河南郑州");      sqlSession.update("test.updateUser", user);      // 提交事务      sqlSession.commit();      // 关闭会话      sqlSession.close();  }
[/code]

**本次难点**

我们在sql中将主键id设置为自增 
[code] 
    <selectKey keyProperty="id" order="AFTER" resultType="java.lang.Integer">          SELECT LAST_INSERT_ID()</selectKey><!--            使用mysql的uuid（）生成主键            执行过程：            首先通过uuid()得到主键，将主键设置到user对象的id属性中            其次在insert执行时，从user对象中取出id属性值             -->        <!--  <selectKey keyProperty="id" order="BEFORE" resultType="java.lang.String">            SELECT uuid()        </selectKey>        insert into user(id,username,birthday,sex,address) value(#{id},#{username},#{birthday},#{sex},#{address}) --><!--         将插入数据的主键返回，返回到user对象中         SELECT LAST_INSERT_ID()：得到刚insert进去记录的主键值，只适用与自增主键         keyProperty：将查询到主键值设置到parameterType指定的对象的哪个属性         order：SELECT LAST_INSERT_ID()执行顺序，相对于insert语句来说它的执行顺序         resultType：指定SELECT LAST_INSERT_ID()的结果类型          -->
[/code]

### 总结一下

  * `#{}`和`${}`


`#{}`表示一个占位符号，`#{}`接收输入参数，类型可以是简单类型，pojo、hashmap。

如果接收简单类型，`#{}`中可以写成value或其它名称。

`#{}`接收pojo对象值，通过OGNL读取对象中的属性值，通过属性.属性.属性…的方式获取对象属性值。

`${}`表示一个拼接符号，会引用sql注入，所以**不建议使用`${}`**。

`${}`接收输入参数，类型可以是简单类型，pojo、hashmap。

如果接收简单类型，`${}`中只能写成value。

`${}`接收pojo对象值，通过OGNL读取对象中的属性值，通过属性.属性.属性…的方式获取对象属性值。