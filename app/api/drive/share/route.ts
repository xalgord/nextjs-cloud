import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { google } from "googleapis"

export async function POST(request: Request) {
  try {
    const session = await getServerSession()

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { fileId, email, role } = await request.json()

    if (!fileId || !email || !role) {
      return NextResponse.json({ error: "File ID, email, and role are required" }, { status: 400 })
    }

    // Validate role
    if (!["reader", "writer", "commenter"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be reader, writer, or commenter" }, { status: 400 })
    }

    // Set up the Google Drive API client
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    })

    const drive = google.drive({ version: "v3", auth: oauth2Client })

    // Create permission
    const permission = await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        type: "user",
        role: role,
        emailAddress: email,
      },
    })

    return NextResponse.json({
      success: true,
      permission: permission.data,
      message: `File shared with ${email}`,
    })
  } catch (error) {
    console.error("Error sharing file:", error)
    return NextResponse.json({ error: "Failed to share file" }, { status: 500 })
  }
}

