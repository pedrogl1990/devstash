export default function DashboardPage() {
  return (
    <>
      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex-shrink-0 p-4">
        <h2 className="text-foreground font-semibold">Sidebar</h2>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto p-6">
        <h2 className="text-foreground font-semibold">Main</h2>
      </main>
    </>
  );
}
