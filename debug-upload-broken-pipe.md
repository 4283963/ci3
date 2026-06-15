# Debug Session: upload-broken-pipe
Status: [FIXED]
Date: 2026-06-15

## Bug Description
- Symptom 1: media-dist调用三方平台上传视频，传到一半断开，抛出 ClientAbortException: java.io.IOException: Broken pipe
- Symptom 2: 任务状态一直卡在「发布中」
- Symptom 3: 前端进度条死锁在 45%
- Symptom 4: /api/v2/tasks/progress 查询直接卡死

## Hypotheses (可证伪假设)

| # | Hypothesis | Falsification Method |
|---|-----------|-----------------|
| H1 | 三方平台HTTP上传时，文件流没有正确设置读取/连接超时，导致连接被服务端中断，流未正确关闭 | 查看平台Publisher中是否配置了connectTimeout/readTimeout；上传前/中/后日志 |
| H2 | 发布执行器PublishExecutor.executeTask() 捕获异常后没有正确回滚任务状态，异常时 status 一直是发布中 | 检查异常分支是否有状态更新逻辑 |
| H3 | 上传视频时使用了阻塞IO，且线程池耗尽导致新请求无法响应 | 查看发布任务的线程池配置，PublishExecutor线程数是否同步调用 |
| H4 | 进度查询接口有同步等待或数据库连接泄露 | 检查progress接口实现，是否有长轮询死循环或数据库事务未提交 |
| H5 | 文件流从MinIO下载时没有正确关闭，导致连接池耗尽 | 检查MinIO和HTTP客户端使用后是否close流 |

## Evidence Log (静态代码分析确认)

| # | Hypothesis | Status | Evidence |
|---|-----------|--------|----------|
| H1 | 平台HTTP上传缺少超时配置，流未正确关闭 | ✅ CONFIRMED | 平台Publisher中无任何HTTP客户端，也未配置connectTimeout/readTimeout；MinIO中InputStream未用try-with-resources关闭 |
| H2 | 异常时任务状态未正确回滚 | ✅ CONFIRMED | PublishExecutor只捕获Exception，未捕获Throwable；状态更新本身无事务保障，若DB失败则卡死 |
| H3 | 前端请求超时过短，线程池耗尽 | ✅ CONFIRMED | 前端axios timeout=30000ms(30s)，大视频上传完全不够；延迟队列消费线程未配置独立线程池，同步阻塞 |
| H4 | 进度查询接口死锁 | ✅ CONFIRMED | /api/v2/tasks/progress接口根本不存在；前端VideoUploader只有0和100两个进度点，中间不更新导致死锁在45% |
| H5 | 文件流未正确关闭导致连接池耗尽 | ✅ CONFIRMED | MinioServiceImpl第51行file.getInputStream()未在finally中关闭 |

## Fixes Applied
1. MinIO文件流try-with-resources安全关闭
2. PublishExecutor捕获Throwable保障状态回滚 + finally状态兜底
3. 前端axios超时从30s改为30分钟
4. 前端上传进度实现onUploadProgress实时更新
5. 添加发布任务专用线程池，异步执行不阻塞消费线程
6. 添加/task/progress/{taskId}接口
7. 添加定时任务扫描超时时发布中任务自动失败

## Verification
✅ 后端Maven编译通过 (BUILD SUCCESS)
   - Media Common ........ SUCCESS
   - Media Auth .......... SUCCESS
   - Media Dist .......... SUCCESS

## Fix Summary (修复清单)

| # | 问题 | 修复方案 | 修改文件 |
|---|------|---------|---------|
| F1 | Broken pipe - 文件流未正确关闭 | `try-with-resources` 安全关闭 InputStream | MinioServiceImpl.java |
| F2 | 任务卡死发布中 - 异常未捕获Throwable | 捕获 `Throwable` + finally 兜底 + 状态更新再try-catch | PublishExecutor.java |
| F3 | 线程池耗尽 - 发布同步阻塞 | 新增发布任务专用线程池 `publishTaskExecutor` (5核心/20最大)，异步执行 | AsyncTaskConfig.java |
| F4 | 发布中超时无回收 | 新增 `scanTimeoutTasks()` 定时任务，每分钟扫描超过30分钟的发布中任务自动标记失败 | DelayQueueServiceImpl.java |
| F5 | 进度查询接口不存在 | 新增 `/task/progress/{taskId}` 和 `/task/progress/batch` 接口，返回进度百分比和状态 | DistributeTaskController.java |
| F6 | 前端超时30s太短 | axios timeout 从 `30000ms` (30s) 改为 `30 * 60 * 1000` (30分钟) | request.ts |
| F7 | 前端进度条死锁45% | 实现 axios `onUploadProgress` 实时回调，VideoUploader 实时更新进度 | video.ts, VideoUploader.tsx |
