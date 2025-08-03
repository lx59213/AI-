// 增强版主应用逻辑
class CanvasApp {
  constructor() {
    this.currentState = "briefing";
    this.uploadedFiles = [];
    this.resources = [];
    this.canvasEngine = null;
    this.currentEditingNode = null;
    this.selectedNodes = [];

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
    
    // 新增元素
    this.resourceLibrary = document.getElementById("resource-library");
    this.courseObjective = document.getElementById("course-objective");
    this.generateCourseBtn = document.getElementById("generate-course-btn");
    this.resourceList = document.getElementById("resource-list");
    this.sourceBrowser = document.getElementById("source-browser");
    this.nodeEditor = document.getElementById("node-editor");
    
    // 检查关键元素是否存在
    const criticalElements = {
      instructionInput: this.instructionInput,
      generateBtn: this.generateBtn,
      canvasWorkspace: this.canvasWorkspace
    };
    
    for (const [name, element] of Object.entries(criticalElements)) {
      if (!element) {
        console.error(`关键DOM元素未找到: ${name}`);
      }
    }
  }

  bindEvents() {
    // 文件上传事件
    this.bindFileUploadEvents();
    this.bindResourceLibraryEvents();

    // 生成按钮事件 - 防止重复绑定
    if (this.generateBtn) {
      // 移除可能存在的旧监听器
      this.generateBtn.replaceWith(this.generateBtn.cloneNode(true));
      this.generateBtn = document.getElementById("generate-canvas-btn");
      this.generateBtn.addEventListener("click", () => this.generateCanvas());
    }
    
    if (this.generateCourseBtn) {
      this.generateCourseBtn.replaceWith(this.generateCourseBtn.cloneNode(true));
      this.generateCourseBtn = document.getElementById("generate-course-btn");
      this.generateCourseBtn.addEventListener("click", () => this.generateCourse());
    }

    // 指令输入事件
    if (this.instructionInput) {
      this.instructionInput.addEventListener("input", () =>
        this.checkFormValidity()
      );
    } else {
      console.error('instructionInput元素未找到，无法绑定input事件');
    }

    // 工具栏事件
    this.bindToolbarEvents();

    // 全局事件
    this.bindGlobalEvents();
  }

  bindFileUploadEvents() {
    const uploadZone = document.getElementById("upload-zone");
    const fileInput = document.getElementById("file-input");

    if (uploadZone && fileInput) {
      // 移除可能存在的旧事件监听器
      uploadZone.replaceWith(uploadZone.cloneNode(true));
      const newUploadZone = document.getElementById("upload-zone");
      
      fileInput.replaceWith(fileInput.cloneNode(true));
      const newFileInput = document.getElementById("file-input");

      newUploadZone.addEventListener("click", () => newFileInput.click());
      newFileInput.addEventListener("change", (e) => this.handleFileSelect(e));
      newUploadZone.addEventListener("dragover", (e) => this.handleDragOver(e));
      newUploadZone.addEventListener("dragleave", (e) => this.handleDragLeave(e));
      newUploadZone.addEventListener("drop", (e) => this.handleFileDrop(e));
    }
  }

  // 资源库事件绑定
  bindResourceLibraryEvents() {
    const libraryUploadZone = document.getElementById("library-upload-zone");
    const libraryFileInput = document.getElementById("library-file-input");
    const collapseBtn = document.getElementById("collapse-library");

    if (libraryUploadZone && libraryFileInput) {
      // 防止重复绑定事件
      libraryUploadZone.replaceWith(libraryUploadZone.cloneNode(true));
      const newLibraryUploadZone = document.getElementById("library-upload-zone");
      
      libraryFileInput.replaceWith(libraryFileInput.cloneNode(true));
      const newLibraryFileInput = document.getElementById("library-file-input");

      newLibraryUploadZone.addEventListener("click", () => newLibraryFileInput.click());
      newLibraryFileInput.addEventListener("change", (e) => this.handleResourceUpload(e));
      newLibraryUploadZone.addEventListener("dragover", (e) => this.handleDragOver(e));
      newLibraryUploadZone.addEventListener("dragleave", (e) => this.handleDragLeave(e));
      newLibraryUploadZone.addEventListener("drop", (e) => this.handleResourceDrop(e));
    }
    
    if (collapseBtn) {
      collapseBtn.replaceWith(collapseBtn.cloneNode(true));
      const newCollapseBtn = document.getElementById("collapse-library");
      newCollapseBtn.addEventListener("click", () => this.toggleResourceLibrary());
    }
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

    // 导出功能按钮已删除

    // 新增的课件相关按钮
    document.getElementById("preview-course").addEventListener("click", () => {
      this.showPreview();
    });

    document
      .getElementById("generate-courseware")
      .addEventListener("click", () => {
        this.showReview();
      });
  }

  bindGlobalEvents() {
    document.addEventListener("click", (e) => this.handleGlobalClick(e));
    document.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("resize", () => this.handleWindowResize());
  }

  // 窗口大小改变处理
  handleWindowResize() {
    // 如果编辑器正在显示且有当前编辑的节点，重新定位
    const editor = document.getElementById('node-editor');
    if (editor && editor.classList.contains('active') && this.currentEditingNode) {
      this.positionEditorNearNode(editor, this.currentEditingNode);
    }
  }

  // 文件处理
  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.addFiles(files);
  }
  
  // 资源上传处理
  handleResourceUpload(e) {
    const files = Array.from(e.target.files);
    this.addResources(files);
  }
  
  handleResourceDrop(e) {
    e.preventDefault();
    const uploadZone = document.getElementById("library-upload-zone");
    uploadZone.classList.remove("dragover");
    
    const files = Array.from(e.dataTransfer.files);
    this.addResources(files);
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
    return file.name.match(/\.(pdf|ppt|pptx|doc|docx|txt|md|jpg|png|mp4|mp3)$/i);
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
    const icons = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      ppt: "📊",
      pptx: "📊",
      txt: "📄",
      md: "📄",
      jpg: "🖼️",
      png: "🖼️",
      mp4: "🎥",
      mp3: "🎵"
    };
    return icons[ext] || "📁";
  }

  removeFile(fileId) {
    this.uploadedFiles = this.uploadedFiles.filter((f) => f.id != fileId);
    this.renderFileList();
    this.checkFormValidity();
  }

  checkFormValidity() {
    if (!this.instructionInput || !this.generateBtn) {
      console.warn('DOM元素未找到:', {
        instructionInput: !!this.instructionInput,
        generateBtn: !!this.generateBtn
      });
      return;
    }

    const hasInstruction = this.instructionInput.value.trim().length > 0;
    const hasFiles = this.uploadedFiles.length > 0;

    if (hasInstruction || hasFiles) {
      this.generateBtn.classList.add("active");
    } else {
      this.generateBtn.classList.remove("active");
    }
  }

  loadDemoData() {
    // 加载演示数据
    window.courseData = {
      title: "产品经理团队管理培训",
      chapters: [
        {
          title: "管理认知转变",
          topics: ["角色定位重新思考", "从执行到赋能", "管理者的核心价值"]
        },
        {
          title: "沟通与反馈技巧",
          topics: ["一对一沟通技巧", "建设性反馈方法", "跨部门协作"]
        },
        {
          title: "项目管理实践",
          topics: ["敏捷项目管理", "风险识别与控制", "团队效能提升"]
        },
        {
          title: "团队激励与发展",
          topics: ["激励机制设计", "职业发展规划", "团队文化建设"]
        }
      ]
    };
  }

  // 生成画布
  generateCanvas() {
    
    if (!this.generateBtn.classList.contains("active")) {
      console.log('按钮未激活，退出');
      return;
    }

    // 防止重复点击
    this.generateBtn.disabled = true;
    this.generateBtn.textContent = "🔄 生成中...";

    console.log('切换到画布视图');
    this.switchToCanvas();
    
    // 3秒后重新启用按钮
    setTimeout(() => {
      this.generateBtn.disabled = false;
      this.generateBtn.textContent = "🚀 在画布上生成课程";
    }, 3000);
  }

  // 切换到画布视图
  switchToCanvas() {
    this.currentState = "canvas";
    this.missionBriefing.classList.add("hidden");
    this.canvasWorkspace.classList.add("active");

    // 确保首页按钮完全不可点击
    if (this.generateBtn) {
      this.generateBtn.style.pointerEvents = 'none';
      this.generateBtn.style.display = 'none';
    }

    // 初始化画布引擎
    this.initializeCanvasEngine();

    // 开始生成课程结构
    this.generateCourseStructure();
  }

  // 切换回首页视图
  switchToHome() {
    this.currentState = "home";
    this.missionBriefing.classList.remove("hidden");
    this.canvasWorkspace.classList.remove("active");

    // 恢复首页按钮的可点击状态
    if (this.generateBtn) {
      this.generateBtn.style.pointerEvents = '';
      this.generateBtn.style.display = '';
    }
  }
  
  // 生成课程（从资源库）
  generateCourse() {
    const objective = this.courseObjective.value.trim();
    const enabledResources = this.resources.filter(r => r.enabled);
    
    if (!objective) {
      alert("请输入课程目标或大纲！");
      return;
    }
    
    if (enabledResources.length === 0) {
      alert("请至少启用一个资源文件！");
      return;
    }
    
    // 防止重复点击
    const generateBtn = this.generateCourseBtn;
    if (generateBtn.disabled) return;
    
    generateBtn.disabled = true;
    generateBtn.textContent = "🔄 生成中...";
    
    this.showLoading("AI正在基于您的资源生成课程结构...");
    
    // 模拟生成过程
    setTimeout(() => {
      this.generateCourseWithSources(objective, enabledResources);
      this.hideLoading();
      
      // 重新启用按钮
      generateBtn.disabled = false;
      generateBtn.textContent = "🚀 生成/更新课程";
    }, 2000);
  }

  // 初始化画布引擎
  initializeCanvasEngine() {
    if (!this.canvasEngine) {
      const canvasElement = document.getElementById("canvas");
      const containerElement = document.getElementById("canvas-container");
      this.canvasEngine = new CanvasEngine(canvasElement, containerElement);
      this.canvasEngine.onNodeClick = (node) => this.handleNodeClick(node);
      this.canvasEngine.onNodeRightClick = (node, e) => this.handleNodeRightClick(node, e);
      this.canvasEngine.onNodeDoubleClick = (node) => this.editNode(node);
      
      // 初始化导出管理器
      if (typeof initializeExportManager === 'function') {
        initializeExportManager(this.canvasEngine);
      }
    }
  }

  // 生成课程结构
  generateCourseStructure() {
    this.showLoading("AI正在画布上生成课程结构...");

    // 模拟AI生成过程
    setTimeout(() => {
      console.log('开始生成课程结构');
      // 清空现有节点，防止重复生成
      if (this.canvasEngine) {
        console.log('清空画布');
        this.canvasEngine.clear();
      }
      this.createCourseNodes();
      this.hideLoading();
    }, 3000);
  }
  
  // 基于资源生成课程
  generateCourseWithSources(objective, resources) {
    // 模拟RAG生成过程
    const mockNodes = this.generateMockNodesWithSources(objective, resources);
    
    // 确保清空现有节点
    if (this.canvasEngine) {
      this.canvasEngine.clear();
    }
    
    this.createNodesFromData(mockNodes);
  }
  
  // 生成带溯源信息的模拟节点
  generateMockNodesWithSources(objective, resources) {
    return {
      title: "产品经理团队管理培训",
      chapters: [
        {
          id: "ch1",
          title: "管理认知转变",
          content: "从个人贡献者到管理者的心态转变",
          sources: ["chunk_1", "chunk_2"],
          topics: [
            {
              id: "t1_1",
              title: "角色定位重新思考",
              content: "理解管理者的核心职责和价值创造方式",
              sources: ["chunk_1"]
            },
            {
              id: "t1_2",
              title: "从执行到赋能",
              content: "学会通过他人完成工作，而非亲力亲为",
              sources: ["chunk_2"]
            }
          ]
        },
        {
          id: "ch2",
          title: "沟通与反馈技巧",
          content: "建立高效的团队沟通机制",
          sources: ["chunk_3", "chunk_4"],
          topics: [
            {
              id: "t2_1",
              title: "一对一沟通技巧",
              content: "掌握个人化沟通的要点和频率",
              sources: ["chunk_3"]
            },
            {
              id: "t2_2",
              title: "建设性反馈方法",
              content: "学会给予有效的正面和改进反馈",
              sources: ["chunk_4"]
            }
          ]
        }
      ]
    };
  }

  // 创建课程节点
  createCourseNodes() {
    const courseData = window.courseData;
    
    console.log('开始创建课程节点，当前节点数量:', this.canvasEngine.nodes.length);
    
    // 确保画布已清空
    if (this.canvasEngine.nodes.length > 0) {
      console.log('发现现有节点，清空画布');
      this.canvasEngine.clear();
    }
    
    // 创建根节点
    const rootNode = this.canvasEngine.createNode(
      "root",
      courseData.title,
      400,
      100,
      { width: 300, height: 80 }
    );
    this.canvasEngine.addNode(rootNode);

    let yOffset = 250;
    courseData.chapters.forEach((chapter, chapterIndex) => {
      const chapterNode = this.canvasEngine.createNode(
        "chapter",
        chapter.title,
        200 + chapterIndex * 300,
        yOffset,
        { width: 250, height: 70 }
      );
      this.canvasEngine.addNode(chapterNode, rootNode);

      let topicYOffset = yOffset + 150;
      chapter.topics.forEach((topic, topicIndex) => {
        const topicNode = this.canvasEngine.createNode(
          "topic",
          topic,
          150 + chapterIndex * 300 + topicIndex * 50,
          topicYOffset + topicIndex * 80,
          { width: 200, height: 60 }
        );
        this.canvasEngine.addNode(topicNode, chapterNode);
      });
    });

    // 自动调整视图
    setTimeout(() => {
      if (this.canvasEngine && typeof this.canvasEngine.fitToScreen === 'function') {
        this.canvasEngine.fitToScreen();
      }
    }, 500);
  }
  
  // 从数据创建节点
  createNodesFromData(data) {
    // 创建根节点
    const rootNode = this.canvasEngine.createNodeWithSource(
      "root",
      data.title,
      400,
      100,
      { width: 300, height: 80 },
      []
    );
    this.canvasEngine.addNode(rootNode);

    let yOffset = 250;
    data.chapters.forEach((chapter, chapterIndex) => {
      const chapterNode = this.canvasEngine.createNodeWithSource(
        "chapter",
        chapter.title,
        200 + chapterIndex * 300,
        yOffset,
        { width: 250, height: 70 },
        chapter.sources || []
      );
      chapterNode.dataset.content = chapter.content;
      this.canvasEngine.addNode(chapterNode, rootNode);

      let topicYOffset = yOffset + 150;
      chapter.topics.forEach((topic, topicIndex) => {
        const topicNode = this.canvasEngine.createNodeWithSource(
          "topic",
          topic.title,
          150 + chapterIndex * 300 + topicIndex * 50,
          topicYOffset + topicIndex * 80,
          { width: 200, height: 60 },
          topic.sources || []
        );
        topicNode.dataset.content = topic.content;
        this.canvasEngine.addNode(topicNode, chapterNode);
      });
    });

    // 自动调整视图
    setTimeout(() => {
      if (this.canvasEngine && typeof this.canvasEngine.fitToScreen === 'function') {
        this.canvasEngine.fitToScreen();
      }
    }, 500);
  }

  // 全局点击处理
  handleGlobalClick(e) {
    // 隐藏上下文菜单
    if (this.contextMenu && !e.target.closest("#context-menu")) {
      this.contextMenu.style.display = "none";
    }

    // 隐藏AI工具箱
    if (this.aiToolbox && !e.target.closest("#ai-toolbox") && !e.target.closest(".node")) {
      this.aiToolbox.style.display = "none";
    }
  }

  // 键盘事件处理
  handleKeyDown(e) {
    if (e.key === "Escape") {
      if (this.contextMenu) {
        this.contextMenu.style.display = "none";
      }
      if (this.aiToolbox) {
        this.aiToolbox.style.display = "none";
      }
      if (this.sourceBrowser) {
        this.sourceBrowser.classList.remove("active");
      }
      if (this.nodeEditor) {
        this.nodeEditor.classList.remove("active");
      }
    }
  }

  // 显示加载动画
  showLoading(text = "处理中...") {
    if (!this.loadingOverlay) return;
    
    this.loadingOverlay.style.display = "flex";
    const loadingText = this.loadingOverlay.querySelector(".loading-text");
    if (loadingText) {
      loadingText.textContent = text;
    }
  }

  // 隐藏加载动画
  hideLoading() {
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = "none";
    }
  }
  
  // 添加资源
  addResources(files) {
    files.forEach(file => {
      const resource = {
        id: 'res_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: this.getFileType(file.name),
        size: this.formatFileSize(file.size),
        status: 'processing',
        enabled: true,
        file: file
      };
      
      this.resources.push(resource);
      this.renderResourceList();
      
      // 模拟处理过程
      setTimeout(() => {
        resource.status = 'ready';
        this.renderResourceList();
      }, 1000 + Math.random() * 2000);
    });
  }
  
  // 渲染资源列表
  renderResourceList() {
    const html = this.resources.map(resource => `
      <div class="resource-item" data-id="${resource.id}">
        <div class="resource-info">
          <div class="resource-icon">${this.getFileIcon(resource.name)}</div>
          <div class="resource-details">
            <p class="resource-name">${resource.name}</p>
            <p class="resource-status ${resource.status}">${this.getStatusText(resource.status)}</p>
          </div>
        </div>
        <div class="resource-controls">
          <input type="checkbox" class="resource-toggle" 
                 ${resource.enabled ? 'checked' : ''} 
                 onchange="app.toggleResource('${resource.id}')">
          <button class="resource-delete" onclick="app.deleteResource('${resource.id}')">
            🗑️
          </button>
        </div>
      </div>
    `).join('');
    
    this.resourceList.innerHTML = html;
  }
  
  // 获取文件类型
  getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'document', 'docx': 'document',
      'ppt': 'presentation', 'pptx': 'presentation',
      'txt': 'text', 'md': 'text',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image',
      'mp4': 'video', 'avi': 'video',
      'mp3': 'audio', 'wav': 'audio'
    };
    return typeMap[ext] || 'file';
  }
  
  // 获取状态文本
  getStatusText(status) {
    const statusMap = {
      'processing': '解析中...',
      'ready': '就绪',
      'error': '解析失败'
    };
    return statusMap[status] || status;
  }
  
  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  // 切换资源启用状态
  toggleResource(resourceId) {
    const resource = this.resources.find(r => r.id === resourceId);
    if (resource) {
      resource.enabled = !resource.enabled;
    }
  }
  
  // 删除资源
  deleteResource(resourceId) {
    this.resources = this.resources.filter(r => r.id !== resourceId);
    this.renderResourceList();
  }
  
  // 切换资源库显示
  toggleResourceLibrary() {
    this.resourceLibrary.classList.toggle('collapsed');
    const btn = document.getElementById('collapse-library');
    btn.textContent = this.resourceLibrary.classList.contains('collapsed') ? '➕' : '➖';
  }

  // 显示提示
  showTooltip(text, element) {
    if (!this.tooltip || !element) return;
    
    this.tooltip.textContent = text;
    this.tooltip.style.display = "block";
    
    const rect = element.getBoundingClientRect();
    this.tooltip.style.left = rect.left + "px";
    this.tooltip.style.top = rect.bottom + 5 + "px";
    
    setTimeout(() => {
      if (this.tooltip) {
        this.tooltip.style.display = "none";
      }
    }, 2000);
  }
  
  // 处理节点点击
  handleNodeClick(node) {
    // 清除之前的选择
    if (this.selectedNodes && this.selectedNodes.length > 0) {
      this.selectedNodes.forEach(n => {
        if (n && n.classList) {
          n.classList.remove('selected');
        }
      });
    }
    this.selectedNodes = [node];
    if (node && node.classList) {
      node.classList.add('selected');
    }
  }
  
  // 处理节点右键点击
  handleNodeRightClick(node, event) {
    event.preventDefault();
    this.currentEditingNode = node;
    this.showContextMenu(event.clientX, event.clientY);
  }
  
  // 显示上下文菜单
  showContextMenu(x, y) {
    if (this.contextMenu) {
      this.contextMenu.style.display = 'block';
      this.contextMenu.style.left = x + 'px';
      this.contextMenu.style.top = y + 'px';
    }
  }
  
  // 导出功能已删除

  // 编辑节点
  editNode(node) {
    if (!node) return;
    
    this.currentEditingNode = node;
    const editor = document.getElementById('node-editor');
    const titleInput = document.getElementById('node-title-input');
    const contentInput = document.getElementById('node-content-input');
    
    if (!editor || !titleInput || !contentInput) {
      console.error('编辑器元素未找到');
      return;
    }
    
    // 安全地获取节点标题
    let title = '';
    try {
      const textElement = node.querySelector('.node-text');
      if (textElement && textElement.textContent) {
        title = textElement.textContent;
      } else if (node.dataset && node.dataset.title) {
        title = node.dataset.title;
      }
    } catch (e) {
      console.warn('获取节点标题失败:', e);
    }
    
    titleInput.value = title;
    contentInput.value = (node.dataset && node.dataset.content) ? node.dataset.content : '';
    
    // 动态定位编辑器到节点旁边
    this.positionEditorNearNode(editor, node);
    
    editor.classList.add('active');
  }

  // 将编辑器定位到节点旁边
  positionEditorNearNode(editor, node) {
    const nodeRect = node.getBoundingClientRect();
    const editorWidth = 400; // 编辑器宽度
    const editorHeight = 500; // 编辑器预估高度
    const padding = 30; // 与节点的间距（增加到30px）
    const mouseOffset = 40; // 避开鼠标指针的额外偏移
    
    let left = nodeRect.right + padding;
    let top = nodeRect.top - mouseOffset; // 向上偏移避开鼠标
    
    // 检查右侧是否有足够空间，如果没有则显示在左侧
    if (left + editorWidth > window.innerWidth) {
      left = nodeRect.left - editorWidth - padding;
    }
    
    // 如果在左侧显示，也要考虑鼠标位置，稍微向上偏移
    if (left < nodeRect.left) {
      top = nodeRect.top - mouseOffset;
    }
    
    // 检查顶部是否有足够空间
    if (top + editorHeight > window.innerHeight) {
      top = window.innerHeight - editorHeight - padding;
    }
    
    // 确保不会超出屏幕上边界（考虑鼠标偏移）
    if (top < padding) {
      top = nodeRect.bottom + padding; // 如果上方空间不够，显示在节点下方
    }
    
    // 确保不会超出屏幕左边界
    if (left < padding) {
      left = padding;
    }
    
    // 最终检查：如果下方也不够空间，则居中显示
    if (top + editorHeight > window.innerHeight && nodeRect.bottom + padding + editorHeight > window.innerHeight) {
      top = Math.max(padding, (window.innerHeight - editorHeight) / 2);
      left = Math.max(padding, (window.innerWidth - editorWidth) / 2);
    }
    
    // 应用位置
    editor.style.position = 'fixed';
    editor.style.left = left + 'px';
    editor.style.top = top + 'px';
    editor.style.right = 'auto';
    editor.style.transform = 'none';
  }

  // 查看节点来源
  viewNodeSource(node) {
    if (!node) return;
    
    const browser = document.getElementById('source-browser');
    const content = document.getElementById('source-content');
    
    if (!browser || !content) {
      console.error('来源浏览器元素未找到');
      return;
    }
    
    let sources = [];
    try {
      if (node.dataset && node.dataset.sources) {
        sources = JSON.parse(node.dataset.sources);
      }
    } catch (e) {
      console.warn('解析来源信息失败:', e);
    }
    
    if (sources.length === 0) {
      content.innerHTML = '<p>该节点暂无来源信息</p>';
    } else {
      content.innerHTML = sources.map(sourceId => {
        // 这里应该从实际的源数据中获取信息
        return `
          <div class="source-item">
            <div class="source-meta">
              <span class="source-file-icon">📄</span>
              <span>产品管理手册.pdf</span>
              <span>第${Math.floor(Math.random() * 20) + 1}页</span>
            </div>
            <div class="source-excerpt">
              这是来自原始文档的相关内容片段，展示了该知识点的具体来源和上下文信息。
            </div>
          </div>
        `;
      }).join('');
    }
    
    browser.classList.add('active');
  }

  // 保存节点编辑
  saveNodeEdit() {
    if (!this.currentEditingNode) return;
    
    const titleInput = document.getElementById('node-title-input');
    const contentInput = document.getElementById('node-content-input');
    const editor = document.getElementById('node-editor');
    
    if (!titleInput || !contentInput || !editor) {
      console.error('编辑器元素未找到');
      return;
    }
    
    try {
      const titleElement = this.currentEditingNode.querySelector('.node-text');
      if (titleElement) {
        titleElement.textContent = titleInput.value;
      }
      
      if (this.currentEditingNode.dataset) {
        this.currentEditingNode.dataset.content = contentInput.value;
        this.currentEditingNode.dataset.title = titleInput.value;
      }
    } catch (e) {
      console.error('保存节点编辑失败:', e);
    }
    
    editor.classList.remove('active');
  }

  // AI增强节点
  aiEnhanceNode(type) {
    // 模拟AI增强功能
    const messages = {
      'expand': '正在扩展节点内容...',
      'simplify': '正在精简节点内容...',
      'example': '正在生成相关案例...'
    };
    
    this.showTooltip(messages[type], event.target);
    
    // 这里应该调用实际的AI API
    setTimeout(() => {
      this.showTooltip('AI增强完成！', event.target);
    }, 2000);
  }

  // 显示课程预览
  showPreview() {
    console.log('显示课程预览，画布状态:', {
      canvasEngine: !!this.canvasEngine,
      nodesLength: this.canvasEngine ? this.canvasEngine.nodes.length : 0,
      nodes: this.canvasEngine ? this.canvasEngine.nodes : []
    });
    
    // 无条件显示预览，让用户看到当前状态

    const previewContent = this.generatePreviewContent();
    const previewModal = document.getElementById("course-preview-modal");
    const previewContentDiv = document.getElementById("course-preview-content");
    
    if (previewContentDiv) {
      previewContentDiv.innerHTML = previewContent;
    }
    
    if (previewModal) {
      previewModal.style.display = "block";
    }
  }

  generatePreviewContent() {
    // 从画布节点生成预览内容
    const nodes = (this.canvasEngine && this.canvasEngine.nodes) ? this.canvasEngine.nodes : [];
    const rootNodes = nodes.filter(node => node.dataset.type === "root");
    const chapterNodes = nodes.filter(node => node.dataset.type === "chapter");
    const topicNodes = nodes.filter(node => node.dataset.type === "topic");
    
    const courseTitle = rootNodes.length > 0 ? rootNodes[0].dataset.title : "AI智能制课";
    
    // 如果没有节点，显示提示信息
    if (nodes.length === 0) {
      return `
        <div class="course-header">
          <h2>AI智能制课</h2>
          <div class="course-meta">
            <span class="meta-tag">⏱️ 90分钟</span>
            <span class="meta-tag">👥 产品经理</span>
            <span class="meta-tag">📊 0个章节</span>
          </div>
        </div>
        <div class="preview-chapter">
          <div class="preview-chapter-header">
            暂无课程内容
          </div>
          <div class="preview-topics">
            <div class="preview-topic">
              <strong>提示</strong>
              <p>请先点击"生成/更新课程"按钮创建课程内容</p>
            </div>
          </div>
        </div>
      `;
    }
    
    let html = `
      <div class="course-header">
        <h2>${courseTitle}</h2>
        <div class="course-meta">
          <span class="meta-tag">⏱️ 90分钟</span>
          <span class="meta-tag">👥 产品经理</span>
          <span class="meta-tag">📊 ${chapterNodes.length}个章节</span>
        </div>
      </div>
    `;

    chapterNodes.forEach((chapterNode, index) => {
      // 找到属于这个章节的主题节点（简单的基于位置判断）
      const relatedTopics = topicNodes.filter(topicNode => {
        const chapterY = parseInt(chapterNode.dataset.y);
        const topicY = parseInt(topicNode.dataset.y);
        return topicY > chapterY && topicY < chapterY + 200; // 简单的范围判断
      });

      html += `
        <div class="preview-chapter">
          <div class="preview-chapter-header">
            ${chapterNode.dataset.title}
          </div>
          <div class="preview-topics">
            ${relatedTopics.map(topicNode => `
              <div class="preview-topic">
                <strong>${topicNode.dataset.title}</strong>
                <p>详细内容将包含理论讲解、实践案例和互动讨论环节</p>
              </div>
            `).join("")}
          </div>
        </div>
      `;
    });

    return html;
  }

  // 显示Review界面
  showReview() {
    console.log('显示Review界面，画布状态:', {
      canvasEngine: !!this.canvasEngine,
      nodesLength: this.canvasEngine ? this.canvasEngine.nodes.length : 0
    });
    
    // 无条件显示Review，让用户看到当前状态

    // 生成动态Review内容
    this.generateReviewContent();
    const reviewModal = document.getElementById("review-modal");
    if (reviewModal) {
      reviewModal.style.display = "block";
    }
  }

  generateReviewContent() {
    // 分析画布内容生成review数据
    const nodes = (this.canvasEngine && this.canvasEngine.nodes) ? this.canvasEngine.nodes : [];
    const nodeCount = nodes.length;
    const chapterCount = nodes.filter(
      (n) => n.dataset.type === "chapter"
    ).length;
    const topicCount = nodes.filter(
      (n) => n.dataset.type === "topic"
    ).length;

    // 更新结构分析
    const structureAnalysis = document.querySelector(
      "#review-structure .structure-analysis"
    );
    
    if (structureAnalysis) {
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
            <span class="status-icon ${topicCount > 12 ? "warning" : "success"}">
              ${topicCount > 12 ? "⚠️" : "✅"}
            </span>
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
  }

  // 其他节点操作方法的占位符
  addChildNode(node) { console.log('Add child node', node); }
  splitNode(node) { console.log('Split node', node); }
  mergeNodes() { console.log('Merge nodes'); }
  disconnectNode(node) { console.log('Disconnect node', node); }
  duplicateNode(node) { console.log('Duplicate node', node); }
  deleteNode(node) { console.log('Delete node', node); }
}

// 全局函数，供HTML调用
function contextAction(action) {
  const node = app.currentEditingNode;
  if (!node) return;
  
  switch(action) {
    case 'edit':
      app.editNode(node);
      break;
    case 'viewSource':
      app.viewNodeSource(node);
      break;
    case 'addChild':
      app.addChildNode(node);
      break;
    case 'split':
      app.splitNode(node);
      break;
    case 'merge':
      app.mergeNodes();
      break;
    case 'disconnect':
      app.disconnectNode(node);
      break;
    case 'duplicate':
      app.duplicateNode(node);
      break;
    case 'delete':
      app.deleteNode(node);
      break;
  }
  
  if (app.contextMenu) {
    app.contextMenu.style.display = 'none';
  }
}

function closeSourceBrowser() {
  document.getElementById('source-browser').classList.remove('active');
}

function closeNodeEditor() {
  const editor = document.getElementById('node-editor');
  editor.classList.remove('active');
  
  // 重置编辑器位置样式为默认值
  editor.style.position = '';
  editor.style.left = '';
  editor.style.top = '';
  editor.style.right = '';
  editor.style.transform = '';
}

function saveNodeEdit() {
  app.saveNodeEdit();
}

function aiEnhance(type) {
  app.aiEnhanceNode(type);
}

function quickAction(action) {
  console.log("Quick action:", action);
  // 这里添加快速操作的具体处理逻辑
}

function closeToolbox() {
  const toolbox = document.getElementById("ai-toolbox");
  if (toolbox) {
    toolbox.style.display = "none";
  }
}

function sendChatMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (message) {
    console.log("Chat message:", message);
    input.value = "";
    // 这里添加聊天处理逻辑
  }
}

// 全局函数已移除，现在使用回调机制处理节点事件

// 全局函数用于模态框关闭
function closePreviewModal() {
  const modal = document.getElementById("course-preview-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function generateCourseware() {
  alert("课件生成功能开发中...");
}

// Review标签切换功能
function switchReviewTab(tabName) {
  // 更新导航状态
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeNavItem) {
    activeNavItem.classList.add("active");
  }

  // 切换内容
  document.querySelectorAll(".review-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  const activeTab = document.getElementById(`review-${tabName}`);
  if (activeTab) {
    activeTab.classList.add("active");
  }
}

// 初始化应用
let app;
document.addEventListener("DOMContentLoaded", () => {
  // 防止重复初始化
  if (!app) {
    app = new CanvasApp();
  }
  
  // 绑定Review导航事件
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const tabName = e.target.dataset.tab;
      if (tabName) {
        switchReviewTab(tabName);
      }
    });
  });
});