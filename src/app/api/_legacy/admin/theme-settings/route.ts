import { NextRequest, NextResponse } from "next/server";

interface ThemeSettings {
  id: string;
  themeName: "default" | "custom";
  mode: "light" | "dark";
  updatedAt: string;
}

// In-memory storage (replace with actual database)
let themeSettings: ThemeSettings = {
  id: "default",
  themeName: "default",
  mode: "light",
  updatedAt: new Date().toISOString(),
};

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: themeSettings,
    });
  } catch (error) {
    console.error("Error fetching theme settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch theme settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    themeSettings = {
      ...themeSettings,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: themeSettings });
  } catch (error) {
    console.error("Error updating theme settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update theme settings" },
      { status: 500 },
    );
  }
}
