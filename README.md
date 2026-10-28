# FastHarness 中文交互解读

公开网页：https://situ-weixi.github.io/fastharness-notes/

基于 2026-10-27 微信文章《FastHarness 让机器人越做越快的执行框架》，补充官方项目和固定代码版本核对。含审核调度示意、可靠性计算器、原文方法图与恢复关键帧、官方演示视频、实验图表、代码解读及与 MOON 的对比。

主实验数据来源：https://mp.weixin.qq.com/s/2qNQUN_ShdZ6xenre6syZw?scene=1
官方项目：https://fastharness.github.io/
固定代码：https://github.com/FastHarness/fast-harness/tree/dfe070f8748fc08fae32ad880a35396859b6973e

本页是独立中文解读，不是官方项目网站。原图和视频版权归原作者，代码摘录遵循原仓库 MIT 许可（assets/code-license.txt）。交互流程是解释性示意，不是机器人仿真。未独立复现 RoboDojo 性能。

网页明确区分微信文章、官网与代码的版本差异：任务集合、Token 口径、经验衰减、预算耗尽行为和恢复预算默认值。

## 离线查看

下载 FastHarness-offline.zip，解压后打开 index.html。交互、原图和视频可离线使用；外部来源链接需要联网。

## 本次验证

- 官方符号 demo：6 轮基线调用均为 37 次，自适应为 26 / 15 / 14 / 11 / 13 / 12 次，两组均完成 6/6。
- Python 3.13 原项目测试：190 通过、5 跳过、1 报错，共 196 项。报错测试依赖 Linux /proc/self/stat，macOS 不支持；没有修改或忽略测试来宣称全部通过。
- 网页桌面 / 手机交互与数据下载检查；数据按微信文章及图 4 转录。

整理日期：2026-10-28。
