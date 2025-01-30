"use client"

import { useCallback, useEffect, useState, useRef } from "react"
import { ArrowUp, Trash2 } from "lucide-react"
import Image from "next/image"
import { chatWithAI, getChatHistory, deleteChat } from "../services/api"
import debounce from "lodash/debounce"

interface File {
  _id: string
  name: string
}

interface ChatInterfaceProps {
  selectedFile: File | null
}

interface Message {
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ChatInterface({ selectedFile }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedFile) {
      console.log("Selected File:", selectedFile)
      setMessages([{ text: `File selected: ${selectedFile.name}`, isUser: false, timestamp: new Date() }])
      fetchChatHistory(selectedFile._id)
    } else {
      setMessages([])
    }
  }, [selectedFile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const fetchChatHistory = async (fileId: string) => {
    try {
      const { chatHistory } = await getChatHistory(fileId)
      setMessages(chatHistory)
    } catch (error) {
      console.error("Error fetching chat history:", error)
    }
  }

  const debouncedChatWithAI = useCallback(
    debounce(async (fileId: string, prompt: string) => {
      try {
        const { response, chatHistory } = await chatWithAI(fileId, prompt)
        setMessages(chatHistory)
        setIsLoading(false)
      } catch (error) {

        console.error("Error chatting with AI:", error)
        setMessages((prev) => [
          ...prev,
          { text: "Error: Unable to get a response from AI.", isUser: false, timestamp: new Date() },
        ])
        setIsLoading(false)
      }
    }, 300),
    [],
  )

  const handleSend = async () => {
    if (input.trim() && selectedFile) {
      const newMessage: Message = { text: input, isUser: true, timestamp: new Date() }
      setMessages((prev) => [...prev, newMessage])
      setInput("")
      setIsLoading(true)
      debouncedChatWithAI(selectedFile._id, input)
    }
  }

  const handleDeleteChat = async () => {
    if (selectedFile) {
      try {
        await deleteChat(selectedFile._id)
        setMessages([])    
        } catch (error) {
        console.error("Error deleting chat history:", error)
      }

    }
  }

  return (
    <div className="flex flex-col w-full overflow-y-auto h-[calc(100vh-60px)]">
      
      <div className="flex-1 p-4 space-y-4 w-full md:pl-64 md:pr-20 overflow-y-auto">
      {selectedFile && (
          <div  className="text-lg font-semibold flex items-center gap-2"> Selected File: <p className="text-blue-500 text-sm">{selectedFile.name}</p> </div>
      )}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-start space-x-2 max-w-[98%] ${message.isUser ? "flex-row-reverse mr-4" : ""}`}>
              <div
                className={`flex-shrink-0  ${
                  message.isUser ? "" : "bg-white w-8 h-8 rounded-full flex items-center justify-center"
                }`}
              >
                {message.isUser ? (
                    <span></span>
                ) : (
                  <Image src="/bot.png" alt="AI" width={40} height={40} />
                )}
              </div>
              <div

                className={`rounded-lg p-3 ${
                  message.isUser ? "bg-blue-500 text-white" : "bg-white border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs mt-1 opacity-50">{new Date(message.timestamp).toLocaleString()}</p>
              </div>
    
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <span className="animate-pulse">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white pl-20 mb-4">
        <div className="max-w-4xl mx-auto bg-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 ">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 outline-none"
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              disabled={!selectedFile || isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!selectedFile || isLoading || !input.trim()}
              className="bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowUp className="h-5 w-5" />
            </button>
            <button
              onClick={handleDeleteChat}
              disabled={!selectedFile || messages.length === 0}
              className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

