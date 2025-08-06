'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, Send, FileText, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Grid3X3, List } from 'lucide-react'

interface CourseNode {
  id: string
  title: string
  type: 'root' | 'chapter' | 'section'
  duration?: string
  x: number
  y: number
  children: CourseNode[]
  parent?: string
}

interface FileResource {
  id: string
  name: string
  type: string
  size: string
  enabled: boolean
}

export default function CanvasPage() {
  const [viewMode, setViewMode] = useState<'canvas' | 'list'>('canvas')
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [aiMessage, setAiMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'ai', message: string}>>([])
  const [isAnimating, setIsAnimating] = useState(false)
  
  const canvasRef = useRef<SVGSVGElement>(null)

  // 示例课程数据
  const [courseData, setCourseData] = useState<CourseNode>({
    id: 'root',
    title: '企业团队管理培训',
    type: 'root',
    duration: '8小时',
    x: 400,
    y: 200,
    children: [
      {
        id: 'chapter1',
        title: '第一章：团队管理认知',
        type: 'chapter',
        duration: '2小时',
        x: 200,
        y: 350,
        parent: 'root',
        children: [
          {
            id: 'section1-1',
            title: '1.1 管理者角色转变',
            type: 'section',
            duration: '30分钟',
            x: 100,
            y: 450,
            parent: 'chapter1',
            children: []
          },
          {
            id: 'section1-2',
            title: '1.2 团队管理基础',
            type: 'section',
            duration: '45分钟',
            x: 300,
            y: 450,
            parent: 'chapter1',
            children: []
          }
        ]
      },
      {
        id: 'chapter2',
        title: '第二章：沟通与协作',
        type: 'chapter',
        duration: '3小时',
        x: 600,
        y: 350,
        parent: 'root',
        children: [
          {
            id: 'section2-1',
            title: '2.1 有效沟通技巧',
            type: 'section',
            duration: '60分钟',
            x: 500,
            y: 450,
            parent: 'chapter2',
            children: []
          },
          {
            id: 'section2-2',
            title: '2.2 团队协作方法',
            type: 'section',
            duration: '90分钟',
            x: 700,
            y: 450,
            parent: 'chapter2',
            children: []
          }
        ]
      }
    ]
  })

  // 示例文件资源
  const [fileResources, setFileResources] = useState<FileResource[]>([
    { id: '1', name: '团队管理理论.pdf', type: 'pdf', size: '2.3MB', enabled: true },
    { id: '2', name: '沟通技巧案例.docx', type: 'doc', size: '1.8MB', enabled: true },
    { id: '3', name: '管理工具模板.xlsx', type: 'excel', size: '0.9MB', enabled: false },
    { id: '4', name: '培训视频素材.mp4', type: 'video', size: '45.2MB', enabled: true },
  ])

  // 处理画布拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 缩放控制
  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(0.1, Math.min(3, prev + delta)))
  }

  // 重置视图
  const resetView = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  // 切换文件启用状态
  const toggleFileEnabled = (fileId: string) => {
    setFileResources(prev => 
      prev.map(file => 
        file.id === fileId ? { ...file, enabled: !file.enabled } : file
      )
    )
  }

  // 发送AI消息
  const sendAiMessage = () => {
    if (!aiMessage.trim()) return
    
    setChatHistory(prev => [...prev, { role: 'user', message: aiMessage }])
    
    // 模拟AI回复
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        message: '我已经理解您的需求，正在为您调整课程结构...' 
      }])
    }, 1000)
    
    setAiMessage('')
  }

  // 渲染节点
  const renderNode = (node: CourseNode) => {
    const nodeSize = node.type === 'root' ? 120 : node.type === 'chapter' ? 100 : 80
    const fontSize = node.type === 'root' ? 14 : node.type === 'chapter' ? 12 : 10
    
    return (
      <g key={node.id}>
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeSize / 2}
          fill={node.type === 'root' ? '#3b82f6' : node.type === 'chapter' ? '#10b981' : '#f59e0b'}
          stroke="#fff"
          strokeWidth="3"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        />
        <text
          x={node.x}
          y={node.y - 5}
          textAnchor="middle"
          fontSize={fontSize}
          fill="white"
          fontWeight="bold"
          className="pointer-events-none"
        >
          {node.title.length > 15 ? node.title.substring(0, 15) + '...' : node.title}
        </text>
        {node.duration && (
          <text
            x={node.x}
            y={node.y + 10}
            textAnchor="middle"
            fontSize="10"
            fill="white"
            className="pointer-events-none"
          >
            {node.duration}
          </text>
        )}
      </g>
    )
  }

  // 渲染连接线
  const renderConnections = (node: CourseNode) => {
    return node.children.map(child => (
      <line
        key={`${node.id}-${child.id}`}
        x1={node.x}
        y1={node.y}
        x2={child.x}
        y2={child.y}
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    ))
  }

  // 递归渲染所有节点和连接
  const renderAllNodes = (node: CourseNode): JSX.Element[] => {
    const elements = [renderNode(node), ...renderConnections(node)]
    node.children.forEach(child => {
      elements.push(...renderAllNodes(child))
    })
    return elements
  }

  // 渲染目录模式
  const renderListMode = () => {
    const renderNodeList = (node: CourseNode, level: number = 0) => (
      <div key={node.id} className={`ml-${level * 4}`}>
        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
          <div className="flex items-center space-x-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                node.type === 'root' ? 'bg-blue-500' : 
                node.type === 'chapter' ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <span className="font-medium">{node.title}</span>
          </div>
          {node.duration && (
            <Badge variant="secondary">{node.duration}</Badge>
          )}
        </div>
        {node.children.map(child => renderNodeList(child, level + 1))}
      </div>
    )

    return (
      <ScrollArea className="h-full">
        {renderNodeList(courseData)}
      </ScrollArea>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左侧资源库 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">统一资源库</h2>
          <p className="text-sm text-gray-600">选择要使用的文件资源</p>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {fileResources.map(file => (
              <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFileEnabled(file.id)}
                  className={file.enabled ? 'text-blue-600' : 'text-gray-400'}
                >
                  {file.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 中间画布区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => handleZoom(0.1)}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleZoom(-0.1)}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <span className="text-sm text-gray-600">缩放: {Math.round(scale * 100)}%</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'canvas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('canvas')}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              画布模式
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              目录模式
            </Button>
          </div>
        </div>

        {/* 画布内容 */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'canvas' ? (
            <svg
              ref={canvasRef}
              className="w-full h-full cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#6b7280"
                  />
                </marker>
              </defs>
              <g transform={`translate(${offset.x}, ${offset.y}) scale(${scale})`}>
                {renderAllNodes(courseData)}
              </g>
            </svg>
          ) : (
            <div className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle>课程目录</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderListMode()}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* 右侧AI修改面板 */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">AI 课程助手</h2>
          <p className="text-sm text-gray-600">告诉AI如何修改您的课程</p>
        </div>
        
        {/* 聊天历史 */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{chat.message}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              placeholder="输入您的修改需求..."
              value={aiMessage}
              onChange={(e) => setAiMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendAiMessage()}
            />
            <Button onClick={sendAiMessage} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
