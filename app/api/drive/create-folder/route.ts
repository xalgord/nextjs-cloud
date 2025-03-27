import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { google } from "googleapis"

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

    const { name, parentFolderId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    // Set up the Google Drive API client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Create folder metadata
    const folderMetadata = {
      name: name,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentFolderId && { parents: [parentFolderId] }),
    }

    // Create the folder
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id,name,webViewLink",
    })

    return NextResponse.json({
      success: true,
      folder: folder.data,
      message: `Folder "${name}" created successfully`,
    })
  } catch (error: any) {
    console.error("Error creating folder:", error)

    // More specific error messages based on the error type
    if (error.code === 403) {
      return NextResponse.json(
        {
          error: "Permission denied. You don't have access to create folders.",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create folder: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    )
  }
}

