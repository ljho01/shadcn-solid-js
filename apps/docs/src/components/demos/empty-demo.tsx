import {
  Empty,
  EmptyIcon,
  EmptyTitle,
  EmptyDescription,
  EmptyAction,
} from "@shadcn-solid-js/empty";
import { Button } from "@shadcn-solid-js/button";

export default function EmptyDemo() {
  return (
    <Empty>
      <EmptyIcon>
        <svg
          class="size-10 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7" />
          <path d="M2 17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1z" />
        </svg>
      </EmptyIcon>
      <EmptyTitle>No Projects Yet</EmptyTitle>
      <EmptyDescription>
        You haven't created any projects yet. Get started by creating your first
        project.
      </EmptyDescription>
      <EmptyAction>
        <Button>Create Project</Button>
      </EmptyAction>
    </Empty>
  );
}
