"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HardDrive,
  Upload,
  File,
  Image,
  FileText,
  FileArchive,
  MoreVertical,
  Download,
  Trash2,
  Share,
  FolderPlus,
  Search,
  LogOut,
  Settings,
  User,
  AlertCircle,
  Loader2,
  RefreshCw,
  SortAsc,
  SortDesc,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { listFiles, uploadFile, downloadFile, deleteFile, shareFile, createUserFolder } from "@/lib/drive-service"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define file type
interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime: string
  shared?: boolean
  webViewLink?: string
}

interface UserFolder {
  id: string
  name: string
  webViewLink?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [files, setFiles] = useState<DriveFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<DriveFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
  const [shareEmail, setShareEmail] = useState("")
  const [shareRole, setShareRole] = useState<"reader" | "writer" | "commenter">("reader")
  const [userFolder, setUserFolder] = useState<UserFolder | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [storageUsed, setStorageUsed] = useState(0)
  const [storageLimit, setStorageLimit] = useState(15 * 1024 * 1024 * 1024) // 15GB default
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [welcomeDialogOpen, setWelcomeDialogOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  // Create user folder on first login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.name) {
      const initializeUserFolder = async () => {
        try {
          const response = await createUserFolder(session.user!.name!)
          if (response.success) {
            setUserFolder({
              id: response.folder.id,
              name: response.folder.name,
              webViewLink: response.folder.webViewLink,
            })

            if (response.isNew) {
              setIsFirstLogin(true)
              setWelcomeDialogOpen(true)
            }
          }
        } catch (error) {
          console.error("Error creating user folder:", error)
          setError("Failed to create your personal folder. Please try again.")
        }
      }

      initializeUserFolder()
    }
  }, [status, session])

  // Fetch files on component mount
  useEffect(() => {
    if (status === "authenticated" && userFolder) {
      fetchFiles()
    }
  }, [status, userFolder])

  // Filter and sort files based on search query and sort options
  useEffect(() => {
    if (files.length > 0) {
      let filtered = [...files]

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      // Apply sorting
      filtered.sort((a, b) => {
        if (sortBy === "name") {
          return sortDirection === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        } else if (sortBy === "date") {
          return sortDirection === "asc"
            ? new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
            : new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
        } else if (sortBy === "size") {
          const sizeA = a.size ? Number.parseInt(a.size) : 0
          const sizeB = b.size ? Number.parseInt(b.size) : 0
          return sortDirection === "asc" ? sizeA - sizeB : sizeB - sizeA
        }
        return 0
      })

      setFilteredFiles(filtered)
    } else {
      setFilteredFiles([])
    }
  }, [searchQuery, files, sortBy, sortDirection])

  // Calculate storage used
  useEffect(() => {
    if (files.length > 0) {
      const used = files.reduce((total, file) => {
        return total + (file.size ? Number.parseInt(file.size) : 0)
      }, 0)
      setStorageUsed(used)
    } else {
      setStorageUsed(0)
    }
  }, [files])

  const fetchFiles = useCallback(async () => {
    if (!userFolder) return

    try {
      setIsLoading(true)
      setError(null)
      setIsRefreshing(true)

      const response = await listFiles(userFolder.id)
      if (response.files) {
        setFiles(response.files)
      }
    } catch (error) {
      console.error("Error fetching files:", error)
      setError("Failed to fetch your files. Please try again.")
      toast({
        title: "Error",
        description: "Failed to fetch your files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [userFolder])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userFolder) {
      toast({
        title: "Error",
        description: "Your personal folder is not set up yet. Please try again.",
        variant: "destructive",
      })
      return
    }

    const fileInput = event.target
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0]

      // Check file size (20MB limit for this example)
      const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "File size exceeds the 20MB limit. Please upload a smaller file.",
          variant: "destructive",
        })
        fileInput.value = ""
        return
      }

      try {
        setIsUploading(true)
        setUploadProgress(0)

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(progressInterval)
              return 95
            }
            return prev + 5
          })
        }, 100)

        await uploadFile(file, userFolder.id)

        clearInterval(progressInterval)
        setUploadProgress(100)

        toast({
          title: "Success",
          description: `${file.name} uploaded successfully!`,
        })

        // Refresh file list
        await fetchFiles()
      } catch (error) {
        console.error("Error uploading file:", error)
        toast({
          title: "Error",
          description: "Failed to upload file. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
        setUploadProgress(0)
        // Clear the file input
        fileInput.value = ""
      }
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a folder name.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreatingFolder(true)

      // This would call an API to create a folder in Google Drive
      // For now, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: `Folder "${newFolderName}" created successfully!`,
      })

      setNewFolderDialogOpen(false)
      setNewFolderName("")

      // Refresh file list
      await fetchFiles()
    } catch (error) {
      console.error("Error creating folder:", error)
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDownload = async (file: DriveFile) => {
    try {
      toast({
        title: "Downloading",
        description: `Preparing ${file.name} for download...`,
      })

      const blob = await downloadFile(file.id)

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Success",
        description: `${file.name} downloaded successfully!`,
      })
    } catch (error) {
      console.error("Error downloading file:", error)
      toast({
        title: "Error",
        description: "Failed to download file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (file: DriveFile) => {
    if (confirm(`Are you sure you want to delete ${file.name}?`)) {
      try {
        await deleteFile(file.id)

        // Remove file from state
        setFiles((prevFiles) => prevFiles.filter((f) => f.id !== file.id))

        toast({
          title: "Success",
          description: `${file.name} deleted successfully!`,
        })
      } catch (error) {
        console.error("Error deleting file:", error)
        toast({
          title: "Error",
          description: "Failed to delete file. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const openShareDialog = (file: DriveFile) => {
    setSelectedFile(file)
    setShareDialogOpen(true)
  }

  const handleShare = async () => {
    if (!selectedFile || !shareEmail) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shareEmail)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    try {
      await shareFile(selectedFile.id, shareEmail, shareRole)

      toast({
        title: "Success",
        description: `${selectedFile.name} shared with ${shareEmail}!`,
      })

      // Close dialog and reset form
      setShareDialogOpen(false)
      setShareEmail("")
      setSelectedFile(null)

      // Refresh file list to update sharing status
      await fetchFiles()
    } catch (error) {
      console.error("Error sharing file:", error)
      toast({
        title: "Error",
        description: "Failed to share file. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return "Unknown size"

    const size = Number.parseInt(bytes)
    if (isNaN(size)) return "Unknown size"

    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("image")) return <Image className="h-10 w-10 text-purple-500" />
    if (mimeType.includes("pdf")) return <FileText className="h-10 w-10 text-red-500" />
    if (mimeType.includes("spreadsheet")) return <FileText className="h-10 w-10 text-green-500" />
    if (mimeType.includes("presentation")) return <FileText className="h-10 w-10 text-orange-500" />
    if (mimeType.includes("document")) return <FileText className="h-10 w-10 text-blue-500" />
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return <FileArchive className="h-10 w-10 text-gray-500" />
    if (mimeType.includes("folder")) return <FolderPlus className="h-10 w-10 text-yellow-500" />
    return <File className="h-10 w-10 text-gray-500" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60))
        return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`
      }
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    }
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7)
      return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`
    }

    return date.toLocaleDateString()
  }

  const getStoragePercentage = () => {
    return Math.min(100, (storageUsed / storageLimit) * 100)
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading your drive...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <HardDrive className="h-6 w-6" />
              <span className="text-xl font-bold">CloudDrive</span>
            </Link>
          </div>
          <div className="flex-1 px-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={fetchFiles} disabled={isRefreshing} title="Refresh files">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <div className="relative">
              <Input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading || !userFolder}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outline"
                  size="icon"
                  className="cursor-pointer"
                  disabled={isUploading || !userFolder}
                  title="Upload file"
                >
                  {isUploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <img
                    src={session?.user?.image || "/placeholder.svg?height=32&width=32"}
                    alt={session?.user?.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{session?.user?.name || "My Account"}</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {session?.user?.email || ""}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container px-4 py-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <HardDrive className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage Used</p>
                    <p className="text-2xl font-bold">{formatFileSize(storageUsed.toString())} / 15 GB</p>
                  </div>
                </div>
                <Progress value={getStoragePercentage()} className="mt-4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <File className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{files.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                    <Share className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Shared Files</p>
                    <p className="text-2xl font-bold">{files.filter((file) => file.shared).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">My Files</h2>
              {userFolder && (
                <p className="text-sm text-muted-foreground">
                  Folder: {userFolder.name}
                  {userFolder.webViewLink && (
                    <a
                      href={userFolder.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary hover:underline"
                    >
                      View in Drive
                    </a>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as "name" | "date" | "size")}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                >
                  {sortDirection === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setNewFolderDialogOpen(true)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
              <label htmlFor="file-upload-main">
                <Button size="sm" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </label>
              <Input
                type="file"
                id="file-upload-main"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading || !userFolder}
              />
            </div>
          </div>

          {isUploading && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium">Uploading...</p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading your files...</p>
                  </div>
                </div>
              ) : filteredFiles.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredFiles.map((file) => (
                    <Card key={file.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex h-40 items-center justify-center bg-gray-100 dark:bg-gray-800">
                          {getFileIcon(file.mimeType)}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownload(file)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openShareDialog(file)}>
                                  <Share className="mr-2 h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                {file.webViewLink && (
                                  <DropdownMenuItem asChild>
                                    <a href={file.webViewLink} target="_blank" rel="noopener noreferrer">
                                      <FileText className="mr-2 h-4 w-4" />
                                      Open in Drive
                                    </a>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(file)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                            <p>{formatFileSize(file.size)}</p>
                            <p>{formatDate(file.createdTime)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">No files found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? "No files match your search query." : "Upload your first file to get started."}
                  </p>
                  {!searchQuery && (
                    <label htmlFor="file-upload-empty">
                      <Button size="sm" className="mt-2 cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload a File
                      </Button>
                    </label>
                  )}
                  <Input
                    type="file"
                    id="file-upload-empty"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading || !userFolder}
                  />
                </div>
              )}
            </TabsContent>
            <TabsContent value="recent" className="space-y-4">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredFiles
                    .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
                    .slice(0, 8)
                    .map((file) => (
                      <Card key={file.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex h-40 items-center justify-center bg-gray-100 dark:bg-gray-800">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate" title={file.name}>
                                {file.name}
                              </p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openShareDialog(file)}>
                                    <Share className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(file)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                              <p>{formatFileSize(file.size)}</p>
                              <p>{formatDate(file.createdTime)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="shared" className="space-y-4">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredFiles
                    .filter((file) => file.shared)
                    .map((file) => (
                      <Card key={file.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex h-40 items-center justify-center bg-gray-100 dark:bg-gray-800">
                            {getFileIcon(file.mimeType)}
                          </div>
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate" title={file.name}>
                                {file.name}
                              </p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDownload(file)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openShareDialog(file)}>
                                    <Share className="mr-2 h-4 w-4" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-500" onClick={() => handleDelete(file)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                              <p>{formatFileSize(file.size)}</p>
                              <p>{formatDate(file.createdTime)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share File</DialogTitle>
            <DialogDescription>Share "{selectedFile?.name}" with others by email</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Permission</Label>
              <Select
                value={shareRole}
                onValueChange={(value) => setShareRole(value as "reader" | "writer" | "commenter")}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reader">Can view</SelectItem>
                  <SelectItem value="commenter">Can comment</SelectItem>
                  <SelectItem value="writer">Can edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={!shareEmail}>
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Folder Dialog */}
      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder name</Label>
              <Input
                id="folder-name"
                placeholder="My Folder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={isCreatingFolder || !newFolderName.trim()}>
              {isCreatingFolder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Folder"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Welcome Dialog */}
      <Dialog open={welcomeDialogOpen} onOpenChange={setWelcomeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to CloudDrive!</DialogTitle>
            <DialogDescription>Your personal cloud storage is ready to use.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              We've created a personal folder for you named <strong>{userFolder?.name}</strong>. You can now start
              uploading and managing your files securely.
            </p>
            <div className="rounded-md bg-muted p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Upload className="mr-2 h-4 w-4 text-primary" />
                  Upload files to your personal storage
                </li>
                <li className="flex items-center">
                  <Share className="mr-2 h-4 w-4 text-primary" />
                  Share files with others
                </li>
                <li className="flex items-center">
                  <Download className="mr-2 h-4 w-4 text-primary" />
                  Download your files anytime, anywhere
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setWelcomeDialogOpen(false)}>Get Started</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

