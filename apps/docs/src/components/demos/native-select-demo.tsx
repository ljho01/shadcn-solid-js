import { NativeSelect } from "@shadcn-solid-js/native-select";

export default function NativeSelectDemo() {
  return (
    <NativeSelect>
      <option value="">Select status</option>
      <option value="todo">Todo</option>
      <option value="in-progress">In Progress</option>
      <option value="done">Done</option>
      <option value="cancelled">Cancelled</option>
    </NativeSelect>
  );
}
