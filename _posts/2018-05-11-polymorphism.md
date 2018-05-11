---
layout: post
title: "2018-05-11周会"
date: 2018-05-11 23:22:20 +0800
description:   # Add post description (optional)
img:  2018-05-11.jpg # Add image post (optional)
list_img:  2018-05-11-list.jpg
tags: ['polymorphism']# add tag
---
## 上周codereview执行结果回馈


## 绩效追踪
> 工作的时间做工作相关的事情

|  姓名  | 占当月 |
|--------|------|
| 余林   |27.50%|
| 何安平 |27.50%|
| 陈喆   |32.35%|
| 李彬   |30.41%|
| 罗鑫   |30.61%|


## 分享
> 遇到大坑小坑常做记录，周会分享，大家学习，共同进步

**多态**
* 多态是指在面向对象中能够根据使用类的上下文来重新定义或改变类的性质和行为；
* 多态可以理解成一个事物多种形态，多种表现形式；
* 一个操作作用于不同的类的实例，将产生不同的执行结果；
* 父类的同一个方法，在不同的子类中有不同的实现；

```php
<?php
/**
* 数据库基类
*/
interface SqlDri {
	public function connect();
}

/**
* mysql子类
*/
class MysqlObj implements SqlDri {
	public function connect() {
		print "mysql connect success!";
	}
}

/**
* mssql子类
*/
class MssqlObj implements SqlDri {
	public function connect() {
		print "mssql connect success!";
	}
}


/**
* 多态入口
*/
class SqlEnt {
	public function connect(SqlDri $SqlDri) {
		$SqlDri->connect();
	}
}

$SqlEnt = new SqlEnt();
$SqlEnt->connect(new MysqlObj());
$SqlEnt->connect(new MssqlObj());
?>
```


## 项目进度
> 会前整理好本周的工作，体现出可实施性。

* EDK 5月13日制定 通测测试时间
* FR 周一上线药妆

## 周会记录


## 备注
* 讨论 如何用框架使用的 `OR WHERE` VS `$this->db->or_where`


