"use client";

import { use } from "react";
import { BoardDetailPage } from "@/components/crm/boards/BoardDetailPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BoardDetailPage boardId={id} />;
}
