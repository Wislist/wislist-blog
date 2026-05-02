---
title: "关于在更新jkd17时遗留下来的问题"
date: 2024-09-15 00:00:00
tags: []
categories: []
---

### 关于在更新jkd17时遗留下来的问题

##### 如何替代被遗弃的BASE64Encoder/BASE64Decoder

JDK中的/lib/tool.jar和/lib/rt.jar已经从Java SE 9中删除  
并且这玩意是不开源的
[code] 
    import sun.misc.BASE64Encoder;import sun.misc.BASE64Decoder;
[/code]

在项目中，设计到64位编码的。有时开发会用到JDK中自带的BASE64工具。但sun公司是建议不这样做的。尤其是更新了JDK版本，项目甚至还存在保存的信息。可引用 import org.apache.commons.codec.binary.Base64;进行替换。

原来
[code] 
    import sun.misc.BASE64Encoder;return new  BASE64Encoder().encode(encrypted);
[/code]
[code] 
    import org.apache.commons.codec.binary.Base64;return Base64.encodeBase64String(encrypted);
[/code]
[code] 
    import sun.misc.BASE64Decoder;byte[] encrypted1 = new BASE64Decoder().decodeBuffer(text);	
[/code]
[code] 
    import org.apache.commons.codec.binary.Base64;byte[] encrypted1 =Base64.decodeBase64(text);
[/code]