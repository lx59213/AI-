'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Send, BookOpen, Clock, CheckCircle, Loader2, Save, Download, Eye } from 'lucide-react'

interface KnowledgePoint {
  id: string
  title: string
  description: string
  status: 'pending' | 'generating' | 'completed'
}

interface CourseContent {
  id: string
  chapterId: string
  chapterTitle: string
  knowledgePoints: KnowledgePoint[]
  content: string
  status: 'pending' | 'generating' | 'completed'
  estimatedTime: string
}

interface ChatMessage {
  role: 'user' | 'ai'
  message: string
  timestamp: Date
}

export default function ContentGenerationPage() {
  const [courseContents, setCourseContents] = useState<CourseContent[]>([])
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [aiMessage, setAiMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'ai',
      message: '您好！我已经开始为您生成课程内容。首先我会分析大纲并提取知识点，然后为每个知识点生成详细的教学内容。',
      timestamp: new Date()
    }
  ])
  const [isGenerating, setIsGenerating] = useState(true)

  // 模拟课程数据（从上一页传入）
  const courseOutline = {
    title: '企业团队管理培训',
    chapters: [
      {
        id: 'chapter1',
        title: '第一章：团队管理认知',
        sections: ['1.1 管理者角色转变', '1.2 团队管理基础']
      },
      {
        id: 'chapter2',
        title: '第二章：沟通与协作',
        sections: ['2.1 有效沟通技巧', '2.2 团队协作方法']
      }
    ]
  }

  // 模拟AI生成内容的过程
  useEffect(() => {
    if (isGenerating) {
      simulateContentGeneration()
    }
  }, [isGenerating])

  const simulateContentGeneration = async () => {
    const contents: CourseContent[] = courseOutline.chapters.map(chapter => ({
      id: chapter.id,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      knowledgePoints: [],
      content: '',
      status: 'pending' as const,
      estimatedTime: '45分钟'
    }))

    setCourseContents(contents)

    // 逐个生成章节内容
    for (let i = 0; i < contents.length; i++) {
      const chapter = contents[i]
      setCurrentGenerating(chapter.id)
      
      // 更新状态为生成中
      setCourseContents(prev => 
        prev.map(c => c.id === chapter.id ? { ...c, status: 'generating' } : c)
      )

      // 模拟生成知识点
      await new Promise(resolve => setTimeout(resolve, 1000))
      const knowledgePoints = generateKnowledgePoints(chapter.chapterTitle)
      
      setCourseContents(prev => 
        prev.map(c => c.id === chapter.id ? { ...c, knowledgePoints } : c)
      )

      // 模拟生成内容
      for (let j = 0; j < knowledgePoints.length; j++) {
        setGenerationProgress((j + 1) / knowledgePoints.length * 100)
        await new Promise(resolve => setTimeout(resolve, 800))
        
        setCourseContents(prev => 
          prev.map(c => {
            if (c.id === chapter.id) {
              const updatedPoints = c.knowledgePoints.map((kp, index) => 
                index === j ? { ...kp, status: 'completed' as const } : kp
              )
              return { ...c, knowledgePoints: updatedPoints }
            }
            return c
          })
        )
      }

      // 生成完整内容
      await new Promise(resolve => setTimeout(resolve, 1500))
      const content = generateChapterContent(chapter.chapterTitle, knowledgePoints)
      
      setCourseContents(prev => 
        prev.map(c => c.id === chapter.id ? { 
          ...c, 
          content, 
          status: 'completed' 
        } : c)
      )

      setGenerationProgress(0)
    }

    setCurrentGenerating(null)
    setIsGenerating(false)
    
    // 添加完成消息
    setChatHistory(prev => [...prev, {
      role: 'ai',
      message: '🎉 课程内容生成完成！我已经为您生成了完整的教学内容，包括详细的知识点讲解、案例分析和实践练习。您可以查看并根据需要进行调整。',
      timestamp: new Date()
    }])
  }

  const generateKnowledgePoints = (chapterTitle: string): KnowledgePoint[] => {
    const pointsMap: { [key: string]: KnowledgePoint[] } = {
      '第一章：团队管理认知': [
        { id: 'kp1-1', title: '管理者角色定义', description: '理解管理者在团队中的核心职责', status: 'generating' },
        { id: 'kp1-2', title: '领导力基础理论', description: '掌握基本的领导力理论框架', status: 'pending' },
        { id: 'kp1-3', title: '团队发展阶段', description: '了解团队发展的不同阶段特征', status: 'pending' },
        { id: 'kp1-4', title: '管理风格适配', description: '学会根据情况调整管理风格', status: 'pending' }
      ],
      '第二章：沟通与协作': [
        { id: 'kp2-1', title: '有效沟通原则', description: '掌握高效沟通的基本原则', status: 'generating' },
        { id: 'kp2-2', title: '倾听技巧训练', description: '提升主动倾听和理解能力', status: 'pending' },
        { id: 'kp2-3', title: '冲突处理方法', description: '学会处理团队内部冲突', status: 'pending' },
        { id: 'kp2-4', title: '协作工具应用', description: '熟练使用各种协作工具', status: 'pending' }
      ]
    }
    return pointsMap[chapterTitle] || []
  }

  const generateChapterContent = (chapterTitle: string, knowledgePoints: KnowledgePoint[]): string => {
    return `
# ${chapterTitle}

## 学习目标
通过本章学习，您将能够：
${knowledgePoints.map(kp => `- ${kp.description}`).join('\n')}

## 核心内容

### 1. 理论基础
${chapterTitle.includes('管理认知') ? 
`团队管理是一门综合性的学科，涉及心理学、组织行为学、领导力理论等多个领域。作为管理者，需要具备以下核心能力：

**管理者的核心职责：**
- 目标设定与规划
- 资源配置与优化
- 团队激励与发展
- 绩效监控与改进

**领导力发展路径：**
1. 自我认知阶段
2. 技能建设阶段  
3. 实践应用阶段
4. 持续优化阶段` :
`有效的沟通是团队成功的基石。研究表明，70%的工作问题都源于沟通不畅。本章将帮助您掌握：

**沟通的基本要素：**
- 信息发送者的表达能力
- 信息接收者的理解能力
- 沟通渠道的选择
- 反馈机制的建立

**高效沟通的原则：**
1. 明确性原则 - 信息要清晰准确
2. 完整性原则 - 信息要全面完整
3. 及时性原则 - 沟通要适时进行
4. 双向性原则 - 注重互动反馈`}

### 2. 实践案例
**案例分析：**
某科技公司团队在项目执行过程中遇到的挑战，通过应用本章理论知识，成功解决了团队协作问题，项目效率提升了40%。

### 3. 练习与思考
1. 结合您的工作经验，分析一个团队管理的成功案例
2. 设计一个适合您团队的沟通机制
3. 制定个人领导力发展计划

### 4. 工具与模板
- 团队角色分析表
- 沟通效果评估表
- 冲突处理流程图
- 协作工具对比表

---
*预计学习时间：45分钟*
*建议实践时间：2小时*
    `.trim()
  }

  const sendAiMessage = () => {
    if (!aiMessage.trim()) return
    
    const newMessage: ChatMessage = {
      role: 'user',
      message: aiMessage,
      timestamp: new Date()
    }
    
    setChatHistory(prev => [...prev, newMessage])
    
    // 模拟AI回复
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'ai',
        message: generateAiResponse(aiMessage),
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, aiResponse])
    }, 1000)
    
    setAiMessage('')
  }

  const generateAiResponse = (userMessage: string): string => {
    const responses = [
      '我理解您的需求，让我为您调整课程内容的重点和结构。',
      '好的，我会根据您的反馈优化这部分内容，使其更加实用。',
      '您的建议很有价值，我会在内容中增加更多实际案例。',
      '我已经记录了您的修改要求，正在为您重新生成相关内容。',
      '明白了，我会调整内容的难度级别，使其更适合目标学员。'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左侧组件区域 - 预留 */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">工具面板</h2>
          <p className="text-sm text-gray-600">功能开发中...</p>
        </div>
        <div className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">此区域预留给</p>
            <p className="text-sm">未来功能扩展</p>
          </div>
        </div>
      </div>

      {/* 中间内容展示区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部状态栏 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">课程内容生成</h1>
            {isGenerating && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600">AI正在生成内容...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              导出
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              预览
            </Button>
          </div>
        </div>

        {/* 内容区域 */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {courseContents.map((content) => (
              <Card key={content.id} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <span>{content.chapterTitle}</span>
                      {content.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {content.status === 'generating' && (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      )}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{content.estimatedTime}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 知识点展示 */}
                  {content.knowledgePoints.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">核心知识点</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {content.knowledgePoints.map((kp) => (
                          <div key={kp.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            {kp.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                            {kp.status === 'generating' && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                            {kp.status === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                            <div>
                              <p className="text-sm font-medium">{kp.title}</p>
                              <p className="text-xs text-gray-600">{kp.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 生成进度 */}
                  {content.status === 'generating' && currentGenerating === content.id && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">内容生成进度</span>
                        <span className="text-sm text-gray-600">{Math.round(generationProgress)}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>
                  )}

                  {/* 生成的内容 */}
                  {content.content && (
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {content.content}
                      </div>
                    </div>
                  )}

                  {/* 等待生成状态 */}
                  {content.status === 'pending' && (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">等待生成内容...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧AI交互面板 */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">AI 内容助手</h2>
          <p className="text-sm text-gray-600">优化和调整课程内容</p>
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
                  <p className="text-sm">{chat.message}</p>
                  <p className={`text-xs mt-1 ${
                    chat.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(chat.timestamp)}
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
              placeholder="告诉AI如何优化内容..."
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
