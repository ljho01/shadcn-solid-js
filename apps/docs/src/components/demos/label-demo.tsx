import { Checkbox } from "@shadcn-solid-js/checkbox";
import { Label } from "@shadcn-solid-js/label";

export default function LabelDemo() {
  return (
    <div>
      <div class="flex items-center space-x-2">
        <Checkbox id="terms" />
        <Label for="terms">Accept terms and conditions</Label>
      </div>
    </div>
  );
}
