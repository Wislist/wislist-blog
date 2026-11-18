---
title: "mybatis学习笔记（day4）"
date: 2023-12-21 00:00:00

categories:
  - 框架
tags:
  - MyBatis
  - 输入映射
  - 参数
---

# mybatis学习(day4)

## 输入映射

通过parameterType指定输入参数的类型，类型可以是

  * 简单类型
  * hashmap
  * pojo的包装类型


昨天已经解释过parameterType是什么了  
例如：

```sql
<delete id="deleteStudent" parameterType="int">
    delete from student where id=#{studentId}
</delete>
```

中的 parameterType 是来指定字段类型的

## 传递pojo的包装对象

  * 定义包装类型pojo

```java
package com.iot.mybatis.po;
public class UserQueryVo {
    //在这里包装所需要的查询条件
    //用户查询条件
    private UserCustom userCustom;
    public UserCustom getUserCustom() {
        return userCustom;
    }
    public void setUserCustom(UserCustom userCustom) {
        this.userCustom = userCustom;
    }
//可以包装其它的查询条件，订单、商品
//....
}
```

其中，UserCustom类继承User


```java
public class UserCustom extends User{}
```

  * mapper.xml


在UserMapper.xml中定义用户信息综合查询（查询条件复杂，通过高级查询进行复杂关联查询）。

```sql
<!-- 用户信息综合查询
    #{userCustom.sex}:取出pojo包装对象中性别值
    ${userCustom.username}：取出pojo包装对象中用户名称 -->
<select id="findUserList" parameterType="com.iot.mybatis.po.UserQueryVo"
        resultType="com.iot.mybatis.po.UserCustom">
    SELECT * FROM user WHERE user.sex=#{userCustom.sex} AND user.username LIKE '%${userCustom.username}%'
</select>
```

注意不要将`#{userCustom.sex}`中的`userCustom`写成`UserCustom`,前者指属性名(由于使用IDE提示自动补全，所以只是把类型名首字母小写了)，后者指类型名，这里是`UserQueryVo`类中的`userCustom`属性，是**属性名** 。写错会报如下异常：

```yml
org.apache.ibatis.exceptions.PersistenceException: ### Error querying database.  Cause: org.apache.ibatis.reflection.ReflectionException: There is no getter for property named 'UserCustom' in 'class com.iot.mybatis.po.UserQueryVo'### Cause: org.apache.ibatis.reflection.ReflectionException: There is no getter for property named 'UserCustom' in 'class com.iot.mybatis.po.UserQueryVo'
```

  * mapper.java


```java
//用户信息综合查询
public List<UserCustom> findUserList(UserQueryVo userQueryVo) throws Exception;
```

  * 测试代码


```java
//用户信息的综合 查询
@Test
public void testFindUserList() throws Exception {
    SqlSession sqlSession = sqlSessionFactory.openSession();
    //创建UserMapper对象，mybatis自动生成mapper代理对象
        UserMapper userMapper  =
    sqlSession.getMapper(UserMapper.class);
    //创建包装对象，设置查询条件
        UserQueryVo userQueryVo =
    new UserQueryVo();
    UserCustom userCustom = new UserCustom();
    //由于这里使用动态sql，如果不设置某个值，条件不会拼接在sql中
    userCustom.setSex("1");
    userCustom.setUsername("张三");
    userQueryVo.setUserCustom(userCustom);
    //调用userMapper的方法
        List<UserCustom> list =
    userMapper.findUserList(userQueryVo);
    System.out.println(list);
}
```

## 补充

### 传递多个参数：

当 Dao 接口方法多个参数，需要通过名称使用参数。在方法形参前面加入`@Param(“自定义参数名”)，mapper 文件使用#{自定义参数名}。`

例如定义 List selectStudent( @Param(“personName”) String name ) { … }  
mapper 文件 select * from student where name = #{ personName}

#### **接口方法：**

@Param注释写在mapper接口里

```java
/**
    * 多个参数：命名参数，在形参定义的前面加入@Param("自定义参数名称")
    */
public List<Student> selectMultiParam(@Param("myname") String name, @Param("myage") Integer age);
```

#### **mapper 文件：**

```sql
<!--多个参数，使用@Param命名-->
<select id="selectMultiParam" resultType="com.zep.domain.Student">
    select * from student where name=#{myname} or age=#{myage}
</select>
```

#### **测试方法：**

```java
@Test
public void testSelectMultiParam() {
    SqlSession sqlSession = MybatisUtils.getSqlSession();
    StudentDao dao = sqlSession.getMapper(StudentDao.class);
    List<Student> students = dao.selectMultiParam("李四", 20);
    for (Student student : students) {
        System.out.println("学生=" + student);
    }
    sqlSession.close();
}
```

![image-20231221111602942](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231221111602942.png)

### 多个参数-使用对象

使用 java 对象传递参数， java 的属性值就是 sql 需要的参数值。 每一个属性就是一个参数。  
语法格式：

`#{ property,javaType=java 中数据类型名,jdbcType=数据类型名称 }`

javaType, jdbcType 的类型 MyBatis 可以检测出来，一般不需要设置。

**常用格式 #{ property }**

![image-20231221154447046](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20231221154447046.png)

注：部分的我还没搞懂，等晚上再发