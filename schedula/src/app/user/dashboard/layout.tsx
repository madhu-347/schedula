import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // We add padding-bottom to the main container to prevent
    // content from being hidden behind the fixed bottom nav
    <div className="pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
