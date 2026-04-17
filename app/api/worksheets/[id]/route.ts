import { NextResponse } from "next/server";
import { deleteWorksheetById, getWorksheetById } from "@/lib/store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const worksheet = await getWorksheetById(id);

  if (!worksheet) {
    return NextResponse.json({ error: "Worksheet not found." }, { status: 404 });
  }

  return NextResponse.json({ worksheet });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  await deleteWorksheetById(id);
  return NextResponse.json({ success: true });
}
