// 画布引擎 - 负责节点管理和渲染
class CanvasEngine {
  constructor(canvasElement, containerElement) {
    this.canvas = canvasElement;
    this.container = containerElement;
    this.nodes = [];
    this.connections = [];
    this.selectedNode = null;
    this.transform = { x: 0, y: 0, scale: 1 };
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.isCanvasDragging = false;
    this.canvasDragStart = { x: 0, y: 0 };

    this.initializeCanvas();
    this.createSVGLayer();
  }

  initializeCanvas() {
    // 设置画布初始状态
    this.canvas.style.transform = "translate(0px, 0px) scale(1)";

    // 绑定事件
    this.container.addEventListener(
      "mousedown",
      this.handleMouseDown.bind(this)
    );
    this.container.addEventListener(
      "mousemove",
      this.handleMouseMove.bind(this)
    );
    this.container.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.container.addEventListener("wheel", this.handleWheel.bind(this));
  }

  createSVGLayer() {
    // 创建SVG层用于绘制连接线
    this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svg.classList.add("connections-svg");
    this.svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 5;
        `;

    // 创建箭头标记
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const marker = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "marker"
    );
    marker.setAttribute("id", "arrowhead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "3.5");
    marker.setAttribute("orient", "auto");

    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon"
    );
    polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
    polygon.setAttribute("fill", "#cbd5e0");

    marker.appendChild(polygon);
    defs.appendChild(marker);
    this.svg.appendChild(defs);
    this.canvas.appendChild(this.svg);
  }

  createNode(type, title, x, y, options = {}) {
    const node = document.createElement("div");
    node.className = `node ${type}`;
    node.textContent = title;

    // 设置位置和大小
    node.style.left = x + "px";
    node.style.top = y + "px";

    if (options.width) node.style.width = options.width + "px";
    if (options.height) node.style.height = options.height + "px";

    // 设置数据属性
    node.dataset.type = type;
    node.dataset.title = title;
    node.dataset.x = x;
    node.dataset.y = y;
    node.dataset.id =
      options.id ||
      `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 添加事件监听
    node.addEventListener("mousedown", this.handleNodeMouseDown.bind(this));
    node.addEventListener("click", this.handleNodeClick.bind(this));
    node.addEventListener("dblclick", this.handleNodeDoubleClick.bind(this));
    node.addEventListener("contextmenu", this.handleNodeContextMenu.bind(this));

    return node;
  }

  addNode(node, parentNode = null) {
    this.nodes.push(node);
    this.canvas.appendChild(node);

    // 添加生长动画
    node.classList.add("growing");
    setTimeout(() => {
      node.classList.remove("growing");
    }, 600);

    // 如果有父节点，创建连接
    if (parentNode) {
      this.addConnection(parentNode, node);
    }
  }

  addConnection(fromNode, toNode) {
    const connection = { from: fromNode, to: toNode };
    this.connections.push(connection);
    this.renderConnection(connection);
  }

  renderConnection(connection) {
    const fromRect = this.getNodeRect(connection.from);
    const toRect = this.getNodeRect(connection.to);

    // 计算连接点
    const fromX = fromRect.x + fromRect.width / 2;
    const fromY = fromRect.y + fromRect.height;
    const toX = toRect.x + toRect.width / 2;
    const toY = toRect.y;

    // 创建路径
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.classList.add("connection-line");

    // 使用贝塞尔曲线
    const midY = fromY + (toY - fromY) / 2;
    const d = `M ${fromX} ${fromY} Q ${fromX} ${midY} ${toX} ${toY}`;
    path.setAttribute("d", d);

    this.svg.appendChild(path);

    // 添加绘制动画
    path.classList.add("drawing");
    setTimeout(() => {
      path.classList.remove("drawing");
    }, 800);
  }

  getNodeRect(node) {
    return {
      x: parseInt(node.dataset.x),
      y: parseInt(node.dataset.y),
      width: parseInt(node.style.width) || 200,
      height: parseInt(node.style.height) || 80,
    };
  }

  updateConnections() {
    // 清除现有连接线
    const existingLines = this.svg.querySelectorAll(".connection-line");
    existingLines.forEach((line) => line.remove());

    // 重新绘制所有连接线
    this.connections.forEach((connection) => {
      this.renderConnection(connection);
    });
  }

  selectNode(node) {
    // 清除之前的选择
    this.nodes.forEach((n) => n.classList.remove("selected"));

    // 选择新节点
    if (node) {
      node.classList.add("selected");
      this.selectedNode = node;
    } else {
      this.selectedNode = null;
    }
  }

  deleteNode(node) {
    if (node.dataset.type === "root") {
      alert("不能删除根节点！");
      return;
    }

    // 移除节点
    const index = this.nodes.indexOf(node);
    if (index > -1) {
      this.nodes.splice(index, 1);
    }

    // 移除相关连接
    this.connections = this.connections.filter(
      (conn) => conn.from !== node && conn.to !== node
    );

    node.remove();
    this.updateConnections();

    if (this.selectedNode === node) {
      this.selectedNode = null;
    }
  }

  duplicateNode(node) {
    const rect = this.getNodeRect(node);
    const newNode = this.createNode(
      node.dataset.type,
      node.dataset.title + " (副本)",
      rect.x + 50,
      rect.y + 50,
      {
        width: rect.width,
        height: rect.height,
      }
    );

    this.addNode(newNode);
    return newNode;
  }

  zoom(factor, centerX = null, centerY = null) {
    const oldScale = this.transform.scale;
    this.transform.scale = Math.max(
      0.1,
      Math.min(3, this.transform.scale * factor)
    );

    if (centerX !== null && centerY !== null) {
      const containerRect = this.container.getBoundingClientRect();
      const scaleChange = this.transform.scale - oldScale;
      this.transform.x -=
        ((centerX - containerRect.left - this.transform.x) * scaleChange) /
        oldScale;
      this.transform.y -=
        ((centerY - containerRect.top - this.transform.y) * scaleChange) /
        oldScale;
    }

    this.updateTransform();
  }

  pan(deltaX, deltaY) {
    this.transform.x += deltaX;
    this.transform.y += deltaY;
    this.updateTransform();
  }

  updateTransform() {
    this.canvas.style.transform = `translate(${this.transform.x}px, ${this.transform.y}px) scale(${this.transform.scale})`;
  }

  fitToScreen() {
    if (this.nodes.length === 0) return;

    // 计算所有节点的边界
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    this.nodes.forEach((node) => {
      const rect = this.getNodeRect(node);
      minX = Math.min(minX, rect.x);
      minY = Math.min(minY, rect.y);
      maxX = Math.max(maxX, rect.x + rect.width);
      maxY = Math.max(maxY, rect.y + rect.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;

    const scaleX = (containerWidth - 100) / contentWidth;
    const scaleY = (containerHeight - 100) / contentHeight;
    this.transform.scale = Math.min(scaleX, scaleY, 1);

    this.transform.x =
      (containerWidth - contentWidth * this.transform.scale) / 2 -
      minX * this.transform.scale;
    this.transform.y =
      (containerHeight - contentHeight * this.transform.scale) / 2 -
      minY * this.transform.scale;

    this.updateTransform();
  }

  resetView() {
    this.transform = { x: 0, y: 0, scale: 1 };
    this.updateTransform();
  }

  // 事件处理
  handleMouseDown(e) {
    if (e.target === this.container || e.target === this.canvas) {
      this.isCanvasDragging = true;
      this.container.classList.add("dragging");
      this.canvasDragStart.x = e.clientX - this.transform.x;
      this.canvasDragStart.y = e.clientY - this.transform.y;

      // 隐藏工具箱
      window.hideAIToolbox();
    }
  }

  handleMouseMove(e) {
    if (this.isDragging && this.selectedNode) {
      // 拖拽节点
      const containerRect = this.container.getBoundingClientRect();
      const x =
        (e.clientX -
          containerRect.left -
          this.dragOffset.x -
          this.transform.x) /
        this.transform.scale;
      const y =
        (e.clientY - containerRect.top - this.dragOffset.y - this.transform.y) /
        this.transform.scale;

      this.selectedNode.style.left = x + "px";
      this.selectedNode.style.top = y + "px";
      this.selectedNode.dataset.x = x;
      this.selectedNode.dataset.y = y;

      this.updateConnections();
    } else if (this.isCanvasDragging) {
      // 拖拽画布
      this.transform.x = e.clientX - this.canvasDragStart.x;
      this.transform.y = e.clientY - this.canvasDragStart.y;
      this.updateTransform();
    }
  }

  handleMouseUp(e) {
    if (this.isDragging) {
      this.isDragging = false;
      if (this.selectedNode) {
        this.selectedNode.classList.remove("dragging");
      }
    }

    if (this.isCanvasDragging) {
      this.isCanvasDragging = false;
      this.container.classList.remove("dragging");
    }
  }

  handleWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom(zoomFactor, e.clientX, e.clientY);
  }

  handleNodeMouseDown(e) {
    e.stopPropagation();
    if (e.button === 0) {
      // 左键
      this.isDragging = true;
      this.selectNode(e.currentTarget);
      e.currentTarget.classList.add("dragging");

      const rect = e.currentTarget.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
    }
  }

  handleNodeClick(e) {
    e.stopPropagation();
    if (!this.isDragging) {
      this.selectNode(e.currentTarget);
      window.showAIToolbox(e.currentTarget);
    }
  }

  handleNodeDoubleClick(e) {
    e.stopPropagation();
    window.editNodeTitle(e.currentTarget);
  }

  handleNodeContextMenu(e) {
    e.preventDefault();
    e.stopPropagation();
    this.selectNode(e.currentTarget);
    window.showContextMenu(e.clientX, e.clientY);
  }
}

// 导出画布引擎
window.CanvasEngine = CanvasEngine;
