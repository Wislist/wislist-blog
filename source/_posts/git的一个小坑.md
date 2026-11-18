---
title: "git的一个小坑"
date: 2024-01-19 00:00:00

categories:
  - 运维工具
tags:
  - Git
  - 排错
---

# git的一个小坑

最近从学校回来了 想在github拉取一些项目做 但是一直报`ssh: connect to host github.com port 22: Connection timed out`这个错误 具体原因是各个运营商对端口22进行屏蔽了 电信好像好很多 在网上收到了一些做法 

运行这段命令，看看是否有成功提示，如果成功，则可以使用这个解决方案

```
ssh -T -p 443 git@ssh.github.com
```

简单地配置一下，让你每次ssh连接github都通过443端口。如果你使用Linux，在`~/.ssh/config`内，添加这些内容，指明ssh连接`git@github.com`或`git@ssh.github.com`走443端口。

然后在git bash 中输入 `vim ~/.ssh/config`

进入编辑模式 

然后将下面的代码复制进去

```
Host github.com
    Hostname ssh.github.com
    Port 443
    User git
```

然后用vim命令，输入`：`进入编辑模式 输入`wq` 保存修改即可完成