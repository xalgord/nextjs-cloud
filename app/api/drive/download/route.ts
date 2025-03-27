import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { google } from "googleapis"

export async function GET(request: Request) {
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

    // Get file metadata to determine the file name and type
    const fileMetadata = await drive.files.get({
      fileId: fileId,
      fields: "name,mimeType",
    })

    // Download the file
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      { responseType: "stream" },
    )

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of response.data) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Create a response with the file data
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": fileMetadata.data.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileMetadata.data.name}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading file:", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}

