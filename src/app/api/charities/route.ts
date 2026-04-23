import { NextRequest, NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<{ message: string }>> {
  return NextResponse.json(
    { message: "Charities endpoint" },
    { status: 200 }
  );
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; message: string }>> {
  try {
    const body = await request.json();

    // Placeholder for charity creation logic
    console.log("Charity creation:", body);

    return NextResponse.json(
      { success: true, message: "Charity created" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Charity error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
