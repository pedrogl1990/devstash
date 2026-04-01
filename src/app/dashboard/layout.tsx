import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Bar */}
      <header className="flex h-14 items-center gap-4 border-b border-border px-4">
        <span className="text-sm font-semibold text-foreground">DevStash</span>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-9 h-8 bg-muted border-0 text-sm"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            New Collection
          </Button>
          <Button size="sm" className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            New Item
          </Button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
