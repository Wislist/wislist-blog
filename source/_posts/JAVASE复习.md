---
title: "JAVASE复习"
date: 2023-12-02 00:00:00

categories:
  - Java基础
tags:
  - Java
  - 语法
  - 面向对象
---

# JAVASE复习

## 基础语法

### 数据类型

#### 基本数据类型

整型:byte 1 int 4 long 8  
浮点: float 4 double(默认) 8  
字符: char 2 ASCII UTF-8(存中文) Unicode JBK(windows)  
布尔: boolean 1

#### 引用数据类型

  * 类class
  * 接口 interface
  * 数组


### 类型转换

#### 自动类型转换 低转高

#### 强制类型转换 高转低 eg. int->long 强转

### 变量和常量

#### type varName [=value];

#### 作用域

  * 类变量
  * 实例变量
  * 局部变量


#### 常量

final MAX_A = ;

#### 命名规范

  * 见名知意
  * 驼峰命名
  * 类 首字母大写
  * 常量：大写＋下划线
  * 不要使用拼音命令


### 运算符

#### 算数运算符

#### 赋值运算符

#### 关系运算符

#### 逻辑运算符

#### 位运算符

## 面向对象

### 类与对象

类是对象的抽象：模板Class  
对象是类的具体

### 构造方法

构造的重载

有一个默认的无参构造

如果手动定义了一个有参构造就必须要手动再加一个无参构造 

单例模式 需要构造器私有

### new对象

栈存放引用

堆存放具体对象

### 封装

属性私有，get set

### 继承

extends Object 子类拥有父类的全部特性

方法重写

this

super

JAVA是单继承 只有一个父类

### 多态

父类的引用指向子类的对象 Person person = new Student();

`instanceof` 关键 如果匹配 可以进行类型之间的转换

### 修饰符

public protected private static final abstract

### 接口interface

interface  
约束 只能定义方法名  
子类实现接口 必须重写其中的方法  
只有一个方法的接口叫函数式接口 可以用lambda表达式简化  
接口比抽象类更抽象  
一个类可以实现多个接口

### 内部类

#### 局部

#### 静态

#### 匿名（重点）

## 异常

### Throwable

  * Exception 运行时异常 检查型异常
  * Error AWT错误 JVM错误 递归有问题 StackOverFlow栈溢出 OutOfMemory内存溢出


### 关键字

  * try{}
  * catch(){} 先小后大
  * finally{}
  * throw 手动抛出异常
  * throws 方法抛出异常


### 自定义异常

继承Exception

## 常用类

### Object

  * hashcode
  * toString
  * clone
  * getClass
  * notify
  * wait
  * equals


### String

不可变性 

### Math

  * 数学计算


### File

  * 创建文件
  * 查看文件
  * 修改文件
  * 删除


### Random

  * 随机数 UUID


### Data

  * Date
  * SimpleDateFormat yyyy-mm-dd HH:mm:ss
  * Calendar (建议使用)


### 包装

自动装箱和拆箱

### StringBuffer

可变长 append()

### StringBuilder

可变长

## 集合框架（看博客）

### Conllection

#### List

  * ArrayList


add remove contains size

  * **LinkedList (常用)**


getFirst getLast removeFirst addFirst

  * Vector
  * Stack


#### Set

  * **HashSet(常用)**
  * TreeSet


### Map

#### HashMap(重点 天天用)

#### TreeMap

### Collections 工具类

### 泛型 <>约束 避免类型转换之间的问题

## IO流

### 字节流

  * 输出：OutputStream
  * 输入: InputStream


### 节点流

  * CharArrayReader,Writer,inputstream,outputstream
  * StringReader Writer
  * pipe(管道流) PipedOutputStream
  * File


### 字符流

Reader Writer

### 处理流

  * **buffer** bufferInputStream bufferOutputStream bufferReader bufferWriter
  * **data** DataInputStream DataOutputStream
  * 转换流 InputstreamReader OutputStreamWriter
  * object 流
  * 序列化 反序列化 Serializable标记性接口 无实际作用 transient (透明的)
  * Filter 四个
  * print printWriter printStream


## 多线程