import { ContentProtect } from "@/components/kennisbank/ContentProtect";

/** Soft copy deterrents for humans; search engines still receive full HTML. */
export default function KennisbankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ContentProtect>{children}</ContentProtect>;
}
