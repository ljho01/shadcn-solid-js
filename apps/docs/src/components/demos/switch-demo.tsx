import { Label } from "@shadcn-solid-js/label";
import { Switch } from "@shadcn-solid-js/switch";

export default function SwitchDemo() {
  return (
    <div class="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label for="airplane-mode">Airplane Mode</Label>
    </div>
  );
}
