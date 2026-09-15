import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { canDelete } from "@/lib/roles";
import { restoreNewsPost } from "@/lib/news";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const authResult = await requireRole(["SUPER_ADMIN"]);
  if (authResult.error) return authResult.error;
  if (!canDelete(authResult.session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const item = await restoreNewsPost(id);
  if (!item) {
    return NextResponse.json({ error: "Not found in trash" }, { status: 404 });
  }
  return NextResponse.json(item);
}
