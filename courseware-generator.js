// 课件生成器 - 处理预览、Review和课件生成
class CoursewareGenerator {
  constructor() {
    this.generatedFiles = [];
    this.currentReviewTab = "structure";
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // 工具栏按钮事件
    document
      .getElementById("preview-course")
      .addEventListener("click", () => this.showPreview());
    document
      .getElementById("generate-courseware")
      .addEventListener("click", () => this.showReview());

    // 交付选项变化事件
    document.querySelectorAll('input[name="delivery"]').forEach((radio) => {
      radio.addEventListener("change", (e) =>
        this.handleDeliveryChange(e.target.value)
      );
    });

    // Review导航事件
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) =>
        this.switchReviewTab(e.target.dataset.tab)
      );
    });

    // 模态框关闭事件
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeAllModals();
      }
    });
  }

  // 显示课程预览
  showPreview() {
    if (!app.canvasEngine || app.canvasEngine.nodes.length === 0) {
      alert("请先生成课程内容！");
      return;
    }

    const previewContent = this.generatePreviewContent();
    document.getElementById("course-preview-content").innerHTML =
      previewContent;
    document.getElementById("course-preview-modal").style.display = "block";
  }

  generatePreviewContent() {
    const courseData = window.courseData;
    let html = `
            <div class="course-header">
                <h2>${courseData.title}</h2>
                <div class="course-meta">
                    <span class="meta-tag">⏱️ 90分钟</span>
                    <span class="meta-tag">👥 产品经理</span>
                    <span class="meta-tag">📊 4个章节</span>
                </div>
            </div>
        `;

    courseData.chapters.forEach((chapter, index) => {
      html += `
                <div class="preview-chapter">
                    <div class="preview-chapter-header">
                        ${chapter.title}
                    </div>
                    <div class="preview-topics">
                        ${chapter.topics
                          .map(
                            (topic) => `
                            <div class="preview-topic">
                                <strong>${topic}</strong>
                                <p>详细内容将包含理论讲解、实践案例和互动讨论环节</p>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            `;
    });

    return html;
  }

  // 显示Review界面
  showReview() {
    if (!app.canvasEngine || app.canvasEngine.nodes.length === 0) {
      alert("请先生成课程内容！");
      return;
    }

    // 生成动态Review内容
    this.generateReviewContent();
    document.getElementById("review-modal").style.display = "block";
  }

  generateReviewContent() {
    // 这里可以根据实际的画布内容生成动态的review数据
    // 目前使用模拟数据，实际项目中应该分析画布节点
    const nodeCount = app.canvasEngine.nodes.length;
    const chapterCount = app.canvasEngine.nodes.filter(
      (n) => n.dataset.type === "chapter"
    ).length;
    const topicCount = app.canvasEngine.nodes.filter(
      (n) => n.dataset.type === "topic"
    ).length;

    // 更新结构分析
    const structureAnalysis = document.querySelector(
      "#review-structure .structure-analysis"
    );
    structureAnalysis.innerHTML = `
            <div class="analysis-item">
                <div class="item-header">
                    <span class="status-icon success">✅</span>
                    <strong>课程完整性</strong>
                </div>
                <p>课程包含${chapterCount}个主要章节，${topicCount}个知识点，结构完整，逻辑清晰</p>
            </div>
            <div class="analysis-item">
                <div class="item-header">
                    <span class="status-icon success">✅</span>
                    <strong>时长分配</strong>
                </div>
                <p>总时长90分钟，各章节时长分配合理</p>
            </div>
            <div class="analysis-item">
                <div class="item-header">
                    <span class="status-icon ${
                      topicCount > 12 ? "warning" : "success"
                    }">${topicCount > 12 ? "⚠️" : "✅"}</span>
                    <strong>知识点密度</strong>
                </div>
                <p>${
                  topicCount > 12
                    ? "知识点较密集，建议适当精简或分拆"
                    : "知识点密度适中，便于学员消化吸收"
                }</p>
            </div>
        `;
  }

  // 切换Review标签
  switchReviewTab(tabName) {
    // 更新导航状态
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // 切换内容
    document.querySelectorAll(".review-tab").forEach((tab) => {
      tab.classList.remove("active");
    });
    document.getElementById(`review-${tabName}`).classList.add("active");

    this.currentReviewTab = tabName;
  }

  // 处理交付方式变化
  handleDeliveryChange(deliveryType) {
    const emailOptions = document.getElementById("email-options");
    if (deliveryType === "email") {
      emailOptions.style.display = "block";
    } else {
      emailOptions.style.display = "none";
    }
  }

  // 显示课件生成界面
  showCoursewareModal() {
    this.closeAllModals();
    document.getElementById("courseware-modal").style.display = "block";
  }

  // 开始生成课件
  startGeneration() {
    const selectedFormats = this.getSelectedFormats();
    const deliveryMethod = this.getSelectedDelivery();

    if (selectedFormats.length === 0) {
      alert("请至少选择一种课件格式！");
      return;
    }

    // 隐藏选项，显示进度
    document.querySelector(".courseware-options").style.display = "none";
    document.getElementById("generation-progress").style.display = "block";
    document.getElementById("start-generation").style.display = "none";

    // 开始生成流程
    this.simulateGeneration(selectedFormats, deliveryMethod);
  }

  getSelectedFormats() {
    const checkboxes = document.querySelectorAll(
      '.format-option input[type="checkbox"]:checked'
    );
    return Array.from(checkboxes).map((cb) => cb.value);
  }

  getSelectedDelivery() {
    const radio = document.querySelector('input[name="delivery"]:checked');
    return radio ? radio.value : "download";
  }

  // 模拟生成过程
  async simulateGeneration(formats, delivery) {
    const steps = [
      { text: "正在分析课程结构...", progress: 10 },
      { text: "正在提取内容要点...", progress: 25 },
      { text: "正在生成课件模板...", progress: 40 },
      { text: "正在填充课程内容...", progress: 60 },
      { text: "正在优化排版样式...", progress: 80 },
      { text: "正在进行质量检查...", progress: 95 },
      { text: "生成完成！", progress: 100 },
    ];

    const progressFill = document.getElementById("progress-fill");
    const progressStatus = document.getElementById("progress-status");

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      progressStatus.textContent = step.text;
      progressFill.style.width = step.progress + "%";

      // 更新详细状态
      if (step.progress >= 30) this.updateDetailStatus("ppt", "processing");
      if (step.progress >= 50) this.updateDetailStatus("ppt", "completed");
      if (step.progress >= 60) this.updateDetailStatus("pdf", "processing");
      if (step.progress >= 80) this.updateDetailStatus("pdf", "completed");
      if (step.progress >= 85) this.updateDetailStatus("quiz", "processing");
      if (step.progress >= 95) this.updateDetailStatus("quiz", "completed");

      await this.delay(800);
    }

    // 生成完成
    this.showGenerationComplete(formats, delivery);
  }

  updateDetailStatus(type, status) {
    const statusElement = document.getElementById(`${type}-status`);
    if (statusElement) {
      statusElement.className = `detail-status ${status}`;
      statusElement.textContent = {
        pending: "等待中",
        processing: "生成中...",
        completed: "已完成",
      }[status];
    }
  }

  // 显示生成完成界面
  showGenerationComplete(formats, delivery) {
    document.getElementById("generation-progress").style.display = "none";
    document.getElementById("generation-complete").style.display = "block";
    document.getElementById("download-all").style.display = "inline-block";

    // 生成文件列表
    this.generatedFiles = this.createFileList(formats);
    this.renderGeneratedFiles();

    // 根据交付方式处理
    if (delivery === "email") {
      this.handleEmailDelivery();
    } else if (delivery === "cloud") {
      this.handleCloudDelivery();
    }
  }

  createFileList(formats) {
    const files = [];
    const formatMap = {
      ppt: {
        name: "产品经理团队管理培训.pptx",
        icon: "📊",
        size: "2.3 MB",
        type: "PowerPoint演示文稿",
      },
      pdf: {
        name: "团队管理培训手册.pdf",
        icon: "📄",
        size: "1.8 MB",
        type: "PDF学习手册",
      },
      word: {
        name: "培训计划大纲.docx",
        icon: "📝",
        size: "890 KB",
        type: "Word培训大纲",
      },
      quiz: {
        name: "配套测验题库.docx",
        icon: "❓",
        size: "456 KB",
        type: "测验题目",
      },
    };

    formats.forEach((format) => {
      if (formatMap[format]) {
        files.push({
          id: format,
          ...formatMap[format],
        });
      }
    });

    return files;
  }

  renderGeneratedFiles() {
    const container = document.getElementById("generated-files");
    container.innerHTML = this.generatedFiles
      .map(
        (file) => `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-icon">${file.icon}</div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${file.type} • ${file.size}</p>
                    </div>
                </div>
                <button class="download-btn" onclick="coursewareGenerator.downloadFile('${file.id}')">
                    📥 下载
                </button>
            </div>
        `
      )
      .join("");
  }

  // 处理邮件发送
  async handleEmailDelivery() {
    const email = document.getElementById("recipient-email").value;
    const message = document.getElementById("email-message").value;

    if (!email) {
      alert("请输入接收人邮箱地址！");
      return;
    }

    // 模拟发送邮件
    await this.delay(1000);
    alert(
      `课件已发送到 ${email}！\n\n包含文件：\n${this.generatedFiles
        .map((f) => f.name)
        .join("\n")}`
    );
  }

  // 处理云端分享
  async handleCloudDelivery() {
    // 模拟生成分享链接
    await this.delay(500);
    const shareLink = `https://course-share.ai/c/${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        alert(`分享链接已复制到剪贴板：\n${shareLink}\n\n链接有效期：30天`);
      })
      .catch(() => {
        prompt("分享链接（请手动复制）：", shareLink);
      });
  }

  // 下载单个文件
  downloadFile(fileId) {
    const file = this.generatedFiles.find((f) => f.id === fileId);
    if (file) {
      // 模拟下载
      const link = document.createElement("a");
      link.href = "#";
      link.download = file.name;
      link.click();

      app.showTooltip(
        `正在下载 ${file.name}`,
        document.querySelector(`[onclick*="${fileId}"]`)
      );
    }
  }

  // 下载全部文件
  downloadAll() {
    // 模拟批量下载
    this.generatedFiles.forEach((file, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = "#";
        link.download = file.name;
        link.click();
      }, index * 500);
    });

    app.showTooltip(
      "正在打包下载全部文件...",
      document.getElementById("download-all")
    );
  }

  // 应用优化建议
  applySuggestion(suggestionType) {
    const suggestions = {
      interaction: "正在为课程添加互动环节...",
      cases: "正在补充实践案例...",
      visual: "正在优化视觉设计...",
    };

    const message = suggestions[suggestionType];
    if (message) {
      app.showTooltip(message, event.target);

      // 模拟应用建议
      setTimeout(() => {
        app.showTooltip("优化建议已应用！", event.target);

        // 实际项目中这里应该修改画布内容
        if (suggestionType === "interaction") {
          this.addInteractionNodes();
        } else if (suggestionType === "cases") {
          this.addCaseStudyNodes();
        }
      }, 1500);
    }
  }

  // 添加互动节点
  addInteractionNodes() {
    if (!app.canvasEngine) return;

    const chapterNodes = app.canvasEngine.nodes.filter(
      (n) => n.dataset.type === "chapter"
    );
    chapterNodes.forEach((chapterNode, index) => {
      setTimeout(() => {
        const rect = app.canvasEngine.getNodeRect(chapterNode);
        const interactionNode = app.canvasEngine.createNode(
          "topic",
          "💬 互动讨论",
          rect.x + 250,
          rect.y + 50,
          { width: 160, height: 60 }
        );
        app.canvasEngine.addNode(interactionNode, chapterNode);
      }, index * 300);
    });
  }

  // 添加案例研究节点
  addCaseStudyNodes() {
    if (!app.canvasEngine) return;

    const topicNodes = app.canvasEngine.nodes.filter(
      (n) => n.dataset.type === "topic"
    );
    const randomTopics = topicNodes.sort(() => 0.5 - Math.random()).slice(0, 2);

    randomTopics.forEach((topicNode, index) => {
      setTimeout(() => {
        const rect = app.canvasEngine.getNodeRect(topicNode);
        const caseNode = app.canvasEngine.createNode(
          "topic",
          "📚 案例分析",
          rect.x + 180,
          rect.y + 80,
          { width: 160, height: 60 }
        );
        app.canvasEngine.addNode(caseNode, topicNode);
      }, index * 500);
    });
  }

  // 关闭所有模态框
  closeAllModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
      modal.style.display = "none";
    });

    // 重置状态
    document.querySelector(".courseware-options").style.display = "flex";
    document.getElementById("generation-progress").style.display = "none";
    document.getElementById("generation-complete").style.display = "none";
    document.getElementById("start-generation").style.display = "inline-block";
    document.getElementById("download-all").style.display = "none";
  }

  // 工具函数
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// 全局函数，供HTML调用
function closePreviewModal() {
  document.getElementById("course-preview-modal").style.display = "none";
}

function closeCoursewareModal() {
  coursewareGenerator.closeAllModals();
}

function closeReviewModal() {
  document.getElementById("review-modal").style.display = "none";
}

function generateCourseware() {
  coursewareGenerator.showCoursewareModal();
}

function showCoursewareModal() {
  coursewareGenerator.showCoursewareModal();
}

function startGeneration() {
  coursewareGenerator.startGeneration();
}

function downloadAll() {
  coursewareGenerator.downloadAll();
}

function applySuggestion(type) {
  coursewareGenerator.applySuggestion(type);
}

// 初始化课件生成器
let coursewareGenerator;
document.addEventListener("DOMContentLoaded", () => {
  coursewareGenerator = new CoursewareGenerator();
});
