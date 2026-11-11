export type ProductSpec = { label: string; value: string };
/** Shop categories, in the order they're shown. */
export const productCategories = [{ id: "saddles", label: "Saddles" }, { id: "saddle-trees", label: "Saddle Trees" }] as const;
export type ProductCategory = (typeof productCategories)[number]["id"];
export const categoryOf = (p: { category?: string }): ProductCategory => p.category === "saddle-trees" ? "saddle-trees" : "saddles";
/** `image` is a built-in saddle key (e.g. "wade"); `photo` is a full image path/URL (a real photo) and wins over it. `gallery` holds extra photos. */
export type Product = { id: string; name: string; image: string; photo?: string; gallery?: string[]; price: number; stock: number; custom?: boolean; category?: ProductCategory; description?: string; specs?: ProductSpec[] };
/** Spec rows every saddle starts with in the admin form; rows left without a value aren't shown on the site. */
export const defaultSpecLabels = ["Tree", "Colour", "Available seat sizes", "Weight"];
/** Main photo followed by the gallery, without blanks or repeats. */
export const productPhotos = (p: Product) => [...new Set([productPhoto(p), ...(p.gallery ?? [])].filter(Boolean))];
/** One entry per saddle type, in display order. Variants like "Stock Saddle #02" are grouped; `product` is the first of them. */
export function saddleTypes(list: Product[]) {
  const types = new Map<string, Product[]>();
  for (const p of list) {
    if (categoryOf(p) !== "saddles") continue;
    const name = p.name.replace(/\s*#\d+\s*$/, "").trim();
    types.set(name, [...(types.get(name) ?? []), p]);
  }
  return [...types].map(([name, variants]) => ({ name, plural: /s$/i.test(name) ? name : `${name}s`, product: variants[0], variants }));
}
export const productPhoto = (p: Product) => p.photo || (p.image ? `/images/saddles/${p.image}-v2.png` : "/images/custom-saddle.webp");
/** Spec values with commas are a list of options (e.g. seat sizes) and show as separate chips. */
export const specOptions = (value: string) => value.split(",").map(v => v.trim()).filter(Boolean);
const SEATS_SMALL = "13”, 13.5”, 14”, 14.5”, 15”", SEATS_WADE = "15.5”, 16”, 16.5”";
const TREE = { label: "Tree", value: "Rigid PU & Carbon Fibre" }, NATURAL = { label: "Colour", value: "Natural" };
const seats = (value: string) => ({ label: "Available seat sizes", value });
const weight = (value: string) => ({ label: "Weight", value });
/** In display order (Saddles, then Saddle Trees). Same-named saddles with different details are numbered (#01, #02…). Entries without a set price are quoted individually. */
export const products: Product[] = [
  {
    id: "campdraft-saddles", name: "Campdraft Saddle", image: "campdraft", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/c4037677-6804-42c2-8afe-45b9ba0754ce.jpg", gallery: ["https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/82c5e800-b187-4267-adc4-d8267ee2b03e.jpg", "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/6db7ceb3-8886-4068-a02b-3b10c72ca155.jpg"], price: 350000, stock: 2,
    description: "Elevate your ride with our precision-built Campdraft Saddle. Finished in classic natural leather with intricate basket stamping on the skirt and fenders, this saddle is crafted to support rider balance and horse movement through every turn. Weighing approximately 10 kg, it offers a lightweight feel without compromising on strength or longevity.",
    specs: [TREE, NATURAL, weight("Approx. 10 kg"), seats(SEATS_SMALL)],
  },
  {
    id: "stock-saddles", name: "Stock Saddle #01", image: "stock", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/dbfb2858-e954-4f6b-9c49-260ff6d338e9.jpg", gallery: ["https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/6ca277d5-ff57-4218-b02e-756b8889d953.jpg", "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/0d4c8732-8ff9-4aba-b820-73054828f31f.jpg", "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/330c7fc0-c088-4692-bedf-6e0496b4fe8c.jpg"], price: 280000, stock: 4,
    description: "Built for serious station work. Our Stock Saddle features a padded inlay roughout seat engineered to enhance rider stability without compromising movement. Finished in classic natural leather with fine waffle stamping on the jockeys and fenders, it delivers reliable performance, rugged durability, and classic style.",
    specs: [TREE, NATURAL, weight("Approx. 10–11 kg"), seats(SEATS_SMALL)],
  },
  {
    id: "stock-saddles-02", name: "Stock Saddle #02", image: "stock", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/b598d853-6b0d-441c-a921-82f3a5997fc6.jpg", gallery: ["https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/231a5066-ea19-48d1-b7a6-ad8086ffc7a1.jpg", "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/35bd946b-1091-447a-a50f-6810f7942cbb.jpg"], price: 0, stock: 0, custom: true,
    description: "Built with a smooth-out seat and fenders for classic feel and easy movement, this Stock Saddle showcases detailed basket stamping framed by an elegant Carlos border. Finished in natural leather, it brings timeless style and durability to everyday work.",
    specs: [TREE, NATURAL, weight("Approx. 10–11 kg"), seats(SEATS_SMALL)],
  },
  {
    id: "stock-saddles-03", name: "Stock Saddle #03", image: "stock", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/cbf41061-6f8f-4565-b38e-1a2790f2fb18.jpg", price: 0, stock: 0, custom: true,
    description: "Crafted with a traditional Hubbard skirt and detailed floral tooling across the rear jockeys, this Stock Saddle pairs classic elegance with rugged functionality. Finished in natural leather, it delivers a comfortable ride and timeless style for station work or performance riding.",
    specs: [TREE, NATURAL, weight("Approx. 10–11 kg"), seats(SEATS_SMALL)],
  },
  {
    id: "wade-saddles", name: "Wade Saddle #01", image: "wade", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/40113acf-59dd-4fd4-829b-a39674469ed4.jpg", price: 320000, stock: 3,
    description: "Built on a tree made from rigid PU and carbon fibre, this Wade saddle features a roughout seat and fenders paired with a padded inlaid seat for maximum grip and comfort. Detailed with refined Carlos border stamping, it combines rugged functionality with clean, traditional lines.",
    specs: [TREE, NATURAL, weight("Approx. 13–14 kg"), seats(SEATS_WADE)],
  },
  {
    id: "wade-saddles-02", name: "Wade Saddle #02", image: "wade", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/ff45f867-81bb-4759-b573-30b249ffd552.jpg", price: 0, stock: 0, custom: true,
    description: "This Wade saddle features a high-traction roughout finish, a padded inlaid seat, and classic basket weave tooling with Carlos border stamping in natural leather.",
    specs: [TREE, NATURAL, weight("Approx. 13–14 kg"), seats(SEATS_WADE)],
  },
  {
    id: "cowboy-dressage-saddles", name: "Cowboy Dressage Saddle #01", image: "western", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/0a7edddb-d3d8-4960-a5a8-f99c6cc119f7.jpg", price: 0, stock: 0, custom: true,
    description: "This natural leather Cowboy Dressage saddle features a padded inlaid roughout seat and fenders for superior grip and comfort. Finished with classic floral tooling on the jockeys and swell.",
    specs: [TREE, NATURAL, weight("Approx. 13–14 kg"), seats("16”")],
  },
  {
    id: "cowboy-dressage-saddles-02", name: "Cowboy Dressage Saddle #02", image: "western", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/7f951eae-80e1-4d15-88f4-2d4a4b814fff.jpg", gallery: ["https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/69a5c157-1e3c-4a11-8236-842ed3815b52.jpg"], price: 0, stock: 0, custom: true,
    description: "This Cowboy Dressage saddle pairs a smooth seat and padded inlay with detailed floral tooling across the fenders, rear jockeys and swell. Built on a high-strength rigid PU and carbon fibre tree, it delivers elegant craftsmanship, balanced performance, and traditional style.",
    specs: [TREE, NATURAL, weight("Approx. 13–14 kg"), seats("16”")],
  },
  {
    id: "old-timer-vaquero-saddles", name: "Old Timer Saddle", image: "vaquero", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/3421b514-b5b5-4c18-98aa-76c32bd9b5ca.jpg", gallery: ["https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/bb83f91b-ee56-46e5-8c97-aeddbfde1739.jpg", "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/71124753-8638-4e3e-b9f9-110841d11cf8.jpg"], price: 380000, stock: 2,
    description: "Classic stockmanship with this Old Timer saddle, featuring a Sam Stagg rigged setup and exposed full-length stirrup leathers. Built on a lightweight, high-strength rigid PU and carbon fibre tree, it’s finished in natural leather with elegant Carlos border detailing for a clean, timeless look.",
    specs: [TREE, NATURAL, seats("16”")],
  },
  { id: "reining-saddles", name: "Reining Saddle", image: "reining", price: 330000, stock: 2 },
  { id: "cutting-saddles", name: "Cutting Saddle", image: "cutting", price: 340000, stock: 1 },
  { id: "custom-western-saddles", name: "Custom Western Saddle", image: "western", price: 0, stock: 0, custom: true },
  {
    id: "stock-standard-saddle-tree-3-5-cantle", name: "Stock Standard Saddle Tree (3 ½” Cantle)", image: "", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/7f75ac3f-b869-49bd-a161-d375f3529fe1.jpg", price: 0, stock: 0, custom: true, category: "saddle-trees",
    description: "Built using a high-strength polyurethane and industrial-grade carbon fibre composite, our Stock Standard Saddle Tree is exceptionally light yet incredibly tough. It is engineered for long-lasting performance and maximum durability under demanding conditions. The ergonomic design provides your horse with optimal freedom of movement, preventing soreness and injury during long rides.",
    specs: [weight("Approx. 3 kg"), { label: "Cantle height", value: "3 ½”" }, { label: "Available sizes", value: SEATS_SMALL }],
  },
  {
    id: "stock-saddle-tree-3-25-cantle", name: "Stock Saddle Tree (3 ¼” Cantle)", image: "", photo: "https://pub-3222dde6d8164a918f3c3681e58bb989.r2.dev/products/2026/11/68aeab5d-014f-4ebc-84d5-8ebf7c7f2f41.jpg", price: 0, stock: 0, custom: true, category: "saddle-trees",
    description: "Featuring a lower 3 ¼” cantle profile, this fully moulded saddle tree leverages high-strength PU and carbon fibre technology to provide an ultra-light. Built to protect your horse from soreness and restriction, it delivers all-day comfort and stability without adding unnecessary weight.",
    specs: [weight("Approx. 3 kg"), { label: "Cantle height", value: "3 ¼”" }, { label: "Available sizes", value: SEATS_SMALL }],
  },
];
// Demonstration prices in AUD cents; replace with the real catalog before launch.
export const money = (cents: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);
