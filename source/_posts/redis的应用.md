---
title: "Redis基本本应用(全局唯一，互斥锁，分布式锁)"
date: 2024-08-27 00:00:00

categories:
  - 数据库
tags:
  - Redis
  - 分布式锁
  - 秒杀
---

# Redis基本应用（全局唯一，互斥锁，分布式锁）

### 优惠券秒杀业务

### 全局唯一ID

每个店铺都可以发布优惠券，当用户抢购时，就会生成订单并保存到tb_voucher_order这个表里，而只使用数据库自增ID就存在一些问题：

  * id规律性太明显
  * 受单表数据量的限制


假设：随着业务不断扩大，mysql单表容量不得超过500w，数据量过大之后，我们要进行拆库拆表，但是拆表之后，他们从逻辑上来说是同一张表，所以他们的id是不能一样的（mysql的ID是自增的）我们要保证id的唯一性

**全局ID生成器** （是否能用雪花算法呢？）

需要我们满足：唯一性，高可用，高性能，递增性，安全性

![image-20240829081304522](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240829081304522.png)

```java
package com.hmdp.utils;
import org.springframework.data.redis.core.StringRedisTemplate;
import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
public class RedisID {
    /**     * 开始时间戳     */
    private static final long BEGIN_TIMESTAMP = 1724919688L;
    /**     * 序列号的位数     * @param args     */
    private static final int COUNT_BITS = 32;
    @Resource
    private StringRedisTemplate stringRedisTemplate;
    public long nextID(String keyPrefix){
        //1、生成时间戳        LocalDateTime now =
        LocalDateTime.now();
        long nowSecond  = now.toEpochSecond(ZoneOffset.UTC);
        long timestamp = nowSecond - BEGIN_TIMESTAMP;
        //2、生成序列号        //2.1获取当前日期，精确到天
        String date = now.format(DateTimeFormatter.ofPattern("yyyy:MM:dd"));
        //2.2自增长
        long count = stringRedisTemplate.opsForValue().increment("icr:"+keyPrefix+":"+date);
        //3、拼接并返回(位运算)
        return timestamp << COUNT_BITS | count;
    }
    public static void main(String[] args) {
        LocalDateTime now = LocalDateTime.now();
        long second  = now.toEpochSecond(ZoneOffset.UTC);
        System.out.println(second);
    }
}
```

测试类：

```java
@Testvoid
testIdWorker() throws InterruptedException {
    CountDownLatch latch = new CountDownLatch(300);
    Runnable task = () -> {
        for (int i = 0; i < 100; i++) {
            long id = redisIdWorker.nextId("order");
            System.out.println("id = " + id);
        }
        latch.countDown();}
    ;
    long begin = System.currentTimeMillis();
    for (int i = 0; i < 300; i++) {
        es.submit(task);
    }
    latch.await();
    long end = System.currentTimeMillis();
    System.out.println("time = " + (end - begin));
}
```

解释：

countdownlatch名为信号枪：主要的作用是同步协调在多线程的等待于唤醒问题

我们如果没有CountDownLatch ，那么由于程序是异步的，当异步程序没有执行完时，主线程就已经执行完了，然后我们期望的是分线程全部走完之后，主线程再走，所以我们此时需要使用到CountDownLatch

CountDownLatch 中有两个最重要的方法

1、countDown

2、await

await 方法 是阻塞方法，我们担心分线程没有执行完时，main线程就先执行，所以使用await可以让main线程阻塞，那么什么时候main线程不再阻塞呢？当CountDownLatch 内部维护的 变量变为0时，就不再阻塞，直接放行，那么什么时候CountDownLatch 维护的变量变为0 呢，我们只需要调用一次countDown ，内部变量就减少1，我们让分线程和变量绑定， 执行完一个分线程就减少一个变量，当分线程全部走完，CountDownLatch 维护的变量就是0，此时await就不再阻塞，统计出来的时间也就是所有分线程执行完后的时间。

#### 添加优惠券

每个店铺都可以发布优惠券，分为平价券和特价券。平价券可以任意购买，而特价券需要秒杀抢购：

tb_voucher：优惠券的基本信息，优惠金额、使用规则等  
tb_seckill_voucher：优惠券的库存、开始抢购时间，结束抢购时间。特价优惠券才需要填写这些信息

代金券由于优惠力度大，所以像第二种卷，就得限制数量，从表结构上也能看出，特价卷除了具有优惠卷的基本信息以外，还具有库存，抢购时间，结束时间等等字段

**新增普通卷代码： **VoucherController

```java
@PostMappingpublic
Result addVoucher(@RequestBody Voucher voucher) {
    voucherService.save(voucher);
    return Result.ok(voucher.getId());
}
```

**新增秒杀卷代码：**

**VoucherController**

```java
@PostMapping("seckill")
public Result addSeckillVoucher(@RequestBody Voucher voucher) {
    voucherService.addSeckillVoucher(voucher);
    return Result.ok(voucher.getId());
}
```

**VoucherServiceImpl**

```java
@Override
@Transactionalpublic
void addSeckillVoucher(Voucher voucher) {
    // 保存优惠券    save(voucher);    // 保存秒杀信息    SeckillVoucher seckillVoucher =
    new SeckillVoucher();
    seckillVoucher.setVoucherId(voucher.getId());
    seckillVoucher.setStock(voucher.getStock());
    seckillVoucher.setBeginTime(voucher.getBeginTime());
    seckillVoucher.setEndTime(voucher.getEndTime());
    seckillVoucherService.save(seckillVoucher);
    // 保存秒杀库存到Redis中
    stringRedisTemplate.opsForValue().set(SECKILL_STOCK_KEY + voucher.getId(), voucher.getStock().toString());
}
```

**库存超卖问题**

我们在原来的代码是这样写的：

```java
if (voucher.getStock() < 1) {
    // 库存不足
    return Result.fail("库存不足！");
}
//5，扣减库存
boolean success = seckillVoucherService.update()           .setSql("stock= stock -1")           .eq("voucher_id", voucherId).update();
if (!success) {
    //扣减库存
    return Result.fail("库存不足！");
}
```

在高并发情况下，我们无法保证让扣减的动作发生在线程2查询库存之后，这是由于cpu同时服务多个线程所决定的。所以我们要用代码来进行逻辑操作。

**悲观锁：**

总是假设最坏的情况，每次去拿数据的时候都认为别人会修改，所以每次在拿数据的时候都会上锁，这样别人想拿这个数据就会阻塞直到它拿到锁（共享资源每次只给一个线程使用，其它线程阻塞，用完后再把资源转让给其它线程）。传统的关系型数据库里边就用到了很多这种锁机制，比如行锁，表锁等，读锁，写锁等，都是在做操作之前先上锁。Java中synchronized和ReentrantLock等独占锁就是悲观锁思想的实现。

```java
public void performSynchronisedTask() {
    synchronized (this) {
        // 需要同步的操作
    }
}
private Lock lock = new ReentrantLock();
lock.lock();
try {
    // 需要同步的操作}
    finally {
        lock.unlock();
    }
```

高并发的场景下，激烈的锁竞争会造成线程阻塞，大量阻塞线程会导致系统的上下文切换，增加系统的性能开销。并且，悲观锁还可能会存在死锁问题（线程获得锁的顺序不当时），影响代码的正常运行

**乐观锁：**

乐观锁一般会使用版本号机制或 CAS 算法实现，CAS 算法相对来说更多一些，这里需要格外注意。

![image-20240830151121158](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830151121158.png)

  * CAS法


CAS 的全称是 **Compare And Swap（比较与交换）** ，用于实现乐观锁，被广泛应用于各大框架中。CAS 的思想很简单，就是用一个预期值和要更新的变量值进行比较，两值相等才会进行更新。

CAS 是一个原子操作，底层依赖于一条 CPU 的原子指令。

> **原子操作** 即最小不可拆分的操作，也就是说操作一旦开始，就不能被打断，直到操作完成。

CAS 涉及到三个操作数：

  * **V** ：要更新的变量值(Var)
  * **E** ：预期值(Expected)
  * **N** ：拟写入的新值(New)


当且仅当 V 的值等于 E 时，CAS 通过原子方式用新值 N 来更新 V 的值。如果不等，说明已经有其它线程更新了 V，则当前线程放弃更新。

**假设：**

线程1要修改变量i的值为6，i的原值为1（V=1,E=1,N=6,假设不存在ABA问题）

i与1进行比较，if相等，则说明没被其他线程修改，可以被设置为6；else则说明被其他线程修改，放弃更新，CAS失败

当多个线程同时使用CAS操作同一个变量时，只有一个会胜出，并成功更新，其余都会失败，但失败的线程并不会被挂起，仅是被告知失败，并且允许继续尝试，当然也允许失败的线程放弃操作。

```java
private void createVoucherOrder(VoucherOrder voucherOrder) {
    Long userId = voucherOrder.getUserId();
    Long voucherId = voucherOrder.getVoucherId();
    // 创建锁对象       RLock redisLock =
    redissonClient.getLock("lock:order:" + userId);
    // 尝试获取锁
    boolean isLock = redisLock.tryLock();
    // 判断
    if (!isLock) {
        // 获取锁失败，直接返回失败或者重试
        log.error("不允许重复下单！");
        return;
    }
    try {
        // 5.1.查询订单
        int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
        // 5.2.判断是否存在
        if (count > 0) {
            // 用户已经购买过了
            log.error("不允许重复下单！");
            return;
        }
        // 6.扣减库存
        boolean success = seckillVoucherService.update()                   .setSql("stock = stock - 1")
        // set stock = stock - 1                   .eq("voucher_id", voucherId).gt("stock", 0) // where id = ? and stock > 0                   .update();
        if (!success) {
            // 扣减失败
            log.error("库存不足！");
            return;
        }
        // 7.创建订单           save(voucherOrder);
    }
    finally {
        // 释放锁
        redisLock.unlock();
    }
}
```

`boolean success = seckillVoucherService.update() .setSql("stock = stock - 1") // set stock = stock - 1 .eq("voucher_id", voucherId).gt("stock", 0) // where id = ? and stock > 0`是mybatisplus的应用

逻辑的核心含义是：只要我扣减库存时的库存和之前我查询到的库存是一样的，就意味着没有人在中间修改过库存，那么此时就是安全的，但是以上这种方式通过测试发现会有很多失败的情况，失败的原因在于：在使用乐观锁过程中假设100个线程同时都拿到了100的库存，然后大家一起去进行扣减，但是100个人中只有1个人能扣减成功，其他的人在处理时，他们在扣减时，库存已经被修改过了，所以此时其他线程都会失败

**第二种** 、之前的方式要修改前后都保持一致，但是这样我们分析过，成功的概率太低，所以我们的乐观锁需要变一下，改成stock大于0 即可

```java
boolean success = seckillVoucherService.update()            .setSql("stock= stock -1")            .eq("voucher_id", voucherId).update().gt("stock",0);
//where id = ? and stock > 0
```

针对cas中的自旋压力过大，我们可以使用Longaddr这个类去解决

Java8 提供的一个对AtomicLong改进后的一个类，LongAdder

大量线程并发更新一个原子性的时候，天然的问题就是自旋，会导致并发性问题，当然这也比我们直接使用syn来的好

所以利用这么一个类，LongAdder来进行优化

如果获取某个值，则会对cell和base的值进行递增，最后返回一个完整的值

![image-20240830181527355](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830181527355.png)

**一人一单问题**

要求：修改秒杀业务，要求同一个优惠券一人只能有一个

现在存在的问题：一个人可以无限次的抢同一个优惠券，这就成了黄牛现象，我们应该加一层逻辑，让一个能最多只能抢一张票。

设计逻辑：时间充足，则进一步判断库存是否足够，然后在根据优惠券的id和用户id来查询这个用户是否已经下过这个订单，如果下过，就不允许重复下单

我们先试试：

```java
@Overridepublic
Result seckillVoucher(Long voucherId) {
    // 1.查询优惠券    SeckillVoucher voucher =
    seckillVoucherService.getById(voucherId);
    // 2.判断秒杀是否开始
    if (voucher.getBeginTime().isAfter(LocalDateTime.now())) {
        // 尚未开始
        return Result.fail("秒杀尚未开始！");
    }
    // 3.判断秒杀是否已经结束
    if (voucher.getEndTime().isBefore(LocalDateTime.now())) {
        // 尚未开始
        return Result.fail("秒杀已经结束！");
    }
    // 4.判断库存是否充足
    if (voucher.getStock() < 1) {
        // 库存不足
        return Result.fail("库存不足！");
    }
    // 5.一人一单逻辑    // 5.1.用户id    Long userId =
    UserHolder.getUser().getId();
    int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
    // 5.2.判断是否存在
    if (count > 0) {
        // 用户已经购买过了
        return Result.fail("用户已经购买过一次！");
    }
    //6，扣减库存
    boolean success = seckillVoucherService.update()            .setSql("stock= stock -1")            .eq("voucher_id", voucherId).update();
    if (!success) {
        //扣减库存
        return Result.fail("库存不足！");
    }
    //7.创建订单    VoucherOrder voucherOrder =
    new VoucherOrder();
    // 7.1.订单id
    long orderId = redisIdWorker.nextId("order");
    voucherOrder.setId(orderId);
    voucherOrder.setUserId(userId);
    // 7.3.代金券id
    voucherOrder.setVoucherId(voucherId);
    save(voucherOrder);
    return Result.ok(orderId);
}
```

我们发现还是存在问题：若并发查询数据库，我们是要加锁的，乐观锁比较适合更新数据，查询数据我们用到悲观锁

**notice：** 我们的初始方案是封装一个creatVoucherOrder方法，同时未来确保他线程安全，在方法上添加一把synchronized锁

```java
@Transactionalpublic synchronized Result createVoucherOrder(Long voucherId)
```

但是这个锁太大了，锁的颗粒度太粗了，我们在使用锁的过程中，要控制**锁的颗粒度** ，锁的颗粒度太大就会造成每个线程进来都会被锁住，我们需要控制一下颗粒度，将其修改为

intern()方法是从常量池中拿到数据，如果我们之间使用userId.toString() 他拿到的实际上是不同的对象，就算他们字符全都一样，但是jvm中，他们有不同的编号，new出来的对象，我们使用锁必须要保证锁必须是同一把锁，所以我们用intern()方法

```java
@Transactionalpublic
Result createVoucherOrder(Long voucherId) {
    Long userId = UserHolder.getUser().getId();
    synchronized(userId.toString().intern()){
        // 5.1.查询订单
        int count = query().eq("user_id", userId).eq("voucher_id", voucherId).count();
        // 5.2.判断是否存在
        if (count > 0) {
            // 用户已经购买过了
            return Result.fail("用户已经购买过一次！");
        }
        // 6.扣减库存
        boolean success = seckillVoucherService.update()                .setSql("stock = stock - 1")
        // set stock = stock - 1                .eq("voucher_id", voucherId).gt("stock", 0) // where id = ? and stock > 0                .update();
        if (!success) {
            // 扣减失败
            return Result.fail("库存不足！");
        }
        // 7.创建订单        VoucherOrder voucherOrder =
        new VoucherOrder();
        // 7.1.订单id
        long orderId = redisIdWorker.nextId("order");
        voucherOrder.setId(orderId);
        // 7.2.用户id
        voucherOrder.setUserId(userId);
        // 7.3.代金券id
        voucherOrder.setVoucherId(voucherId);
        save(voucherOrder);
        // 7.返回订单id
        return Result.ok(orderId);
    }
}
```

以上代码还存在问题：当前方法被spring的事务所控制，如果在方法内部加锁，可能会导致事务还未提交，但是锁已经释放，我们需要将这个方法包裹起来，确保这个事务不会出现错误

在seckillVoucher 方法中，添加以下逻辑，这样就能保证事务的特性，同时也控制了锁的粒度

![image-20240830203228295](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830203228295.png)

但是以上做法依然有问题，因为你调用的方法，其实是this.的方式调用的，事务想要生效，还得利用代理来生效，所以这个地方，我们需要获得原始的事务对象， 来操作事务

![image-20240830212628954](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830212628954.png)

同时引入maven：

```xml
<dependency>
    <groupId>
        org.aspectj
    </groupId>
    <artifactId>
        aspectjweaver
    </artifactId>
</dependency>
```

该工具类负责解析切入点表达式 在用的时候不能脱离AOP环境也就是不能脱离spring来适用

它提供了一个叫做代理对象的东西，我们需要在spring启动项那里添加一个注解

```java
@EnableAspectJAutoProxy(exposeProxy = true)
```

暴露代理对象 这个事务就能生效了

**集群环境的并发问题**

我们虽然已经建立了锁 但是若我们处在集群环境下 Nginx反向代理多个服务器后端 每个后端都会启用一个tomcat和一个jvm 之间并没有建立通信（但是存在一个插件可以实现`Terrocotta`）,我们写的syn锁就会失效

多个jvm里有多个jvm的锁导致每一个锁都有可能被一个线程获取，就有可能并行运行，可能出现安全问题

![image-20240830215323379](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240830215323379.png)

所以，我们需要分布式锁来解决这个问题

### 分布式锁

满足分布式系统或者集群模式下多进程可见并且互斥的锁

其核心思想就是让大家都使用同一把锁，只要都使用同一个锁，线程就能锁住，不让线程进行，让程序串行执行。

分布式锁应该满足的条件：

![image-20240831084921492](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831084921492.png)

常见的分布式锁：

mysql:mysql本身就带有锁机制，但是由于mysql性能一般，所以采用的比较少

redis：redis作为分布式锁非常常见，企业开发一般用redis或者zookeeper作为分布式锁，利用setnx方法，如果插入key成功，则表示获得到了锁

zookeeper：详细可以见另一篇文章

![image-20240831090432430](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831090432430.png)

**基于Redis的分布式锁**

  * 获取锁

互斥：确保只能有一个线程获取锁

![image-20240831125831796](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831125831796.png)

  * 释放锁


​ 手动释放 `DEL key`

​ 自动释放（添加一个超时时间）`EXPIRE key time`

我们利用redis的setNX方法，当有多个线程进入时，我们就利用该方法，当一个线程进入时，redis中就有这个key了，返回1，如果结果是1，表示该线程抢到了锁，就去执行业务，然后再删除锁，退出锁逻辑。

![image-20240831130338897](https://wilsit-img.oss-cn-guangzhou.aliyuncs.com/img/image-20240831130338897.png)

测试代码：

```java
public class SimpleRedisLock implements ILock {
    private String name;
    private StringRedisTemplate stringRedisTemplate;
    public SimpleRedisLock(String name, StringRedisTemplate stringRedisTemplate) {
        this.name = name;
        this.stringRedisTemplate = stringRedisTemplate;
    }
    @Override
    public boolean tryLock(long timeoutSec) {
        // 获取线程标示
        String threadId = ID_PREFIX + Thread.currentThread().getId();
        // 获取锁        Boolean success =
        stringRedisTemplate.opsForValue()                .setIfAbsent(KEY_PREFIX + name, threadId, timeoutSec, TimeUnit.SECONDS);
        return Boolean.TRUE.equals(success);
    }
}
```