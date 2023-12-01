---
layout: post
title: SQL练习专题
subtitle: SQL练习专题
date: 2023-09-16
author: Gavin
header-img: img/post-bg-swift.jpg
catalog: true
tags:
  - 博客
---

# SQL练习

# SQL练习

## day01

```
#–1.学生表 
#Student(s_id,s_name,s_birth,s_sex) –学生编号,学生姓名, 出生年月,学生性别
CREATE TABLE `Student` (
    `s_id` VARCHAR(20),
    s_name VARCHAR(20) NOT NULL DEFAULT '',
    s_brith VARCHAR(20) NOT NULL DEFAULT '',
    s_sex VARCHAR(10) NOT NULL DEFAULT '',
    PRIMARY KEY(s_id)
);
#–2.课程表 
#Course(c_id,c_name,t_id) – –课程编号, 课程名称, 教师编号 
create table Course(
    c_id varchar(20),
    c_name VARCHAR(20) not null DEFAULT '',
    t_id VARCHAR(20) NOT NULL,
    PRIMARY KEY(c_id)
);
/*
–3.教师表 
Teacher(t_id,t_name) –教师编号,教师姓名 
*/
CREATE TABLE Teacher(
    t_id VARCHAR(20),
    t_name VARCHAR(20) NOT NULL DEFAULT '',
    PRIMARY KEY(t_id)
);
/*
–4.成绩表 
Score(s_id,c_id,s_score) –学生编号,课程编号,分数
*/
Create table Score(
    s_id VARCHAR(20),
    c_id VARCHAR(20) not null default '',
    s_score INT(3),
    primary key(`s_id`,`c_id`)
);
```

原始数据
```mysql
#--插入学生表测试数据#('01' , '赵雷' , '1990-01-01' , '男')
insert into Student values('01' , '赵雷' , '1990-01-01' , '男');insert into Student values('02' , '钱电' , '1990-12-21' , '男');insert into Student values('03' , '孙风' , '1990-05-20' , '男');insert into Student values('04' , '李云' , '1990-08-06' , '男');insert into Student values('05' , '周梅' , '1991-12-01' , '女');insert into Student values('06' , '吴兰' , '1992-03-01' , '女');insert into Student values('07' , '郑竹' , '1989-07-01' , '女');insert into Student values('08' , '王菊' , '1990-01-20' , '女');
#--课程表测试数据
insert into Course values('01' , '语文' , '02');insert into Course values('02' , '数学' , '01');insert into Course values('03' , '英语' , '03');
#--教师表测试数据
insert into Teacher values('01' , '张三');insert into Teacher values('02' , '李四');insert into Teacher values('03' , '王五');
#--成绩表测试数据
insert into Score values('01' , '01' , 80);insert into Score values('01' , '02' , 90);insert into Score values('01' , '03' , 99);insert into Score values('02' , '01' , 70);insert into Score values('02' , '02' , 60);insert into Score values('02' , '03' , 80);insert into Score values('03' , '01' , 80);insert into Score values('03' , '02' , 80);insert into Score values('03' , '03' , 80);insert into Score values('04' , '01' , 50);insert into Score values('04' , '02' , 30);insert into Score values('04' , '03' , 20);insert into Score values('05' , '01' , 76);insert into Score values('05' , '02' , 87);insert into Score values('06' , '01' , 31);insert into Score values('06' , '03' , 34);insert into Score values('07' , '02' , 89);insert into Score values('07' , '03' , 98);
```

表关系分析

1 查询"01"课程比"02"课程成绩高的学生的信息及课程分数

```mysql
-- 1查询"01"课程比"02"课程成绩高的学生的信息及课程分数
-- 分析题目关键字: 学生信息 课程分数  课程编号
-- 第一步:锁定使用表  学生表 分数表 这两张表能提供题目所需
-- 第二步:通过s_id关联 学生表和分数表
SELECT
    *
FROM
    student a
INNER JOIN score b ON a.s_id = b.s_id
-- 第三步:进行同一学生不同成绩比较,那么就需要在关联一次成绩表,利用s_id相同,c_id不同进行关联
SELECT
    *
FROM
    student a
INNER JOIN score b ON a.s_id = b.s_id
INNER JOIN score c ON a.s_id = c.s_id
AND b.c_id = "01"
AND c.c_id = "02"
-- 第四步:最终回归到题目,只需要筛选一下课程,利用where条件比较分数即可
SELECT
    *
FROM
    student a
INNER JOIN score b ON a.s_id = b.s_id
INNER JOIN score c ON a.s_id = c.s_id
AND b.c_id = "01"
AND c.c_id = "02"
WHERE
    b.s_score > c.s_score
```

### 自己写的
下面这样写比较好理解一点
```sql
SELECT * FROM student t1
JOIN score t2 ON t1.s_id = t2.s_id AND t2.c_id = '01'
JOIN score t3 ON t1.s_id = t3.s_id AND t3.c_id = '02'
WHERE t2.s_score > t3.s_score
```

![](imgs/Pasted%20image%2020230921110851.png)

2 查询平均成绩大于等于60分的同学的学生编号和学生姓名和平均成绩 
```mysql
-- 查询平均成绩大于等于60分的同学的学生编号和学生姓名和平均成绩
-- 分析题目关键字, 学生编号 学生姓名 平均成绩>60
-- 第一步:锁定使用表  学生表 成绩表 这两张表提供题目所需信息
-- 第二步:成绩表按照s_id聚合 获取平均成绩,并且筛选出平均成绩大于等于60的s_id 和平均成绩
select
s_id,
avg(s_score) avg_score
from score 
GROUP BY s_id
HAVING avg_score>60
-- 第三步:关联学生表 获取学生姓名
select 
*
from student a RIGHT  JOIN (select
s_id,
avg(s_score) avg_score
from score 
GROUP BY s_id
HAVING avg_score>60) b
ON a.s_id = b.s_id
```
### 自己写的
```sql
SELECT t1.s_id,t2.s_name,AVG(s_score) 'avageScore' FROM score t1
JOIN student t2 ON t1.s_id = t2.s_id
GROUP BY s_id 
HAVING avageScore >= 60
```

![|400](imgs/Pasted%20image%2020230921110907.png)
3 查询在score表存在成绩的学生信息
```mysql
-- 查询在score表存在成绩的学生信息
-- 分析题目关键字 score表 成绩 学生信息
-- 第一步: 锁定表 学生表 成绩表
-- 第二步: 以成绩表为主,左关联学生表 连接主键s_id 使用 left join 关键就在于去重处理,否则会有多条重复记录
 select DISTINCT(s_id) from score
-- 第三步:使用 distinct 从成绩表中获取唯一sid 左连接学生表  
select 
*
from (select DISTINCT(s_id) from score ) a LEFT JOIN student b
on a.s_id = b.s_id
```
### 自己写的
```sql
SELECT DISTINCT t1.* FROM student t1
RIGHT JOIN score t2 ON t1.s_id = t2.`s_id`;
```

![|400](imgs/Pasted%20image%2020230921110928.png)
4 查询所有同学的学生编号、学生姓名、选课总数、所有课程的总成绩
```mysql
-- 查询所有同学的学生编号、学生姓名、选课总数、所有课程的总成绩
-- 分析题目关键字 学生信息 选课总述 所有课程总成绩
-- 第一步:锁定表 学生表 成绩表
-- 第二步:在score表中对s_id进行聚合,获取每个学生的选课总数 所有课程的总成绩
select
s_id,
count(1) as ct,
SUM(s_score) total
from score
GROUP BY s_id
-- 第三步:学生表为主表,与第二步得到的成绩汇总表进行左关联查询
select
a.s_id,
a.s_name,
b.ct,
b.total
from student a  LEFT JOIN 
(select
s_id,
count(1) as ct,
SUM(s_score) total
from score
GROUP BY s_id) b 
on a.s_id = b.s_id
```
### 自己写的
有一个学生的没有选课也没有成绩,所以需要进行right join,将这个学生的所有的信息也查询出来
```sql
select t2.s_id,t2.s_name, count(t1.c_id) '选课总数',sum(t1.s_score) '所有课程总成绩'  
from score t1  
         right join student t2 on t1.s_id = t2.s_id  
group by t2.s_id;
```

![|400](imgs/Pasted%20image%2020230921110605.png)

4.1 查询有成绩的学生信息

```mysql
-- 查询有成绩的学生信息
-- 第一步:锁定表 学生表 成绩表
-- 第二步:筛选出有成绩的s_id 并用group_by /distinct 分组去重
SELECT 
DISTINCT(s_id)
FROM
score
-- 第三步:利用有成绩的s_id 在 student表 做筛选
SELECT
*
from student
where s_id in(SELECT 
DISTINCT(s_id)
FROM
score)
```

5 查询"李"姓老师的数量

```mysql
-- 查询"李"姓老师的数量
-- 分析题目关键字 老师 李  数量
-- 第一步:锁定表 教师表
-- 第二步:筛选出 李 姓老师 (提示: 使用like关键字 % 表示占位符)
select 
*
from
teacher
WHERE
t_name like "李%"
-- 第三步:统计 李 姓老师 老师的数量
select 
 count(*) 数量
from
teacher
WHERE
t_name like "李%"
```

### 自己写的
```sql
select count(*) from teacher where t_name like '李%';
```

![](imgs/Pasted%20image%2020230921111533.png)
## day02

1,查询学过 张三 老师授课的同学的信息

```mysql
-- 查询学过 张三 老师授课的同学的信息
-- 分析题目关键字 教师姓名  学生信息
-- 第一步:锁定表 首先学生表 与 教师表没有直接关联 此时就需要通过课程表 成绩表 进行间接关联
-- 第二步:关联课程表和教师表 得到课程c_id 与 教师 t_name 的关系
SELECT 
a.*,
b.t_name
FROM
course a ,teacher b 
WHERE
a.t_id = b.t_id
-- 第三步:与成绩表关联,得到学生s_id 与教师 t_name的关系
SELECT
a.*,b.t_name
from
score a INNER JOIN (SELECT 
a.*,
b.t_name
FROM
course a ,teacher b 
WHERE
a.t_id = b.t_id) b
on a.c_id = b.c_id
-- 第四步:与学生表关联,获取学生信息
SELECT
a.* ,b.t_name
FROM student a INNER JOIN 
(SELECT
a.*,b.t_name
from
score a INNER JOIN (SELECT 
a.*,
b.t_name
FROM
course a ,teacher b 
WHERE
a.t_id = b.t_id) b
on a.c_id = b.c_id) b 
ON a.s_id = b.s_id
-- 第五步:增加筛选条件,t_name 为 张三
SELECT
a.* ,b.t_name
FROM student a INNER JOIN 
(SELECT
a.*,b.t_name
from
score a INNER JOIN (SELECT 
a.*,
b.t_name
FROM
course a ,teacher b 
WHERE
a.t_id = b.t_id) b
on a.c_id = b.c_id) b 
ON a.s_id = b.s_id
WHERE b.t_name = "张三"
```
### 自己写的

```sql
select t4.*,t3.c_id,t3.s_score,t1.t_name from teacher t1  
join course t2 on t1.t_id = t2.t_id  
         join score t3 on t2.c_id = t3.c_id  
         join student t4 on t4.s_id = t3.s_id  
where t1.t_name = '张三'
```
不停的join就好了,这个题没有什么难的
![](imgs/Pasted%20image%2020230921112119.png)

2 查询没有学全所有课程的同学的信息 
```mysql
-- 查询没有学全所有课程的同学的信息 
-- 分析题目关键字 所有课程数   学生信息
-- 第一步:锁定表 首先学生表 成绩表 课程表
-- 第二步:查询出所有课程的课程数
select count(1) from course
-- 第三步:在成绩表中获取每一名s_id 的课程数 并筛选出所学课程小于总课程数的s_id
select 
s_id,
count(1) ct
from score 
GROUP BY s_id
HAVING ct < (select count(1) from course)
-- 第四步:根据s_id与学生表进行关联获取学生信息
select 
*
from student a RIGHT JOIN 
(select 
s_id,
count(1) ct
from score 
GROUP BY s_id
HAVING ct < (select count(1) from course)) b
ON a.s_id = b.s_id
```

### 自己写的
```sql
select t2.*  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
group by t1.s_id  
having count(c_id) < (select count(1) from course);
```

![](imgs/Pasted%20image%2020230921112657.png)

3 查询至少有一门课与学号为"01"的同学所学相同的同学的信息

```mysql
-- 查询至少有一门课与学号为"01"的同学所学相同的同学的信息
-- 分析题目关键字 01 同学所学课程   学生信息
-- 第一步: 锁定表 学生表 成绩表
-- 第二步:根据成绩表 获取01同学所学的课程编号
select c_id FROM score where s_id = "01"
-- 第三步:使用 in 获取课程表在 01 同学 所学课程编号范围内的记录
SELECT
*
FROM
score
where 
c_id in (select c_id FROM score where s_id = "01")
-- 第四步:关联学生表,获取学生信息 并用distinct去重
SELECT
DISTINCT a.*
from student a INNER JOIN
(SELECT
*
FROM
score
where 
c_id in (select c_id FROM score where s_id = "01")) b
ON a.s_id = b.s_id
```

### 自己写的
```sql
select distinct t1.*  
from student t1  
         join (select *  
               from score  
               where c_id in (select c_id from score where s_id = '01')) t2 on t1.s_id = t2.s_id and t1.s_id <> '01';
```

![](imgs/Pasted%20image%2020230921122501.png)

4 查询和"01"号的同学学习的课程完全相同的其他同学的信息

```mysql
-- 查询和"01"号的同学学习的课程完全相同的其他同学的信息
-- 分析题目关键字  01同学学习课程的信息 完全相同 学生信息
        -- 完全相同 有 2层含义  
            -- 第一层:没有学习01号同学学习课程以外的其他课程 
            -- 第二层:与01号同学学习课程数量相等
-- 第一步:锁定表 学生表 成绩表
-- 第二步: 先获取出 学了01号同学学习课程以外其他课程的同学 并使用not in 过滤
SELECT  s_id from score WHERE c_id not in (SELECT c_id from score where s_id = "01")
-- 第三步:利用反向思维 排除第二步找到的同学以及01号同学
SELECT s_id from score
where s_id not in (SELECT  s_id from score WHERE c_id not in (SELECT c_id from score where s_id = "01"))
AND s_id != "01" GROUP BY s_id
-- 第四步: 筛选出与 01 号同学所学课程数量相同的同学 
SELECT s_id from score
where s_id not in (SELECT  s_id from score WHERE c_id not in (SELECT c_id from score where s_id = "01"))
AND s_id != "01" 
GROUP BY s_id
HAVING COUNT(c_id) = (SELECT count(*) from score where s_id = "01")
-- 第五步:关联学生表,获取学生信息
select
b.*
from (SELECT s_id from score
where s_id not in (SELECT  s_id from score WHERE c_id not in (SELECT c_id from score where s_id = "01"))
AND s_id != "01" 
GROUP BY s_id
HAVING COUNT(c_id) = (SELECT count(*) from score where s_id = "01")) a  INNER JOIN  student b 
ON a.s_id = b.s_id
```
### 自己写的
```sql
-- 方法1 比较的麻烦,写法没有方法2简洁
select t1.*, t2.c_id, t3.c_id, t4.c_id  
from student t1  
         left join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'  
         left join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'  
         left join score t4 on t1.s_id = t4.s_id and t4.c_id = '03'  
where (t2.c_id in (select c_id from score where s_id = '01') and  
       t3.c_id in (select c_id from score where s_id = '01') and  
       t4.c_id in (select c_id from score where s_id = '01'))  
  and t1.s_id <> '01';
  
-- 方法2
select t2.*  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
group by t1.s_id  
having group_concat(c_id) =  
       (select group_concat(c_id)  
        from score  
        where s_id = '01'  
        group by s_id) and t1.s_id <> '01';
```

![](imgs/Pasted%20image%2020230921142902.png)
5 查询没学过"张三"老师授课的任一门课程的同学信息 

```mysql
-- 查询没学过"张三"老师授课的任一门课程的同学信息  
-- 分析题目关键字 由于教师表与学生表没有直接关联所有需要成绩表与课程包进行关联 四表关联
-- 第一步: 锁定表 4张表
-- 第二步: 关联成绩表,获取学过张三老师课程的s_id
select * from
  score a LEFT JOIN course b ON a.c_id = b.c_id
    INNER JOIN teacher c ON b.t_id = c.t_id 
WHERE c.t_name = '张三'
-- 第三步: 关联学生表,使用not in 筛选出没有学过张三 老师课程的sid
select
*
from student a 
WHERE a.s_id not in (select s_id from
  score a LEFT JOIN course b ON a.c_id = b.c_id
    INNER JOIN teacher c ON b.t_id = c.t_id 
WHERE c.t_name = '张三')
```

这个题自己没有写出来,基本的思路如下: 
首先根据score和course以及teacher查询出来score里面有哪些课程是张三这个老师教授的
然后上面查询出来的结果作为下一个查询的条件,判断的依据是s_id不在上面查询出来的结果里面
![](imgs/Pasted%20image%2020230921145246.png)
## day03

1,查询两门及其以上不及格课程的同学的学号，姓名及其平均成绩
```mysql
-- 查询两门及其以上不及格课程的同学的学号，姓名及其平均成绩 
-- 分析题目关键字 两门及以上 学生学号和姓名  平均成绩
-- 第一步: 锁定表 学生表 成绩表
-- 第二步:求出学生的 平均成绩
select s_id, AVG(s_score) avg_score from score GROUP BY s_id  
-- 第三步:找出有两门及以上不及格的同学
select 
s_id from score
WHERE s_score < 60 
GROUP BY s_id
HAVING count(c_id)>=2
-- 第四步:结合第二步和第三步 求出两门及以上不及格课程的同学的平均分
select 
a.s_id ,avg(s_score) avg_score
from score a INNER JOIN (select 
s_id from score
WHERE s_score < 60 
GROUP BY s_id
HAVING count(c_id)>=2) b 
on a.s_id = b.s_id
GROUP BY  a.s_id
-- 第五步:关联学生表,获取学生姓名
select 
a.s_name,a.s_id,avg_score
from student a INNER JOIN (select 
a.s_id ,avg(s_score) avg_score
from score a INNER JOIN (select 
s_id from score
WHERE s_score < 60 
GROUP BY s_id
HAVING count(c_id)>=2) b 
on a.s_id = b.s_id
GROUP BY  a.s_id) b
ON a.s_id = b.s_id
```
### 自己写的
基本上的思路是这样的: 
根据s_id进行分组,然后聚合一个平均的分数,另外聚合一个60分以下的课程的数目
联合查询出来对应的学生的信息
```sql
select t2.*, avg(s_score)  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
where s_score < 60  
group by s_id  
having count(1) >= 2;
```

![](imgs/Pasted%20image%2020230921150313.png)

2 检索"01"课程分数小于60，按分数降序排列的学生信息

```mysql
-- 检索"01"课程分数小于60，按分数降序排列的学生信息
-- 分析题目关键字 
-- 第一步: 锁定表 成绩表 学生表
-- 第二步: 查询01课程小于60的s_id
select s_id,s_score from score where c_id = '01' AND s_score < 60
-- 第三步: 关联学生表,获取学生信息,并且按照分数降序排列
select
a.*,b.s_score
from student a INNER JOIN (select s_id,s_score from score where c_id = '01' AND s_score < 60) b
ON a.s_id = b.s_id ORDER BY s_score DESC
```

```sql
select t2.*,t1.s_score from score t1  
         join student t2 on t1.s_id = t2.s_id  
         where s_score < 60 and c_id = '01' order by s_score desc;
```

![](imgs/Pasted%20image%2020230921152145.png)
3 按平均成绩从高到低显示所有学生的所有课程的成绩以及平均成绩

```mysql
-- 按平均成绩从高到低显示所有学生的所有课程的成绩以及平均成绩
-- 分析题目关键字 所有学生 所有课程 平均成绩 由于排序时最后执行,所以本题目最大的误区就是先获取平均成绩
-- 第一步: 锁定表 学生表 成绩表
-- 第二步: 获取所有学生的所有课程成绩(学生表左连接成绩表,没有成绩的显示为null)
select 
a.s_id,b.c_id,b.s_score
from student a LEFT JOIN score b 
ON a.s_id = b.s_id
-- 第三步: 求出学生的平均成绩
select
s_id,AVG(s_score) avg_scroe
from score
GROUP BY s_id
-- 第四步:给每条成绩记录加上平均成绩,最终按照平均成绩降序排列
select 
*
from 
(select 
a.s_id,b.c_id,b.s_score
from student a LEFT JOIN score b 
ON a.s_id = b.s_id) m
LEFT JOIN 
(select
s_id,AVG(s_score) avg_scroe
from score
GROUP BY s_id) n 
ON m.s_id = n.s_id 
ORDER BY n.avg_scroe DESC
```
### 自己写的
```sql
select t5.*, t2.s_score '语文', t3.s_score '数学', t4.s_score '英语', avg(t1.s_score) averageScore  
from score t1  
         join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'  
         join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'  
         join score t4 on t1.s_id = t4.s_id and t4.c_id = '03'  
         join student t5 on t1.s_id = t5.s_id  
group by t1.s_id  
order by averageScore desc;
```

![](imgs/Pasted%20image%2020230921153012.png)

4 查询各科成绩最高分、最低分和平均分：以如下形式显示：课程ID，课程name，最高分，最低分，平均分，及格率，中等率，优良率，优秀率   及格为>=60，中等为：70-80，优良为：80-90，优秀为：>=90要求输出课程号和选修人数,查询结果按人数排序排列,若人数相同,按课程号升序排列

CASE 表示函数开始，END 表示函数结束。如果 condition1 成立，则返回 result1, 如果 condition2 成立，则返回 result2，当全部不成立则返回 result，而当有一个成立之后，后面的就不执行了。case when s_score>=70 AND s_score<80 then 1 else 0 end 符合条件的则记为1 也就说统计1出现的次数就是该分数段出现的此处

 

```mysql
-- 查询各科成绩最高分、最低分和平均分：以如下形式显示：课程ID，课程name，最高分，最低分，平均分，及格率，中等率，优良率，优秀率
-- 及格为>=60，中等为：70-80，优良为：80-90，优秀为：>=90
-- 要求输出课程号和选修人数,查询结果按人数排序排列,若人数相同,按课程号升序排列
-- 分析题目关键字: 课程号,课程名称 聚合计算(选修人数,最高分,最低分,平均分,及格率,中等率,优良率,优秀率) 排序
-- 第一步: 锁定表 课程表 成绩表
-- 第二步:聚合计算(使用提交判断语句 case when)
select
c_id,
count(*) 选修人数,
max(s_score) 最高分,
min(s_score) 最低分,
avg(s_score) 平均分,
sum(case when s_score>=60 then 1 else 0 end)/count(*) 及格率,
sum(case when s_score>=70 AND s_score<80 then 1 else 0 end) /count(*) 中等率,
sum(case when s_score>=80 and s_score<90 then 1 else 0 end) /count(*) 优良率,
sum(case when s_score>=90 then 1 else 0 end )/count(*) 优秀率
from
score
GROUP BY c_id 
-- 第三步: 排序(按照选修人数降序 课程号升序)
select
c_id,
count(*) 选修人数,
max(s_score) 最高分,
min(s_score) 最低分,
avg(s_score) 平均分,
sum(case when s_score>=60 then 1 else 0 end)/count(*) 及格率,
sum(case when s_score>=70 AND s_score<80 then 1 else 0 end) /count(*) 中等率,
sum(case when s_score>=80 and s_score<90 then 1 else 0 end) /count(*) 优良率,
sum(case when s_score>=90 then 1 else 0 end )/count(*) 优秀率
from
score
GROUP BY c_id 
ORDER BY count(*),c_id asc
-- 第四步:关联课程表 输出课程名称
select 
a.*,
b.c_name
from
(select
c_id,
count(*) 选修人数,
max(s_score) 最高分,
min(s_score) 最低分,
avg(s_score) 平均分,
sum(case when s_score>=60 then 1 else 0 end)/count(*) 及格率,
sum(case when s_score>=70 AND s_score<80 then 1 else 0 end) /count(*) 中等率,
sum(case when s_score>=80 and s_score<90 then 1 else 0 end) /count(*) 优良率,
sum(case when s_score>=90 then 1 else 0 end )/count(*) 优秀率
from
score
GROUP BY c_id 
ORDER BY count(*),c_id asc) a LEFT  JOIN course b 
ON a.c_id = b.c_id
```
### 自己写的
不明白为什么答案上需要用子查询,感觉完全没有必要啊
```sql
select t1.c_id '课程ID',t2.c_name '课程name',count(1) '选修人数',max(t1.s_score) '最高分',min(t1.s_score) '最低分',avg(s_score) '平均分',  
sum(case when s_score >= 60 then 1 else 0 end)/count(1) '及格率',  
sum(case when s_score >= 70 and s_score < 80 then 1 else 0 end)/count(1) '中等率',  
sum(case when s_score >= 80 and s_score < 90 then 1 else 0 end)/count(1) '优良率',  
sum(case when s_score >= 90 then 1 else 0 end)/count(1) '优秀率'  
from score t1  
join course t2 on t1.c_id = t2.c_id  
group by t1.c_id  
order by count(1) , t1.c_id;
```

![](imgs/Pasted%20image%2020230921154836.png)

5 按各科成绩进行排序，并显示排名,score重复时,也继续排名

mysql从8.0开始支持窗口函数

什么是窗口?

可以理解为记录集合,窗口函数就是在满足某种提交的记录集合上执行的特殊函数,按照功能划分,可以把mysql支持的窗口函数分为如下几类:

| 名称     | 方法                                                 |
| -------- | ---------------------------------------------------- |
| 序号函数 | row_number() / rank()/dense_rank() 主要解决排序/排名 |
| 分布函数 | percent_rank() /cume_dist()                          |
| 前后函数 | lag() /lead()                                        |
| 头尾函数 | first_val() /last_val()                              |
| 其他函数 | nth_value() /nfile()                                 |

窗口函数基本用法如下

函数名([expr]) over 字句

over是关键字,用来指定函数执行的窗口范围

```mysql
-- 按各科成绩进行排序，并显示排名,score重复时,也继续排名
SELECT
*,row_number() over (partition  by c_id order by s_score desc) as 排名
from score
    -- 按各科成绩进行排序,并显示排名,score 重复时,合并名次
SELECT
*,dense_rank() over (partition  by c_id order by s_score desc) as 排名
from score
-- 知识点 row_number() rank() dense_rank()区别
-- (1) row_number:依次排序,不会出现相同排名
-- (2) rank():出现相同的排名时,跳跃排序
-- (3) dense_rank():出现相同排序时,连续排序
```

### 自己写的
```sql
select *, dense_rank() over w from score t1  
         window w as (partition by c_id order by s_score);
```

![](imgs/Pasted%20image%2020230921155535.png)
## day04

1,查询学生的总成绩并进行排名 总分重复时保留名词空缺

```mysql
-- 查询学生的总成绩并进行排名 总分重复时保留名次空缺
-- 分析题目关键字 总成绩  保留名词空缺
-- 第一步:计算总成绩
select 
s_id,
sum(s_score) as sum_score
from score 
GROUP BY s_id
-- 第二步:按照总成绩进行排序(排名跳跃)
select
*,
rank() over(ORDER BY sum_score) as 排名
from (select 
s_id,
sum(s_score) as sum_score
from score 
GROUP BY s_id) a 
-- 查询学生的总成绩并进行排名 总分重复时不保留名次空缺
-- 分析题目关键字 总成绩  保留名词空缺
-- 第一步:计算总成绩
-- 第二步:按照总成绩进行排序(排名连续)
select
*,
dense_rank() over(ORDER BY sum_score) as 排名
from (select 
s_id,
sum(s_score) as sum_score
from score 
GROUP BY s_id) a 
```

### 自己写的
```sql
select *, dense_rank() over w  
from (select s_id, sum(s_score) total  
      from score  
      group by s_id  
      ) as tt  
window w as (order by total desc);
```

![](imgs/Pasted%20image%2020230921160528.png)

2统计各科成绩各分数段人数：课程编号,课程名称,[100-85],[85-70],[70-60],[0-60]及所占百分比

```mysql
-- 统计各科成绩各分数段人数：课程编号,课程名称,[100-85],[85-70],[70-60],[0-60]及所占百分比
-- 分析题目关键字 
-- 第一步:锁定表 成绩表 课程表
-- 第二步:使用case when ,按照课程编号统计各个分数段的人数
select
c_id,
sum(case when s_score>=0 and s_score<60 then 1 else 0 end ) '[0-60]',
sum(case when s_score>=60 and s_score<70 then 1 else 0 end ) '[60-70]',
sum(case when s_score>=70 and s_score<85 then 1 else 0 end ) '[70-85]',
sum(case when s_score>=85 and s_score<=100 then 1 else 0 end ) '[100-85]'
from 
score
GROUP BY c_id
-- 第三步:转化成所占百分比
select
c_id,
sum(case when s_score>=0 and s_score<60 then 1 else 0 end )/count(*) '[0-60]',
sum(case when s_score>=60 and s_score<70 then 1 else 0 end )/count(*)  '[60-70]',
sum(case when s_score>=70 and s_score<85 then 1 else 0 end )/count(*)  '[70-85]',
sum(case when s_score>=85 and s_score<=100 then 1 else 0 end )/count(*)  '[100-85]'
from 
score
GROUP BY c_id
-- 第四步:使用concat拼接 输出百分比符号
select
c_id,
concat(sum(case when s_score>=0 and s_score<60 then 1 else 0 end )/count(*)*100,'%') '[0-60]',
concat(sum(case when s_score>=60 and s_score<70 then 1 else 0 end )/count(*)*100,'%')  '[60-70]',
concat(sum(case when s_score>=70 and s_score<85 then 1 else 0 end )/count(*)*100,'%')  '[70-85]',
concat(sum(case when s_score>=85 and s_score<=100 then 1 else 0 end )/count(*)*100,'%')  '[100-85]'
from 
score
GROUP BY c_id
-- 第五步:关联课程表,输出课程名称
select 
*
from
course a LEFT JOIN (select
c_id,
concat(sum(case when s_score>=0 and s_score<60 then 1 else 0 end )/count(*)*100,'%') '[0-60]',
concat(sum(case when s_score>=60 and s_score<70 then 1 else 0 end )/count(*)*100,'%')  '[60-70]',
concat(sum(case when s_score>=70 and s_score<85 then 1 else 0 end )/count(*)*100,'%')  '[70-85]',
concat(sum(case when s_score>=85 and s_score<=100 then 1 else 0 end )/count(*)*100,'%')  '[100-85]'
from 
score
GROUP BY c_id) b
ON a.c_id = b.c_id
```
### 自己写的

```sql
select t1.c_id                                                                                   '课程编号',  
       t2.c_name,  
       concat(sum(case when s_score >= 85 and s_score <= 100 then 1 else 0 end) / count(1), '%') '[100-85]',  
       concat(sum(case when s_score >= 70 and s_score < 85 then 1 else 0 end) / count(1), '%')   '[85-70]',  
       concat(sum(case when s_score >= 60 and s_score < 70 then 1 else 0 end) / count(1), '%')   '[70-60]',  
       concat(sum(case when s_score >= 0 and s_score < 60 then 1 else 0 end) / count(1), '%')    '[0-60]'  
from score t1  
         join course t2 on t1.c_id = t2.c_id  
group by t1.c_id;
```

![](imgs/Pasted%20image%2020230921161258.png)
3 查询各科成绩前三名的记录
```mysql
-- 查询各科成绩前三名的记录
-- 分析题目关键字 借助于窗口函数 各科成绩 前三名
-- 第一步:锁定表 成绩表
-- 第二步:根据成绩进行排名
select 
*,
dense_rank() over(PARTITION by c_id order by s_score desc) as socre_rank
from score
-- 第三步: 筛选出前三名 只要是socre_rank 小于等于3的记录就行
select
*
from (select 
*,
dense_rank() over(PARTITION by c_id order by s_score desc) as socre_rank
from score) a 
WHERE socre_rank<=3
```
### 自己写的
```sql
select * from (select *, rank() over (partition by c_id order by s_score) tt  
               from score) as dd  
where tt <= 3;
```

![](imgs/Pasted%20image%2020230921162255.png)
4,查询每门课程被选修的学生数
```mysql
-- 查询每门课程被选修的学生数
-- 分析题目关键字 每门课程 学生数
-- 第一步:锁定表 成绩表
-- 第二步:按照课程编号进行分组统计
select 
c_id,
count(s_id) 学生数
from
score
GROUP BY c_id
```
### 自己写的
```sql
select t1.c_id,t2.c_name,count(*) '选修的人数' from score t1  
                      join course t2 on t1.c_id = t2.c_id  
                      group by c_id;
```

![](imgs/Pasted%20image%2020230921162503.png)

5查询出只有两门课程的全部学生的学号和姓名
```mysql
-- 查询出只有两门课程的全部学生的学号和姓名
-- 分析题目关键字 两门课程 学生编号和姓名
-- 第一步:锁定表 成绩表 学生表
-- 第二步:统计出每个学生选修的课程数 并筛选出只选修2门课程的学生s_id
select
s_id,
count(c_id) cnum
FROM score
GROUP BY s_id
HAVING cnum =2
-- 第三步:关联学生表,输出学生姓名
select 
a.s_name,
b.cnum
from student a RIGHT  JOIN (select
s_id,
count(c_id) cnum
FROM score
GROUP BY s_id
HAVING cnum =2) b
ON a.s_id = b.s_id
```
### 自己写的
```sql
select t2.s_id, t2.s_name  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
group by t1.s_id  
having count(1) = 2;
```
![](imgs/Pasted%20image%2020230921162820.png)
## day05
1,查询男生、女生人数
```mysql
-- 查询男生、女生人数
-- 分析题目关键字  不同性别  学生数
-- 第一步:锁定表 学生表
-- 第二步:按照性别进行分组统计
select 
s_sex,
count(1) "人数"
from student
GROUP BY s_sex
```
### 自己写的
```sql
select s_sex,count(1) from student  
group by s_sex;
```

![](imgs/Pasted%20image%2020230923104330.png)
2查询名字中含有"风"字的学生信息
```mysql
-- 查询名字中含有"风"字的学生信息
-- 分析题目关键字 包含风字(字符串匹配问题) 学生信息
-- 第一步:锁定表 学生表
-- 第二步:使用 like 操作符 %作为占位符
select 
*
from student
where s_name like '%风%'
```

### 自己写的
```sql
select * from student where s_name like '%风%';
```
![](imgs/Pasted%20image%2020230923104426.png)
3查询同名同性学生名单，并统计同名人数
```mysql
-- 查询同名同性学生名单，并统计同名人数
-- 分析题目关键字  同名同性 人数 
-- 第一步:锁定表 学生表
-- 第二步: 自连接查询,筛选出名字,性别相同但是学号不同的信息
select
*
from
student a INNER JOIN student b
ON a.s_name = b.s_name AND a.s_sex = b.s_sex AND a.s_id != b.s_id
-- 第三步:统计同名同性的人数
select 
a.s_name,
a.s_sex,
count(*) as ct
from(select
a.*
from
student a INNER JOIN student b
ON a.s_name = b.s_name AND a.s_sex = b.s_sex AND a.s_id != b.s_id) a
GROUP BY a.s_name,a.s_sex
```
### 自己写的
```sql
select t1.s_name,count(1) from student t1  
join student t2 on t1.s_name = t2.s_name and t1.s_sex = t2.s_sex and t1.s_id != t2.s_id  
group by t1.s_name
```
![](imgs/Pasted%20image%2020230923104958.png)

4查询1990年出生的学生名单

```mysql
-- 查询1990年出生的学生名单
-- 分析题目关键字 出生日期 
-- 第一步:锁定表 学生表
-- 第二步:使用year() 筛选出1990年出生的学生
select year("1990-01-01")
select 
* 
from 
student
where year(s_brith)='1990'
-- 另外一种解法:
select
*
from
student
where left(s_brith,4)="1990"
```
### 自己写的
这个left前四位匹配的用法比较的专业,我自己使用的是模糊查询的方式

5查询每门课程的平均成绩，结果按平均成绩降序排列，平均成绩相同时，按课程编号升序排列

```mysql
-- 查询每门课程的平均成绩，结果按平均成绩降序排列，平均成绩相同时，按课程编号升序排列
-- 分析题目关键字  平均成绩 排序
-- 第一步:锁定表 成绩表
-- 第二步: 计算没门课程平均成绩
select
s_id,
AVG(s_score) avg_score
from 
score
GROUP BY c_id
-- 第三步:排序
select
s_id,
AVG(s_score) avg_score
from 
score
GROUP BY c_id
ORDER BY avg_score DESC,c_id ASC
```
不明白上面写的语句里面要s_id干什么用
```sql
select c_id,avg(s_score) from score  
group by c_id  
order by avg(s_score) desc ,c_id asc;
```

![](imgs/Pasted%20image%2020230923105728.png)
## day06
1,查询平均成绩大于等于85的所有学生的学号、姓名和平均成绩

```mysql
-- 查询平均成绩大于等于85的所有学生的学号、姓名和平均成绩
-- 分析题目关键字 平均成绩 学号 姓名
-- 第一步:锁定表 成绩表 学生表
-- 第二步:分组聚合求出每一名同学的平均成绩 并筛选出平均成绩大于85的s_id
SELECT
s_id,
AVG(s_score) as s_avg_score
FROM
score
GROUP BY s_id
HAVING s_avg_score >=85
-- 第三步:关联学生表 获取学生姓名
select 
a.s_name,
b.*
from  student a RIGHT JOIN 
(SELECT
s_id,
AVG(s_score) as s_avg_score
FROM
score
GROUP BY s_id
HAVING s_avg_score >=85) b 
on a.s_id = b.s_id
```
### 自己写的
```sql
select t2.s_id,t2.s_name,avg(s_score) '平均成绩' from score t1  
                    join student t2 on t1.s_id = t2.s_id  
group by s_id  
having avg(s_score) >= 85;
```

![](imgs/Pasted%20image%2020230923110637.png)

2,查询课程名称为"数学"，且分数低于60的学生姓名和分数

```mysql
-- 查询课程名称为"数学"，且分数低于60的学生姓名和分数 
-- 分析题目关键字 数学  低于60分  学生姓名 
-- 第一步:锁定表 课程表  成绩表 学生表
-- 第二步: 现获取 课程名为数学对应的s_id 和分数
select
b.s_id,
a.c_name,
b.s_score
FROM
course a LEFT JOIN score b
on a.c_id = b.c_id
where a.c_name = "数学" AND b.s_score < 60
-- 第三步:关联学生表,获取学生姓名
select
a.s_name,
b.*
from student a RIGHT JOIN 
(select
b.s_id,
a.c_name,
b.s_score
FROM
course a LEFT JOIN score b
on a.c_id = b.c_id
where a.c_name = "数学" AND b.s_score < 60) b
ON a.s_id = b.s_id
```
### 自己写的
```sql
select t2.s_id,t2.s_name,t3.c_name,t1.s_score from score t1  
join student t2 on t1.s_id = t2.s_id  
join course t3 on t1.c_id = t3.c_id  
where t3.c_name = '数学' and t1.s_score < 60;
```
![](imgs/Pasted%20image%2020230923110933.png)

3 查询所有学生的课程及分数情况

```mysql
-- 查询所有学生的课程及分数情况
-- 分析题目关键字 所有学生 课程 分数
-- 第一步:锁定表 学生表 成绩表
-- 第二步:学生表左关联成绩表
select 
*
from student a LEFT JOIN score b 
on a.s_id = b.s_id
```
### 自己写的
```sql
select t1.*,t2.s_score '01语文',t3.s_score '02数学',t4.s_score '03英语' from student t1  
left join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'  
left join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'  
left join score t4 on t1.s_id = t4.s_id and t4.c_id = '03';
```
![](imgs/Pasted%20image%2020230923111450.png)

4 查询任何一门课程成绩在70分以上的姓名、课程名称和分数 

```mysql
-- 查询任何一门课程成绩在70分以上的姓名、课程名称和分数
-- 分析题目关键字 70分以上 学生姓名 课程姓名 分数
-- 第一步:锁定表 学生表 课程表 成绩表
-- 第二步: 课程分数大于70 的 课程名名称
select
a.s_id,
b.c_name,
a.s_score
from 
score a LEFT  JOIN course b
ON a.c_id = b.c_id
where 
s_score > 70
-- 第三步:关联学生表获取学生姓名
select
a.s_name, 
b.*
from student a RIGHT JOIN 
(select
a.s_id,
b.c_name,
a.s_score
from 
score a INNER JOIN course b
ON a.c_id = b.c_id
AND
s_score > 70) b
on a.s_id = b.s_id
```
答案的查询出来的效果如下图所示: 
![](imgs/Pasted%20image%2020230923112012.png)
### 自己写的
```sql
select t1.s_id, t1.s_name, t3.c_name, t2.s_score  
from student t1  
         join score t2 on t1.s_id = t2.s_id  
         join course t3 on t2.c_id = t3.c_id  
where s_score > 70;
```

![](imgs/Pasted%20image%2020230923114914.png)

5,查询不及格的课程 
感觉这个题表达的意思不是很清晰,难道不应该是有不及格的课程的学生信息以及不及格的课程的信息吗
![](imgs/Pasted%20image%2020230923112128.png)
```mysql
-- 查询不及格的课程
-- 分析题目关键字 不及格 课程信息
-- 第一步:锁定表 成绩表 课程表
-- 第二步:筛选出分数小于60的课程c_id
select 
distinct(c_id)
from score
where s_score <60
-- 第三步:使用子查询,获取课程信息
select 
*
from course
where c_id in(select 
distinct(c_id)
from score
where s_score <60)
```
### 自己写的
```sql
select t1.s_id, t1.s_name, t3.c_name, t2.s_score  
from student t1  
         join score t2 on t1.s_id = t2.s_id  
         join course t3 on t2.c_id = t3.c_id  
where s_score < 60;
```
![](imgs/Pasted%20image%2020230923115223.png)
## day07

1查询课程编号为01且课程成绩在80分以上的学生的学号和姓名；

```
-- 查询课程编号为01且课程成绩在80分以上的学生的学号和姓名；
-- 分析题目关键字 课程编号 成绩 学生学号 学生姓名
-- 第一步:锁定表 学生表 成绩表
-- 第二步:
select 
a.*,
b.s_name
from score a LEFT JOIN student b
on a.s_id = b.s_id
where a.c_id = "01" and a.s_score >=80
```
### 自己写的
```sql
select t1.s_id,t1.s_name from student t1  
join score t2 on t1.s_id = t2.s_id  
where c_id = '01' and s_score >= 80;
```
![](imgs/Pasted%20image%2020230923115442.png)
2 求每门课程的学生人数

```
-- 求每门课程的学生人数
-- 分析题目关键字 每门课程 人数
-- 第一步:锁定表 成绩表
-- 第二步:使用聚合函数
select 
c_id,
count(*) "人数"
FROM
score
GROUP BY c_id
```
### 自己写的
```sql
select t2.c_name,count(1) '学生人数' from score t1  
join course t2 on t1.c_id = t2.c_id  
group by t1.c_id  
order by t1.c_id;
```

![](imgs/Pasted%20image%2020230923115723.png)
3 假设成绩不重复,查询选修"张三"老师所授课程的学生中，成绩最高的学生信息及其成绩

```
-- 假设成绩不重复,查询选修"张三"老师所授课程的学生中，成绩最高的学生信息及其成绩
-- 分析题目关键字  成绩不重复 张三老师所授课程的学生     成绩最高   成绩
-- 第一步:锁定表 教师表 课程表 成绩表 学生表
-- 第二步: 关联四张表
SELECT
b.*,
s_score,
t_name
from score a LEFT JOIN student b on a.s_id = b.s_id
LEFT JOIN course c ON a.c_id = c.c_id 
LEFT JOIN teacher d on c.t_id = d.t_id
-- 第三步:添加筛选条件为 张三老师
SELECT
b.*,
s_score,
t_name
from score a LEFT JOIN student b on a.s_id = b.s_id
LEFT JOIN course c ON a.c_id = c.c_id 
LEFT JOIN teacher d on c.t_id = d.t_id
WHERE d.t_name  = "张三" 
-- 第四步 按照分数排序,只显示第一条记录(limit)
SELECT
b.*,
s_score,
t_name
from score a LEFT JOIN student b on a.s_id = b.s_id
LEFT JOIN course c ON a.c_id = c.c_id 
LEFT JOIN teacher d on c.t_id = d.t_id
WHERE d.t_name  = "张三" 
ORDER BY s_score desc limit 1
```

3 假设成绩有重复,查询选修"张三"老师所授课程的学生中，成绩最高的学生信息及其成绩
```
-- 假设成绩有重复,查询选修"张三"老师所授课程的学生中，成绩最高的学生信息及其成绩
-- 分析题目关键字  成绩重复 张三老师所授课程的学生     成绩最高   成绩
-- 第一步:锁定表 教师表 课程表 成绩表 学生表
-- 第二步:添加筛选条件为 张三老师
SELECT
b.*,
s_score,
t_name
from score a LEFT JOIN student b on a.s_id = b.s_id
LEFT JOIN course c ON a.c_id = c.c_id 
LEFT JOIN teacher d on c.t_id = d.t_id
WHERE d.t_name  = "张三" 
-- 第三步 使用dense_rank()进行排名
SELECT
b.*,
s_score,
t_name,
dense_rank() over (order by s_score desc) as score_rank
from score a LEFT JOIN student b on a.s_id = b.s_id
LEFT JOIN course c ON a.c_id = c.c_id 
LEFT JOIN teacher d on c.t_id = d.t_id
WHERE d.t_name  = "张三" 
-- 第四步 筛选出第一名
select
* from 
(SELECT
b.*,
s_score,
t_name,
dense_rank() over (order by s_score desc) as score_rank
from score a LEFT JOIN student b on a.s_id = b.s_id
LEFT JOIN course c ON a.c_id = c.c_id 
LEFT JOIN teacher d on c.t_id = d.t_id
WHERE d.t_name  = "张三" ) a 
where score_rank = 1
```
### 自己写的
```sql
# 方法1 最麻烦两次子查询,子查询里面套子查询  
select tt.* from score ss  
            join student  tt on ss.s_id = tt.s_id  
where c_id = (  
    select c_id from course t1  
                join teacher t2 on t1.t_id = t2.t_id  
                where t2.t_name = '张三'  
    ) and s_score = (select max(s_score) from score  
where c_id = (  
    select c_id from course t1  
                join teacher t2 on t1.t_id = t2.t_id  
                where t2.t_name = '张三'  
    ));  
# 方法2 稍微简单一点,但是还是两次子查询,不是很推荐  
select t4.*,t1.s_score from score t1  
join (  
    select c_id from course t1  
                join teacher t2 on t1.t_id = t2.t_id  
                where t2.t_name = '张三'  
    ) t2 on t1.c_id = t2.c_id  
join (select c_id,max(s_score) maxScore from score group by c_id) t3 on t1.s_score = t3.maxScore and t2.c_id = t3.c_id  
join student t4 on t1.s_id = t4.s_id;  
# 方法3 通过窗口函数的方式来进行排序查询  
select t4.*,t3.s_score from student t4  
join (  
    select s_id,t1.s_score,dense_rank() over (partition by t1.c_id order by s_score desc) maxScore from score t1  
join course t2 on t1.c_id = t2.c_id  
join teacher t3 on t2.t_id = t3.t_id  
where t3.t_name = '张三'  
) t3 on t4.s_id = t3.s_id  
where t3.maxScore = 1;
```

![](imgs/Pasted%20image%2020230923141806.png)
4查询不同课程成绩相同的学生的学生编号、课程编号、学生成绩
```
-- 查询不同课程成绩相同的学生的学生编号、课程编号、学生成绩
-- 分析题目关键字 不同课程 成绩相同
-- 第一步:锁定表 成绩表
-- 第二步:自连接查询成绩表 链接条件是学生编号相同  课程编号不同 成绩相同
select
a.*
from
score a INNER JOIN score b
on a.s_id = b.s_id AND a.c_id != b.c_id AND a.s_score = b.s_score
-- 第三步:去重
select
DISTINCT a.*
from
score a INNER JOIN score b
on a.s_id = b.s_id AND a.c_id != b.c_id AND a.s_score = b.s_score
```
### 自己写的
这个题的题目的意思应该说的是: 
每一个学生自己的科目不同,但是成绩相同
所以需要比较的条件就是 s_id相同,c_id不同,最后s_score需要相同
```sql
select distinct t1.* from score t1  
join score t2 on t1.s_score = t2.s_score and t1.c_id != t2.c_id and t1.s_id = t2.s_id ;
```

![](imgs/Pasted%20image%2020230923142913.png)
5 查询每门课程 成绩最好的前两名
```
-- 查询每门课程 成绩最好的前两名
-- 分析题目关键字 每门课程  成绩最好前两名 
-- 第一步:锁定表  成绩表
-- 第二步: 典型的排名问题 在mysql8后 可以使用窗口函数轻松解决
select
*,
dense_rank() over(PARTITION by c_id order by s_score desc) score_rank
from
score
-- 第三步:筛选出前两名 score_rank 等于1 和 2的记录
SELECT
*
from (select
*,
dense_rank() over(PARTITION by c_id order by s_score desc) score_rank
from
score) a WHERE score_rank<=2
```
### 自己写的
答案的查询的时间为: -- 37ms 40ms 35ms 45ms 47ms
自己写的查询的时间为: -- 35ms 43ms 41ms 42ms 47ms
```sql
select t1.*,t2.c_id,t2.s_score,rankScore '排名' from student t1  
join (select s_id,s_score,c_id,dense_rank() over (partition by c_id order by s_score desc) rankScore  
      from score) t2 on t1.s_id = t2.s_id  
where rankScore <= 2;
```
![](imgs/Pasted%20image%2020230923143657.png)
## day08

1,统计每门课程的学生选修人数（超过5人的课程才统计）
```
-- 统计每门课程的学生选修人数（超过5人的课程才统计）
-- 分析题目关键字 每门课程 选修人数 超过5人才统计
-- 第一步:锁定表 成绩表
-- 第二步:分组聚合 求每门课程的选修人数
select
c_id,
COUNT(*) ct
from score
GROUP BY c_id
-- 第三步: 筛选出选修人数大于5的记录
select
c_id,
COUNT(*) ct
from score
GROUP BY c_id
HAVING ct>5
```
### 自己写的
```sql
select t1.c_id,count(1) from score t1  
                     join course t2 on t1.c_id = t2.c_id  
group by t1.c_id  
having count(1) > 5;
```
![](imgs/Pasted%20image%2020230923144448.png)

2,检索至少选修两门课程的学生学号 
```
-- 检索至少选修两门课程的学生学号 
-- 分析题目关键字 至少  选修两门 学生学号
-- 第一步:锁定表 成绩表
-- 第二步: 分组聚合 查询 每个学生选修的课程数
SELECT
s_id,
count(*)
from score
GROUP BY s_id
-- 第三步: 添加筛选条件
SELECT
s_id,
count(*) ct
from score
GROUP BY s_id
HAVING ct>=2
```

### 自己写的
```sql
select t2.*,count(1) '选修课程数量' from score t1  
join student t2 on t1.s_id = t2.s_id  
                group by t1.s_id  
having count(1) >= 2;
```

![](imgs/Pasted%20image%2020230923144739.png)
3查询选修了全部课程的学生信息

```
-- 查询选修了全部课程的学生信息
-- 分析题目关键字 选修全部课程 学生信息
-- 第一步:锁定表 成绩表 学生表  课程表(统计有几门课程)
-- 第二步:查询出课程表的总课程数
select count(1) from course
-- 第三步:获取每名学生选修课程的总数
select
s_id,
count(1) ct 
from score
GROUP BY s_id
-- 第四步:筛选出学习了3门课程的学生sid
select
s_id,
count(1) ct 
from score
GROUP BY s_id
HAVING ct = (select count(1) from course)
-- 第五步:关联学生表,获取学生信息
select
*
from student a RIGHT JOIN 
(select
s_id,
count(1) ct 
from score
GROUP BY s_id
HAVING ct = (select count(1) from course)) b
ON a.s_id = b.s_id
```

### 自己写的
```sql
select t2.*,count(1) '选修课程数量' from score t1  
join student t2 on t1.s_id = t2.s_id  
                group by t1.s_id  
having count(1) = (select count(1) from course);
```
![](imgs/Pasted%20image%2020230923144922.png)
4 查询各学生的年龄 只按年份来算

```
-- 查询各学生的年龄 只按年份来算
-- 分析题目关键字 年龄  按年份计算
-- 第一步:锁定表 学生表
-- 第二步:使用now() year()函数计算年龄
select year('2022-01-01 00:00:00')
select now()
select 
* ,
(year(now())-year(s_brith)) "年龄"
from student 
```

### 自己写的
查询出来的结果和答案上的是一样的
```sql
select *,(left(now(),4) - left(s_brith,4)) '年龄' from student;
```

![](imgs/Pasted%20image%2020230923145305.png)

5 按照出生日期来算，当前月日 < 出生年月的月日则，年龄减一

```
-- 按照出生日期来算，当前月日 < 出生年月的月日则，年龄减一
-- 分析题目关键字 年龄  当前月日<出生年月的月日 则年龄减一
-- 第一步:锁定表 学生表
-- 第二步:使用now() timestampdiff()函数计算年龄
-- TIMESTAMPDIFF(unit,datetime_expr1,datetime_expr2)  用来专门解决日期相减问题的函数
    -- 用法 3个参数  expr2-expr1  第一个参数返回值的格式 eg:如果是year 表示两个日期相差的年份 如果是day 表示
    -- 两个日期相差的天数 hour 表示相差的小时数
select TIMESTAMPDIFF(year, '2020-02-01 00:00:00','2022-01-01 00:00:00')
select TIMESTAMPDIFF(year, '2020-02-01 00:00:00','2022-03-01 00:00:00')
select TIMESTAMPDIFF(day, '2020-02-01 00:00:00','2022-03-01 00:00:00')
select TIMESTAMPDIFF(hour, '2020-02-01 00:00:00','2022-03-01 00:00:00')
select 
* ,
TIMESTAMPDIFF(YEAR,s_brith,NOW()) "年龄"
from student 
```

![](imgs/Pasted%20image%2020230923151004.png)
## day09

1查询本周过生日的学生
```
-- 查询本周过生日的学生
-- 分析题目关键字 本周过生日:当前的日期所处的周数 等于 出生日期所对应的周数 
-- 第一步:锁定表 学生表
-- 第二步:使用week()函数查询
select week('2020-02-01 00:00:00')
select
*,
WEEK(s_brith),
week('2020-05-20 00:00:00')
from student
where week(s_brith)=week('2020-05-20 00:00:00')
```

2 查询下周过生日的学生
```
-- 查询下周过生日的学生
-- 分析题目关键字 本周过生日:当前的日期所处的周数 等于 出生日期所对应的周数 
-- 第一步:锁定表 学生表
-- 第二步:使用week()函数查询
select week('2020-02-01 00:00:00')
select
*,
WEEK(s_brith),
week('2020-05-20 00:00:00')+1
from student
where week(s_brith)=week('2020-05-20 00:00:00')+1
```

3 查询本月过生日的学生
```
-- 查询本月过生日的学生
-- 分析题目关键字 月份 本月过生日:当前的日期所处的月份 等于 出生日期所对应的月份 
-- 第一步:锁定表 学生表
-- 第二步:使用month()函数查询
select MONTH('2020-02-01 00:00:00')
select
*,
WEEK(s_brith),
MONTH(NOW())
from student
where MONTH(s_brith)=MONTH(NOW())
```

4 查询下月过生日的学生
```
-- 查询本月过生日的学生
-- 分析题目关键字 月份 本月过生日:当前的日期所处的月份 等于 出生日期所对应的月份 
-- 第一步:锁定表 学生表
-- 第二步:使用month()函数查询
select MONTH('2020-02-01 00:00:00')
select
*,
WEEK(s_brith),
MONTH(NOW())+1
from student
where MONTH(s_brith)=MONTH(NOW())+1
```

### 自己写的
```sql
select *,week(s_brith) '生日所在的周',week(now()) '当前的周' from student where week(s_brith) = week(now());  
# 2 查询下周过生日的学生  
select *,week(s_brith) '生日所在的周',week(now()) '当前的周' from student where week(s_brith) = week(now()) + 1;  
# 3 查询本月过生日的学生  
select *,month(s_brith) '生日所在的周',month(now()) '当前的周' from student where month(s_brith) = month(now());  
# 4 查询下月过生日的学生  
select *,month(s_brith) '生日所在的周',month(now()) '当前的周' from student where month(s_brith) = month(now()) + 1;
```
## 所有的自己写的答案
```sql
########################day1##########################  
-- 1 查询"01"课程比"02"课程成绩高的学生的信息及课程分数  
/*SELECT *  
FROM (SELECT t1.*, t3.c_name, t2.s_score, t2.c_id, rank() over w 'score', row_number() over w 'rrow'  
      FROM student t1               JOIN score t2                    ON t1.s_id = t2.s_id AND c_id IN ('01', '02')               JOIN course t3 ON t2.c_id = t3.c_id      window w AS (PARTITION BY t2.s_id ORDER BY t2.s_score DESC)) AS XWHERE x.rrow = 1  
  AND x.c_id = '01';*/  
SELECT t1.*, t2.c_id, t2.s_score  
FROM student t1  
         JOIN score t2 ON t1.s_id = t2.s_id AND t2.c_id = '01'  
         JOIN score t3 ON t1.s_id = t3.s_id AND t3.c_id = '02'  
WHERE t2.s_score > t3.s_score;  
  
-- 2查询平均成绩大于等于60分的同学的学生编号和学生姓名和平均成绩  
-- 先查询平均成绩 分组和聚合函数  
SELECT t1.s_id, t2.s_name, AVG(s_score) 'avageScore'  
FROM score t1  
         JOIN student t2 ON t1.s_id = t2.s_id  
GROUP BY s_id  
HAVING avageScore >= 60;  
  
-- 3 查询在score表存在成绩的学生信息  
SELECT DISTINCT t1.*  
FROM student t1  
         RIGHT JOIN score t2 ON t1.s_id = t2.`s_id`;  
  
  
-- 4查询所有同学的学生编号、学生姓名、选课总数、所有课程的总成绩  
-- 只能从score表里面获取到相对应的信息了  
select t2.s_id, t2.s_name, count(t1.c_id) '选课总数', sum(t1.s_score) '所有课程总成绩'  
from score t1  
         right join student t2 on t1.s_id = t2.s_id  
group by t2.s_id;  
  
-- 4.1 查询有成绩的学生信息 (这个题目感觉和上面的第3题一样的啊)  
  
-- 5 查询"李"姓老师的数量  
select count(*)  
from teacher  
where t_name like '李%';  
  
########################day1##########################  
  
########################day2##########################  
-- 1,查询学过 张三 老师授课的同学的信息  
select t4.*, t3.c_id, t3.s_score, t1.t_name  
from teacher t1  
         join course t2 on t1.t_id = t2.t_id  
         join score t3 on t2.c_id = t3.c_id  
         join student t4 on t4.s_id = t3.s_id  
where t1.t_name = '张三';  
  
-- 2 查询没有学全所有课程的同学的信息  
-- 思路就是在score里面分组后统计课程的总数,小于3的同学的信息  
select t2.*  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
group by t1.s_id  
having count(c_id) < (select count(1) from course);  
  
-- 3 查询至少有一门课与学号为"01"的同学所学相同的同学的信息  
/*select t1.*, t2.c_id, t3.c_id, t4.c_id  
from student t1  
         left join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'         left join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'         left join score t4 on t1.s_id = t4.s_id and t4.c_id = '03'where (t2.c_id in (select c_id from score where s_id = '01') or  
       t3.c_id in (select c_id from score where s_id = '01') or       t4.c_id in (select c_id from score where s_id = '01'))  and t1.s_id <> '01';*/select distinct t1.*  
from student t1  
         join (select *  
               from score  
               where c_id in (select c_id from score where s_id = '01')) t2 on t1.s_id = t2.s_id and t1.s_id <> '01';  
  
-- 4 查询和"01"号的同学学习的课程完全相同的其他同学的信息  
-- 方法1  
select t1.*, t2.c_id, t3.c_id, t4.c_id  
from student t1  
         left join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'  
         left join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'  
         left join score t4 on t1.s_id = t4.s_id and t4.c_id = '03'  
where (t2.c_id in (select c_id from score where s_id = '01') and  
       t3.c_id in (select c_id from score where s_id = '01') and  
       t4.c_id in (select c_id from score where s_id = '01'))  
  and t1.s_id <> '01';  
-- 方法2  
-- 把每位同学的cid全部拼接起来,然后查询相等的,最后在进行联查student里面的s_id  
  
select t2.*  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
group by t1.s_id  
having group_concat(c_id) =  
       (select group_concat(c_id)  
        from score  
        where s_id = '01'  
        group by s_id)  
   and t1.s_id <> '01';  
  
-- 5 查询没学过"张三"老师授课的任一门课程的同学信息  
-- 先获取张三老师所教授的课程  
select c_id  
from course t1  
         join teacher t2 on t1.t_id = t2.t_id  
where t2.t_name = '张三';  
-- 再来查询哪个学生没有学习02的这门课程  
  
  
select distinct t4.*  
from score t3  
         join student t4 on t3.s_id = t4.s_id  
    and t3.c_id not in ();  
  
select *  
from student t4  
where t4.s_id not in (select t1.s_id  
                      from score t1  
                               left join course t2 on t1.c_id = t2.c_id  
                               join teacher t3 on t2.t_id = t3.t_id  
                      where t3.t_name = '张三');  
  
########################day2##########################  
  
########################day3##########################  
-- 1,查询两门及其以上不及格课程的同学的学号，姓名及其平均成绩  
select t2.*, avg(s_score)  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
where s_score < 60  
group by s_id  
having count(1) >= 2;  
  
-- 2 检索"01"课程分数小于60，按分数降序排列的学生信息  
select t2.*, t1.s_score  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
where s_score < 60  
  and c_id = '01'  
order by s_score desc;  
  
-- 3 按平均成绩从高到低显示所有学生的所有课程的成绩以及平均成绩  
select t5.*, t2.s_score '语文', t3.s_score '数学', t4.s_score '英语', avg(t1.s_score) averageScore  
from score t1  
         join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'  
         join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'  
         join score t4 on t1.s_id = t4.s_id and t4.c_id = '03'  
         join student t5 on t1.s_id = t5.s_id  
group by t1.s_id  
order by averageScore desc;  
  
-- 4 查询各科成绩最高分、最低分和平均分：  
-- 以如下形式显示：课程ID，课程name，最高分，最低分，平均分，及格率，中等率，优良率，优秀率  
-- 及格为>=60，中等为：70-80，优良为：80-90，优秀为：>=90  
-- 要求输出课程号和选修人数,查询结果按人数排序排列,若人数相同,按课程号升序排列  
  
# CASE 表示函数开始，END 表示函数结束。如果 condition1 成立，则返回 result1,# 如果 condition2 成立，则返回 result2，当全部不成立则返回 result，  
# 而当有一个成立之后，后面的就不执行了。  
# case when s_score>=70 AND s_score<80 then 1 else 0 end  
# 符合条件的则记为1 也就说统计1出现的次数就是该分数段出现的此处  
select t1.c_id                                                                    '课程ID',  
       t2.c_name                                                                  '课程name',  
       count(1)                                                                   '选修人数',  
       max(t1.s_score)                                                            '最高分',  
       min(t1.s_score)                                                            '最低分',  
       avg(s_score)                                                               '平均分',  
       sum(case when s_score >= 60 then 1 else 0 end) / count(1)                  '及格率',  
       sum(case when s_score >= 70 and s_score < 80 then 1 else 0 end) / count(1) '中等率',  
       sum(case when s_score >= 80 and s_score < 90 then 1 else 0 end) / count(1) '优良率',  
       sum(case when s_score >= 90 then 1 else 0 end) / count(1)                  '优秀率'  
from score t1  
         join course t2 on t1.c_id = t2.c_id  
group by t1.c_id  
order by count(1), t1.c_id;  
  
  
# 5 按各科成绩进行排序，并显示排名,score重复时,也继续排名  
select *, dense_rank() over w  
from score t1  
window w as (partition by c_id order by s_score);  
########################day3##########################  
  
########################day4##########################  
# 1,查询学生的总成绩并进行排名 总分重复时保留名词空缺  
select *, dense_rank() over w  
from (select s_id, sum(s_score) total  
      from score  
      group by s_id) as tt  
window w as (order by total desc);  
  
# 2统计各科成绩各分数段人数：课程编号,课程名称,[100-85],[85-70],[70-60],[0-60]及所占百分比  
select t1.c_id                                                                                   '课程编号',  
       t2.c_name,  
       concat(sum(case when s_score >= 85 and s_score <= 100 then 1 else 0 end) / count(1), '%') '[100-85]',  
       concat(sum(case when s_score >= 70 and s_score < 85 then 1 else 0 end) / count(1), '%')   '[85-70]',  
       concat(sum(case when s_score >= 60 and s_score < 70 then 1 else 0 end) / count(1), '%')   '[70-60]',  
       concat(sum(case when s_score >= 0 and s_score < 60 then 1 else 0 end) / count(1), '%')    '[0-60]'  
from score t1  
         join course t2 on t1.c_id = t2.c_id  
group by t1.c_id;  
# 3 查询各科成绩前三名的记录  
select *  
from (select *, rank() over (partition by c_id order by s_score) tt  
      from score) as dd  
where tt <= 3;  
  
# 4,查询每门课程被选修的学生数  
select t1.c_id, t2.c_name, count(*) '选修的人数'  
from score t1  
         join course t2 on t1.c_id = t2.c_id  
group by c_id;  
  
# 5查询出只有两门课程的全部学生的学号和姓名  
select t2.s_id, t2.s_name  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
group by t1.s_id  
having count(1) = 2;  
########################day4##########################  
  
########################day5##########################  
# 1,查询男生、女生人数  
select s_sex, count(1)  
from student  
group by s_sex;  
# 2查询名字中含有"风"字的学生信息  
select *  
from student  
where s_name like '%风%';  
# 3查询同名同性学生名单，并统计同名人数  
select t1.s_name, count(1)  
from student t1  
         join student t2 on t1.s_name = t2.s_name and t1.s_sex = t2.s_sex and t1.s_id != t2.s_id  
group by t1.s_name;  
# 4查询1990年出生的学生名单  
select *  
from student  
where s_brith like '1990%';  
# 5查询每门课程的平均成绩，结果按平均成绩降序排列，平均成绩相同时，按课程编号升序排列  
select c_id, avg(s_score)  
from score  
group by c_id  
order by avg(s_score) desc, c_id asc;  
########################day5##########################  
  
########################day6##########################  
# 1,查询平均成绩大于等于85的所有学生的学号、姓名和平均成绩  
select t2.s_id, t2.s_name, avg(s_score) '平均成绩'  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
group by s_id  
having avg(s_score) >= 85;  
# 2,查询课程名称为"数学"，且分数低于60的学生姓名和分数  
select t2.s_id, t2.s_name, t3.c_name, t1.s_score  
from score t1  
         join student t2 on t1.s_id = t2.s_id  
         join course t3 on t1.c_id = t3.c_id  
where t3.c_name = '数学'  
  and t1.s_score < 60;  
# 3 查询所有学生的课程及分数情况  
-- 答案里面没有对学生进行聚合  
select t1.*, t2.s_score '01语文', t3.s_score '02数学', t4.s_score '03英语'  
from student t1  
         left join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'  
         left join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'  
         left join score t4 on t1.s_id = t4.s_id and t4.c_id = '03';  
# 4 查询任何一门课程成绩在70分以上的姓名、课程名称和分数  
/*select t1.s_id, t1.s_name, group_concat(s_score order by c_id) '语文,数学,英语'  
from student t1  
         join score t2 on t1.s_id = t2.s_idwhere s_score > 70  
group by t1.s_id;*/  
select t1.s_id,  
       t1.s_name,  
       if(t2.s_score > 70, t2.s_score, null) '语文',  
       if(t3.s_score > 70, t3.s_score, null) '数学',  
       if(t4.s_score > 70, t4.s_score, null) '英语'  
from student t1  
         join score t2 on t1.s_id = t2.s_id and t2.c_id = '01'  
         join score t3 on t1.s_id = t3.s_id and t3.c_id = '02'  
         join score t4 on t1.s_id = t4.s_id and t4.c_id = '03'  
group by t1.s_id  
having 语文 is not null  
   and 数学 is not null  
   and 英语 is not null;  
  
  
  
select t1.s_id, t1.s_name, t3.c_name, t2.s_score  
from student t1  
         join score t2 on t1.s_id = t2.s_id  
         join course t3 on t2.c_id = t3.c_id  
where s_score > 70;  
# 5查询有不及格的课程的学生的信息以及不及格的课程的信息  
select t1.s_id, t1.s_name, t3.c_name, t2.s_score  
from student t1  
         join score t2 on t1.s_id = t2.s_id  
         join course t3 on t2.c_id = t3.c_id  
where s_score < 60;  
########################day6##########################  
  
########################day7##########################  
# 1查询课程编号为01且课程成绩在80分以上的学生的学号和姓名；  
select t1.s_id,t1.s_name from student t1  
join score t2 on t1.s_id = t2.s_id  
where c_id = '01' and s_score >= 80;  
  
# 2 求每门课程的学生人数  
select t2.c_name,count(1) '学生人数' from score t1  
join course t2 on t1.c_id = t2.c_id  
group by t1.c_id  
order by t1.c_id;  
# 3 假设成绩不重复,查询选修"张三"老师所授课程的学生中，成绩最高的学生信息及其成绩  
# 方法1 最麻烦两次子查询,子查询里面套子查询  
select tt.* from score ss  
            join student  tt on ss.s_id = tt.s_id  
where c_id = (  
    select c_id from course t1  
                join teacher t2 on t1.t_id = t2.t_id  
                where t2.t_name = '张三'  
    ) and s_score = (select max(s_score) from score  
where c_id = (  
    select c_id from course t1  
                join teacher t2 on t1.t_id = t2.t_id  
                where t2.t_name = '张三'  
    ));  
# 方法2 稍微简单一点,但是还是两次子查询,不是很推荐  
select t4.*,t1.s_score from score t1  
join (  
    select c_id from course t1  
                join teacher t2 on t1.t_id = t2.t_id  
                where t2.t_name = '张三'  
    ) t2 on t1.c_id = t2.c_id  
join (select c_id,max(s_score) maxScore from score group by c_id) t3 on t1.s_score = t3.maxScore and t2.c_id = t3.c_id  
join student t4 on t1.s_id = t4.s_id;  
# 方法3 通过窗口函数的方式来进行排序查询  
select t4.*,t3.s_score from student t4  
join (  
    select s_id,t1.s_score,dense_rank() over (partition by t1.c_id order by s_score desc) maxScore from score t1  
join course t2 on t1.c_id = t2.c_id  
join teacher t3 on t2.t_id = t3.t_id  
where t3.t_name = '张三'  
) t3 on t4.s_id = t3.s_id  
where t3.maxScore = 1;  
# 4查询不同课程成绩相同的学生(值得是每个学生自己的不同课程成绩相同)的学生编号、课程编号、学生成绩  
  
select distinct t1.* from score t1  
join score t2 on t1.s_score = t2.s_score and t1.c_id != t2.c_id and t1.s_id = t2.s_id ;  
# 5 查询每门课程 成绩最好的前两名  
-- 使用窗口函数然后在过滤一下,需要跳过排名吗,不需要跳过排名使用desen_rank这个窗口函数应该就够了  
select t1.*,t2.c_id,t2.s_score,rankScore '排名' from student t1  
join (select s_id,s_score,c_id,dense_rank() over (partition by c_id order by s_score desc) rankScore  
      from score) t2 on t1.s_id = t2.s_id  
where rankScore <= 2;  
-- 35ms 43ms 41ms 42ms 47ms  
########################day7##########################  
# 1,统计每门课程的学生选修人数（超过5人的课程才统计）  
select t1.c_id,count(1) from score t1  
                     join course t2 on t1.c_id = t2.c_id  
group by t1.c_id  
having count(1) > 5;  
# 2,检索至少选修两门课程的学生学号  
select t2.*,count(1) '选修课程数量' from score t1  
join student t2 on t1.s_id = t2.s_id  
                group by t1.s_id  
having count(1) >= 2;  
  
# 3查询选修了全部课程的学生信息  
select t2.*,count(1) '选修课程数量' from score t1  
join student t2 on t1.s_id = t2.s_id  
                group by t1.s_id  
having count(1) = (select count(1) from course);  
# 4 查询各学生的年龄 只按年份来算  
select *,(left(now(),4) - left(s_brith,4)) '年龄' from student;  
select *,(year(now()) - year(s_brith)) '年龄' from student;  
# 5 按照出生日期来算，当前月日 < 出生年月的月日则，年龄减一  
select *,(year(now()) - year(s_brith)) '真实年龄',if(right(now(),5) < right(s_brith,5),year(now()) - year(s_brith) - 1,year(now()) - year(s_brith) + 1) '非真实年龄' from student  
########################day8##########################  
select TIMESTAMPDIFF(year, '2020-02-01 00:00:00','2022-01-01 00:00:00')  
select TIMESTAMPDIFF(year, '2020-02-01 00:00:00','2022-03-01 00:00:00')  
select TIMESTAMPDIFF(day, '2020-02-01 00:00:00','2022-03-01 00:00:00')  
select TIMESTAMPDIFF(hour, '2020-02-01 00:00:00','2022-03-01 00:00:00')  
  
select  
* ,  
TIMESTAMPDIFF(YEAR,s_brith,NOW()) "年龄"  
from student  
########################day8##########################  
  
########################day9##########################  
# 1查询本周过生日的学生  
select week(now());  
  
select *,week(s_brith) '生日所在的周',week(now()) '当前的周' from student where week(s_brith) = week(now());  
# 2 查询下周过生日的学生  
select *,week(s_brith) '生日所在的周',week(now()) '当前的周' from student where week(s_brith) = week(now()) + 1;  
# 3 查询本月过生日的学生  
select *,month(s_brith) '生日所在的周',month(now()) '当前的周' from student where month(s_brith) = month(now());  
# 4 查询下月过生日的学生  
select *,month(s_brith) '生日所在的周',month(now()) '当前的周' from student where month(s_brith) = month(now()) + 1;  
########################day9##########################
```