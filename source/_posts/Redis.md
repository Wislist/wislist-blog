---
title: "Redis语法以及一些基本应用"
date: 2024-07-17 00:00:00

categories:
  - 数据库
tags:
  - Redis
  - 数据结构
  - 缓存
---

# Redis语法以及一些基本应用

### Resids数据结构

![image-20240704155014302](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240704155014302.png)

**常用命令** ：

  * KEYS:查看符合模板的所有key
  * DEL: 删除一个key
  * EXISTS:判断key是否存在
  * EXPIRE:给一个key设置有效时长
  * TTL：这个key剩余时长


String类型

![image-20240704161249447](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240704161249447.png)

常见的有：

  * SET
  * GET
  * MSET:批量添加
  * MGET：更加多个key获取多个String类型的value
  * INCR：让一个整型的key自增1
  * INCRBY:让一个整型的key自增并指定步长，incrby num 2 就是让num增加2
  * INCRBYFLOAT：让一个浮点类型的数字自增并指定步长
  * SETNX：添加一个String类型的键值对，前提是这个key不存在
  * SETEX：添加一个String类型的键值对，并且制定有效期


Redis没有Table的概念，如何区分不同类型的key?

允许有多个单词形成层级结构，多个单词之间用“：”隔开

`项目名：业务名：类型：id`

![image-20240704171047397](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240704171047397.png)

HASH类型

hashmap结构 value是一个无序字典

String结构是将对象序列化为JSON字符串后存储，当我们需要修改的时候很不方便，所以我们用hash类型来解决

Redis hash 是一个string类型的field和value的映射表，hash特别适合用于存储对象。

```java
HMSET w3ckey name "redis tutorial" description "redis basic commands for caching" likes 20 visitors 23000
HGETALL w3ckey
```

![image-20240709215238372](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240709215238372.png)

  * HSET key field value 将哈希表 key 中的字段 field 的值设为 value 
  * HGET key field : 获取存储在哈希表中指定字段的值
  * HGETALL key : 获取在哈希表中指定 key 的所有字段和值
  * HDEL key field: 删除
  * HMSET key field1 value1 field2 value2 : 添加/修改多个数据
  * HMGET key field1 field2 ：获取多个数据
  * HLEN key : 获取哈希表中的字段的数量
  * HEXISTS key field ： 获取哈希表中是否存在指定的字段
  * HKEYS keyhcals key : 获取哈希表中所有的**字段名或字段值**
  * HINCRBY key field increment : 增加vlaue的值 前提要是Intetger
  * HINCRBYFLOAT key field increment : 同 要求是float类型


例子：

```
HSET myhash field 5
HINCRBY myhash field 1
HINCRBY myhash field -1
HINCRBY myhash field -10
```

list类型

双向链表

  * LPUSH key element: 
  * LPOP key ：移除并返回列表左侧的第一个元素，没有则返回null
  * RPUSH key element : 向列表右侧插入元素
  * RPOP key
  * LRANGE key star end: 返回一段角标范围内的所有元素
  * BLPOP 和BRPOP：与LPOP和RPOP类似，没有元素时等待指定时间，而不是直接返回null


set类型

与HASHset类似 可以看做一个value为null的hashmap 只关注key

  * 无序
  * 无重复元素
  * 查找快
  * 支持交集、并集、差集等功能


string常用命令有：

  * SADD key member 添加元素
  * SREM key member 移除
  * SCARD key 返回set元素个数
  * SISMEMBER key member 判断一个元素是否存在set中
  * SMEMBERS 获取set中的所有元素
  * SINTER key1 key2 : 求key1和可以2的交集
  * SDIFF key1 key2 ：差集
  * SUNION ： 并集 会去重


SortedSet类型

可排序的set集合，与java中的TreeSet类似。SortedSet的每一个元素都带有一个score属性，可以基于score属性对元素排序，底层实现是一个跳表(SkipList)加hash表

  * 可排序
  * 元素不重复
  * 查询快


常见命令有：

  * ZADD key score member ： 添加一个或者多个元素到sorted set 如果已经存在则更新其score值
  * ZREM key member : 删除
  * ZSCORE key member : 获取sorted set 中指定元素的score值
  * ZRANK key member: 获取指定元素的排名（方便用来做什么什么贡献榜）
  * ZCARD key 获取sorted set中的元素个数  
![image-20240717094251184](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240717094251184.png)


(注： 所有排名默认都是升序，如果要降序则在命令Z后添加REV就行)

### Redis的java客户端

![image-20240717095839962](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240717095839962.png)

jedis连接池

jedis本身是线程不安全的，频繁的创建和销毁链接会有性能损失，用连接池来解决

**SpringDataRedis**

![image-20240717104407099](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240717104407099.png)

序列化问题

![image-20240717161922063](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240717161922063.png)

json序列化的问题

用spring自带的json解析器（jackson）

```java
package com.wislist.iteam.util;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;
@Configuration
public
class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory){
        //创建RedisTemplate对象
        RedisTemplate<String, Object> template =
        new RedisTemplate<>();
        //设置连接工厂
        template.setConnectionFactory(connectionFactory);
        //创建JSON序列化工具
        GenericJackson2JsonRedisSerializer jsonRedisSerializer =
        new GenericJackson2JsonRedisSerializer();
        //设置key的序列化
        template.setKeySerializer(RedisSerializer.string());
        template.setHashKeySerializer(RedisSerializer.string());
        //设置value的序列化
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashValueSerializer(jsonRedisSerializer);
        //返回
        return template;
    }
}
```

同时也会存在一些问题

![image-20240717170252370](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240717170252370.png)

我们可以统一使用String序列化器，只存储String类型的key和value。当需要存储java对象时，手动完成对象的序列化和反序列化

Spring提供了一个StringRedisTemplate类，默认key和value就是String方式。

两种序列化实际：

一、自定义RedisTemplate

```java
package com.wislist.demoredis.untils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializer;
@Configuration
public
class RedisConfig {
    @Bean
    public RedisTemplate<String , Object> redisTemplate(RedisConnectionFactory connectionFactory){
        //创建RedisTemplate对象
        RedisTemplate<String, Object> template =
        new RedisTemplate<>();
        //设置连接工厂
        template.setConnectionFactory(connectionFactory);
        //创建序列化工厂
        GenericJackson2JsonRedisSerializer jsonRedisSerializer =
        new GenericJackson2JsonRedisSerializer();
        //设置key的序列化
        template.setKeySerializer(RedisSerializer.string());
        template.setHashValueSerializer(RedisSerializer.string());
        //value的序列化
        template.setValueSerializer(jsonRedisSerializer);
        template.setHashKeySerializer(jsonRedisSerializer);
        //返回
        return template;
    }
}
```

```java
package com.wislist.demoredis.text;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
@SpringBootTest
public
class JedisTest {
    @Autowired
    private RedisTemplate redisTemplate;
    @Test
    void testString() {
        redisTemplate.opsForValue().set("name","wislist");
        Object name = redisTemplate.opsForValue().get("name");
        System.out.println("name=" + name);
    }
}
```

二、使用StringRedisTemplate；写入redis时手动进行序列化

```java
package com.wislist.demoredis.text;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wislist.demoredis.pojo.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.SecurityProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
@SpringBootTest
public
class JedisStringTest {
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Test
    void testString() {
        stringRedisTemplate.opsForValue().set("name","胡歌");
        Object name = stringRedisTemplate.opsForValue().get("name");
        System.out.println("name=" + name);
    }
    private static final ObjectMapper mapper = new ObjectMapper();
    @Test
    void textSaveUser() throws JsonProcessingException {
        User user = new User("胡歌",21);
        //手动序列化
        String json = mapper.writeValueAsString(user);
        //写入数据
        stringRedisTemplate.opsForValue().set("user:200",json);
        //获取数据
        String jsonUser = stringRedisTemplate.opsForValue().get("user:200");
        //手动反序列化
        User user1 =
        mapper.readValue(jsonUser,User.class);
        System.out.println(user1);
    }
}
```

**实战部分**

一、redis解决集群的session共享问题

![image-20240818223502673](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240818223502673.png)

tomcat提供过数据拷贝的功能 但是会占用很大的内存空间

![image-20240818223642893](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240818223642893.png)

二、redis缓存

数据交换的缓冲区(Cache)，存储数据的临时地方，一般读写性能较高。

![image-20240821214348601](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240821214348601.png)

问题：当我们将数据库里的数据更新后，缓存中的数据未更新，就会造成数据未及时更新的问题

**缓存更新策略：**

![image-20240822152219022](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240822152219022.png)

**主动更新策略**

  * 由缓存的调用者在更新数据库的时候来更新缓存（可控性高）

![image-20240822154209914](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240822154209914.png)

    * 先删除缓存，再操作数据库
    * 先删除数据库，再操作缓存
  * 缓存和数据库整合成一个服务来维护服务的统一性，调用者只用调用不用关心缓存一致性的问题

  * 调用者只操作缓存，由其他线程异步的将缓存数据持久化到数据库来保证统一性（当缓存出现宕机无法将数据写入缓存，就会造成数据丢失）


**缓存穿透问题**

缓存穿透是指**缓存和数据库中都没有的数据** ，而用户不断发起请求。由于缓存是不命中时被动写的，并且出于容错考虑，如果从存储层查不到数据则不写入缓存，这将导致这个不存在的数据每次请求都要到存储层去查询，失去了缓存的意义。

在流量大时，可能DB就挂掉了，要是有人利用不存在的key频繁攻击我们的应用，这就是漏洞。

如发起为id为“-1”的数据或id为特别大不存在的数据。这时的用户很可能是攻击者，攻击会导致数据库压力过大。

**解决方法：**

  * 缓存空对象
    * 优点：实现简单，维护方便
    * 缺点：
      * 额外的内存消耗
      * 可能造成短期的不一致
  * 布隆过滤
    * 优点：内存占用较少，没有多余key
    * 缺点：
      * 实现复杂
      * 存在误判可能


**缓存空对象思路分析：** 当我们客户端访问不存在的数据时，先请求redis，但是此时redis中没有数据，此时会访问到数据库，但是数据库中也没有数据，这个数据穿透了缓存，直击数据库，我们都知道数据库能够承载的并发不如redis这么高，如果大量的请求同时过来访问这种不存在的数据，这些请求就都会访问到数据库，简单的解决方案就是哪怕这个数据在数据库中也不存在，我们也把这个数据存入到redis中去，这样，下次用户过来访问这个不存在的数据，那么在redis中也能找到这个数据就不会进入到缓存了

![image-20240822161857888](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240822161857888.png)

**布隆过滤：** 布隆过滤器其实采用的是哈希思想来解决这个问题，通过一个庞大的二进制数组，走哈希思想去判断当前这个要查询的这个数据是否存在，如果布隆过滤器判断存在，则放行，这个请求会去访问redis，哪怕此时redis中的数据过期了，但是数据库中一定存在这个数据，在数据库中查询出来这个数据后，再将其放入到redis中，

假设布隆过滤器判断这个数据不存在，则直接返回

这种方式优点在于节约内存空间，存在误判，误判原因在于：布隆过滤器走的是哈希思想，只要哈希思想，就可能存在哈希冲突

![image-20240822162137290](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240822162137290.png)

缓存穿透产生的原因是什么？

  * 用户请求的数据在缓存中和数据库中都不存在，不断发起这样的请求，给数据库带来巨大压力


缓存穿透的解决方案有哪些？

  * 缓存null值
  * 布隆过滤
  * 增强id的复杂度，避免被猜测id规律
  * 做好数据的基础格式校验
  * 加强用户权限校验
  * 做好热点参数的限流


代码部分：

```java
Shop shop = cacheClient
                .queryWithPassThrough(CACHE_SHOP_KEY, id, Shop.class, this::getById, CACHE_SHOP_TTL, TimeUnit.MINUTES);
```

**缓存雪崩**

缓存雪崩是指在同一时段大量的缓存key同时失效或者Redis服务宕机，导致大量请求到达数据库，带来巨大压力。

解决方案：

  * 给不同的Key的TTL添加随机值
  * 利用Redis集群提高服务的可用性
  * 给缓存业务添加降级限流策略
  * 给业务添加多级缓存


![image-20240822163633203](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240822163633203.png)

**缓存击穿**

缓存击穿问题也叫热点Key问题，就是一个被高并发访问并且缓存重建业务较复杂的key突然失效了，无数的请求访问会在瞬间给数据库带来巨大的冲击。

![image-20240823110039881](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240823110039881.png)

常见的解决方案有两种：

  * 互斥锁

![image-20240823151926110](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240823151926110.png)


处理思路: 进行查询之后，如果从缓存没有查询到暑假，则进行互斥锁的获取，获取互斥锁后，判断是否获得了锁，如果没有获得，就休眠，过一会再次尝试，直到获取锁为止，才能查询。  
如果获得了锁的线程，再去查询，查询后将数据写入redis，再释放锁，返回数据，利用互斥锁就能保证只有一个线程去执行操作数据库的逻辑，防止缓存击穿。

![image-20240825154153738](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240825154153738.png)

**操作锁的代码**

利用redis的setnx方法来表示获取锁，该方法的含义是redis如果没有这个key则插入成功，返回1，在stringRedisTemplate中返回true，如果这个key插入失败 返回0，在stringRedisTemplate返回false，我们可以通过返回的结果来判断是否有线程成功插入key，插入成功的线程就是获得锁的线程。

```java
private boolean tryLock(String key) {
    Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
    return BooleanUtil.isTrue(flag);
}
private void unlock(String key) {
    stringRedisTemplate.delete(key);
}
```

**操作代码：**

```java
public Shop queryWithMutex(Long id)  {
    String key = CACHE_SHOP_KEY + id;
    // 1、从redis中查询商铺缓存
    String shopJson = stringRedisTemplate.opsForValue().get("key");
    // 2、判断是否存在
    if (StrUtil.isNotBlank(shopJson)) {
        // 存在,直接返回
        return JSONUtil.toBean(shopJson, Shop.class);
    }
    //判断命中的值是否是空值
    if (shopJson != null) {
        //返回一个错误信息
        return null;
    }
    // 4.实现缓存重构
       //4.1 获取互斥锁
    String lockKey = "lock:shop:" + id;
    Shop shop = null;
    try {
        boolean isLock = tryLock(lockKey);
        // 4.2 判断否获取成功
        if(!isLock){
            //4.3 失败，则休眠重试
            Thread.sleep(50);
            return queryWithMutex(id);
        }
        //4.4 成功，根据id查询数据库
            shop = getById(id);
           // 5.不存在，返回错误
        if(shop == null){
            //将空值写入redis
            stringRedisTemplate.opsForValue().set(key,"",CACHE_NULL_TTL,TimeUnit.MINUTES);
            //返回错误信息
            return null;
        }
        //6.写入redis
        stringRedisTemplate.opsForValue().set(key,JSONUtil.toJsonStr(shop),CACHE_NULL_TTL,TimeUnit.MINUTES);
    }
    catch (Exception e){
        throw new RuntimeException(e);
    }
    finally {
        //7.释放互斥锁
           unlock(lockKey);
    }
    return shop;
}
```

问题就是：当一个线程在做缓存的时候 其他线程在等待 若是这一个线程在同步的过程中等待的时间过久 就会使得项目运行缓慢 类似线程饥饿

  * 逻辑过期


​ 我们之所以会出现这个缓存击穿问题，主要原因是在于我们对key设置了过期时间，假设我们不设置过期时间，其实就不会有缓存击穿的问题，但是不设置过期时间，这样数据不就一直占用我们内存了吗，我们可以采用逻辑过期方案。

​ 我们将过期的时间设置在redis的value中，这个过期时间并不直接作用于redis，而是我们后续通过逻辑去处理。

![image-20240825102402405](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240825102402405.png)

其过程：线程1去查询缓存，然后从value中判断出来当前的数据已经过期了，这时线程1去获得互斥锁，那么其他线程就是堵塞，获得锁的线程它会开启一个线程去进行`以前的重构数据的逻辑，直到新开的线程完成这个逻辑后，才释放锁`，而线程1直接进行返回，假设现在线程3过来范文，由于线程2持有锁，线程3无法获得锁，线程3直接返回数据，只有等到新开的线程2把数据构建完后，其他的线程才能周返回正确的数据。

现在有一个需求：**修改根据id查询商铺的业务，基于逻辑过期方式来解决缓存击穿问题**

当用户开始查询redis时，判断是否命中，如果没有命中则直接返回空数据，不查询数据库，而一旦命中后，将value取出，判断vlaue中的过期时间是否满足，如果没有过期，则直接返回redis中的数据，如果过期，则在开启独立线程后直接返回之前的数据，独立线程去重构数据，重构完成后释放互斥锁。

![image-20240825180051867](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240825180051867.png)

如果封装数据：因为现在redis中存储的数据的vlaue需要带上过期时间，此时要么你去修改原来的实体类，要么就采用以下方案：

一、新建一个实体类，这个方案对原来的代码没有侵入性。

```java
@Data
public
class RedisData {
    private LocalDateTime expireTime;
    private Object data;
}
```

二、在**ShopServiceImpl** 新增此方法，利用单元测试进行缓存预热

![image-20240825205826073](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240825205826073.png)

**测试类中**

![image-20240825205920339](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240825205920339.png)

**步骤三** ：

```java
private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);
public Shop queryWithLogicalExpire( Long id ) {
    String key = CACHE_SHOP_KEY + id;
    // 1.从redis查询商铺缓存
    String json = stringRedisTemplate.opsForValue().get(key);
    // 2.判断是否存在
    if (StrUtil.isBlank(json)) {
        // 3.存在，直接返回
        return null;
    }
    // 4.命中，需要先把json反序列化为对象
    RedisData redisData =
    JSONUtil.toBean(json, RedisData.class);
    Shop shop = JSONUtil.toBean((JSONObject) redisData.getData(), Shop.class);
    LocalDateTime expireTime = redisData.getExpireTime();
    // 5.判断是否过期
    if(expireTime.isAfter(LocalDateTime.now())) {
        // 5.1.未过期，直接返回店铺信息
        return shop;
    }
    // 5.2.已过期，需要缓存重建
    // 6.缓存重建
    // 6.1.获取互斥锁
    String lockKey = LOCK_SHOP_KEY + id;
    boolean isLock = tryLock(lockKey);
    // 6.2.判断是否获取锁成功
    if (isLock){
        CACHE_REBUILD_EXECUTOR.submit(() -> {
            try {
                //重建缓存
                this.saveShop2Redis(id,20L);
            } catch (Exception e) {
                throw new RuntimeException(e);
            } finally {
                unlock(lockKey);
            }
        });
    }
    // 6.4.返回过期的商铺信息
    return shop;
}
```

​ 这种方案好在异步的构建缓存，缺点就是在构建完缓存之前，返回的都是脏数据。

两种方案对比：

![image-20240825152504761](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240825152504761.png)

综上，可以将方法放置在一个方法类里

基于StringRedisTemplate封装一个缓存工具类，满足下列需求：

  * 方法1：将任意Java对象序列化为json并存储在string类型的key中，并且可以设置TTL过期时间
  * 方法2：将任意Java对象序列化为json并存储在string类型的key中，并且可以设置逻辑过期时间，用于处理缓


存击穿问题

  * 方法3：根据指定的key查询缓存，并反序列化为指定类型，利用缓存空值的方式解决缓存穿透问题
  * 方法4：根据指定的key查询缓存，并反序列化为指定类型，需要利用逻辑过期解决缓存击穿问题


将逻辑进行封装

```java
@Slf4j
@Component
public
class CacheClient {
    private final StringRedisTemplate stringRedisTemplate;
    private static final ExecutorService CACHE_REBUILD_EXECUTOR = Executors.newFixedThreadPool(10);
    public CacheClient(StringRedisTemplate stringRedisTemplate) {
        this.stringRedisTemplate = stringRedisTemplate;
    }
    public void set(String key, Object value, Long time, TimeUnit unit) {
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(value), time, unit);
    }
    public void setWithLogicalExpire(String key, Object value, Long time, TimeUnit unit) {
        // 设置逻辑过期
        RedisData redisData =
        new RedisData();
        redisData.setData(value);
        redisData.setExpireTime(LocalDateTime.now().plusSeconds(unit.toSeconds(time)));
        // 写入Redis
        stringRedisTemplate.opsForValue().set(key, JSONUtil.toJsonStr(redisData));
    }
    public <R,ID> R queryWithPassThrough(
            String keyPrefix, ID id, Class<R> type, Function<ID, R> dbFallback, Long time, TimeUnit unit){
        String key = keyPrefix + id;
        // 1.从redis查询商铺缓存
        String json = stringRedisTemplate.opsForValue().get(key);
        // 2.判断是否存在
        if (StrUtil.isNotBlank(json)) {
            // 3.存在，直接返回
            return JSONUtil.toBean(json, type);
        }
        // 判断命中的是否是空值
        if (json != null) {
            // 返回一个错误信息
            return null;
        }
        // 4.不存在，根据id查询数据库
        R r =
        dbFallback.apply(id);
        // 5.不存在，返回错误
        if (r == null) {
            // 将空值写入redis
            stringRedisTemplate.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
            // 返回错误信息
            return null;
        }
        // 6.存在，写入redis
        this.set(key, r, time, unit);
        return r;
    }
    public <R, ID> R queryWithLogicalExpire(
            String keyPrefix, ID id, Class<R> type, Function<ID, R> dbFallback, Long time, TimeUnit unit) {
        String key = keyPrefix + id;
        // 1.从redis查询商铺缓存
        String json = stringRedisTemplate.opsForValue().get(key);
        // 2.判断是否存在
        if (StrUtil.isBlank(json)) {
            // 3.存在，直接返回
            return null;
        }
        // 4.命中，需要先把json反序列化为对象
        RedisData redisData =
        JSONUtil.toBean(json, RedisData.class);
        R r = JSONUtil.toBean((JSONObject) redisData.getData(), type);
        LocalDateTime expireTime = redisData.getExpireTime();
        // 5.判断是否过期
        if(expireTime.isAfter(LocalDateTime.now())) {
            // 5.1.未过期，直接返回店铺信息
            return r;
        }
        // 5.2.已过期，需要缓存重建
        // 6.缓存重建
        // 6.1.获取互斥锁
        String lockKey = LOCK_SHOP_KEY + id;
        boolean isLock = tryLock(lockKey);
        // 6.2.判断是否获取锁成功
        if (isLock){
            // 6.3.成功，开启独立线程，实现缓存重建
            CACHE_REBUILD_EXECUTOR.submit(() -> {
                try {
                    // 查询数据库
                    R newR = dbFallback.apply(id);
                    // 重建缓存
                    this.setWithLogicalExpire(key, newR, time, unit);
                } catch (Exception e) {
                    throw new RuntimeException(e);
                } finally {
                    // 释放锁
                    unlock(lockKey);
                }
            });
        }
        // 6.4.返回过期的商铺信息
        return r;
    }
    public <R, ID> R queryWithMutex(
            String keyPrefix, ID id, Class<R> type, Function<ID, R> dbFallback, Long time, TimeUnit unit) {
        String key = keyPrefix + id;
        // 1.从redis查询商铺缓存
        String shopJson = stringRedisTemplate.opsForValue().get(key);
        // 2.判断是否存在
        if (StrUtil.isNotBlank(shopJson)) {
            // 3.存在，直接返回
            return JSONUtil.toBean(shopJson, type);
        }
        // 判断命中的是否是空值
        if (shopJson != null) {
            // 返回一个错误信息
            return null;
        }
        // 4.实现缓存重建
        // 4.1.获取互斥锁
        String lockKey = LOCK_SHOP_KEY + id;
        R r = null;
        try {
            boolean isLock = tryLock(lockKey);
            // 4.2.判断是否获取成功
            if (!isLock) {
                // 4.3.获取锁失败，休眠并重试
                Thread.sleep(50);
                return queryWithMutex(keyPrefix, id, type, dbFallback, time, unit);
            }
            // 4.4.获取锁成功，根据id查询数据库
            r =
            dbFallback.apply(id);
            // 5.不存在，返回错误
            if (r == null) {
                // 将空值写入redis
                stringRedisTemplate.opsForValue().set(key, "", CACHE_NULL_TTL, TimeUnit.MINUTES);
                // 返回错误信息
                return null;
            }
            // 6.存在，写入redis
            this.set(key, r, time, unit);
        }
        catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        finally {
            // 7.释放锁
            unlock(lockKey);
        }
        // 8.返回
        return r;
    }
    private boolean tryLock(String key) {
        Boolean flag = stringRedisTemplate.opsForValue().setIfAbsent(key, "1", 10, TimeUnit.SECONDS);
        return BooleanUtil.isTrue(flag);
    }
    private void unlock(String key) {
        stringRedisTemplate.delete(key);
    }
}
```

在ShopServiceImpl 中

```java
@Resource
private
CacheClient cacheClient;
@Override
public Result queryById(Long id) {
    // 解决缓存穿透
        Shop shop =
    cacheClient
                .queryWithPassThrough(CACHE_SHOP_KEY, id, Shop.class, this::getById, CACHE_SHOP_TTL, TimeUnit.MINUTES);
    // 互斥锁解决缓存击穿
    // Shop shop = cacheClient
    //         .queryWithMutex(CACHE_SHOP_KEY, id, Shop.class, this::getById, CACHE_SHOP_TTL, TimeUnit.MINUTES);
    // 逻辑过期解决缓存击穿
    // Shop shop = cacheClient
    //         .queryWithLogicalExpire(CACHE_SHOP_KEY, id, Shop.class, this::getById, 20L, TimeUnit.SECONDS);
    if (shop == null) {
        return Result.fail("店铺不存在！");
    }
    // 7.返回
    return Result.ok(shop);
}
```