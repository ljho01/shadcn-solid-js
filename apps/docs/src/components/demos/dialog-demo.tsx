import { Button } from "@shadcn-solid-js/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shadcn-solid-js/dialog";
import { Input } from "@shadcn-solid-js/input";
import { Label } from "@shadcn-solid-js/label";

export default function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid gap-3">
            <Label for="name-1">Name</Label>
            <Input id="name-1" value="Pedro Duarte" />
          </div>
          <div class="grid gap-3">
            <Label for="username-1">Username</Label>
            <Input id="username-1" value="@peduarte" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
