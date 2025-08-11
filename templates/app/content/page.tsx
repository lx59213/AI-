'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Send, MoreVertical, Edit3, Expand, Minimize, Languages, Trash2, Eye, EyeOff, Save, Download, GripVertical, Sparkles, Volume2 } from 'lucide-react'

interface ContentSection {
  id: string
  type: 'h1' | 'h2' | 'h3' | 'p'
  content: string
  level: number
  selected: boolean
}

interface ChatMessage {
  role: 'user' | 'ai'
  message: string
  timestamp: Date
  context?: string
}

interface OutlineItem {
  id: string
  title: string
  level: number
  children: OutlineItem[]
}

export default function EnhancedContentPage() {
  const [contentSections, setContentSections] = useState<ContentSection[]>([
    { id: '1', type: 'h1', content: '第一章：团队管理认知', level: 1, selected: false },
    { id: '2', type: 'h2', content: '1.1 管理者角色转变', level: 2, selected: false },
    { id: '3', type: 'p', content: '在现代企业环境中，管理者的角色正在发生深刻的变化。传统的命令式管理模式已经无法适应快速变化的市场需求和员工期望。现代管理者需要从"指挥者"转变为"引导者"，从"控制者"转变为"赋能者"。', level: 2, selected: false },
    { id: '4', type: 'p', content: '这种转变要求管理者具备更强的情商、沟通能力和适应性。他们需要学会倾听员工的声音，理解团队成员的需求，并创造一个支持创新和协作的工作环境。', level: 2, selected: false },
    { id: '5', type: 'h2', content: '1.2 团队管理基础', level: 2, selected: false },
    { id: '6', type: 'p', content: '有效的团队管理建立在几个核心原则之上：明确的目标设定、清晰的角色分工、开放的沟通渠道、以及持续的反馈机制。', level: 2, selected: false },
    { id: '7', type: 'h1', content: '第二章：沟通与协作', level: 1, selected: false },
    { id: '8', type: 'h2', content: '2.1 有效沟通技巧', level: 2, selected: false },
    { id: '9', type: 'p', content: '沟通是团队成功的基石。研究表明，70%的工作问题都源于沟通不畅。有效的沟通不仅仅是信息的传递，更是理解和共识的建立。', level: 2, selected: false },
  ])

  const [hoveredSection, setHoveredSection] = useState<string | null>(null)
  const [selectionMode, setSelectionMode] = useState<'single' | 'paragraph'>('single')
  const [selectedText, setSelectedText] = useState<string>('')
  const [aiMessage, setAiMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'ai',
      message: '您好！我是您的课程内容助手。您可以选中任何文字与我对话，我会根据上下文为您提供帮助。',
      timestamp: new Date()
    }
  ])
  const [draggedSection, setDraggedSection] = useState<string | null>(null)
  const [isMarkdownMode, setIsMarkdownMode] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)

  // 生成大纲结构
  const generateOutline = (): OutlineItem[] => {
    const outline: OutlineItem[] = []
    let currentH1: OutlineItem | null = null
    let currentH2: OutlineItem | null = null

    contentSections.forEach(section => {
      if (section.type === 'h1') {
        currentH1 = {
          id: section.id,
          title: section.content,
          level: 1,
          children: []
        }
        outline.push(currentH1)
        currentH2 = null
      } else if (section.type === 'h2' && currentH1) {
        currentH2 = {
          id: section.id,
          title: section.content,
          level: 2,
          children: []
        }
        currentH1.children.push(currentH2)
      } else if (section.type === 'h3' && currentH2) {
        const h3Item = {
          id: section.id,
          title: section.content,
          level: 3,
          children: []
        }
        currentH2.children.push(h3Item)
      }
    })

    return outline
  }

  // 跳转到指定章节
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // 处理文字选择
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
    }
  }

  // 切换选择模式
  const toggleSelectionMode = (sectionId: string) => {
    const newMode = selectionMode === 'single' ? 'paragraph' : 'single'
    setSelectionMode(newMode)
    
    if (newMode === 'paragraph') {
      selectParagraphMode(sectionId)
    } else {
      selectSingleMode(sectionId)
    }
  }

  // 单行模式选择
  const selectSingleMode = (sectionId: string) => {
    setContentSections(prev => 
      prev.map(section => ({
        ...section,
        selected: section.id === sectionId
      }))
    )
  }

  // 段落模式选择
  const selectParagraphMode = (sectionId: string) => {
    const sectionIndex = contentSections.findIndex(s => s.id === sectionId)
    if (sectionIndex === -1) return

    const currentSection = contentSections[sectionIndex]
    const sectionsToSelect: string[] = [sectionId]

    // 如果是标题，选择到下一个同级或更高级标题之前的所有内容
    if (currentSection.type.startsWith('h')) {
      for (let i = sectionIndex + 1; i < contentSections.length; i++) {
        const nextSection = contentSections[i]
        if (nextSection.type.startsWith('h') && nextSection.level <= currentSection.level) {
          break
        }
        sectionsToSelect.push(nextSection.id)
      }
    }

    setContentSections(prev => 
      prev.map(section => ({
        ...section,
        selected: sectionsToSelect.includes(section.id)
      }))
    )
  }

  // AI操作处理
  const handleAiAction = (action: string, sectionId: string) => {
    const section = contentSections.find(s => s.id === sectionId)
    if (!section) return

    let actionMessage = ''
    switch (action) {
      case 'polish':
        actionMessage = `请帮我润色这段文字：${section.content}`
        break
      case 'expand':
        actionMessage = `请帮我扩写这段内容：${section.content}`
        break
      case 'compress':
        actionMessage = `请帮我压缩这段文字：${section.content}`
        break
      case 'tone':
        actionMessage = `请帮我改变这段文字的语气，使其更加专业：${section.content}`
        break
      case 'translate':
        actionMessage = `请帮我翻译这段文字：${section.content}`
        break
    }

    setChatHistory(prev => [...prev, {
      role: 'user',
      message: actionMessage,
      timestamp: new Date(),
      context: section.content
    }])

    // 模拟AI回复
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'ai',
        message: generateAiResponse(action, section.content),
        timestamp: new Date()
      }])
    }, 1000)
  }

  // 生成AI回复
  const generateAiResponse = (action: string, content: string): string => {
    const responses = {
      polish: `我已经为您润色了这段文字，使其更加流畅和专业。建议修改为：\n\n"${content.replace('管理者', '优秀的管理者').replace('需要', '必须')}"`,
      expand: `我为您扩展了这段内容，增加了更多细节和例子：\n\n"${content} 具体来说，这包括建立信任关系、提供及时反馈、创造学习机会等多个方面。"`,
      compress: `我为您精简了这段文字：\n\n"${content.substring(0, content.length / 2)}..."`,
      tone: `我已经调整了语气，使其更加正式和专业：\n\n"${content.replace('需要', '应当').replace('他们', '管理人员')}"`,
      translate: `英文翻译：\n\n"${content.includes('管理者') ? 'In the modern business environment, the role of managers is undergoing profound changes.' : 'Translation of the selected text.'}"`,
    }
    return responses[action as keyof typeof responses] || '我已经处理了您的请求。'
  }

  // 删除段落
  const deleteSection = (sectionId: string) => {
    setContentSections(prev => prev.filter(section => section.id !== sectionId))
  }

  // 发送AI消息
  const sendAiMessage = () => {
    if (!aiMessage.trim()) return
    
    const newMessage: ChatMessage = {
      role: 'user',
      message: aiMessage,
      timestamp: new Date(),
      context: selectedText
    }
    
    setChatHistory(prev => [...prev, newMessage])
    
    // 模拟AI回复
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'ai',
        message: `基于您选中的内容"${selectedText.substring(0, 50)}..."，我的建议是：${aiMessage.includes('优化') ? '可以增加更多实例来支撑观点' : '这个想法很好，我会帮您实现'}`,
        timestamp: new Date()
      }])
    }, 1000)
    
    setAiMessage('')
  }

  // 拖拽处理
  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedSection || draggedSection === targetId) return

    const draggedIndex = contentSections.findIndex(s => s.id === draggedSection)
    const targetIndex = contentSections.findIndex(s => s.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newSections = [...contentSections]
    const [draggedItem] = newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, draggedItem)

    setContentSections(newSections)
    setDraggedSection(null)
  }

  // 渲染大纲
  const renderOutlineItem = (item: OutlineItem, depth: number = 0) => (
    <div key={item.id} className={`ml-${depth * 3}`}>
      <button
        onClick={() => scrollToSection(item.id)}
        className={`w-full text-left p-2 text-sm hover:bg-gray-100 rounded transition-colors ${
          depth === 0 ? 'font-semibold text-gray-900' : 
          depth === 1 ? 'font-medium text-gray-700' : 'text-gray-600'
        }`}
      >
        {item.title}
      </button>
      {item.children.map(child => renderOutlineItem(child, depth + 1))}
    </div>
  )

  // 渲染内容区域
  const renderContentSection = (section: ContentSection) => {
    const isHovered = hoveredSection === section.id
    const isSelected = section.selected

    return (
      <div
        key={section.id}
        id={`section-${section.id}`}
        className={`group relative ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500 pl-4' : ''}`}
        onMouseEnter={() => setHoveredSection(section.id)}
        onMouseLeave={() => setHoveredSection(null)}
        draggable
        onDragStart={() => handleDragStart(section.id)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, section.id)}
      >
        <div className="flex items-start">
          {/* 左侧操作按钮 */}
          <div className="flex items-center mr-2 mt-1">
            {isHovered && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                    onDoubleClick={() => toggleSelectionMode(section.id)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" side="right">
                  <div className="grid gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleAiAction('polish', section.id)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI润色
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleAiAction('expand', section.id)}
                    >
                      <Expand className="h-4 w-4 mr-2" />
                      扩写
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleAiAction('compress', section.id)}
                    >
                      <Minimize className="h-4 w-4 mr-2" />
                      缩写
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleAiAction('tone', section.id)}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      改变语气
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleAiAction('translate', section.id)}
                    >
                      <Languages className="h-4 w-4 mr-2" />
                      翻译
                    </Button>
                    <Separator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-red-600 hover:text-red-700"
                      onClick={() => deleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除本段
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          </div>

          {/* 内容区域 */}
          <div className="flex-1" onMouseUp={handleTextSelection}>
            {section.type === 'h1' && (
              <h1 className="text-2xl font-bold text-gray-900 mb-4 cursor-text">
                {section.content}
              </h1>
            )}
            {section.type === 'h2' && (
              <h2 className="text-xl font-semibold text-gray-800 mb-3 cursor-text">
                {section.content}
              </h2>
            )}
            {section.type === 'h3' && (
              <h3 className="text-lg font-medium text-gray-700 mb-2 cursor-text">
                {section.content}
              </h3>
            )}
            {section.type === 'p' && (
              <p className="text-gray-700 leading-relaxed mb-4 cursor-text">
                {section.content}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左侧大纲导航 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">课程大纲</h2>
          <p className="text-sm text-gray-600">点击快速跳转</p>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {generateOutline().map(item => renderOutlineItem(item))}
          </div>
        </ScrollArea>
      </div>

      {/* 中间主编辑区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">课程内容编辑</h1>
            <Badge variant="secondary">
              模式: {selectionMode === 'single' ? '单行' : '段落'}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={isMarkdownMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsMarkdownMode(!isMarkdownMode)}
            >
              {isMarkdownMode ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {isMarkdownMode ? '编辑模式' : '预览模式'}
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
          </div>
        </div>

        {/* 内容编辑区 */}
        <ScrollArea className="flex-1">
          <div ref={contentRef} className="max-w-4xl mx-auto p-6 space-y-2">
            {contentSections.map(section => renderContentSection(section))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧AI对话框 */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">AI 内容助手</h2>
          <p className="text-sm text-gray-600">选中文字进行上下文对话</p>
          {selectedText && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <div className="flex items-center space-x-1 mb-1">
                <Eye className="h-3 w-3 text-blue-600" />
                <span className="text-blue-600 font-medium">已选中内容</span>
              </div>
              <p className="text-gray-700 line-clamp-2">
                {selectedText.substring(0, 100)}...
              </p>
            </div>
          )}
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
                  className={`max-w-[85%] p-3 rounded-lg ${
                    chat.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                  {chat.context && (
                    <div className="mt-2 pt-2 border-t border-blue-400 text-xs opacity-80">
                      上下文: {chat.context.substring(0, 50)}...
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    chat.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {chat.timestamp.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* 输入区域 */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <Input
              placeholder={selectedText ? "基于选中内容提问..." : "输入您的问题..."}
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
