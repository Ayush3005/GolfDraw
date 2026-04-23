import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
