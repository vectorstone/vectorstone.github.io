---
layout:     post
title:      gitignore文件失效
subtitle:   添加gitignore文件失效的原因
date:       2023-09-03
author:     Gavin
header-img: img/post-bg-cook.jpg
catalog: true
tags:
    - Git
---
https://lanxin1234.github.io/gitbookNote/git/gitignoreNOtinvaild.html
#### 添加gitignore文件失效的原因

###### 1. 如果在项目开始的时候配置了.gitignore文件

如果在项目开始的时候配置了.gitignore文件，会对一些文件进行忽略。然后git初始化，添加到远程仓库，这个时候再进行版本控制的时候就会忽略对这些文件的跟踪。

###### 2. 项目开始的时候 没有将一些无关文件配置进 .gitignore里面。

项目开始的时候 没有将一些无关文件配置进 .gitignore里面。在git初始化之后再添加.gitignore文件，这时候，文件已经被track，导致.gitignore文件无法进行跟踪，所以导致gitignore文件失效， 修改文件之后，git依然检测到被忽略的文件改动。

###### 原因

原来git有一条规则，“如果一个文件一开始没有添加到.gitignore里面，中途添加进去。git 将不会 忽略这个文件。”在这种情况下，必须使用 git rm --cached < file name > 这个命令来移除对这个文件的跟踪，然后将这个不想被跟踪的文件添加到 .gitignore文件里面就可以了。

解决办法:

- 方法1. 移除某个文件的跟踪，然后再添加到gitignore文件中。
```
 git rm -r --cached <文件名>
 git add <文件名>
 git commit -m 'fixed untracked files'
```

 
- 方法2. 先把本地缓存删除（改变成未track状态），然后再提交。
```
 首先把本地未提交的全部提交到版本库。

	 git add -A
	 git commit -m ''

然后把本地不想要的文件或文件夹的缓存删除，再提交一次。
     git rm -r .\.idea\    
     git rm -r -f .\.idea\  
	 git rm -r cached .
	
	 git add .
	 git commit -m "fixed untracked files"
```