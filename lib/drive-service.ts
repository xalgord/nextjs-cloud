// This service handles interactions with the Google Drive API

export async function createUserFolder(userName: string) {
  try {
    const response = await fetch("/api/drive/create-user-folder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create folder")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in createUserFolder:", error)
    throw error
  }
}

export async function listFiles(folderId?: string) {
  try {
    const url = folderId ? `/api/drive?folderId=${folderId}` : "/api/drive"
    const response = await fetch(url)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to list files")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in listFiles:", error)
    throw error
  }
}

export async function uploadFile(file: File, folderId?: string) {
  try {
    const formData = new FormData()
    formData.append("file", file)

    if (folderId) {
      formData.append("folderId", folderId)
    }

    const response = await fetch("/api/drive/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload file")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in uploadFile:", error)
    throw error
  }
}

export async function downloadFile(fileId: string) {
  try {
    const response = await fetch(`/api/drive/download?fileId=${fileId}`)

    if (!response.ok) {
      const errorText = await response.text()
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error || "Failed to download file")
      } catch (e) {
        throw new Error("Failed to download file")
      }
    }

    return response.blob()
  } catch (error) {
    console.error("Error in downloadFile:", error)
    throw error
  }
}

export async function deleteFile(fileId: string) {
  try {
    const response = await fetch(`/api/drive/delete?fileId=${fileId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to delete file")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in deleteFile:", error)
    throw error
  }
}

export async function shareFile(fileId: string, email: string, role: "reader" | "writer" | "commenter") {
  try {
    const response = await fetch("/api/drive/share", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId, email, role }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to share file")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in shareFile:", error)
    throw error
  }
}

export async function createFolder(name: string, parentFolderId?: string) {
  try {
    const response = await fetch("/api/drive/create-folder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, parentFolderId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to create folder")
    }

    return await response.json()
  } catch (error) {
    console.error("Error in createFolder:", error)
    throw error
  }
}

