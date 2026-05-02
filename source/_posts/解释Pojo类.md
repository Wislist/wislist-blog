---
title: "解释Pojo类以及javabean"
date: 2023-12-22 00:00:00
tags: []
categories: []
---

# 解释Pojo类

其实就是我们在开发中的一些规范，至于为啥叫pojo类，原因如下：

在软件工程领域，POJO是一个普通的Java对象，其不受任何特殊的限制。

POJO具有以下特点：

  * ➊ 不继承任何类
  * ➋ 不实现任何接口
  * ➌ 无任何注解
  * ➍ 不依赖于任何第三方框架（库）


[code] 
    public class EmployeePojo➊ {      public String➋ firstName;    public String➋ lastName;    private LocalDate➋ startDate;      public EmployeePojo(String firstName, String lastName, LocalDate startDate) {        this.firstName = firstName;        this.lastName = lastName;        this.startDate = startDate;    }      public String name()➍ {        return this.firstName + " " + this.lastName;    }      public LocalDate getStart()➍ {        return this.startDate;    }}
[/code]

  * ➊ 无继承、无实现
  * ➋ 属性类型均为java内置类型
  * ➌ 无注解


他的优点： 可以被任何java程序使用。

## 反射Pojo

引入maven-jar包
[code] 
    <dependency>    <groupId>commons-beanutils</groupId>    <artifactId>commons-beanutils</artifactId>    <version>1.9.4</version></dependency>
[/code]

使用如下方法来反射EmployeePojo的属性：
[code] 
    class EmployeePojoTest {    @Test    void inspectProperties() {        // 反射EmployeePojo的属性        List<String> propertyNames =                Arrays.stream(PropertyUtils.getPropertyDescriptors(EmployeePojo.class))                        .sequential()                        .map(PropertyDescriptor::getDisplayName)                        .collect(Collectors.toList());         // 打印反射的结果        System.out.println(propertyNames);         // 打印的结果总归还需要眼睛来看，而使用断言则不需要眼睛来看控制台，且更规范        assertEquals(1, propertyNames.size());        assertEquals("start", propertyNames.get(0));    }}
[/code]

可见对EmpoyeePojo进行反射后并**未** 获取到其它两个属性：firstName、lastName。

我们希望对EmpoyeePojo的反射能够获取到所有的字段： _firstName、lastName_ 以及 _startDate_ ，这对框架而言非常的有必要。虽然一般的POJO无法实现上述功能，但值得庆幸的是大多数的框架（库）均支持一种叫做JavaBean的命名规范，若想反射出所有的字段则只需要简单的遵循该规范即可。

## JavaBeans

JavaBean**原则上** 也是一个POJO，相较于POJO它还需要遵循以下规范：

  * 访问级别：所有的属性需要定义为private类型，并且提供getter以及setter方法。
  * 方法命名：getter、setter方法必须以 _getX_ 以及 _setX_ 的命名规范（如果字段类型为boolean，则getter方法还可命名为： _isX_ ）。
  * 默认构造函数：必须提从一个没有任何参数的构造函数。因为只有这样才能够在不提供任何参数的情况下创建对应的实例，最经典的使用场景为：反序列化。
  * 可(反)序列化：必须实现 _Serializable_ 接口（该接口中未定义任何方法，作用仅为标识class是否可(反)序列化。


[code] 
    package po;import java.util.Date;public class User {    //属性名要和数据库表的字段对应    private int id;    private String username;// 用户姓名    private String sex;// 性别    private Date birthday;// 生日    private String address;// 地址    public int getId() {        return id;    }    public void setId(int id) {        this.id = id;    }    public String getUsername() {        return username;    }    public void setUsername(String username) {        this.username = username;    }    public String getSex() {        return sex;    }    public void setSex(String sex) {        this.sex = sex;    }    public Date getBirthday() {        return birthday;    }    public void setBirthday(Date birthday) {        this.birthday = birthday;    }    public String getAddress() {        return address;    }    public void setAddress(String address) {        this.address = address;    }    @Override    public String toString() {        return "User [id=" + id + ", username=" + username + ", sex=" + sex                + ", birthday=" + birthday + ", address=" + address + "]";    }}
[/code]

### 反射JavaBean

使用同样的代码来反射EmployeeBean，则得到如下结果：
[code] 
    [firstName, lastName, startDate]
[/code]

## 权衡利弊

虽然JavaBeans在很多时候为我们带来了较大的便利，但其缺点也很明显，这需要我们在使用时结合其优缺点来权衡利弊。

JavaBeans的主要缺点如下：

  * 易变性：由于我们需要为每个字段都设置一个setter方法，所以原则上每个字段都可以通过setter方法来重新赋值。这有时候会引发一些并发或数据不一致的问题。
  * 死板：我们不得不为每个字段都提供getter/setter方法，而有些时候我们根本用不到某些getter/setter，但却不得不收书定大量样板化的代码。
  * 空构造函数：由于某些对象在实例化时必须传入相应的字段才会有意义，所以我们可以在构造函数中声明必须传入的字段从而达到约束特殊字段的目的。而此时我们提供的空构造函数破坏了这一约束性。


但值得庆幸的事，大多数的框架已经习惯并适应了JavaBean，并能够很好的对其缺点进行处理。

## 总结和补充

mybatis中的[POJO](<https://so.csdn.net/so/search?q=POJO&spm=1001.2101.3001.7020>) “只是为了封装数据”,当sql语句查询到数据之后,如果你要封装到对应的POJO中,一定要保证字段和POJO中的变量名一样,如果不一样,无法封装,这个时候只能使用起别名或修改变量名的方式解决问题.

起别名的作用只是为了把数据封装到POJO中对应的变量上,当然这是你是用resultType时这样做,如果使用resultMap就不需要这样做,只需要自己设置字段对应的变量就行.

SQL语句在数据库进行查询的时候还是利用以前的名字进行查询,只是在显示的时候使用别名显示.