---
title: "SQL语句"
date: 2023-12-08 00:00:00
tags: []
categories: []
---

# SQL语句

## 基础

### 0.1 连接数据库

![8a199df40306c936d6657d72e6a9cb3](https://gitee.com/wislist/img/raw/master/8a199df40306c936d6657d72e6a9cb3.png)

### 0.2 创建数据库、添加引擎、设置编码格式

注意：每个数据库版本可能所支持的引擎有所不同
[code] 
    create database if not EXISTS db_studydefault character set utf8default collate utf8_general_ci;
[/code]

### 0.3 创建数据表
[code]
    USING database(数据库名)CREATE TABLE --数据表名--(	学号 CHAR(4) PRIMARY KEY ,    姓名 varchar(20) NOT NULL ,    性别 varchar(5) DEFAULT '男' CHECK ( 性别='男' || 性别='女' ),    出生日期 date not null ,    专业 varchar(20) not null ,    院系 varchar(20) not null ,    联系电话 text)
[/code]

## 一、查询数据

### 1.1 基本查询

要查询数据库表的数据
[code] 
    SELECT * FROM students;== 其中 SELECT 是关键字 表示查询== ‘*’ 表示所有列  FROM 表示从哪个表查询
[/code]

注意：查询结果也是一个二维表，它包含列名和每一行的数据。
[code] 
    SELECT <定义列的名字> FROM <表名>
[/code]

### 1.2 条件查询

很多时候，我们并不希望获得所有记录，而是根据条件选择性地获取指定条件的记录，例如，查询分数在80分以上的学生记录。
[code] 
    SELECT * FROM <表名> WHERE <条件表达式>
[/code]

条件表达式可以用`<条件1> AND <条件2>`表达满足条件1并且满足条件2。  
例如；
[code] 
    SELECT * FROM students WHERE score >= 80 AND gender = 'M';
[/code]

第二种条件是`<条件1> OR <条件2>`，表示满足条件1或者满足条件2。
[code] 
    SELECT * FROM students WHERE score >= 80 OR gender = 'M';
[/code]

第三种条件是`NOT <条件>`，表示“不符合该条件”的记录。
[code] 
    SELECT * FROM students WHERE NOT class_id = 2;
[/code]

上述`NOT`条件`NOT class_id = 2`其实等价于`class_id <> 2`，因此，`NOT`查询不是很常用。

**SELECT * FROM students WHERE 85 <= score <= 95;**

表示score >=85 or score <=95

### 1.3 投影查询

使用`SELECT * FROM <表名> WHERE <条件>`可以选出表中的若干条记录。我们注意到返回的二维表结构和原表是相同的，即结果集的所有列与原表的所有列都一一对应。

如果我们只希望返回某些列的数据，而不是所有列的数据，我们可以用`SELECT 列1, 列2, 列3 FROM ...`，让结果集**仅包含指定列** 。这种操作称为投影查询。
[code] 
    SELECT id, score, name FROM students;
[/code]

![2cc21195be1bf2503a0c93302e7cfb5](https://gitee.com/wislist/img/raw/master/2cc21195be1bf2503a0c93302e7cfb5.png)

使用`SELECT 列1, 列2, 列3 FROM ...`时，还可以给每一列起个==别名==，这样，结果集的列名就可以与原表的列名不同。它的语法是`SELECT 列1 别名1, 列2 别名2, 列3 别名3 FROM ...`。

例如，以下`SELECT`语句将列名`score`重命名为`points`，而`id`和`name`列名保持不变：
[code] 
    -- 使用投影查询，并将列名重命名：SELECT id, score points, name FROM students;
[/code]

投影查询同样可以接`WHERE`条件，实现复杂的查询：
[code] 
    SELECT id, score points, name FROM students WHERE gender = 'M';
[/code]

### 1.4 排序

查询结果集通常是按照`id`排序的，也就是根据主键排序。如果我们要根据其他条件排序怎么办？可以加上`ORDER BY`子句.
[code] 
    SELECT id, name, gender, score FROM students ORDER BY score;
[/code]

**==ORDER BY==** 从低到高

**==DESC==** 从高到低

例如：
[code] 
    SELECT id, name, gender, score FROM students ORDER BY score DESC, gender;表示先按score列倒序，如果有相同分数的，再按gender列排序：
[/code]

默认的排序规则是`ASC`：“升序”，即从小到大。`ASC`可以省略，即`ORDER BY score ASC`和`ORDER BY score`效果一样。

如果有`WHERE`子句，那么`ORDER BY`子句要放到`WHERE`子句后面。例如，查询一班的学生成绩，并按照倒序排序：

带WHERE条件的ORDER BY：
[code] 
    SELECT id, name, gender, scoreFROM studentsWHERE class_id = 1ORDER BY score DESC;
[/code]

### 1.5 分页查询

如果结果集数据量很大，放在一个页面显示的话数据量太大，不如分页显示，每次显示100条。

要实现分页功能，实际上就是从结果集中显示第1~100条记录作为第1页，显示第101-200条记录作为第2页，以此类推。

因此，分页实际上就是从结果集中“截取”出第M~N条记录。这个查询可以通过`LIMIT <N-M> OFFSET <M>`子句实现。我们先把所有学生按照成绩从高到低进行排序：
[code] 
    SELECT id, name, gender, score FROM students ORDER BY score DESC;
[/code]

现在，我们把结果集分页，每页3条记录。要获取第1页的记录，可以使用`LIMIT 3 OFFSET 0`：
[code] 
    ==查询第一页SELECT id, name, gender, scoreFROM studentsORDER BY score DESCLIMIT 3 OFFSET 0;
[/code]

==**LIMIT OFFSET **== 每页最多M行数据，从第N行开始显示。

### 1.6 聚合查询

对于统计总数、平均数这类计算，SQL提供了专门的聚合函数，使用聚合函数进行查询，就是聚合查询，它可以快速获得结果。

使用SQL内置的`COUNT()`函数查询：
[code] 
    SELECT COUNT(*) FROM students;
[/code]

聚合查询同样可以使用`WHERE`条件，因此我们可以方便地统计出有多少男生、多少女生、多少80分以上的学生等：
[code] 
    SELECT COUNT(*) boys FROM students WHERE gender = 'M';==其中COUNT(*)和COUNT(id)是一样的效果
[/code]

除了`COUNT()`函数外，SQL还提供了如下聚合函数：

![25e08ab60c7cff303d8592a66f331ec](https://gitee.com/wislist/img/raw/master/25e08ab60c7cff303d8592a66f331ec.png)

注意，`MAX()`和`MIN()`函数并不限于数值类型。如果是字符类型，`MAX()`和`MIN()`会返回排序最后和排序最前的字符。

要特别注意：如果聚合查询的`WHERE`条件没有匹配到任何行，`COUNT()`会返回0，而`SUM()`、`AVG()`、`MAX()`和`MIN()`会返回`NULL`：

#### 并

并查询，将有相同属性的联系起来
[code] 
    SELECT COUNT(*) num FROM students WHERE MAJ='计算机' UNION SELECT * FROM s;
[/code]

#### 分组

对于聚合查询，SQL还提供了“分组聚合”的功能。我们观察下面的聚合查询：
[code] 
    -- 按class_id分组:SELECT COUNT(*) num FROM students GROUP BY class_id;
[/code]

### 1.6 多表查询

SELECT查询不但可以从一张表查询数据，还可以从多张表同时查询数据。查询多张表的语法是：`SELECT * FROM <表1> <表2>`。

同时从`students`表和`classes`表的“乘积”，即查询数据，可以这么写：
[code] 
    SELECT * FROM students, classes;
[/code]

### 1.7 连接查询

假设我们希望结果集同时包含所在班级的名称，上面的结果集只有`class_id`列，缺少对应班级的`name`列。

现在问题来了，存放班级名称的`name`列存储在`classes`表中，只有根据`students`表的`class_id`，找到`classes`表对应的行，再取出`name`列，就可以获得班级名称。

这时，连接查询就派上了用场。我们先使用最常用的一种内连接——INNER JOIN来实现：
[code] 
    -- 选出所有学生，同时返回班级名称SELECT s.id, s.name, s.class_id, c.name class_name, s.gender, s.scoreFROM students sINNER JOIN classes cON s.class_id = c.id;
[/code]

注意INNER JOIN查询的写法是：

  1. 先确定主表，仍然使用`FROM <表1>`的语法；
  2. 再确定需要连接的表，使用`INNER JOIN <表2>`的语法；
  3. 然后确定连接条件，使用`ON <条件...>`，这里的条件是`s.class_id = c.id`，表示`students`表的`class_id`列与`classes`表的`id`列相同的行需要连接；
  4. 可选：加上`WHERE`子句、`ORDER BY`等子句。


那什么是内连接（INNER JOIN）呢？先别着急，有内连接（INNER JOIN）就有外连接（OUTER JOIN）。我们把内连接查询改成外连接查询，看看效果：
[code] 
    SELECT s.id, s.name, s.class_id, c.name class_name, s.gender, s.scoreFROM students sRIGHT OUTER JOIN classes cON s.class_id = c.id;
[/code]

![1c2a1b2e3aac2dc0c372c71e8c1ecb5](https://gitee.com/wislist/img/raw/master/1c2a1b2e3aac2dc0c372c71e8c1ecb5.png)

执行上述RIGHT OUTER JOIN可以看到，和INNER JOIN相比，RIGHT OUTER JOIN多了一行，多出来的一行是“四班”，但是，学生相关的列如`name`、`gender`、`score`都为`NULL`。

这也容易理解，因为根据`ON`条件`s.class_id = c.id`，`classes`表的id=4的行正是“四班”，但是，`students`表中并不存在class_id=4的行。

有RIGHT OUTER JOIN，就有LEFT OUTER JOIN，以及FULL OUTER JOIN。它们的区别是：

INNER JOIN只返回同时存在于两张表的行数据，由于`students`表的`class_id`包含1，2，3，`classes`表的`id`包含1，2，3，4，所以，INNER JOIN根据条件`s.class_id = c.id`返回的结果集仅包含1，2，3。

RIGHT OUTER JOIN返回右表都存在的行。如果某一行仅在右表存在，那么结果集就会以`NULL`填充剩下的字段。

LEFT OUTER JOIN则返回左表都存在的行。如果我们给students表增加一行，并添加class_id=5，由于classes表并不存在id=5的行，所以，LEFT OUTER JOIN的结果会增加一行，对应的`class_name`是`NULL`：
[code] 
    - 先增加一列class_id=5:INSERT INTO students (class_id, name, gender, score) values (5, '新生', 'M', 88);-- 使用LEFT OUTER JOINSELECT s.id, s.name, s.class_id, c.name class_name, s.gender, s.scoreFROM students sLEFT OUTER JOIN classes cON s.class_id = c.id;
[/code]

最后，我们使用FULL OUTER JOIN，它会把两张表的所有记录全部选择出来，并且，自动把对方不存在的列填充为NULL：
[code] 
    -- 使用FULL OUTER JOINSELECT s.id, s.name, s.class_id, c.name class_name, s.gender, s.scoreFROM students sFULL OUTER JOIN classes cON s.class_id = c.id;
[/code]

假设查询语句是
[code] 
    SELECT ... FROM tableA ??? JOIN tableB ON tableA.column1 = tableB.column2;
[/code]

![57ee7a5a668ea3a0fa7e1872d401139](https://gitee.com/wislist/img/raw/master/57ee7a5a668ea3a0fa7e1872d401139.png)

### 1.8 子查询***

#### ==**普通子查询** ==

#### ==**相关子查询** ==
[code]
    select sno,snfrom swhere 'c1' in  (select cno                from sc                where sno = s.sno);
[/code]

一般可以写成`非相关子查询`

`EXISTS`:(存在) 不返回实际数据 只返回`ture`和`false`
[code] 
    exists (select * from sc where sno = s.sno and cno='c1');
[/code]

#### ==**WITH AS** ==(高级CTE)
[code]
    WITH <表名>(自己起的类似函数) AS( 查询CET );
[/code]

1.使用with子句可以让子查询重用相同的with查询块,通过select调用（with子句只能被select查询块引用），一般在with查询用到多次情况下。在引用的select语句之前定义,同级只能定义with关键字只能使用一次,多个用逗号分割。
[code] 
    withcte1 as(    select * from table1 where name like 'abc%'),cte2 as(    select * from table2 where id > 20),cte3 as(    select * from table3 where price < 100)select a.* from cte1 a, cte2 b, cte3 c where a.id = b.id and a.id = c.id
[/code]

2.with子句的返回结果存到用户的临时表空间中，只做一次查询，反复使用,提高效率。

3.在同级select前有多个查询定义的时候，第1个用with，后面的不用with，并且用逗号隔开。

4.最后一个with 子句与下面的查询之间不能有逗号，只通过右括号分割,with 子句的查询必须用括号括起来

5.如果定义了with子句，而在查询中不使用，那么会报ora-32035 错误：未引用在with子句中定义的查询名。（至少一个with查询的name未被引用，解决方法是移除未被引用的with查询），注意：只要后面有引用的就可以，不一定非要在主查询中引用，比如后面的with查询也引用了，也是可以的。

6.前面的with子句定义的查询在后面的with子句中可以使用。但是一个with子句内部不能嵌套with子句。

7.当一个查询块名字和一个表名或其他的对象相同时，解析器从内向外搜索，优先使用子查询块名字。

8.with查询的结果列有别名，引用的时候必须使用别名或*。

## 二、修改数据

### 2.1 插入新数据

==**INSERT** == 
[code] 
    INSERT INTO <表名> (字段1, 字段2, ...) VALUES (值1, 值2, ...);
[/code]

注意到我们并没有列出`id`字段，也没有列出`id`字段对应的值，这是因为`id`字段是一个自增主键，它的值可以由数据库自己推算出来。此外，如果一个字段有默认值，那么在`INSERT`语句中也可以不出现。

要注意，字段顺序不必和数据库表的字段顺序一致，但值的顺序必须和字段顺序一致。也就是说，可以写`INSERT INTO students (score, gender, name, class_id) ...`，但是对应的`VALUES`就得变成`(80, 'M', '大牛', 2)`。 
[code] 
    -- 一次性添加多条新记录INSERT INTO students (class_id, name, gender, score) VALUES  (1, '大宝', 'M', 87),  (2, '二宝', 'M', 81);
[/code]

### 2.2 更新数据

`UPDATE`语句的基本语法是：
[code] 
    UPDATE <表名> SET 字段1=值1, 字段2=值2, ... WHERE ...;
[/code]

例如，我们想更新`students`表`id=1`的记录的`name`和`score`这两个字段，先写出`UPDATE students SET name='大牛', score=66`，然后在`WHERE`子句中写出需要更新的行的筛选条件`id=1`：
[code] 
    -- 更新id=1的记录UPDATE students SET name='大牛', score=66 WHERE id=1;
[/code]

注意到`UPDATE`语句的`WHERE`条件和`SELECT`语句的`WHERE`条件其实是一样的，因此完全可以一次更新多条记录：
[code] 
    -- 更新id=5,6,7的记录UPDATE students SET name='小牛', score=77 WHERE id>=5 AND id<=7;--将id为5 6 7 的name全部改成小牛 且对应的score都为77
[/code]

其中，`SET score=score+10`就是给当前行的`score`字段的值加上了10。

如果`WHERE`条件没有匹配到任何记录，`UPDATE`语句不会报错，也不会有任何记录被更新。例如：
[code] 
    -- 更新id=999的记录UPDATE students SET score=100 WHERE id=999;
[/code]

==最后，要特别小心的是，`UPDATE`语句可以没有`WHERE`条件==

==这时，整个表的所有记录都会被更新。所以，在执行`UPDATE`语句时要非常小心，最好先用`SELECT`语句来测试`WHERE`条件是否筛选出了期望的记录集，然后再用`UPDATE`更新。==

### 2.3 删除

`DELETE`语句的基本语法是：
[code] 
    DELETE FROM <表名> WHERE ...;
[/code]
[code] 
    select @@autocommit;-- 禁止自动提交SET AUTOCOMMIT=0;-- 开启自动提交SET AUTOCOMMIT=1;
[/code]

==最后，要特别小心的是，和`UPDATE`类似，不带`WHERE`条件的`DELETE`语句会删除整个表的数据：==

## 三、MySQL

MySQL Client是一个命令行客户端，可以通过MySQL Client登录MySQL，然后，输入SQL语句并执行。

打开命令提示符，输入命令`mysql -u root -p`，提示输入口令。填入MySQL的root口令，如果正确，就连上了MySQL Server，同时提示符变为`mysql>`：

![4f4780cb58b7f01b9f43c4fe27cb98e](https://gitee.com/wislist/img/raw/master/4f4780cb58b7f01b9f43c4fe27cb98e.png)

输入`exit`断开与MySQL Server的连接并返回到命令提示符。

==MySQL Client的可执行程序是mysql，MySQL Server的可执行程序是mysqld==

MySQL Client和MySQL Server的关系如下：

![8b636b2b9c339a0400e36535533d0a9](https://gitee.com/wislist/img/raw/master/8b636b2b9c339a0400e36535533d0a9.png)

在MySQL Client中输入的SQL语句通过TCP连接发送到MySQL Server。默认端口号是3306，即如果发送到本机MySQL Server，地址就是`127.0.0.1:3306`。

也可以只安装MySQL Client，然后连接到远程MySQL Server。假设远程MySQL Server的IP地址是`10.0.1.99`，那么就使用`-h`指定IP或域名：
[code] 
    mysql -h 10.0.1.99 -u root -p
[/code]

### 3.1 管理数据库

#### 数据库

在一个运行MySQL的服务器上，实际上可以创建多个数据库（Database）。要列出所有数据库，使用命令：
[code] 
    mysql> SHOW DATABASES;+--------------------+| Database           |+--------------------+| information_schema || mysql              || performance_schema || shici              || sys                || test               || school             |+--------------------+
[/code]

其中，`information_schema`、`mysql`、`performance_schema`和`sys`是系统库，不要去改动它们。其他的是用户创建的数据库。

要创建一个新数据库，使用命令：
[code] 
    mysql> CREATE DATABASE test;Query OK, 1 row affected (0.01 sec)
[/code]

要删除一个数据库，使用命令：
[code] 
    mysql> DROP DATABASE test;Query OK, 0 rows affected (0.01 sec)
[/code]

注意：删除一个数据库将导致该数据库的所有表全部被删除。

对一个数据库进行操作时，要首先将其切换为当前数据库：
[code] 
    mysql> USE test;Database changed
[/code]

#### 表

列出当前数据库的所有表，使用命令：
[code] 
    mysql> SHOW TABLES;+---------------------+| Tables_in_test      |+---------------------+| classes             || statistics          || students            || students_of_class1  |+---------------------+
[/code]

要查看一个表的结构，使用命令：
[code] 
    mysql> DESC students;+----------+--------------+------+-----+---------+----------------+| Field    | Type         | Null | Key | Default | Extra          |+----------+--------------+------+-----+---------+----------------+| id       | bigint(20)   | NO   | PRI | NULL    | auto_increment || class_id | bigint(20)   | NO   |     | NULL    |                || name     | varchar(100) | NO   |     | NULL    |                || gender   | varchar(1)   | NO   |     | NULL    |                || score    | int(11)      | NO   |     | NULL    |                |+----------+--------------+------+-----+---------+----------------+
[/code]

查看创建表的SQL语句：
[code] 
    mysql> SHOW CREATE TABLE students;+----------+-------------------------------------------------------+| students | CREATE TABLE `students` (                             ||          |   `id` bigint(20) NOT NULL AUTO_INCREMENT,            ||          |   `class_id` bigint(20) NOT NULL,                     ||          |   `name` varchar(100) NOT NULL,                       ||          |   `gender` varchar(1) NOT NULL,                       ||          |   `score` int(11) NOT NULL,                           ||          |   PRIMARY KEY (`id`)                                  ||          | ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 |+----------+-------------------------------------------------------+
[/code]

创建表使用`CREATE TABLE`语句，而删除表使用`DROP TABLE`语句：
[code] 
    mysql> DROP TABLE students;
[/code]

修改表就比较复杂。如果要给`students`表新增一列`birth`，使用：
[code] 
    ALTER TABLE students ADD COLUMN birth VARCHAR(10) NOT NULL;
[/code]

要修改`birth`列，例如把列名改为`birthday`，类型改为`VARCHAR(20)`：
[code] 
    ALTER TABLE students CHANGE COLUMN birth birthday VARCHAR(20) NOT NULL;
[/code]

要删除列，使用：
[code] 
    ALTER TABLE students DROP COLUMN birthday;
[/code]

### 3.2 实用SQL语句

#### 插入或替换

插入一条新记录（INSERT），但如果记录已经存在，就先删除原记录，再插入新记录。

此时，可以使用`REPLACE`语句，这样就不必先查询，再决定是否先删除再插入：
[code] 
    REPLACE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
[/code]

#### 插入或更新

如果我们希望插入一条新记录（INSERT），但如果记录已经存在，就更新该记录，此时，可以使用`INSERT INTO ... ON DUPLICATE KEY UPDATE ...`语句：
[code] 
    INSERT INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99) ON DUPLICATE KEY UPDATE name='小明', gender='F', score=99;
[/code]

#### 插入或忽略

如果我们希望插入一条新记录（INSERT），但如果记录已经存在，就啥事也不干直接忽略，此时，可以使用`INSERT IGNORE INTO ...`语句：
[code] 
    INSERT IGNORE INTO students (id, class_id, name, gender, score) VALUES (1, 1, '小明', 'F', 99);
[/code]

#### 快照

如果想要对一个表进行快照，即复制一份当前表的数据到一个新表，可以结合`CREATE TABLE`和`SELECT`：
[code] 
    -- 对class_id=1的记录进行快照，并存储为新表students_of_class1:CREATE TABLE students_of_class1 SELECT * FROM students WHERE class_id=1;
[/code]

#### 写入查询结果集

如果查询结果集需要写入到表中，可以结合`INSERT`和`SELECT`，将`SELECT`语句的结果集直接插入到指定表中。

例如，创建一个统计成绩的表`statistics`，记录各班的平均成绩：
[code] 
    CREATE TABLE statistics (    id BIGINT NOT NULL AUTO_INCREMENT,    class_id BIGINT NOT NULL,    average DOUBLE NOT NULL,    PRIMARY KEY (id));
[/code]

然后，我们就可以用一条语句写入各班的平均成绩：
[code] 
    INSERT INTO statistics (class_id, average) SELECT class_id, AVG(score) FROM students GROUP BY class_id;
[/code]

确保`INSERT`语句的列和`SELECT`语句的列能一一对应，就可以在`statistics`表中直接保存查询的结果：
[code] 
    > SELECT * FROM statistics;+----+----------+--------------+| id | class_id | average      |+----+----------+--------------+|  1 |        1 |         86.5 ||  2 |        2 | 73.666666666 ||  3 |        3 | 88.333333333 |+----+----------+--------------+3 rows in set (0.00 sec)
[/code]

#### 强制使用指定索引

在查询的时候，数据库系统会自动分析查询语句，并选择一个最合适的索引。但是很多时候，数据库系统的查询优化器并不一定总是能使用最优索引。如果我们知道如何选择索引，可以使用`FORCE INDEX`强制查询使用指定的索引。例如：
[code] 
    SELECT * FROM students FORCE INDEX (idx_class_id) WHERE class_id = 1 ORDER BY id DESC;
[/code]

指定索引的前提是索引`idx_class_id`必须存在。

## 四、事务

数据库事务具有ACID这4个特性：

  * A：Atomic，原子性，将所有SQL作为原子工作单元执行，要么全部执行，要么全部不执行；

  * C：Consistent，一致性，事务完成后，所有数据的状态都是一致的，即A账户只要减去了100，B账户则必定加上了100；

  * I：Isolation，隔离性，如果有多个事务并发执行，每个事务作出的修改必须与其他事务隔离；

  * D：Duration，持久性，即事务完成后，对数据库数据的修改被持久化存储。


对于单条SQL语句，数据库系统自动将其作为一个事务执行，这种事务被称为==_隐式事务_ ==。

要手动把多条SQL语句作为一个事务执行，使用`BEGIN`开启一个事务，使用`COMMIT`提交一个事务，这种事务被称为 _显式事务_ ，例如，把上述的转账操作作为一个==显式事务==：
[code] 
    BEGIN;UPDATE accounts SET balance = balance - 100 WHERE id = 1;UPDATE accounts SET balance = balance + 100 WHERE id = 2;COMMIT;
[/code]

作用：银行转账 如果钱不够直接回滚

数据库事务是由数据库系统保证的，我们只需要根据业务逻辑使用它就可以。

#### 隔离级别

对于两个并发执行的事务，如果涉及到操作同一条记录的时候，可能会发生问题。因为并发操作会带来数据的不一致性，包括脏读、不可重复读、幻读等。数据库系统提供了隔离级别来让我们有针对性地选择事务的隔离级别，避免数据不一致的问题。

SQL标准定义了4种隔离级别，分别对应可能出现的数据不一致的情况：

![436e50a507e24d98785ffee8f13e9cd](https://gitee.com/wislist/img/raw/master/436e50a507e24d98785ffee8f13e9cd.png)

### 4.1 Read Uncommitted

Read Uncommitted是隔离级别最低的一种事务级别。在这种隔离级别下，一个事务会读到另一个事务更新后但未提交的数据，如果另一个事务回滚，那么当前事务读到的数据就是脏数据，这就是脏读（Dirty Read）。

首先，我们准备好`students`表的数据，该表仅一行记录：
[code] 
    mysql> select * from students;+----+-------+| id | name  |+----+-------+|  1 | Alice |+----+-------+1 row in set (0.00 sec)
[/code]

然后，分别开启两个MySQL客户端连接，按顺序依次执行事务A和事务B：

![635d02730ad3b7bce615cded7aaf430](https://gitee.com/wislist/img/raw/master/635d02730ad3b7bce615cded7aaf430.png)

当事务A执行完第3步时，它更新了`id=1`的记录，但并未提交，而事务B在第4步读取到的数据就是未提交的数据。

随后，事务A在第5步进行了回滚，事务B再次读取`id=1`的记录，发现和上一次读取到的数据不一致，这就是脏读。

可见，在Read Uncommitted隔离级别下，一个事务可能读取到另一个事务更新但未提交的数据，这个数据有可能是脏数据。

### 4.2 Read Committed

在Read Committed隔离级别下，一个事务可能会遇到不可重复读（Non Repeatable Read）的问题。

不可重复读是指，在一个事务内，多次读同一数据，在这个事务还没有结束时，如果另一个事务恰好修改了这个数据，那么，在第一个事务中，两次读取的数据就可能不一致。

我们仍然先准备好`students`表的数据：
[code] 
    mysql> select * from students;+----+-------+| id | name  |+----+-------+|  1 | Alice |+----+-------+1 row in set (0.00 sec)
[/code]

然后，分别开启两个MySQL客户端连接，按顺序依次执行事务A和事务B：

![59550b71991867247616f6372b6efed](https://gitee.com/wislist/img/raw/master/59550b71991867247616f6372b6efed.png)

当事务B第一次执行第3步的查询时，得到的结果是`Alice`，随后，由于事务A在第4步更新了这条记录并提交，所以，事务B在第6步再次执行同样的查询时，得到的结果就变成了`Bob`，因此，在Read Committed隔离级别下，事务不可重复读同一条记录，因为很可能读到的结果不一致。

### 4.3 Repeatable Read

在Repeatable Read隔离级别下，一个事务可能会遇到幻读（Phantom Read）的问题。

幻读是指，在一个事务中，第一次查询某条记录，发现没有，但是，当试图更新这条不存在的记录时，竟然能成功，并且，再次读取同一条记录，它就神奇地出现了。

==幻读就是没有读到的记录，以为不存在，但其实是可以更新成功的，并且，更新成功后，再次读取，就出现了。==

### 4.4 Serializable

Serializable是最严格的隔离级别。在Serializable隔离级别下，所有事务按照次序依次执行，因此，脏读、不可重复读、幻读都不会出现。

虽然Serializable隔离级别下的事务具有最高的安全性，但是，由于事务是串行执行，所以效率会大大下降，应用程序的性能会急剧降低。如果没有特别重要的情景，一般都不会使用Serializable隔离级别。

### 默认隔离级别(Repeatable Read)

如果没有指定隔离级别，数据库就会使用默认的隔离级别。在MySQL中，如果使用InnoDB，默认的隔离级别是Repeatable Read。

## 五、作业与习题

来源：[Homework #1 - SQL | CMU 15-445/645 :: Intro to Database Systems (Fall 2023)](<https://15445.courses.cs.cmu.edu/fall2023/homework1/>)

### Q2、找出运行时间最长的 10 部“科幻”作品
[code]
    SELECT primary_title,premiered,runtime_minutesfrom titleswhere genres = 'Fantasy'order by runtime_minutes desclimit 10;
[/code]

**注意** ： ==order by== 默认是 ASC

### Q3、确定数据集中出生于 1900 年或之后的最年长的人。 您应该假设一个没有已知死亡年份的人还活着。
[code]
    select name,2023-people.born as agefrom peoplewhere born>=1900 and died is not nullorder by age desclimit 20;
[/code]

**注意** ：died 为null的人也要考虑  
但是如果认为没死的人一定大那就是错的了 要考虑到有人可能1990年生 died也为null 有人1950年生死的早 

如果统计的是最大岁数的人这么想是可以的

### Q4、计算每十年内容评级的间歇统计数据。

**详：** 获取平均评分（四舍五入到小数点后两位）、最高评分、 最小评级，以及每个十年的发布数量。排除标题 尚未首映（即首映的地方）。打印相关 通过构造如下所示的字符串，以更高级的格式进行十年：.按其平均评分降序排列十年 时尚，其次是十年，上升，打破联系。
[code] 
    SELECT  CAST(premiered/10*10 AS TEXT) || 's' AS decade,  ROUND(AVG(rating), 2) as avg_rating,  MAX(rating) as top_rating,  MIN(rating) as min_rating,  COUNT(*) as num_releasesFROM     titlesINNER JOIN     ratings ON titles.title_id = ratings.title_idWHERE premiered IS NOT NULLGROUP BY decadeORDER BY avg_rating DESC, decade ASC;
[/code]

### Q5、查找最常作为机组人员出现的人员。

**详：** 打印20人的姓名和出场次数 按出场次数排序的船员出场次数最多 以下降的方式。
[code] 
    select p.name , count(*) as num_appearancesfrom people pjoin crew c on p.person_id = c.person_idgroup by p.person_idorder by count(*) desc, p.namelimit 20;
[/code]

### Q6、确定与带有“Cruise”的人一起最受欢迎的作品 姓名，出生于1962年。

**详：** 获得剧组中有人得票最多的作品 他们的名字中有“克鲁斯”，出生于 1962 年。返回 工作和票数，并仅列出前 10 个结果，顺序从 从多到少的选票。请确保输出的格式如下：`Top Gun|408389`、
[code] 
    SELECT    titles.primary_title AS name,    ratings.votes AS votesFROM      titlesINNER JOIN      ratings ON titles.title_id = ratings.title_idINNER JOIN	crew ON titles.title_id = crew.title_idINNER JOIN      people ON crew.person_id = people.person_idWHERE people.name LIKE "%Cruise%" AND people.born = 1962ORDER BY votes DESCLIMIT 10;
[/code]

**注意** ：`LIKE` 后加模糊搜索

**复习** ：

**1，%** ：表示任意0个或多个字符。可匹配任意类型和长度的字符，有些情况下若是中文，请使用两个百分号（%%）表示。

**2，_** ： 表示任意单个字符。匹配单个任意字符，它常用来限制表达式的字符长度语句。

**3，[ ]** ：表示括号内所列字符中的一个（类似正则表达式）。指定一个字符、字符串或范围，要求所匹配对象为它们中的任一个。

**4，[^ ] ** ：表示不在括号所列之内的单个字符。其取值和 [] 相同，但它要求所匹配对象为指定字符以外的任一个字符。

ps :在书写markdown文本中 遇到冲突可以使用==“\”==(反斜杠)来处理

### Q7、列出同年首播的作品数量，《军队的军队》 盗贼》首映。

**详：** 仅打印作品总数。答案应该包括 “盗贼军团”本身。对于这个问题，通过以下方式确定不同的作品 他们的名字，而不是他们的名字。`title_id`
[code] 
    with premiered as (    select premiered    from titles    where primary_title = 'Army of Thieves')select count(*) as TITLE_IDfrom titles twhere premiered = premieredorder by TITLE_ID desc ;
[/code]

如果遇到大型和复杂的问题 我们可以考虑将其分为多个子问题 并用**`WITH AS`**语句来解决

### Q8、