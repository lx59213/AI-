// 导出管理器 - 处理SVG和Markdown导出
class ExportManager {
  constructor(canvasEngine) {
    this.canvasEngine = canvasEngine;
  }

  // 生成SVG思维导图
  generateSVG() {
    if (!this.canvasEngine || this.canvasEngine.nodes.length === 0) {
      throw new Error('没有可导出的内容');
    }

    const nodes = this.canvasEngine.nodes;
    const connections = this.canvasEngine.connections;
    
    // 计算画布边界
    const bounds = this.calculateBounds(nodes);
    const padding = 50;
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    // 创建SVG内容
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <style>
      .root-node { fill: #0f766e; stroke: #134e4a; stroke-width: 3; }
      .chapter-node { fill: #48bb78; stroke: #38a169; stroke-width: 2; }
      .topic-node { fill: #ed8936; stroke: #dd6b20; stroke-width: 2; }
      .node-text { fill: white; font-family: 'Arial', sans-serif; font-size: 14px; text-anchor: middle; dominant-baseline: middle; }
      .connection { stroke: #a0aec0; stroke-width: 2; fill: none; }
      .source-indicator { fill: #0f766e; stroke: white; stroke-width: 1; }
    </style>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#a0aec0"/>
    </marker>
  </defs>
  
  <g transform="translate(${padding}, ${padding})">`;

    // 绘制连接线
    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.dataset.id === conn.from);
      const toNode = nodes.find(n => n.dataset.id === conn.to);
      
      if (fromNode && toNode) {
        const fromRect = this.getNodeBounds(fromNode, bounds);
        const toRect = this.getNodeBounds(toNode, bounds);
        
        const fromX = fromRect.x + fromRect.width / 2;
        const fromY = fromRect.y + fromRect.height / 2;
        const toX = toRect.x + toRect.width / 2;
        const toY = toRect.y + toRect.height / 2;
        
        svgContent += `
    <path class="connection" d="M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY} ${toX} ${toY}" marker-end="url(#arrowhead)"/>`;
      }
    });

    // 绘制节点
    nodes.forEach(node => {
      const rect = this.getNodeBounds(node, bounds);
      const nodeType = node.dataset.type;
      const title = node.dataset.title || node.querySelector('.node-text')?.textContent || '';
      const sources = node.dataset.sources ? JSON.parse(node.dataset.sources) : [];
      
      // 绘制节点矩形
      svgContent += `
    <rect class="${nodeType}-node" x="${rect.x}" y="${rect.y}" width="${rect.width}" height="${rect.height}" rx="8"/>`;
      
      // 绘制节点文本
      svgContent += `
    <text class="node-text" x="${rect.x + rect.width / 2}" y="${rect.y + rect.height / 2}">${this.escapeXml(title)}</text>`;
      
      // 绘制溯源指示器
      if (sources.length > 0) {
        svgContent += `
    <circle class="source-indicator" cx="${rect.x + rect.width - 10}" cy="${rect.y + 10}" r="6"/>
    <text x="${rect.x + rect.width - 10}" y="${rect.y + 10}" text-anchor="middle" dominant-baseline="middle" font-size="8" fill="white">🔗</text>`;
      }
    });

    svgContent += `
  </g>
</svg>`;

    return svgContent;
  }

  // 生成Markdown思维导图
  generateMarkdown() {
    if (!this.canvasEngine || this.canvasEngine.nodes.length === 0) {
      throw new Error('没有可导出的内容');
    }

    const nodes = this.canvasEngine.nodes;
    const rootNode = nodes.find(n => n.dataset.type === 'root');
    
    if (!rootNode) {
      throw new Error('找不到根节点');
    }

    let markdown = `# ${this.getNodeTitle(rootNode)}\n\n`;
    
    // 添加课程概述
    if (rootNode.dataset.content) {
      markdown += `## 课程概述\n\n${rootNode.dataset.content}\n\n`;
    }

    // 构建节点层次结构
    const hierarchy = this.buildHierarchy(nodes);
    
    // 生成章节内容
    const chapters = hierarchy.children || [];
    chapters.forEach((chapter, chapterIndex) => {
      markdown += `## ${chapterIndex + 1}. ${this.getNodeTitle(chapter.node)}\n\n`;
      
      if (chapter.node.dataset.content) {
        markdown += `${chapter.node.dataset.content}\n\n`;
      }
      
      // 添加来源信息
      const chapterSources = this.getNodeSources(chapter.node);
      if (chapterSources.length > 0) {
        markdown += `**参考来源:** ${chapterSources.map(s => `[${s}]`).join(', ')}\n\n`;
      }
      
      // 生成子主题
      const topics = chapter.children || [];
      topics.forEach((topic, topicIndex) => {
        markdown += `### ${chapterIndex + 1}.${topicIndex + 1} ${this.getNodeTitle(topic.node)}\n\n`;
        
        if (topic.node.dataset.content) {
          markdown += `${topic.node.dataset.content}\n\n`;
        }
        
        // 添加来源信息
        const topicSources = this.getNodeSources(topic.node);
        if (topicSources.length > 0) {
          markdown += `**参考来源:** ${topicSources.map(s => `[${s}]`).join(', ')}\n\n`;
        }
      });
    });

    // 添加来源索引
    const allSources = this.getAllSources(nodes);
    if (allSources.length > 0) {
      markdown += `## 参考资料\n\n`;
      allSources.forEach((source, index) => {
        markdown += `[${source}]: 来源文档片段 ${index + 1}\n`;
      });
    }

    return markdown;
  }

  // 计算所有节点的边界
  calculateBounds(nodes) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      const x = parseInt(node.dataset.x) || 0;
      const y = parseInt(node.dataset.y) || 0;
      const width = parseInt(node.style.width) || 200;
      const height = parseInt(node.style.height) || 60;
      
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });
    
    return {
      minX,
      minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // 获取节点在SVG中的位置和大小
  getNodeBounds(node, bounds) {
    const x = parseInt(node.dataset.x) || 0;
    const y = parseInt(node.dataset.y) || 0;
    const width = parseInt(node.style.width) || 200;
    const height = parseInt(node.style.height) || 60;
    
    return {
      x: x - bounds.minX,
      y: y - bounds.minY,
      width,
      height
    };
  }

  // 获取节点标题
  getNodeTitle(node) {
    return node.dataset.title || node.querySelector('.node-text')?.textContent || '未命名节点';
  }

  // 获取节点来源
  getNodeSources(node) {
    try {
      return node.dataset.sources ? JSON.parse(node.dataset.sources) : [];
    } catch (e) {
      return [];
    }
  }

  // 获取所有来源
  getAllSources(nodes) {
    const sources = new Set();
    nodes.forEach(node => {
      this.getNodeSources(node).forEach(source => sources.add(source));
    });
    return Array.from(sources);
  }

  // 构建节点层次结构
  buildHierarchy(nodes) {
    const rootNode = nodes.find(n => n.dataset.type === 'root');
    if (!rootNode) return null;

    const nodeMap = new Map();
    nodes.forEach(node => {
      nodeMap.set(node.dataset.id, {
        node,
        children: []
      });
    });

    // 简化的层次结构构建（实际项目中需要根据连接关系构建）
    const root = nodeMap.get(rootNode.dataset.id);
    const chapters = nodes.filter(n => n.dataset.type === 'chapter');
    const topics = nodes.filter(n => n.dataset.type === 'topic');

    chapters.forEach(chapter => {
      const chapterNode = nodeMap.get(chapter.dataset.id);
      root.children.push(chapterNode);
      
      // 简单地将所有topic分配给章节（实际应该根据连接关系）
      topics.forEach(topic => {
        const topicNode = nodeMap.get(topic.dataset.id);
        chapterNode.children.push(topicNode);
      });
    });

    return root;
  }

  // XML转义
  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 导出文件
  exportFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// 全局导出管理器实例
let exportManager = null;

// 初始化导出管理器
function initializeExportManager(canvasEngine) {
  exportManager = new ExportManager(canvasEngine);
}

// 导出SVG
function exportSVG() {
  if (!exportManager) {
    alert('导出管理器未初始化');
    return;
  }
  
  try {
    const svgContent = exportManager.generateSVG();
    exportManager.exportFile(svgContent, 'mindmap.svg', 'image/svg+xml');
  } catch (error) {
    alert('导出SVG失败：' + error.message);
  }
}

// 导出Markdown
function exportMarkdown() {
  if (!exportManager) {
    alert('导出管理器未初始化');
    return;
  }
  
  try {
    const mdContent = exportManager.generateMarkdown();
    exportManager.exportFile(mdContent, 'mindmap.md', 'text/markdown');
  } catch (error) {
    alert('导出Markdown失败：' + error.message);
  }
}