"use client";
import { Accordion } from "radix-ui";
import { PlusIcon } from "@radix-ui/react-icons";
const details = [
  ["Fit & specifications", "Discuss your horse’s build, riding discipline and preferred fit with us. Confirm sizing, saddle tree and specifications before placing a real order."],
  ["Materials & craftsmanship", "Leatherwork and hardware are selected with attention to strength, finish and performance. Ask us about the materials and available details for your chosen saddle."],
  ["Delivery & ordering", "This is a demonstration shop. Real delivery costs, lead times and payment options will be confirmed when the live ordering system is connected."],
];
export function SaddleDetailsAccordion() {
  return <Accordion.Root type="single" collapsible className="saddle-details">{details.map(([title, copy]) => <Accordion.Item key={title} value={title} className="saddle-detail-item"><Accordion.Header><Accordion.Trigger className="saddle-detail-trigger">{title}<PlusIcon aria-hidden="true" /></Accordion.Trigger></Accordion.Header><Accordion.Content className="saddle-detail-content"><p>{copy}</p></Accordion.Content></Accordion.Item>)}</Accordion.Root>;
}
