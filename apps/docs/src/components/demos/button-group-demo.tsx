import { Button } from "@shadcn-solid-js/button";

export default function ButtonGroupDemo() {
  return (
    <div class="inline-flex rounded-md shadow-sm">
      <Button variant="outline" class="rounded-r-none border-r-0">
        Archive
      </Button>
      <Button variant="outline" class="rounded-none border-r-0">
        Report
      </Button>
      <Button variant="outline" class="rounded-l-none">
        Snooze
      </Button>
    </div>
  );
}
