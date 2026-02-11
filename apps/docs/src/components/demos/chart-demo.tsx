export default function ChartDemo() {
  const data = [30, 55, 40, 80, 65, 95, 75];
  const max = 100;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div class="w-full max-w-sm space-y-2">
      <h4 class="text-sm font-medium">Weekly Activity</h4>
      <div class="flex h-[120px] items-end gap-2">
        {data.map((value, i) => (
          <div class="flex flex-1 flex-col items-center gap-1">
            <div
              class="w-full rounded-t bg-primary transition-all"
              style={{ height: `${(value / max) * 100}%` }}
            />
            <span class="text-xs text-muted-foreground">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
