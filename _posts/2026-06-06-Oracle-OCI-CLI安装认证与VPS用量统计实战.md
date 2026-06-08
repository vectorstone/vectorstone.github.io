---
layout: post
title: Oracle OCI CLI 安装认证与 VPS 用量统计实战
subtitle: 从 CLI 安装、API Key 配置到 Oracle 托管 usage report 的脱敏统计方法与 Skill 化沉淀
date: 2026-06-06
author: Gavin
header-img: img/post-bg-art.jpg
catalog: true
tags:
  - Oracle Cloud
  - OCI CLI
  - VPS
  - Billing
  - Usage Report
  - Skill
  - GitHub
---

# 背景

这次要解决的问题很具体：

1. 本地已经装好了 OCI CLI，先验证认证链路是否真的通。
2. 想查 Oracle VPS 过去 3 个月到底用了多少流量。
3. 不只要这次算出来，还要把整个流程沉淀成可复用的 skill 和脚本。
4. 最后把过程整理成一篇技术博客，并把 skill 仓库公开托管到 GitHub。

最终产物仓库：

- [oracle-oci-metering-skills](https://github.com/vectorstone/oracle-oci-metering-skills)

这篇文章记录完整路径，包括中间踩过的坑、为什么第一次统计会低估 5 月流量，以及如何避免以后重复走弯路。

# 先说结论

## 脱敏说明

- 公开版移除了真实 VNIC / Instance / Tenancy 等资源标识。
- 公开版不展示真实月度流量数字和累计值。
- 公开版保留统计方法、查询路径、坑点和脚本接口。
- 本地私有产物仍可保留真实统计结果，但不进入公开 blog / 公开仓库。

过去 3 个月 Oracle VPS 出网流量，最终以 **边界校验后的 usage report 统计** 为准。公开版不展示真实字节数、精确月度流量和具体资源 OCID，只保留趋势和方法：

| 月份 | 公开版趋势 | 说明 |
| --- | --- | --- |
| 2026-03 | 低 | 基线期，流量规模明显较小 |
| 2026-04 | 高 | 相比 3 月显著放大，进入高流量区间 |
| 2026-05 | 更高 | 继续高于 4 月，是这三个月中的峰值 |
| TOTAL | 脱敏 | 公开版仅保留趋势，不披露精确累计值 |

对应资源也已脱敏处理。可以确定的是：统计最终可以稳定归因到单一实例网络接口资源，但公开文章不展示真实 VNIC / Instance / Tenancy 标识。

# 第一部分：OCI CLI 安装与配置

## macOS

Oracle 官方文档给了 Homebrew 安装方式：

```bash
brew update && brew install oci-cli
```

升级：

```bash
brew update && brew upgrade oci-cli
```

卸载：

```bash
brew uninstall oci-cli
```

## Windows

Oracle 官方支持两种方式：

### 方式 1：MSI 安装包

直接从 OCI CLI GitHub Releases 下载 MSI，然后安装。

### 方式 2：PowerShell 安装

```powershell
Set-ExecutionPolicy RemoteSigned
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.ps1 -OutFile install.ps1
./install.ps1 -AcceptAllDefaults
```

如果你想交互式安装，也可以直接运行：

```powershell
iex ((New-Object System.Net.WebClient).DownloadString('https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.ps1'))
```

## Linux / UNIX

Oracle 官方推荐脚本安装：

```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)"
```

无提示安装：

```bash
bash -c "$(curl -L https://raw.githubusercontent.com/oracle/oci-cli/master/scripts/install/install.sh)" -- --accept-all-defaults
```

## Arch Linux

Oracle 官方文档没有单独给 Arch Linux 包管理器方案，最稳的是：

- 直接走上面的 Linux 安装脚本
- 或者自己放进独立 Python/venv 环境

这次我的环境里，CLI 实际可执行文件在：

```bash
$HOME/bin/oci
```

这就引出第一个坑。

# 第二部分：第一个坑——CLI 明明装了，但 `oci` 不在 PATH

我一开始验证时，`~/.oci/config` 明明已经有了，key 文件也存在，但命令直接报：

```bash
oci: command not found
```

后来定位到 CLI 实际在：

```bash
$HOME/bin/oci
```

也就是说：

- CLI 已安装
- 认证配置也在
- 只是当前 shell 环境没把 `$HOME/bin` 放进 `PATH`

临时验证可以直接用绝对路径：

```bash
$HOME/bin/oci --version
$HOME/bin/oci os ns get --output json
```

如果返回 namespace，说明认证链路是通的。

长期修复一般是把下面这行放进 shell 配置：

```bash
export PATH="$HOME/bin:$PATH"
```

# 第三部分：OCI CLI 认证配置怎么做

OCI CLI 需要这些核心信息：

- `user`：User OCID
- `tenancy`：Tenancy OCID
- `region`：Region，例如 `<home-region>`
- `fingerprint`：API Key 指纹
- `key_file`：本地私钥路径

## 1. 生成 API Signing Key

Linux/macOS 最常见是生成 RSA PEM 私钥。

Oracle 官方要求：

- RSA key pair
- PEM format
- 至少 2048 bits

比如：

```bash
openssl genrsa -out ~/.oci/oci_api_key.pem 2048
openssl rsa -pubout -in ~/.oci/oci_api_key.pem -out ~/.oci/oci_api_key_public.pem
chmod 600 ~/.oci/oci_api_key.pem
```

## 2. 上传公钥到 OCI Console

路径：

```text
Profile -> User Settings -> Tokens and keys -> API keys -> Add API key
```

然后：

- 选择上传公钥内容
- 把 `oci_api_key_public.pem` 内容粘进去
- 点击 Add

Oracle Console 会给出配置预览，可以直接拿来填 `~/.oci/config`。

## 3. `~/.oci/config` 示例

```ini
[DEFAULT]
user=<user-ocid>
fingerprint=aa:bb:cc:dd:ee:ff:...
tenancy=<tenancy-ocid>
region=<home-region>
key_file=/home/yourname/.oci/oci_api_key.pem
```

## 4. 验证认证是否成功

最简单的只读测试：

```bash
oci os ns get --output json
```

如果成功返回 namespace，说明：

- 本地 CLI 可用
- 签名成功
- 网络连通
- 当前 profile 有基本权限

# 第四部分：Oracle 报表到底存在哪

这一步是核心。

Oracle 的 cost / usage reports 不在你平时自己的普通 bucket 列表里，而是在 **Oracle 托管的 Object Storage bucket** 中。

关键点：

- 区域：**tenancy home region**
- namespace：`bling`
- bucket name：**tenancy OCID**

也就是说，列报表对象的命令是这种形态：

```bash
oci os object list --region <home-region> --namespace-name bling --bucket-name <your-tenancy-ocid> --all
```

这一步验证成功后，才能继续谈批量下载和统计。

# 第五部分：第二个坑——查 2026 年 3、4、5 月时，按常见前缀根本扫不到

我一开始按这种直觉去查：

```bash
FOCUS Reports/2026/03/
FOCUS Reports/2026/04/
FOCUS Reports/2026/05/
reports/cost-csv/2026/03/
reports/cost-csv/2026/04/
reports/cost-csv/2026/05/
```

结果全空。

这说明一个非常重要的事实：

## 旧报表前缀并不一定按年月目录组织

尤其是：

- `reports/usage-csv/`
- `reports/cost-csv/`

很多是**平铺文件名**，不是你以为的 `2026/05/xx.csv.gz` 目录结构。

所以正确姿势不是猜目录，而是：

1. 先把对象列表拉出来
2. 看 `time-created`
3. 再决定下载窗口

这一步是后面所有统计能不能对上的前提。

# 第六部分：第三个坑——只按对象创建月份过滤，会低估月末流量

这是整个过程里最关键的坑。

第一次统计 2026-05 时，我按“对象创建时间在 5 月内”的 usage 文件去汇总，得到的是：

```text
<initial-month-total-redacted>
```

但后面我做边界校验时，把候选对象窗口扩成：

- 起始月前 2 天
- 结束月后 2 天

然后再真正按 CSV 行里的：

```text
lineItem/intervalUsageStart
```

去判断这条流量归属哪个月。

结果 2026-05 变成了：

```text
<final-month-total-redacted>
```

也就是：

```text
存在一段月末小时流量在边界校验后被补回
```

这说明什么？

## 说明月末最后几个小时的 usage，可能写进了次月创建的对象里

所以：

- **对象创建时间** 只能用来缩小下载范围
- **真正的月份归属** 一定要看 `lineItem/intervalUsageStart`

这是这次统计能否正确的决定性细节。

# 第七部分：第四个坑——`OBJECTSTORE` 里也会出现类似“出网流量”名字，但不能直接当 VPS 流量

usage report 里能看到两类看起来都像“出网”的行：

1. `NETWORK / PIC_COMPUTE_OUTBOUND_DATA_TRANSFER_ZONE1`
2. `OBJECTSTORE / PIC_COMPUTE_OUTBOUND_DATA_TRANSFER_ZONE1`

如果只是名字匹配，很容易一锅端全加进去。

但实际抽样后会发现：

- `OBJECTSTORE` 那部分很多是 `0`
- 有些和日志、对象存储相关
- 它不是 VPS 本机出网统计的主口径

所以这次最终只保留：

```text
product/service = NETWORK
usage/consumedQuantityUnits = BYTES
usage/consumedQuantityMeasure = DATA_TRANSFERRED
```

这才是 VPS 出网流量的稳妥统计口径。

# 第八部分：最终用到的统计脚本

这次我把脚本和 skill 都沉淀进仓库了：

- GitHub：[https://github.com/vectorstone/oracle-oci-metering-skills](https://github.com/vectorstone/oracle-oci-metering-skills)

两个 skill：

1. `oracle-vps-usage`
2. `oracle-cost-breakdown`

## 1. 流量统计脚本

```bash
python ~/.codex/skills/oracle-vps-usage/scripts/oracle_vps_usage_report.py   --start-month 2026-03   --end-month 2026-05   --csv ./oracle-vps-traffic.csv   --summary-md ./oracle-vps-traffic-brief.md
```

这个脚本会：

1. 从 `~/.oci/config` 读 tenancy 和 region
2. 去 `bling/<tenancy-ocid>/reports/usage-csv/` 列对象
3. 在目标月份前后各扩 2 天做候选下载
4. 逐个下载 usage report
5. 按 `lineItem/intervalUsageStart` 做月份归属
6. 只保留 `NETWORK / BYTES / DATA_TRANSFERRED`
7. 输出 CSV 和 Markdown 简报

## 2. 成本/成分分析脚本

```bash
python ~/.codex/skills/oracle-cost-breakdown/scripts/oracle_cost_breakdown.py   --start-month 2026-05   --end-month 2026-05   --csv ./oracle-cost-breakdown-2026-05.csv   --summary-md ./oracle-cost-breakdown-2026-05.md
```

它会从 `reports/cost-csv/` 做按月聚合，统计：

- `cost/myCost`
- `usage/billedQuantity`
- `product/service`
- `product/Description`

这一步很适合看：

- Free Tier 下各组件的 billed quantity
- Compute / Network / Block Storage / Object Storage 的构成

例如我实跑某个月，结果里能看到：

- `COMPUTE / Standard - A1 - Memory`
- `COMPUTE / Standard - A1`
- `NETWORK / Outbound Data Transfer Zone 1`
- `BLOCK_STORAGE / Block Volume - Free`

而且在你的这个账号下，`myCost` 全是 0，说明这段时间都还在 Free Tier / 零计费口径里。

# 第九部分：这次产物

## 1. 月度统计 CSV

已生成：

```text
<private-local-artifact>/oracle-vps-traffic-YYYY-MM-to-YYYY-MM.csv
```

公开版不附真实 CSV 内容。对外只保留脚本、方法和脱敏样例。

## 2. 简报

已生成：

```text
<private-local-artifact>/oracle-vps-traffic-brief.md
```

## 3. Skills

已安装到本地：

```text
~/.codex/skills/oracle-vps-usage
~/.codex/skills/oracle-cost-breakdown
```

并在 GitHub 仓库中保存一份：

- [https://github.com/vectorstone/oracle-oci-metering-skills](https://github.com/vectorstone/oracle-oci-metering-skills)

# 第十部分：整个过程中最值得记住的坑

最后把关键坑点压缩成一个 checklist：

## 坑 1：CLI 安装了，但 `oci` 不在 PATH

看 `which oci` 没结果，不代表 CLI 没装。

先试：

```bash
$HOME/bin/oci --version
```

## 坑 2：报表不在你自己的普通 bucket 命名空间里

正确的是：

- namespace = `bling`
- bucket = tenancy OCID
- region = home region

## 坑 3：不能假设 `usage-csv` / `cost-csv` 按年月目录存放

很多文件是平铺命名。

## 坑 4：不能只按对象创建月份统计月流量

月末最后几小时可能落进次月创建的对象。

## 坑 5：真正的月归属必须看 CSV 行里的时间字段

也就是：

```text
lineItem/intervalUsageStart
```

## 坑 6：VPS 流量统计不要把 `OBJECTSTORE` 同名资源也算进去

这次公开方法里稳定口径是：

```text
NETWORK + BYTES + DATA_TRANSFERRED
```

# 参考资料

- Oracle CLI 安装文档：<https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm>
- Oracle API Signing Key 文档：<https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm>
- Oracle Cost Reports 列表文档：<https://docs.oracle.com/en-us/iaas/Content/Billing/Tasks/list-cost-usage-report.htm>
- Oracle Cost Reports 下载文档：<https://docs.oracle.com/en-us/iaas/Content/Billing/Tasks/download-cost-usage-report.htm>
- 技能仓库：<https://github.com/vectorstone/oracle-oci-metering-skills>

# 尾声

这次真正有价值的不是“公开一个 3 个月流量数字”，而是把整条链路打通了：

```text
安装 CLI
→ 配置 API Key
→ 验证认证
→ 访问 Oracle 托管报表桶
→ 识别正确统计口径
→ 处理月末边界
→ 输出 CSV / 简报
→ Skill 化
→ GitHub 托管
```

以后再查某个月、某几个月，或者做成本成分分析，就不需要从头摸一遍了。
