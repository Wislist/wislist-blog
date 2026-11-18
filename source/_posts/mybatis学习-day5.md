---
title: "mybatis学习笔记（day5）"
date: 2023-12-22 00:00:00

categories:
  - 框架
tags:
  - MyBatis
  - 输出映射
  - resultMap
---

# mybatis学习(day5)

## 输出映射

输出映射有两种方式

  * `resultType`
  * `resultMap`


在前面的学习中我吗可以看到我们的mapper.xml配置为

```sql
<?xml version="1.0" encoding="UTF-8" ?>
    <!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
    <!-- namespace 命名空间，作用就是对sql进行分类化管理,理解为sql隔离 注意：使用mapper代理方法开发，namespace有特殊重要的作用 -->
    <mapper namespace="mapper.UserMapper">
        <!-- 在映射文件中配置很多sql语句 -->
        <!--需求:通过id查询用户表的记录 -->
        <!-- 通过select执行数据库查询
     id:标识映射文件中的sql，称为statement的id
     将sql语句封装到mappedStatement对象中，所以将id称为statement的id
     parameterType:指定输入参数的类型
     #{}标示一个占位符,
     #{value}其中value表示接收输入参数的名称，如果输入参数是简单类型，那么#{}中的值可以任意。
     resultType：指定sql输出结果的映射的java对象类型，select指定resultType表示将单条记录映射成java对象
     -->
        <select id="findUserById" parameterType="int" resultType="po.User">
            SELECT * FROM  users.user  WHERE id=#{value}
        </select>
        <!-- 根据用户名称模糊查询用户信息，可能返回多条
    resultType：指定就是单条记录所映射的java对象类型
    ${}:表示拼接sql串，将接收到参数的内容不加任何修饰拼接在sql中。
    使用${}拼接sql，引起 sql注入
    ${value}：接收输入参数的内容，如果传入类型是简单类型，${}中只能使用value
     -->
        <select id="findUserByName" parameterType="java.lang.String" resultType="po.User">
            SELECT * FROM users.user WHERE username LIKE '%${value}%'
        </select>
        <!-- 添加用户
        parameterType：指定输入 参数类型是pojo（包括 用户信息）
        #{}中指定pojo的属性名，接收到pojo对象的属性值，mybatis通过OGNL获取对象的属性值
        -->
        <insert id="insertUser" parameterType="po.User">
            <!--
         将插入数据的主键返回，返回到user对象中
         SELECT LAST_INSERT_ID()：得到刚insert进去记录的主键值，只适用与自增主键
         keyProperty：将查询到主键值设置到parameterType指定的对象的哪个属性
         order：SELECT LAST_INSERT_ID()执行顺序，相对于insert语句来说它的执行顺序
         resultType：指定SELECT LAST_INSERT_ID()的结果类型
          -->
            <selectKey keyProperty="id" order="AFTER" resultType="java.lang.Integer">
                SELECT LAST_INSERT_ID()
            </selectKey>
            INSERT INTO users.user (username,birthday,sex,address)values (#{username},#{birthday},#{sex},#{address})
            <!--
            使用mysql的uuid（）生成主键
            执行过程：
            首先通过uuid()得到主键，将主键设置到user对象的id属性中
            其次在insert执行时，从user对象中取出id属性值
             -->
            <!--  <selectKey keyProperty="id" order="BEFORE" resultType="java.lang.String">
            SELECT uuid()
        </selectKey>
        insert into user(id,username,birthday,sex,address) value(#{id},#{username},#{birthday},#{sex},#{address}) -->
        </insert>
        <!-- 删除 用户
        根据id删除用户，需要输入 id值
         -->
        <delete id="deleteUser" parameterType="java.lang.Integer">
            delete from users.user where id=#{id}
        </delete>
        <!-- 根据id更新用户
    分析：
    需要传入用户的id
    需要传入用户的更新信息
    parameterType指定user对象，包括 id和更新信息，注意：id必须存在
    #{id}：从输入 user对象中获取id属性值
     -->
        <update id="updateUser" parameterType="po.User">
            update users.user set username=#{username},birthday=#{birthday},sex=#{sex},address=#{address}
        where id=#{id}
        </update>
        <!-- 用户信息综合查询
        #{userCustom.sex}:取出pojo包装对象中性别值
        ${userCustom.username}：取出pojo包装对象中用户名称
     -->
        <select id="findUserList" parameterType="po.UserQueryVo" resultType="po.UserCustom">
            SELECT * FROM users.user WHERE user.sex=#{userCustom.sex} AND user.username LIKE '%${userCustom.username}%'
        </select>
        <!-- 测试两个变量同时查询的返回值 -->
        <select id="selectMulti2Object" resultType="po.User">
            select * from users.user where username = #{paramName,javaType=java.lang.String,jdbcType=VARCHAR}
        or birthday = #{paramAge}
        </select>
    </mapper>
```

仅有`resultType`

所以为什么我们要写这个？

## resultType

  * 使用`resultType`进行输出映射，只有查询出来的列名和pojo中的属性名一致，该列才可以映射成功。
  * 如果查询出来的列名和pojo中的属性名全部不一致，没有创建pojo对象。
  * 只要查询出来的列名和pojo中的属性有一个一致，就会创建pojo对象。


所以我们在写mapper的时候，一定要记得mapper的映射对象一定是我们写的实现接口。

![image-20231221161023934](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231221161023934.png)

![image-20231221161035368](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231221161035368.png)

### 输出简单类型

  * mapper.xml


```sql
<!-- 用户信息综合查询总数
       parameterType：指定输入类型和findUserList一样
       resultType：输出结果类型   -->
<select id="findUserCount" parameterType="com.iot.mybatis.po.UserQueryVo" resultType="int">
    SELECT count(*) FROM user WHERE user.sex=#{userCustom.sex} AND user.username LIKE '%${userCustom.username}%'
</select>
```

  * mapper.java


```java
//用户信息综合查询总数
@Test
public
void testFindUserCount() throws Exception {
    SqlSession sqlSession = sqlSessionFactory.openSession();
    //创建UserMapper对象，mybatis自动生成mapper代理对象
    UserMapper userMapper =
    sqlSession.getMapper(UserMapper.class);
    //创建包装对象，设置查询条件
    UserQueryVo userQueryVo =
    new UserQueryVo();
    UserCustom userCustom = new UserCustom();
    //由于这里使用动态sql，如果不设置某个值，条件不会拼接在sql中
    userCustom.setSex("1");
    userCustom.setUsername("小");
    userQueryVo.setUserCustom(userCustom);
    //调用userMapper的方法
    int count = userMapper.findUserCount(userQueryVo);
    System.out.println(count);
}
```

  * 小结


查询出来的结果集只有一行且一列，可以使用简单类型进行输出映射。

### 输出pojo对象和pojo列表

**不管是输出的pojo单个对象还是一个列表（list中包括pojo），在mapper.xml中`resultType`指定的类型是一样的。**

在mapper.java指定的方法返回值类型不一样：

  * 输出单个pojo对象，方法返回值是单个对象类型


```java
//根据id查询用户信息
public User findUserById(int id) throws Exception;
```

  * 输出pojo对象list，方法返回值是List


```java
//根据用户名列查询用户列表
public List<User> findUserByName(String name) throws Exception;
```

**生成的动态代理对象中是根据mapper方法的返回值类型确定是调用`selectOne`(返回单个对象调用)还是`selectList` （返回集合对象调用 ）.**

## resultMap（这个是mybatis里的核心完成方式）

mybatis中使用resultMap完成高级输出结果映射。(一对多，多对多)

### resultMap使用方法

如果查询出来的列名和pojo的属性名不一致，通过定义一个resultMap对列名和pojo属性名之间作一个映射关系。

1.定义resultMap

2.使用resultMap作为statement的输出映射类型

  * 定义reusltMap


```xml
<!-- 定义resultMap
    将SELECT id id_,username username_ FROM USER 和User类中的属性作一个映射关系
        type：resultMap最终映射的java对象类型,可以使用别名
    id：对resultMap的唯一标识
     -->
<resultMap type="user" id="userResultMap">
    <!-- id表示查询结果集中唯一标识
        column：查询出来的列名
        property：type指定的pojo类型中的属性名
        最终resultMap对column和property作一个映射关系 （对应关系）
        -->
    <id column="id_" property="id"/>
    <!--
        result：对普通名映射定义
        column：查询出来的列名
        property：type指定的pojo类型中的属性名
        最终resultMap对column和property作一个映射关系 （对应关系）
         -->
    <result column="username_" property="username"/>
</resultMap>
```

### 小结

使用resultType进行输出映射，只有查询出来的列名和pojo中的属性名一致，该列才可以映射成功。

如果查询出来的列名和pojo的属性名不一致，通过定义一个resultMap对列名和pojo属性名之间作一个映射关系。