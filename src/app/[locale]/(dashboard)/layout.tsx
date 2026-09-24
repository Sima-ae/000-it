import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardSessionSync } from "@/components/dashboard/DashboardSessionSync";
import { ContentTransition } from "@/components/shared/ContentTransition";
import { CopyrightBar } from "@/components/shared/CopyrightBar";
import { localizedHref } from "@/i18n/pathnames";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(localizedHref(locale, "/login"));
  }

  // Always read identity from DB — JWT cookies can keep a stale name/role.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, role: true },
  });
  if (!dbUser) {
    redirect(localizedHref(locale, "/login"));
  }

  const t = await getTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[100rem] flex-col">
      <DashboardSessionSync />
      <div className="flex flex-1 flex-col md:flex-row">
        <Sidebar
          user={{
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
          }}
        />
        <div className="flex-1 p-3 md:p-6 md:pl-0">
          <div className="glass min-h-[calc(100svh-1.5rem)] rounded-[1.75rem] p-4 md:p-8">
            <ContentTransition>{children}</ContentTransition>
          </div>
        </div>
      </div>

      <CopyrightBar
        year={year}
        rights={t("rights")}
        className="bg-transparent px-3 pb-5 pt-2 text-center md:px-6 md:pb-6 md:pt-3"
      />
    </div>
  );
}
