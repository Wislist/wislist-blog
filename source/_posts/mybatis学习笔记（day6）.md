---
title: "mybatis学习笔记（day6）"
date: 2024-01-18 00:00:00

categories:
  - 框架
tags:
  - MyBatis
  - 动态SQL
---

# mybatis学习笔记（day6）

## 动态sql

mybatis核心,对sql语句进行灵活操作，通过表达式进行判断，对sql进行灵活拼接、组装。

### Choose

  * mapper.xml


```sql
<select id="findUserCount" parameterType="po.UserQueryVo" resultType="int">
    SELECT count(*) FROM users.user
    <where>
        <if test="userCustom!=null">
            <choose>
                <!--相当于switch-->
                <when test="userCustom.sex!=null and userCustom.sex != ''">
                    <!--相当于case-->
                    AND user.sex=#{userCustom.sex}
                </when>
                <when test="userCustom.username!=null and userCustom.username != ''">
                    AND user.username LIKE '%${userCustom.username}%'
                </when>
                <otherwise>
                    <!--否则的意思 就是都不满足-->
                </otherwise>
            </choose>
        </if>
        <!--            <if test="userCustom!=null">-->
        <!--                <if test="userCustom.sex!=null and userCustom.sex != '' ">-->
        <!--                    AND user.sex=#{userCustom.sex}-->
        <!--                </if>-->
        <!--                <if test="userCustom.username!=null and userCustom.username != '' ">-->
        <!--                    AND user.username LIKE '%${userCustom.username}%'-->
        <!--                </if>-->
        <!--            </if>-->
    </where>
</select>
```

### if判断

  * mapper.xml


```sql
<!-- 用户信息综合查询    #{userCustom.sex}:取出pojo包装对象中性别值    ${userCustom.username}：取出pojo包装对象中用户名称 -->
<select id="findUserList" parameterType="com.iot.mybatis.po.UserQueryVo"        resultType="com.iot.mybatis.po.UserCustom">
    SELECT * FROM user
    <!--  where 可以自动去掉条件中的第一个and -->
    <where>
        <if test="userCustom!=null">
            <if test="userCustom.sex!=null and userCustom.sex != '' ">
                AND user.sex=#{userCustom.sex}
            </if>
            <if test="userCustom.username!=null and userCustom.username != '' ">
                AND user.username LIKE '%${userCustom.username}%'
            </if>
        </if>
    </where>
</select>
<!-- 用户信息综合查询总数    parameterType：指定输入类型和findUserList一样    resultType：输出结果类型-->
<select id="findUserCount" parameterType="com.iot.mybatis.po.UserQueryVo" resultType="int">
    SELECT count(*) FROM user
    <where>
        <if test="userCustom!=null">
            <if test="userCustom.sex!=null and userCustom.sex != '' ">
                AND user.sex=#{userCustom.sex}
            </if>
            <if test="userCustom.username!=null and userCustom.username != '' ">
                AND user.username LIKE '%${userCustom.username}%'
            </if>
        </if>
    </where>
</select>
```

  * 测试结果


1.注释掉`testFindUserList()`方法中的`userCustom.setUsername("张三");`

```java
//由于这里使用动态sql，如果不设置某个值，条件不会拼接在sql中userCustom.setSex("1");//userCustom.setUsername("张三");
userQueryVo.setUserCustom(userCustom);
```

  * 输出


![image-20240124121929946](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240124121929946.png)

可以看到sql语句变为了`SELECT * FROM user`

## sql片段(重点)

将上边实现的动态sql判断代码块抽取出来，组成一个sql片段。其它的statement中就可以引用sql片段。

  * 定义sql片段


```xml
<!-- 定义sql片段id：sql片段的唯 一标识经验：是基于单表来定义sql片段，这样话这个sql片段可重用性才高在sql片段中不要包括 where -->
<sql id="query_user_where">
    <if test="userCustom!=null">
        <if test="userCustom.sex!=null and userCustom.sex!=''">
            AND user.sex = #{userCustom.sex}
        </if>
        <if test="userCustom.username!=null and userCustom.username!=''">
            AND user.username LIKE '%${userCustom.username}%'
        </if>
    </if>
</sql>
```

  * 引用sql片段


```sql
<!-- 用户信息综合查询    #{userCustom.sex}:取出pojo包装对象中性别值    ${userCustom.username}：取出pojo包装对象中用户名称 -->
<select id="findUserList" parameterType="com.iot.mybatis.po.UserQueryVo"        resultType="com.iot.mybatis.po.UserCustom">
    SELECT * FROM user
    <!--  where 可以自动去掉条件中的第一个and -->
    <where>
        <!-- 引用sql片段 的id，如果refid指定的id不在本mapper文件中，需要前边加namespace -->
        <include refid="query_user_where">
        </include>
        <!-- 在这里还要引用其它的sql片段  -->
    </where>
</select>
```

相当于只用写一遍sql 然后让别的pojo全部去调用sql包裹住的sql语句

**输出是一样的**

![image-20240124124141971](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240124124141971.png)

## foreach标签

向sql传递**数组或List** ，mybatis使用foreach解析

在用户查询列表和查询总数的statement中增加多个id输入查询。两种方法，sql语句如下：

  * `SELECT * FROM USER WHERE id=1 OR id=10 OR id=16`
  * `SELECT * FROM USER WHERE id IN(1,10,16)`


一个使用OR,一个使用IN

  * 在输入参数类型中添加`List<Integer> ids`传入多个id


```java
public class UserQueryVo {
    //传入多个id
    private List<Integer> ids;
    //getter、setter方法
}
```

  * 修改mapper.xml

```xml
<if test="ids!=null">
    <!-- 使用 foreach遍历传入ids    collection：指定输入 对象中集合属性    item：每个遍历生成对象中    open：开始遍历时拼接的串    close：结束遍历时拼接的串    separator：遍历的两个对象中需要拼接的串     -->
    <!-- 使用实现下边的sql拼接：     AND (id=1 OR id=10 OR id=16)     -->
    <foreach collection="ids" item="user_id" open="AND (" close=")" separator="or">
        <!-- 每个遍历需要拼接的串 -->
        id=#{user_id}
    </foreach>
    <!-- 实现  “ and id IN(1,10,16)”拼接 -->
    <!-- <foreach collection="ids" item="user_id" open="and id IN(" close=")" separator=",">        每个遍历需要拼接的串        #{user_id}    </foreach> -->
</if>
```