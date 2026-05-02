---
title: "MySQL忘记密码怎么去修改"
date: 2023-12-07 00:00:00
tags: []
categories: []
---

#### 第一步：关闭Mysql服务

首先先停止mysql服务。可通过`net stop mysql`或者任务管理器中关闭。

#### 第二步：跳过Mysql密码验证

进入命令提示符（管理员登陆）操作，进入mysql目录中bin文件夹下，mysql8.0与其他版本不同的地方在于无法直接使用mysqld –skip-grant-tables来跳过密码登录。在这我们使用`mysqld -console --skip-grant-tables --shared-memory`来跳过权限验证。  
![image-20231207155119283](https://gitee.com/wislist/img/raw/master/image-20231207155119283.png)

#### 第三步：无密码方式进入Mysql

在上述步骤之后，再打开一个管理员模式运行的cmd.exe

进入mysql下的bin目录后，直接登录mysql

不需要通过`net start mysql`打开mysql服务

在命令行中输入以下代码
[code] 
    d:cd D:\mysql-8.0.19-winx64\bin(此处输入自己电脑上的安装目录)mysql -u root -p
[/code]

此时会显示让你输入密码，直接回车，就可以成功连接Mysql。

#### 第四步：将登陆密码设置为空

输入代码，将密码设置为空（**此时还不能直接修改密码，必须先设置为空，否则会报错** ）  
输入：
[code] 
    use mysql; (使用mysql数据表)update user set authentication_string='' where user='root';（将密码置为空）quit; (然后退出Mysql)
[/code]

#### 第五步：更改自己的登陆密码

这里分为两个部分

##### 1.关闭第一个cmd窗口(一定要关闭！)；

##### 2.在第二个窗口中输入代码；
[code]
    net stop mysql(关闭mysql服务,虽然会显示没有开启服务，但是以防万一)net start mysql(再打开mysql服务)
[/code]

接着输入：
[code] 
    cd D:\mysql-8.0.19-winx64\bin  (此处输入自己电脑上的安装目录)mysql -u root -p(此处会显示输入密码，直接回车就好了，第四步我们已经将他置为空了)ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';（更改密码）
[/code]

#### 最后一步：验证密码是否修改成功

输入：
[code] 
    quit（退出mysql）mysql -u root -p (输入新密码，再次登录)
[/code]