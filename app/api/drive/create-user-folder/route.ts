import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    // Pass authOptions to getServerSession
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userName } = await request.json();

    if (!userName) {
      return NextResponse.json({ error: "User name is required" }, { status: 400 });
    }

    // Set up the Google Drive API client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Check if folder already exists
    const response = await drive.files.list({
      q: `name='${userName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      spaces: "drive",
      fields: "files(id, name)",
    });

    if (response.data.files && response.data.files.length > 0) {
      // Folder already exists
      return NextResponse.json({
        success: true,
        folderId: response.data.files[0].id,
        message: `Folder already exists for ${userName}`,
        isNew: false,
      });
    }

    // Create a folder with the user's name
    const folderMetadata = {
      name: userName,
      mimeType: "application/vnd.google-apps.folder",
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id,name,webViewLink",
    });

    return NextResponse.json({
      success: true,
      folder: folder.data,
      message: `Folder created for ${userName}`,
      isNew: true,
    });
  } catch (error: any) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      {
        error: "Failed to create folder: " + (error.message || "Unknown error"),
      },
      { status: 500 },
    );
  }
}
