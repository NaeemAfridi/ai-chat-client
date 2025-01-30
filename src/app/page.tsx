"use client"

import { useState } from "react"
import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import ChatInterface from "./components/ChatInterface"

interface File {
  _id: string
  name: string
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setIsSidebarOpen(false)
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex-1 overflow-hidden">
      <div className="flex  overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onFileSelect={handleFileSelect} />
        <main  className="flex flex-col w-full">
          <Header onMenuClick={toggleSidebar} />
          <ChatInterface selectedFile={selectedFile} />
        </main>
      </div>
    </div>
  )
}

