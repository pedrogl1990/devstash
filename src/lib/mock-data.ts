export const mockUser = {
  id: "user_1",
  name: "John Doe",
  email: "demo@devstash.io",
  image: null,
  isPro: false,
};

export const mockItemTypes = [
  { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6", isSystem: true, count: 24 },
  { id: "type_prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true, count: 18 },
  { id: "type_command", name: "command", icon: "Terminal", color: "#f97316", isSystem: true, count: 15 },
  { id: "type_note", name: "note", icon: "StickyNote", color: "#fde047", isSystem: true, count: 12 },
  { id: "type_file", name: "file", icon: "File", color: "#6b7280", isSystem: true, count: 5 },
  { id: "type_image", name: "image", icon: "Image", color: "#ec4899", isSystem: true, count: 3 },
  { id: "type_link", name: "link", icon: "Link", color: "#10b981", isSystem: true, count: 8 },
];

export const mockCollections = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    itemCount: 12,
    isFavorite: true,
    dominantColor: "#3b82f6",
    icons: ["Code", "StickyNote", "Link"],
  },
  {
    id: "col_2",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    itemCount: 8,
    isFavorite: false,
    dominantColor: "#3b82f6",
    icons: ["Code", "Terminal"],
  },
  {
    id: "col_3",
    name: "Context Files",
    description: "AI context files for projects",
    itemCount: 5,
    isFavorite: true,
    dominantColor: "#6b7280",
    icons: ["File"],
  },
  {
    id: "col_4",
    name: "Interview Prep",
    description: "Technical interview preparation",
    itemCount: 24,
    isFavorite: false,
    dominantColor: "#3b82f6",
    icons: ["Code", "Sparkles", "Link"],
  },
  {
    id: "col_5",
    name: "Git Commands",
    description: "Frequently used git commands",
    itemCount: 15,
    isFavorite: true,
    dominantColor: "#f97316",
    icons: ["Terminal"],
  },
  {
    id: "col_6",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    itemCount: 18,
    isFavorite: false,
    dominantColor: "#8b5cf6",
    icons: ["Sparkles", "Code"],
  },
];

export const mockItems = [
  {
    id: "item_1",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    contentType: "text" as const,
    content: `import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}`,
    language: "typescript",
    itemTypeId: "type_snippet",
    itemType: { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
    isFavorite: true,
    isPinned: true,
    tags: ["react", "auth", "hooks"],
    createdAt: new Date("2026-03-19"),
    updatedAt: new Date("2026-03-19"),
  },
  {
    id: "item_2",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    contentType: "text" as const,
    content: `async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      return res;
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
  throw new Error("Max retries reached");
}`,
    language: "typescript",
    itemTypeId: "type_snippet",
    itemType: { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
    isFavorite: false,
    isPinned: true,
    tags: ["api", "error-handling", "typescript"],
    createdAt: new Date("2026-03-19"),
    updatedAt: new Date("2026-03-19"),
  },
  {
    id: "item_3",
    title: "Git Stash All Changes",
    description: "Stash all tracked and untracked files",
    contentType: "text" as const,
    content: "git stash push -u -m 'WIP: description'",
    language: "bash",
    itemTypeId: "type_command",
    itemType: { id: "type_command", name: "command", icon: "Terminal", color: "#f97316" },
    isFavorite: false,
    isPinned: false,
    tags: ["git", "workflow"],
    createdAt: new Date("2026-03-18"),
    updatedAt: new Date("2026-03-18"),
  },
  {
    id: "item_4",
    title: "Code Review Prompt",
    description: "Prompt for thorough code reviews",
    contentType: "text" as const,
    content:
      "Review this code for: 1) Security vulnerabilities 2) Performance issues 3) Edge cases 4) Code style consistency. Provide specific line-by-line feedback.",
    language: null,
    itemTypeId: "type_prompt",
    itemType: { id: "type_prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
    isFavorite: true,
    isPinned: false,
    tags: ["code-review", "ai", "productivity"],
    createdAt: new Date("2026-03-17"),
    updatedAt: new Date("2026-03-17"),
  },
  {
    id: "item_5",
    title: "Next.js API Route Template",
    description: "Boilerplate for authenticated API routes",
    contentType: "text" as const,
    content: `import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ data: null });
}`,
    language: "typescript",
    itemTypeId: "type_snippet",
    itemType: { id: "type_snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
    isFavorite: false,
    isPinned: false,
    tags: ["nextjs", "api", "auth"],
    createdAt: new Date("2026-03-16"),
    updatedAt: new Date("2026-03-16"),
  },
];

export const mockPinnedItems = mockItems.filter((item) => item.isPinned);
export const mockRecentItems = [...mockItems].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
export const mockFavoriteCollections = mockCollections.filter((c) => c.isFavorite);
