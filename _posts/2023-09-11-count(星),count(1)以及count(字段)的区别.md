---
layout: post
title: count(*),count(1)以及count(字段)
subtitle: count(*),count(1)以及count(字段)的区别
date: 2023-09-11
author: Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
  - 博客
  - MySQL
---
## 1. count(1) and count( * )

从执行计划来看，count(1)和count(* )的效果是一样的。

**当表的数据量大些时**，对表作分析之后，使用count(1)还要比使用count( * )用时多！ 当数据量在1W以内时，count(1)会比count( * )的用时少些，不过也差不了多少。

如果count(1)是聚集索引时，那肯定是count(1)快，但是差的很小。 因为count( * )，会自动优化指定到那一个字段。所以没必要去count(1)，使用count( * )，sql会帮你完成优化的 因此：在有聚集索引时count(1)和count( * )基本没有差别！

## 2. count(1) and count(字段)

两者的主要区别是

- count(1) 会统计表中的所有的记录数，包含字段为null 的记录。
- count(字段) 会统计该字段在表中出现的次数，忽略字段为null 的情况。  
    即不统计字段为null 的记录。  
    

## 3. count( * ) 和 count(1)和count(列名)区别

执行效果上：

- count( * )包括了所有的列，相当于行数，在统计结果的时候，**不会忽略为NULL的值。**
- count(1)包括了忽略所有列，用1代表代码行，在统计结果的时候，**不会忽略为NULL的值**。
- count(列名)只包括列名那一列，在统计结果的时候，会忽略列值为空（这里的空不是指空字符串或者0，而是表示null）的计数，**即某个字段值为NULL时，不统计**。

执行效率上：

- 列名为主键，count(列名)会比count(1)快
- 列名不为主键，count(1)会比count(列名)快
- 如果表多个列并且没有主键，则 count(1 的执行效率优于 count（*）
- 如果有主键，则 select count（主键）的执行效率是最优的
- 如果表只有一个字段，则 select count（*）最优