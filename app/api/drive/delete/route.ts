import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { google } from "googleapis"

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get("fileId")

    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 })
    }

    // Set up the Google Drive API client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Delete the file
    await drive.files.delete({
      fileId: fileId,
    })

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting file:", error)
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 })
  }
}

