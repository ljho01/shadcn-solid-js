export default function SidebarDemo() {
  return (
    <div class="flex w-full max-w-sm flex-col rounded-lg border">
      <div class="border-b px-4 py-3">
        <span class="text-sm font-semibold">프로젝트</span>
      </div>
      <nav class="flex-1 space-y-1 p-2">
        <a class="flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground" href="#">대시보드</a>
        <a class="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" href="#">프로젝트</a>
        <a class="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" href="#">팀</a>
        <a class="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground" href="#">설정</a>
      </nav>
      <div class="border-t px-4 py-3">
        <span class="text-xs text-muted-foreground">v0.1.0</span>
      </div>
    </div>
  );
}
