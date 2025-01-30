"use client"

import { X, Upload, MessageSquare, Loader, AlertCircle, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { uploadFile, getFiles, deleteFile } from "../services/api"

interface File {
  _id: string
  name: string
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onFileSelect: (file: File) => void
}

export default function Sidebar({ isOpen, onClose, onFileSelect }: SidebarProps) {
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supportedFileTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ]

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!supportedFileTypes.includes(file.type)) {
        setError("Unsupported file type. Please upload a PDF, Word, Excel, or PowerPoint file.")
        return
      }

      setIsUploading(true)
      setError(null)
      try {
        const uploadedFile = await uploadFile(file)
        setFiles((prevFiles) => [...prevFiles, uploadedFile.file])
        onFileSelect(uploadedFile.file)
      } catch (error) {
        console.error("Error uploading file:", error)
        setError("Failed to upload file. Please try again.")
      } finally {
        setIsUploading(false)
      }
    }
  }

  const fetchFiles = async () => {
    try {
      const fetchedFiles = await getFiles()
      setFiles(fetchedFiles)
    } catch (error) {
      console.error("Error fetching files:", error)
      setError("Failed to fetch files. Please try again.")
    }
  }

  const handleDeleteFile = async (fileId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      await deleteFile(fileId)
      setFiles((prevFiles) => prevFiles.filter((file) => file._id !== fileId))
    } catch (error) {
      console.error("Error deleting file:", error)
      setError("Failed to delete file. Please try again.")
    }
  }

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-20 flex flex-col`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Menu</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <label
              htmlFor="file-upload"
              className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
            >
              {isUploading ? <Loader className="h-5 w-5 mr-2 animate-spin" /> : <Upload className="h-5 w-5 mr-2" />}
              {isUploading ? "Uploading..." : "Upload File"}
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              disabled={isUploading}
            />
          </li>
          <li>
            <button
              onClick={fetchFiles}
              className="flex items-center w-full p-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Refresh Files
            </button>
          </li>
        </ul>
      </nav>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="font-semibold mb-2">Uploaded Files</h3>
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file._id}
              className="text-sm text-gray-600 bg-gray-100 rounded-md p-2 hover:bg-gray-200 cursor-pointer flex items-center justify-between"
              onClick={() => onFileSelect(file)}
            >
              <span className="font-semibold truncate flex-grow">{file.name}</span>
              <button
                onClick={(e) => handleDeleteFile(file._id, e)}
                className="text-red-500 hover:text-red-700 focus:outline-none ml-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

