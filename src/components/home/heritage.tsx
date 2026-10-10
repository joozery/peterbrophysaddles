import Image from "next/image";
import { TextLink } from "@/components/ui/button-link";

export function Heritage() {
  return <section id="about" className="heritage grid md:grid-cols-2">
    <div className="relative min-h-80"><Image src="/cover/right.png" alt="Peter Brophy Saddles craftsmanship" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
    <div className="heritage-copy" style={{ backgroundImage: "linear-gradient(90deg, #eee8dc99, #eee8dc33), url(/cover/left.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}><p className="eyebrow">Our heritage</p><h2 className="mt-5">Traditional<br />craftsmanship.<br />Modern performance.</h2><p className="body-copy mt-6">With over 20 years of experience, Peter Brophy Saddles creates custom saddles and premium leatherwork designed for comfort, balance and long-term performance.</p><div className="mt-5 h-px w-24 bg-gold" /><div className="mt-4"><TextLink href="/about">Our story</TextLink></div></div>
  </section>;
}
