'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Upload, FileText, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CourseCreationPage() {
  const [courseTitle, setCourseTitle] = useState('')
  const [aiGenerate, setAiGenerate] = useState(false)
  const [courseTopic, setCourseTopic] = useState('')
  const [studentIdentity, setStudentIdentity] = useState('')
  const [courseGoals, setCourseGoals] = useState('')
  const [courseDuration, setCourseDuration] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 处理表单提交逻辑
    console.log({
      courseTitle,
      aiGenerate,
      courseTopic,
      studentIdentity,
      courseGoals,
      courseDuration,
      uploadedFiles
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">企业AI制课平台</h1>
          <p className="text-lg text-gray-600">创建您的专属课程内容</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">新建课程</CardTitle>
            <CardDescription className="text-center">
              填写以下信息来创建您的课程
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 课程标题 */}
              <div className="space-y-2">
                <Label htmlFor="courseTitle" className="text-base font-medium">
                  课程标题
                </Label>
                <div className="flex items-center space-x-3">
                  <Input
                    id="courseTitle"
                    placeholder="请输入课程标题"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="flex-1"
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="aiGenerate"
                      checked={aiGenerate}
                      onCheckedChange={(checked) => setAiGenerate(checked as boolean)}
                    />
                    <Label htmlFor="aiGenerate" className="text-sm">
                      AI生成
                    </Label>
                  </div>
                </div>
              </div>

              {/* 课程主题 */}
              <div className="space-y-2">
                <Label htmlFor="courseTopic" className="text-base font-medium">
                  课程主题
                </Label>
                <Textarea
                  id="courseTopic"
                  placeholder="请描述课程的主要主题和内容方向"
                  value={courseTopic}
                  onChange={(e) => setCourseTopic(e.target.value)}
                  rows={3}
                />
              </div>

              {/* 学员身份 */}
              <div className="space-y-2">
                <Label htmlFor="studentIdentity" className="text-base font-medium">
                  学员身份
                </Label>
                <Input
                  id="studentIdentity"
                  placeholder="请输入目标学员身份，如：新员工、技术人员、管理层等"
                  value={studentIdentity}
                  onChange={(e) => setStudentIdentity(e.target.value)}
                />
              </div>

              {/* 课程目标 */}
              <div className="space-y-2">
                <Label htmlFor="courseGoals" className="text-base font-medium">
                  课程目标
                </Label>
                <Textarea
                  id="courseGoals"
                  placeholder="请描述学员完成课程后应该达到的学习目标"
                  value={courseGoals}
                  onChange={(e) => setCourseGoals(e.target.value)}
                  rows={4}
                />
              </div>

              {/* 课程时长 */}
              <div className="space-y-2">
                <Label htmlFor="courseDuration" className="text-base font-medium">
                  课程时长
                </Label>
                <Select value={courseDuration} onValueChange={setCourseDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择课程时长" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2hours">1-2小时</SelectItem>
                    <SelectItem value="3-5hours">3-5小时</SelectItem>
                    <SelectItem value="6-10hours">6-10小时</SelectItem>
                    <SelectItem value="1-2days">1-2天</SelectItem>
                    <SelectItem value="1week">1周</SelectItem>
                    <SelectItem value="2-4weeks">2-4周</SelectItem>
                    <SelectItem value="1-3months">1-3个月</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 文件上传 */}
              <div className="space-y-2">
                <Label className="text-base font-medium">课程资料</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="fileUpload"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                  />
                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      点击上传文件
                    </p>
                    <p className="text-sm text-gray-500">
                      支持 PDF, DOC, PPT, TXT, MD 等格式
                    </p>
                  </label>
                </div>

                {/* 已上传文件列表 */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">已上传文件：</Label>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 提交按钮 */}
              <div className="flex justify-center pt-6">
                <Button type="submit" size="lg" className="px-8">
                  创建课程
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
