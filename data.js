// 课程数据模板
const courseData = {
  title: "产品经理团队管理培训",
  chapters: [
    {
      title: "第一章：管理认知转变",
      topics: [
        "1.1 从个人贡献者到管理者",
        "1.2 管理者的核心职责",
        "1.3 常见管理误区",
      ],
    },
    {
      title: "第二章：高效沟通技巧",
      topics: ["2.1 倾听的艺术", "2.2 反馈与批评技巧", "2.3 跨部门沟通策略"],
    },
    {
      title: "第三章：项目管理实践",
      topics: ["3.1 敏捷项目管理", "3.2 风险识别与控制", "3.3 里程碑管理"],
    },
    {
      title: "第四章：团队激励与发展",
      topics: ["4.1 激励理论应用", "4.2 员工发展规划", "4.3 团队文化建设"],
    },
  ],
};

// 演示文件数据
const demoFiles = [
  {
    id: "demo1",
    name: "团队管理手册.pdf",
    size: 2048000,
    type: "application/pdf",
  },
  {
    id: "demo2",
    name: "项目管理模板.pptx",
    size: 1536000,
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
  {
    id: "demo3",
    name: "沟通技巧指南.docx",
    size: 1024000,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
];

// 节点布局配置
const layoutConfig = {
  root: {
    x: 400,
    y: 200,
    width: 280,
    height: 120,
  },
  chapter: {
    width: 200,
    height: 80,
    spacing: {
      x: 300,
      y: 200,
    },
  },
  topic: {
    width: 160,
    height: 60,
    spacing: {
      x: 180,
      y: 100,
    },
  },
};

// AI响应模板
const aiResponses = {
  expand: [
    "正在为该节点扩写详细内容...",
    "已添加更多实践案例和理论支撑",
    "内容已扩展，增加了具体的操作步骤",
  ],
  simplify: [
    "正在精简该节点内容...",
    "已提取核心要点，去除冗余信息",
    "内容已精简，保留最重要的知识点",
  ],
  quiz: [
    "正在生成相关测验题目...",
    "已生成3道选择题和2道判断题",
    "测验题目已准备就绪，可用于考核",
  ],
  case: [
    "正在从素材库查找相关案例...",
    "已找到2个相关的实际案例",
    "案例已添加，增强了内容的实用性",
  ],
};

// 文件图标映射
const fileIcons = {
  pdf: "📄",
  ppt: "📊",
  pptx: "📊",
  doc: "📝",
  docx: "📝",
  txt: "📃",
  default: "📁",
};

// 导出数据
window.courseData = courseData;
window.demoFiles = demoFiles;
window.layoutConfig = layoutConfig;
window.aiResponses = aiResponses;
window.fileIcons = fileIcons;
