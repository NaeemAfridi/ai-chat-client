import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

const api = axios.create({
  baseURL: API_URL,
})

export const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post("/files/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data
}

export const getFiles = async () => {
  const response = await api.get("/files")
  return response.data
}

export const chatWithAI = async (fileId: string, prompt: string) => {
  const response = await api.post("/chat", { fileId, prompt })
  return response.data
}

export const getChatHistory = async (fileId: string) => {
  const response = await api.get(`/chat/${fileId}`)
  return response.data
}

export const deleteChat = async (fileId: string) => {
  const response = await api.delete(`/chat/${fileId}`)
  return response.data
}

export const deleteFile = async (fileId: string) => {
  const response = await api.delete(`/files/${fileId}`)
  return response.data
}

