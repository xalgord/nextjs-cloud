import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { google } from "googleapis"

export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Check for token error (from refresh token failure)
    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get("folderId")

    // Set up the Google Drive API client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Build query to filter files
    let query = "trashed=false"
    if (folderId) {
      query += ` and '${folderId}' in parents`
    }

    // List files in the user's Drive or specific folder
    const response = await drive.files.list({
      q: query,
      pageSize: 100,
      fields: "files(id, name, mimeType, size, createdTime, shared, webViewLink)",
    })

    return NextResponse.json({ files: response.data.files })
  } catch (error: any) {
    console.error("Error listing files:", error)

    // More specific error messages based on the error type
    if (error.code === 403) {
      return NextResponse.json(
        {
          error: "Permission denied. You don't have access to list files.",
        },
        { status: 403 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to list files: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    )
  }
}

