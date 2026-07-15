# 博客内容部署提示词模板

以下提示词可直接复制使用，每次替换 `[内容]` 部分即可。

---

## 1. 文章生成与部署

```
请帮我生成一篇技术文章并部署到我的博客：

博客信息：
- 博客地址：https://694587769.github.io
- GitHub 仓库：694587769/694587769.github.io
- GitHub Token：你的GitHub_Token
- 博客名称：苦瓜与吉姆餐厅
- 站长：Anqing Peng

文章要求：
- 标题：[你的文章标题]
- 主题：[文章主题和内容大纲]
- 格式：自包含的 HTML 文件，使用 main.css 相同的 CSS 变量和设计风格
- 需要包含：目录导航、代码高亮、数学公式（KaTeX CDN）、响应式设计
- 文件名：[英文文件名].html

部署要求：
1. 将 HTML 文件放到仓库根目录
2. 在 index.html 文章区域添加卡片（时间格式：YYYY-MM-DD）
3. 在 articles/index.html 文章列表添加条目
4. 在 search.json 添加搜索索引
5. 提交并推送到 GitHub Pages master 分支
```

---

## 2. 题库生成与部署

```
请帮我生成一个题库页面并部署到我的博客：

博客信息：
- 博客地址：https://694587769.github.io
- GitHub 仓库：694587769/694587769.github.io
- GitHub Token：你的GitHub_Token
- 题库目录：quiz/ 或 ai-study-guide/quiz/

题库要求：
- 标题：[题库名称]
- 内容：[题型和数量，如：单选题20道、多选题10道、判断题10道]
- 功能：答题、计分、答案解析、进度条、重新开始
- 格式：自包含的 HTML 文件（参考 quiz.html 的样式和交互逻辑）
- 文件名：[英文文件名].html

部署要求：
1. 将 HTML 文件放到 quiz/ 目录下
2. 在 index.html 学习资料区域添加卡片，标签为"题库"
3. 在 search.json 添加搜索索引
4. 提交并推送到 GitHub Pages master 分支
```

---

## 3. 学习资料生成与部署

```
请帮我生成一份学习资料并部署到我的博客：

博客信息：
- 博客地址：https://694587769.github.io
- GitHub 仓库：694587769/694587769.github.io
- GitHub Token：你的GitHub_Token
- 学习资料目录：ai-study-guide/

学习资料要求：
- 标题：[资料名称]
- 内容：[学习资料的内容大纲]
- 格式：自包含的 HTML 文件，参考 ai-study-guide.html 的设计风格
- 需要包含：目录导航、代码示例、图表（ECharts）、数学公式
- 文件名：[英文文件名].html

部署要求：
1. 将 HTML 文件放到 ai-study-guide/ 目录下
2. 在 index.html 学习资料区域添加卡片，标签为"学习资料"
3. 在 search.json 添加搜索索引
4. 提交并推送到 GitHub Pages master 分支
```

---

## 4. 快速修复与优化

```
请帮我诊断并修复博客性能问题：

博客信息：
- 博客地址：https://694587769.github.io
- GitHub 仓库：694587769/694587769.github.io
- GitHub Token：你的GitHub_Token

修复要求：
1. 克隆仓库，全面扫描所有 HTML/CSS/JS 文件
2. 分析并修复：渲染阻塞、CDN 超时、未使用的代码、过大的文件
3. 不改变现有架构、动画效果、视觉设计和内容
4. 提交并推送，验证所有页面 HTTP 200
```

---

## 5. 通用更新指令

```
请帮我更新博客内容：

博客信息：
- 博客地址：https://694587769.github.io
- GitHub 仓库：694587769/694587769.github.io
- GitHub Token：你的GitHub_Token

更新内容：
[具体描述要更新的内容]

注意事项：
- 不修改 blog-articles、blog-quiz、blog-study-materials 三个子仓库
- 保持 main.css 和现有 JS 文件不变
- 确保所有修改后页面 HTTP 200 可用
```