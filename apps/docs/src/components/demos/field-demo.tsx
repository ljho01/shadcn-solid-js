import { Input } from "@shadcn-solid/input";
import { Label } from "@shadcn-solid/label";

export default function FieldDemo() {
  return (
    <div class="w-full max-w-sm space-y-4">
      <div class="space-y-2">
        <Label for="field-name">Name</Label>
        <Input id="field-name" placeholder="Enter your name" />
        <p class="text-xs text-muted-foreground">
          This will be displayed on your public profile.
        </p>
      </div>
      <div class="space-y-2">
        <Label for="field-err">Email</Label>
        <Input id="field-err" placeholder="Email" aria-invalid="true" />
        <p class="text-xs text-destructive">
          Please enter a valid email address.
        </p>
      </div>
    </div>
  );
}
