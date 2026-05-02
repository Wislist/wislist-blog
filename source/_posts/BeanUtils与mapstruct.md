---
title: "BeanUtils与mapstruct"
date: 2024-09-02 00:00:00
tags: []
categories: []
---

### BeanUtils与mapstruct

MapStruct和BeanUtils都是Java中常用的对象属性映射工具，但它们在使用方式和性能上有一些区别
[code] 
    @Mapperpublic interface CarMapper {    @BeanMapping(resultType = CarDto.class, ignoreByDefault = true, mappingControl = MappingControl.FILTER)    @Mapping(target = "color", ignore = true)    @Mapping(source = "model", target = "modelName")    @Mapping(condition = "java(source.getAge() >= 18)", target = "isAdult")    CarDto map(Car car);}
[/code]

使用@Mapper注解将它标记为MapStruct映射器。

然后，我们在映射方法上使用了@BeanMapping注解，并提供了以下配置： resultType = CarDto.class：指定映射方法的返回类型为CarDto。 ignoreByDefault = true：在目标类型CarDto中忽略所有未映射的属性。 mappingControl = MappingControl.FILTER：如果存在未匹配的属性，过滤它们而不报告错误或警告。

接下来，我们使用了@Mapping注解，对特定属性进行了额外的配置： target = “color”, ignore = true：忽略源对象的color属性，在目标对象CarDto中不进行映射。 source = “model”, target = “modelName”：将源对象的model属性映射到目标对象的modelName属性。 condition = “java(source.getAge() >= 18)”：添加条件判断，只有当源对象的age属性大于等于18时，才进行映射，并将结果映射到目标对象的isAdult属性。

若使用mapstrut
[code] 
    <dependency>        <groupId>org.mapstruct</groupId>        <artifactId>mapstruct</artifactId>        <version>1.5.0.Final</version></dependency>
[/code]

Gradle:`implementation 'org.mapstruct:mapstruct:1.5.0.Beta1'`