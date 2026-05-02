---
title: "docker问题"
date: 2024-10-07 00:00:00
tags: []
categories: []
---

docker问题

我自认为dockerdesktop在windows电脑上运行这是一件很酷的事 会节省很多操作但是 是我小看了docker了 报错为（随机的 毫无规律的）：`docker: Error response from daemon: Ports are not available: exposing port TCP 0.0.0.0:6379 -> 0.0.0.0:0: listen tcp 0.0.0.0:6379: bind: An attempt was made to access a socket in a way forbidden by its access permissions.`

我在stack overflow找到了解决的办法 [docker - 端口不可用：监听 tcp 0.0.0.0/50070：bind：尝试以访问权限禁止的方式访问套接字 - Stack Overflow](<https://stackoverflow.com/questions/65272764/ports-are-not-available-listen-tcp-0-0-0-0-50070-bind-an-attempt-was-made-to>)

以及大佬解释的原因 [Solve the problem of docker on Windows 10 failed to port binding | Medium](<https://medium.com/@sevenall/completely-solve-the-problem-of-docker-containers-not-starting-or-running-on-windows-10-due-to-port-57f16ed6143>)