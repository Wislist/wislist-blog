---
title: "Dubbo(Day2)"
date: 2024-09-09 00:00:00

categories:
  - 中间件
tags:
  - Dubbo
  - RPC
  - 通信协议
---

### Dubbo(Day2)

#### 消费端是如何找到服务端的?

Dubbo 会在 Zookeeper 的 `/dubbo/interfaceName` 和 `/services/appName` 下写入服务提供者的连接信息。

zookeeper显示的数据：

```xml
[zk: localhost:2181(CONNECTED) 2] ls /services/first-dubbo-provider[30.221.146.35:20880][zk: localhost:2181(CONNECTED) 3] get /services/first-dubbo-provider/30.221.146.35:20880{
    "name":"first-dubbo-provider","id":"30.221.146.35:20880","address":"30.221.146.35","port":20880,"sslPort":null,"payload":{
        "@class":"org.apache.dubbo.registry.zookeeper.ZookeeperInstance","id":"30.221.146.35:20880","name":"first-dubbo-provider","metadata":{
        "dubbo.endpoints":"[{\"port\":20880,\"protocol\":\"dubbo\"}]","dubbo.metadata-service.url-params":"{\"connections\":\"1\",\"version\":\"1.0.0\",\"dubbo\":\"2.0.2\",\"release\":\"3.1.4\",\"side\":\"provider\",\"ipv6\":\"fd00:1:5:5200:3218:774a:4f67:2341\",\"port\":\"20880\",\"protocol\":\"dubbo\"}","dubbo.metadata.revision":"871fbc9cb2730caea9b0d858852d5ede","dubbo.metadata.storage-type":"local","ipv6":"fd00:1:5:5200:3218:774a:4f67:2341","timestamp":"1674960780647"
        }}
,"registrationTimeUTC":1674960781893,"serviceType":"DYNAMIC","uriSpec":null
}
```

#### 消费端是如何发起请求的？

在Dubbo调用模型中，起到连接服务消费者和服务提供者的桥梁是接口

服务提供者对指定接口进行实现，消费者通过Dubbo去订阅这个接口。消费者调用接口的过程中Dubbo会将请求封装成网络请求，然后发送给提供者进行实际调用。

例如，我们定义一个`GreetingsService`的 接口，这个接口有一个名为sayHi的方法

```xml
package org.apache.dubbo.samples.api;
public interface GreetingsService {
    String sayHi(String name);
}
```

消费者通过Dubbo的API可以获取`GreetingsService`接口的代理，然后就可以按照普通的接口调用方式进行调用。**得益于Dubbo的动态代理机制，这就像本地代理一样**

```java
// 获取订阅到的 StubGreetingsService service =
reference.get();
// 像普通的 java 接口一样调用String message =
service.sayHi("dubbo");
```

#### Dubbo Spring Boot Starter开发微服务

![image-20240909234029059](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240909234029059.png)

![image-20240909234102999](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240909234102999.png)

父工程的pom

```xml
<?xml version="1.0" encoding="UTF-8"?>
    <project xmlns="http://maven.apache.org/POM/4.0.0"         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
        <modelVersion>
            4.0.0
        </modelVersion>
        <groupId>
            com.wislsit
        </groupId>
        <artifactId>
            dubbo-spring-boot-demo
        </artifactId>
        <version>
            1.0-SNAPSHOT
        </version>
        <packaging>
            pom
        </packaging>
        <modules>
            <module>
                dubbo-spring-boot-demo-interface
            </module>
            <module>
                dubbo-spring-boot-demo-provider
            </module>
            <module>
                dubbo-spring-boot-demo-consumer
            </module>
        </modules>
        <properties>
            <spring-boot.version>
                2.7.8
            </spring-boot.version>
            <dubbo.version>
                3.2.0-beta.4
            </dubbo.version>
            <maven.compiler.source>
                17
            </maven.compiler.source>
            <maven.compiler.target>
                17
            </maven.compiler.target>
            <project.build.sourceEncoding>
                UTF-8
            </project.build.sourceEncoding>
        </properties>
        <dependencies>
            <!--        springboot-->
            <dependency>
                <groupId>
                    org.springframework.boot
                </groupId>
                <artifactId>
                    spring-boot-dependencies
                </artifactId>
                <version>
                    ${spring-boot.version}
                </version>
                <type>
                    pom
                </type>
                <scope>
                    import
                </scope>
            </dependency>
            <!--        Dubbo-->
            <dependency>
                <groupId>
                    org.apache.dubbo
                </groupId>
                <artifactId>
                    dubbo-spring-boot-starter
                </artifactId>
                <version>
                    ${dubbo.version}
                </version>
                <type>
                    pom
                </type>
                <scope>
                    import
                </scope>
            </dependency>
            <!--        -->
            <dependency>
                <groupId>
                    org.apache.dubbo
                </groupId>
                <artifactId>
                    dubbo-dependencies-zookeeper-curator5
                </artifactId>
                <version>
                    ${dubbo.version}
                </version>
            </dependency>
        </dependencies>
        <build>
            <pluginManagement>
                <plugins>
                    <plugin>
                        <groupId>
                            org.springframework.boot
                        </groupId>
                        <artifactId>
                            spring-boot-maven-plugin
                        </artifactId>
                        <version>
                            ${spring-boot.version}
                        </version>
                    </plugin>
                </plugins>
            </pluginManagement>
        </build>
    </project>
```

子工程consumer和provider的pom

```xml
<dependencies>
    <dependency>
        <groupId>
            com.wislsit
        </groupId>
        <artifactId>
            dubbo-spring-boot-demo-interface
        </artifactId>
        <version>
            1.0-SNAPSHOT
        </version>
    </dependency>
    <dependency>
        <groupId>
            org.apache.dubbo
        </groupId>
        <artifactId>
            dubbo-spring-boot-starter
        </artifactId>
    </dependency>
    <dependency>
        <groupId>
            org.apache.dubbo
        </groupId>
        <artifactId>
            dubbo-dependencies-zookeeper-curator5
        </artifactId>
        <type>
            pom
        </type>
        <exclusions>
            <exclusion>
                <artifactId>
                    slf4j-reload4j
                </artifactId>
                <groupId>
                    org.slf4j
                </groupId>
            </exclusion>
        </exclusions>
    </dependency>
    <!--        springboot starter-->
    <dependency>
        <groupId>
            org.springframework.boot
        </groupId>
        <artifactId>
            spring-boot-starter
        </artifactId>
    </dependency>
```

#### 为啥我们需要Dubbo，它能带来啥？

按照微服务架构的定义，采用它的组织能够很好的提高业务迭代效率与系统稳定性，但前提是要先能保证微服务按照期望的方式运行，要做到这一点需要解决服务拆分与定义、数据通信、地址发现、流量管理、数据一致性、系统容错能力等一系列问题。

  * 微服务编程范式和工具
  * 高性能的RPC通信
  * 微服务监控与治理
  * 部署在多个环境中


#### Dubbo核心概念和架构

![image-20240910215729270](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240910215729270.png)

  * **服务治理控制面** ：不只是特指注册中心类的单一具体组件，而是Dubbo治理体系的抽象表达。注册中心、流量监控策略、Dubbo Admin控制台等。

  * **Dubbo数据面** ：代表集群部署的所有Dubbo进程，进程之间通过RPC协议实现数据交换，Dubbo定义了微服务应用开发与调用规范并负责完成数据传输的编解码工作。

#### Dubbo数据面

  * dubbo作为数据面约束微服务的定义、开发与调用规范，定义了服务治理流程及适配模式

  * RPC通信协议实现解决服务间数据传输的编解码问题


#### 微服务开发框架

微服务的目标是构建足够小的、自包含的、独立演进的、可以随时部署运行的分布式应用程序

微服务的分布式特性，使得应用间的依赖、网络交互、数据传输变得更频繁，因此不同的**应用需要定义、暴露或调用 RPC 服务，那么这些 RPC 服务如何定义、如何与应用开发框架结合、服务调用行为如何控制？这就是 Dubbo 服务开发框架的含义，Dubbo 在微服务应用开发框架之上抽象了一套 RPC 服务定义、暴露、调用与治理的编程范式** 。

Dubbo Java 作为服务开发框架，当运行在 Spring 体系时就是构建在 Spring Boot 应用开发框架之上的微服务开发框架，并在此之上抽象了一套 RPC 服务定义、暴露、调用与治理的编程范式。

![image-20240911002515957](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240911002515957.png)

Dobbo作为开发框架具体内容如下：

  * RPC服务定义开发规范
  * RPC服务发布与调用
  * 服务治理策略、流程与适配方式


### 通信协议

支持多种主流的通信协议

![image-20240911002814172](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240911002814172.png)

### 高级特性

#### 多版本

灰度发布：当出现新功能后 ，会让一部分用户使用新功能，用户反馈没问题之后，再将所有用户迁移到新功能

dubbo用关键字version属性来设置和调用同一个接口的不同版本

![image-20240911175025150](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240911175025150.png)

#### 负载均衡

策略：

  * Random 随机访问策略（默认值 可以修改权重比调整概率）


![image-20240911192409810](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240911192409810.png)

  * RoundRobin权重轮询
  * LeastActive 最少活跃调用数，相同活跃数的随机
  * ConsistentHash 一致性Hash，相同参数的请求总是发到同一提供者


#### 集群容错

容错模式：

  * Failover Cluster：失败重试。（默认值）当出现失败，重试其他服务器，默认重试2次，使用retries配置。一般用于读操作
  * Failfast Cluster:快速失败，出现异常时直接忽略。return一个null
  * Failsafe Cluster： 失败安全，出现异常直接忽略
  * Failback Cluster： 失败自动恢复，后天记录失败请求，定时重发
  * Broadcast Cluster： 广播调用所有提供者，逐个调用，任意一台报错则报错


#### 服务降级

![image-20240911203939258](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240911203939258.png)

支付服务是最高的，当服务器接近极限，我们优先保障最高级的服务能够正常运行

  * mock=force:return null 表示消费方对该服务的方法调用直接返回null值，不发起远程调用。用来屏蔽不重要服务不可用时对调用发的影响
  * mock=fail:return null 表示消费方对该服务的方法调用在失败后，再返回null值，不泡异常。用来容忍不重要服务不稳定时对调用方的影响。