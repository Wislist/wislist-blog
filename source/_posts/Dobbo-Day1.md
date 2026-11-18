---
title: "Dobbo(Day1)"
date: 2024-09-07 00:00:00

categories:
  - 中间件
tags:
  - Dubbo
  - RPC
  - 分布式
---

## Dobbo(Day1)

### 分布式服务架构

RPC 远程过程调用 

![image-20240908105157300](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240908105157300.png)

缺点：需要一个调度中心来实时分配服务器 提高资源的利用率

流动计算架构 ：动态调度中心：zookeeper nacos等等

![image-20240908105322326](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240908105322326.png)

### RPC

远程过程调用，一种进程间的通信方式，是一种技术思想

#### 基本原理

![image-20240908105714287](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240908105714287.png)

RPC两大核心：通信 序列化

框架有 ： Dubbo、gRPC、Thrift、HSE（阿里巴巴）

### dobbo核心

高性能、轻量级的开源java rpc框架，三大核心功能：面向接口的远程方法调用，智能容错和均衡负载、服务自动注册和发现

### ![image-20240908113401767](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240908113401767.png)

这里的Registry可以用zookeeper

#### Zookeeper注册中心

使用docker拉取镜像

```shell
# 检索ZooKeeper 镜像
docker search zookeeper
# 拉取ZooKeeper镜像最新版本
docker pull zookeeper:latest
# 我使用的版本
docker pull zookeeper:3.5.7
```

  * 启动容器


```shell
docker run -d --name zookeeper --privileged=true -p 2181:2181  -v /mydata/zookeeper/data:/data -v /mydata/zookeeper/conf:/conf -v /mydata/zookeeper/logs:/datalog zookeeper:3.5.7
```

参数说明

-e TZ=”Asia/Shanghai” # 指定上海时区  
-d # 表示在一直在后台运行容器  
-p 2181:2181 # 对端口进行映射，将本地2181端口映射到容器内部的2181端口  
–name # 设置创建的容器名称  
-v # 将本地目录(文件)挂载到容器指定目录；  
–restart always #始终重新启动zookeeper，看需求设置不设置自启动

  * 检验测试


```shell
docker exec -it zookeeper zkCli.sh
```

进入zkCli客户端来查看是否启动

#### dobbo-admin安装

```shell
docker run -d \
    --name dubbo-admin \
    --net zookeeper \
    -v background:/data \
    -p 7001:8080 \
    -e DUBBO_REGISTRY="zookeeper:\/\/ip:port" \
    -e DUBBO_ROOT_PASSWORD=root \
    -e DUBBO_GUEST_PASSWORD=guest \
    --restart=always \
    apache/dubbo-admin
```

缺点：配置网络桥接（容器与容器间的通信）

#### 快速上手微服务框架

参照dubbo官网（教程非常详细值得一看）