import { Slider } from "@shadcn-solid-js/slider";

export default function SliderDemo() {
  return <Slider defaultValue={[50]} max={100} step={1} class="w-[60%]" />;
}
