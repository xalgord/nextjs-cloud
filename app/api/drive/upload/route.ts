import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { Readable } from "stream"

// Increase the body size limit (default is 4mb)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check for token error (from refresh token failure)
    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file size (20MB limit for this example)
    const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "File size exceeds the 20MB limit. Please upload a smaller file.",
        },
        { status: 400 },
      )
    }

    // Set up the Google Drive API client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const stream = Readable.from(buffer)

    // File metadata
    const fileMetadata = {
      name: file.name,
      ...(folderId && { parents: [folderId] }),
    }

    // Upload file to Drive
    const media = {
      mimeType: file.type || "application/octet-stream",
      body: stream,
    }

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id,name,mimeType,size,webViewLink,createdTime",
    })

    return NextResponse.json({
      success: true,
      file: driveResponse.data,
      message: `File ${file.name} uploaded successfully`,
    })
  } catch (error: any) {
    console.error("Error uploading file:", error)

    // More specific error messages based on the error type
    if (error.code === 403) {
      return NextResponse.json(
        {
          error: "Permission denied. You don't have access to upload files.",
        },
        { status: 403 },
      )
    }

    if (error.code === 404) {
      return NextResponse.json(
        {
          error: "The specified folder was not found.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to upload file: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    )
  }
}

