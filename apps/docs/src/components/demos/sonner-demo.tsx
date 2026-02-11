import { Button } from "@shadcn-solid/button";

export default function SonnerDemo() {
  const handleClick = async () => {
    const { toast } = await import("@shadcn-solid/sonner");
    toast("Event has been created", {
      description: "Sunday, December 03, 2023 at 9:00 AM",
      action: {
        label: "Undo",
        onClick: () => console.log("Undo"),
      },
    });
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      Show Toast
    </Button>
  );
}
