import { createSignal } from "solid-js";
import { Calendar } from "@shadcn-solid-js/calendar";

export default function CalendarDemo() {
  const [date, setDate] = createSignal<Date | undefined>(new Date());

  return (
    <Calendar
      mode="single"
      selected={date()}
      onSelect={setDate}
      class="rounded-md border shadow-sm"
    />
  );
}
