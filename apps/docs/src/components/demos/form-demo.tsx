import { Button } from "@shadcn-solid-js/button";
import { Input } from "@shadcn-solid-js/input";
import { Label } from "@shadcn-solid-js/label";

export default function FormDemo() {
  return (
    <form
      class="w-full max-w-sm space-y-4"
      onSubmit={(e) => e.preventDefault()}
    >
      <div class="space-y-2">
        <Label for="form-email">Email</Label>
        <Input id="form-email" type="email" placeholder="name@example.com" />
        <p class="text-xs text-muted-foreground">Enter your email address.</p>
      </div>
      <div class="space-y-2">
        <Label for="form-pw">Password</Label>
        <Input id="form-pw" type="password" placeholder="••••••••" />
      </div>
      <Button type="submit" class="w-full">
        Sign Up
      </Button>
    </form>
  );
}
