---
title: "LinuxShell语言基础(让自动化运维不再是梦)"
date: 2024-09-13 00:00:00

categories:
  - 运维工具
tags:
  - Linux
  - Shell
  - 运维
---

### LinuxShell语言基础(让自动化运维不再是梦)

当下最流行的运维自动化语音就是Shell和Pyhon了

**为啥要学shell？**

Shell为我们提供了运维工作中快速部署、服务启动停止、数据备份及处理、日志分析等环节，而用py就更牛逼了，可以开发更加复杂，精细度更高的运维工作，甚至能用web实时监控等。

**Shell是什么？**

Shell其实是一个命令解释器，解释执行用户所输入的命令和程序，且是实时的。

简单来说“shell编程就是对一堆Linux命令的逻辑化处理”

用Shell语言编程的Helloworld(需要对shell命令以及vim有一些了解):

![image-20240831204607150](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831204607150.png)

shell 中 # 符号表示注释。**shell 的第一行比较特殊，一般都会以#!开始来指定使用的 shell 类型。在 linux 中，除了 bash shell 以外，还有很多版本的 shell， 例如 zsh、dash 等等…不过 bash shell 还是我们使用最多的。**

可以用`echo $SHELL`命令来查看自己用的shell版本 具体切换可百度

#### Shell变量

1、自己定义的变量：只在当前shell实例中有效  
2、Linux自定义的环境变量：像是`PATH`,`HOME` 使用`env`可以查看所有的环境变量，`set`既可以查看环境变量也可以查看自定义变量  
3、Shell变量：有shell程序设置的特殊变量

常用的环境变量：

PATH 决定了 shell 将到哪些目录中寻找命令或程序  
HOME 当前用户主目录  
HISTSIZE 历史记录数  
LOGNAME 当前用户的登录名  
HOSTNAME 指主机的名称  
SHELL 当前用户 Shell 类型  
LANGUAGE 语言相关的环境变量，多语言可以修改此环境变量  
MAIL 当前用户的邮件存放目录  
PS1 基本提示符，对于 root 用户是#，对于普通用户是$

使用Linux已经定义的环境变量：例如echo $HOME 查看当前用户目录

使用自己定义的变量：

```shell
#!/bin/bash#自定义变量hellohello="hello world"echo $helloecho  "helloworld!"
```

![image-20240901003533437](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240901003533437.png)

#### Shell字符串入门

字符串是 shell 编程中最常用最有用的数据类型（数字也是 这里不多说了）字符串可以用单引号，也可以用双引号

常用操作

```shell
#!/bin/bashname="SnailClimb"# 使用双引号拼接greeting="hello, "$name" !"greeting_1="hello, ${name} !"echo $greeting  $greeting_1# 使用单引号拼接greeting_2='hello, '$name' !'greeting_3='hello, ${name} !'echo $greeting_2  $greeting_3
```

流程控制不想写 用的不多

简单实战一下：快速部署docker的redis集群 需要3对主从节点 并且需要 将端口设置为6001 6002 6003 7001 7002 7003 并生成一个6010端口的哨兵

```shell
#!/bin/bashdocker rm -f `docker ps --filter name=.*redis-700.* -aq`echo "1.请输入您要部署的目录位置"gml=""while : do   read path   if [[ "$path" =~ ^([\/]{1}[a-zA-Z]{1,9}){1,5}$ ]];then     gml=$path     break   else     echo "$path不符合linux路径标准"     echo "输入一个合法的根目录如《/path/path1...》"   fi donerm -rf $path/redismkdir $pathcd $gmlecho "2.正在创建redis目录"mkdir rediscd redisdocker pull redis:5.0.4echo "3.正在创建redis集群模板"touch redis-cluster.tmplecho -e "port \${PORT}\nprotected-mode no\ncluster-enabled yes\ncluster-config-file nodes.conf\ncluster-node-timeout 5000\ncluster-announce-ip 192.168.2.103\ncluster-announce-port \${PORT}\ncluster-announce-bus-port 1\${PORT}\nappendonly yes">>redis-cluster.tmpldocker network create redis-netecho "4.完成模板创建"echo "5.正在创建redis配置"for port in `seq 7000 7005` do   mkdir -p ./${port}/conf && PORT=${port} envsubst < ./redis-cluster.tmpl > ./${port}/conf/redis.conf   && mkdir -p ./${port}/data doneecho "6.redis配置创建完成"ips=""for port in `seq 7000 7005` do  docker run --privileged=true -m 200m -d  -p ${port}:${port} -p 1${port}:1${port}   -v /${gml}/redis/${port}/conf/redis.conf:/usr/local/etc/redis/redis.conf   -v /${gml}/redis/${port}/data:/data   --restart always --name redis-${port} --net redis-net   --sysctl net.core.somaxconn=1024 redis:5.0.4 redis-server /usr/local/etc/redis/redis.conf echo "7.正在创建redis-$port 容器" ips="$ips`docker inspect redis-${port} --format '{{ (index .NetworkSettings.Networks "redis-net").IPAddress }}'`:${port}  " doneecho "所有容器中创建完成"docker exec -it redis-7000 bash -c "echo yes | redis-cli --cluster create $ips --cluster-replicas 1  && exit"echo "集群启动成功！！！"
```