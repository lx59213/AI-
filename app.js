// 主应用逻辑
class CanvasApp {
  constructor() {
    this.currentState = "briefing";
    this.uploadedFiles = [];
    this.canvasEngine = null;

    this.initializeApp();
  }

  initializeApp() {
    this.initializeElements();
    this.bindEvents();
    this.loadDemoData();
  }

  initializeElements() {
    // 获取主要元素
    this.missionBriefing = document.getElementById("mission-briefing");
    this.canvasWorkspace = document.getElementById("canvas-workspace");
    this.instructionInput = document.getElementById("instruction-input");
    this.generateBtn = document.getElementById("generate-canvas-btn");
    this.fileList = document.getElementById("file-list");
    this.loadingOverlay = document.getElementById("loading-overlay");
    this.aiToolbox = document.getElementById("ai-toolbox");
    this.contextMenu = document.getElementById("context-menu");
    this.tooltip = document.getElementById("tooltip");
  }

  bindEvents() {
    // 文件上传事件
    this.bindFileUploadEvents();

    // 生成按钮事件
    this.generateBtn.addEventListener("click", () => this.generateCanvas());

    // 指令输入事件
    this.instructionInput.addEventListener("input", () =>
      this.checkFormValidity()
    );

    // 工具栏事件
    this.bindToolbarEvents();

    // 全局事件
    this.bindGlobalEvents();
  }

  bindFileUploadEvents() {
    const uploadZone = document.getElementById("upload-zone");
    const fileInput = document.getElementById("file-input");

    uploadZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
    uploadZone.addEventListener("dragover", (e) => this.handleDragOver(e));
    uploadZone.addEventListener("dragleave", (e) => this.handleDragLeave(e));
    uploadZone.addEventListener("drop", (e) => this.handleFileDrop(e));
  }

  bindToolbarEvents() {
    document.getElementById("zoom-in").addEventListener("click", () => {
      if (this.canvasEngine) this.canvasEngine.zoom(1.2);
    });

    document.getElementById("zoom-out").addEventListener("click", () => {
      if (this.canvasEngine) this.canvasEngine.zoom(0.8);
    });

    document.getElementById("fit-screen").addEventListener("click", () => {
      if (this.canvasEngine) this.canvasEngine.fitToScreen();
    });

    document.getElementById("reset-view").addEventListener("click", () => {
      if (this.canvasEngine) this.canvasEngine.resetView();
    });

    // 新增的课件相关按钮
    document.getElementById("preview-course").addEventListener("click", () => {
      if (window.coursewareGenerator) {
        window.coursewareGenerator.showPreview();
      }
    });

    document
      .getElementById("generate-courseware")
      .addEventListener("click", () => {
        if (window.coursewareGenerator) {
          window.coursewareGenerator.showReview();
        }
      });
  }

  bindGlobalEvents() {
    document.addEventListener("click", (e) => this.handleGlobalClick(e));
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  // 文件处理
  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.addFiles(files);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  }

  handleDragLeave(e) {
    e.currentTarget.classList.remove("dragover");
  }

  handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove("dragover");
    const files = Array.from(e.dataTransfer.files);
    this.addFiles(files);
  }

  addFiles(files) {
    files.forEach((file) => {
      if (this.isValidFileType(file)) {
        this.uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          id: Date.now() + Math.random(),
        });
      }
    });
    this.renderFileList();
    this.checkFormValidity();
  }

  isValidFileType(file) {
    return file.name.match(/\.(pdf|ppt|pptx|doc|docx|txt)$/i);
  }

  renderFileList() {
    this.fileList.innerHTML = this.uploadedFiles
      .map(
        (file) => `
            <div class="file-item">
                <span>${this.getFileIcon(file.name)} ${file.name}</span>
                <span style="cursor: pointer;" onclick="app.removeFile('${
                  file.id
                }')">🗑️</span>
            </div>
        `
      )
      .join("");
  }

  getFileIcon(filename) {
    const ext = filename.split(".").pop().toLowerCase();
    return window.fileIcons[ext] || window.fileIcons.default;
  }

  removeFile(fileId) {
    this.uploadedFiles = this.uploadedFiles.filter(
      (file) => file.id !== fileId
    );
    this.renderFileList();
    this.checkFormValidity();
  }

  checkFormValidity() {
    const instruction = this.instructionInput.value.trim();

    if (instruction || this.uploadedFiles.length > 0) {
      this.generateBtn.classList.add("active");
    } else {
      this.generateBtn.classList.remove("active");
    }
  }

  // 画布生成
  generateCanvas() {
    if (!this.generateBtn.classList.contains("active")) {
      return;
    }

    this.switchToCanvasState();
    this.showLoading();

    // 模拟生成过程
    setTimeout(() => {
      this.hideLoading();
      this.createCourseNodes();
    }, 2500);
  }

  switchToCanvasState() {
    this.missionBriefing.classList.add("hidden");
    this.canvasWorkspace.classList.add("active");
    this.currentState = "canvas";

    // 初始化画布引擎
    const canvas = document.getElementById("canvas");
    const container = document.getElementById("canvas-container");
    this.canvasEngine = new CanvasEngine(canvas, container);
  }

  showLoading() {
    this.loadingOverlay.classList.add("active");
  }

  hideLoading() {
    this.loadingOverlay.classList.remove("active");
  }

  createCourseNodes() {
    const { root, chapter, topic } = window.layoutConfig;

    // 创建根节点
    const rootNode = this.canvasEngine.createNode(
      "root",
      window.courseData.title,
      root.x,
      root.y,
      { width: root.width, height: root.height }
    );
    this.canvasEngine.addNode(rootNode);

    // 创建章节和知识点节点
    let delay = 500;
    window.courseData.chapters.forEach((chapterData, chapterIndex) => {
      setTimeout(() => {
        this.createChapterWithTopics(chapterData, chapterIndex, rootNode);
      }, delay);
      delay += 200;
    });

    // 适应屏幕
    setTimeout(() => {
      this.canvasEngine.fitToScreen();
    }, delay + 1000);
  }

  createChapterWithTopics(chapterData, chapterIndex, rootNode) {
    const { chapter, topic } = window.layoutConfig;

    // 计算章节位置
    const chapterX =
      window.layoutConfig.root.x + (chapterIndex % 2 === 0 ? -250 : 250);
    const chapterY =
      window.layoutConfig.root.y +
      200 +
      Math.floor(chapterIndex / 2) * chapter.spacing.y;

    // 创建章节节点
    const chapterNode = this.canvasEngine.createNode(
      "chapter",
      chapterData.title,
      chapterX,
      chapterY,
      { width: chapter.width, height: chapter.height }
    );
    this.canvasEngine.addNode(chapterNode, rootNode);

    // 创建知识点节点
    chapterData.topics.forEach((topicTitle, topicIndex) => {
      setTimeout(() => {
        const topicX = chapterX + (topicIndex % 2 === 0 ? -120 : 120);
        const topicY =
          chapterY + 120 + Math.floor(topicIndex / 2) * topic.spacing.y;

        const topicNode = this.canvasEngine.createNode(
          "topic",
          topicTitle,
          topicX,
          topicY,
          { width: topic.width, height: topic.height }
        );
        this.canvasEngine.addNode(topicNode, chapterNode);

        // 随机添加素材节点
        if (Math.random() > 0.6 && this.uploadedFiles.length > 0) {
          this.createAssetNode(
            topicX + topic.width + 10,
            topicY - 10,
            this.uploadedFiles[0]
          );
        }
      }, topicIndex * 300);
    });
  }

  createAssetNode(x, y, file) {
    const assetNode = document.createElement("div");
    assetNode.className = "asset-node";
    assetNode.textContent = this.getFileIcon(file.name);
    assetNode.style.left = x + "px";
    assetNode.style.top = y + "px";
    assetNode.title = `来源: ${file.name}`;

    this.canvasEngine.canvas.appendChild(assetNode);
  }

  // 全局事件处理
  handleGlobalClick(e) {
    if (
      !e.target.closest(".ai-toolbox") &&
      !e.target.classList.contains("node")
    ) {
      this.hideAIToolbox();
    }

    if (!e.target.closest(".context-menu")) {
      this.hideContextMenu();
    }
  }

  handleKeyDown(e) {
    if (
      e.key === "Delete" &&
      this.canvasEngine &&
      this.canvasEngine.selectedNode
    ) {
      this.canvasEngine.deleteNode(this.canvasEngine.selectedNode);
      this.hideAIToolbox();
    } else if (e.key === "Escape") {
      this.hideAIToolbox();
      this.hideContextMenu();
    }
  }

  // AI工具箱
  showAIToolbox(node) {
    const rect = node.getBoundingClientRect();
    const container = document
      .getElementById("canvas-container")
      .getBoundingClientRect();

    this.aiToolbox.style.left =
      Math.min(rect.right + 20, container.right - 340) + "px";
    this.aiToolbox.style.top = Math.max(rect.top, container.top + 20) + "px";
    this.aiToolbox.style.display = "block";

    // 更新工具箱标题
    const title = this.aiToolbox.querySelector(".toolbox-title");
    title.textContent = `🤖 ${node.dataset.title}`;
  }

  hideAIToolbox() {
    this.aiToolbox.style.display = "none";
  }

  // 上下文菜单
  showContextMenu(x, y) {
    this.contextMenu.style.left = x + "px";
    this.contextMenu.style.top = y + "px";
    this.contextMenu.style.display = "block";
  }

  hideContextMenu() {
    this.contextMenu.style.display = "none";
  }

  // 节点编辑
  editNodeTitle(node) {
    const currentTitle = node.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentTitle;
    input.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: transparent;
            text-align: center;
            font-weight: 600;
            font-size: inherit;
            color: inherit;
            padding: 5px;
        `;

    node.innerHTML = "";
    node.appendChild(input);
    input.focus();
    input.select();

    const finishEdit = () => {
      const newTitle = input.value.trim() || currentTitle;
      node.textContent = newTitle;
      node.dataset.title = newTitle;
    };

    input.addEventListener("blur", finishEdit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        finishEdit();
      } else if (e.key === "Escape") {
        node.textContent = currentTitle;
      }
    });
  }

  // 工具提示
  showTooltip(text, targetElement) {
    const rect = targetElement.getBoundingClientRect();

    this.tooltip.textContent = text;
    this.tooltip.style.left = rect.right + 10 + "px";
    this.tooltip.style.top = rect.top + "px";
    this.tooltip.classList.add("show");

    setTimeout(() => {
      this.tooltip.classList.remove("show");
    }, 3000);
  }

  // 加载演示数据
  loadDemoData() {
    setTimeout(() => {
      // 预填充演示指令
      this.instructionInput.value =
        "为新入职的产品经理，制作一门关于团队管理的培训课程，包含沟通技巧、项目管理、团队激励等核心内容，时长90分钟。";

      // 添加演示文件
      this.uploadedFiles = [...window.demoFiles];
      this.renderFileList();
      this.checkFormValidity();
    }, 500);
  }
}

// 全局函数，供HTML调用
function quickAction(action) {
  if (!app.canvasEngine || !app.canvasEngine.selectedNode) return;

  const responses = window.aiResponses[action];
  if (responses) {
    const response = responses[Math.floor(Math.random() * responses.length)];
    app.showTooltip(response, app.canvasEngine.selectedNode);

    // 模拟AI处理效果
    if (action === "expand") {
      setTimeout(() => {
        const selectedNode = app.canvasEngine.selectedNode;
        const rect = app.canvasEngine.getNodeRect(selectedNode);
        const childNode = app.canvasEngine.createNode(
          "topic",
          "详细内容点",
          rect.x + 50,
          rect.y + rect.height + 50,
          { width: 160, height: 60 }
        );
        app.canvasEngine.addNode(childNode, selectedNode);
      }, 1500);
    }
  }
}

function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();

  if (!message || !app.canvasEngine || !app.canvasEngine.selectedNode) return;

  app.showTooltip(`AI正在处理: ${message}`, app.canvasEngine.selectedNode);
  input.value = "";

  setTimeout(() => {
    app.showTooltip(
      "内容已更新，请查看节点变化",
      app.canvasEngine.selectedNode
    );
  }, 1500);
}

function contextAction(action) {
  app.hideContextMenu();

  if (!app.canvasEngine || !app.canvasEngine.selectedNode) return;

  const selectedNode = app.canvasEngine.selectedNode;

  switch (action) {
    case "delete":
      app.canvasEngine.deleteNode(selectedNode);
      app.hideAIToolbox();
      break;
    case "duplicate":
      app.canvasEngine.duplicateNode(selectedNode);
      break;
    case "addChild":
      const rect = app.canvasEngine.getNodeRect(selectedNode);
      const childNode = app.canvasEngine.createNode(
        "topic",
        "新子节点",
        rect.x + 50,
        rect.y + rect.height + 50,
        { width: 160, height: 60 }
      );
      app.canvasEngine.addNode(childNode, selectedNode);
      break;
    case "edit":
      app.editNodeTitle(selectedNode);
      break;
  }
}

function closeToolbox() {
  app.hideAIToolbox();
}

function showAIToolbox(node) {
  app.showAIToolbox(node);
}

function hideAIToolbox() {
  app.hideAIToolbox();
}

function showContextMenu(x, y) {
  app.showContextMenu(x, y);
}

function editNodeTitle(node) {
  app.editNodeTitle(node);
}

// 初始化应用
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new CanvasApp();
});
