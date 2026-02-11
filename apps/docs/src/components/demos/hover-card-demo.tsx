import { Avatar, AvatarFallback, AvatarImage } from "@shadcn-solid/avatar";
import { Button } from "@shadcn-solid/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@shadcn-solid/hover-card";

export default function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@nextjs</Button>
      </HoverCardTrigger>
      <HoverCardContent class="w-80">
        <div class="flex justify-between gap-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <div class="space-y-1">
            <h4 class="text-sm font-semibold">@nextjs</h4>
            <p class="text-sm">
              The React Framework – created and maintained by @vercel.
            </p>
            <div class="text-muted-foreground text-xs">
              Joined December 2021
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
