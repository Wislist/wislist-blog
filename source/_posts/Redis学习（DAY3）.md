---
title: "Redis基本本应用(集群)"
date: 2024-08-29 00:00:00
tags: []
categories: []
---

### Redis学习（DAY3）

#### 持久化

我们知道Redis是保存在内存中的，因为内存的特性，在机器断电之后，数据会消失，所以我们需要持久化，将数据备份到磁盘上。

两种方案：1、保存当前**已经存储的数据** ；2、保存我们存放数据的**所有过程**

**RDB**

就是第一种方式
[code] 
    save-- 注意上面这个命令是直接保存，会占用一定的时间，也可以单独开一个子进程后台执行保存bgsave-- 后台执行
[/code]

执行之后会生成一个`dump.rdb`文件，当重启服务器后，会自动加载内容到对应的数据库中

![image-20240831154021335](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831154021335.png)

方便 如果数据库数据量较大，会花费大量的时间，我们可以每隔一段时间进行保存
[code] 
    save 300 10 # 300秒（5分钟）内有10个写入save 60 10000 # 60秒（1分钟）内有10000个写入
[/code]

**AOF**

以日志的方式将我们每次执行的命令都进行保存，服务器重启时按照命令依次执行。

我们可以自己来配置保存策略：

  * always：每次执行写操作都会保存一次
  * everysec：每秒保存一次（默认配置），这样就算丢失数据也只会丢一秒以内的数据
  * no：看系统心情保存


[code] 
    # 注意得改成也是appendonly yes# appendfsync alwaysappendfsync everysec# appendfsync no
[/code]

服务器目录会多一个`appendonly.aof`文件

其缺点就是写的越多，重启耗费的时间越多

Redis提供了优化策略：
[code] 
    lpush test 666lpush test 777lpush test 888
[/code]

我们只有能保证最终结果和重演的一样就行了，无论你当时写的一些无效语句不必记录，就可以大大压缩空间和时间

也可以手动执行操作
[code] 
    bgrewriteaof
[/code]

或者在配置里设置自动重写
[code] 
    # 百分比计算，这里不多介绍auto-aof-rewrite-percentage 100# 当达到这个大小时，触发自动重写auto-aof-rewrite-min-size 64mb
[/code]

#### Redis多级缓存

使用Redis作为框架的缓存，其应用领域非常宽泛

##### **Mybatis二级缓存**

Mybatis的默认二级缓存只能是单机的，如果存在多台服务器访问同一个数据库，实际上二级缓存只会在各自的服务器上生效，但是我们都希望的是多台服务器都能同时使用同一个二级缓存，这样就不会造成资源浪费

![image-20240831155806123](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831155806123.png)

##### **Token的持久化存储**

我们可以将Token存储到redis中

### 哨兵机制(Sentinel)

哨兵就是帮助监控整个节点的，当节点宕机，帮助重新选择主服务器

如何启动哨兵？

![image-20240831164039260](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831164039260.png)

`Running in sentinel mode` 以哨兵模式启动

依次启动主从节点

从节点配置需要修改指向主节点
[code] 
    slaveof 127.0.0.1 6001
[/code]

最后启动哨兵

![image-20240831171044391](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831171044391.png)

发现全部连进来了

当主节点挂了

从节点会访问呼叫一段时间的主节点，若长时间未响应sentinel就会直接切换从节点为主节点

![image-20240831171248707](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831171248707.png)

### 集群搭建

单机内存不够了，就可以进行集群操作。我们可以让N台redis服务器来存储数据，每个服务器可以存储(1/N)数据

同时每个服务器可以配一个从节点来保证数据的安全性

![image-20240831171614858](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831171614858.png)

集群机制：一个redis集群包含16384个插槽，集群中每个Redis实例负责维护一部分插槽以及插槽所映射的键值数据。

插槽就是键的Hash计算后一个结果，采用计网中的CRC循环冗余校验CRC16

Redis key的路由公式为：slot = CRC16(KEY) % 16384 (也就是2的16次方) 

搭建简单的redis集群：

设置3对主从 个人推荐还是用docker试一下 配置太累了

如果让某一个主节点挂掉会发生什么?

会让从节点取代主节点

那两个都挂了呢？

当我们插入数据时候就会报错