// client/src//lib/banner-data.ts

export interface Slide {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  badge: string;
  collection: string;
  category: string;
}

// Static banner data - you can update these as needed
export const bannerSlides: Slide[] = [
  {
    title: "Classic Normal Panjabi",
    subtitle: "Traditional Elegance",
    description: "",
    image: "/panjabi-jummah.png",
    buttonText: "Shop Now",
    buttonLink: "/all-collections",
    badge: "Classic",
    collection: "Normal Collection",
    category: "normal",
  },
  {
    title: "Premium Medium Panjabi",
    subtitle: "Contemporary Style",
    description: "",
    image: "/panjabi-jummah.png",
    buttonText: "Premium Panjabi",
    buttonLink: "/best-selling",
    badge: "Premium Collections",
    collection: "Medium Collection",
    category: "medium",
  },
];

// Static feature data
export const features = [
  {
    title: "Free Shipping",
    desc: "On orders over ৳ 2000",
    icon: "Truck",
    bg: "from-amber-500 to-orange-500",
  },
  {
    title: "Quality Guarantee",
    desc: "Premium quality fabrics",
    icon: "ShieldCheck",
    bg: "from-green-500 to-emerald-600",
  },
  {
    title: "Easy Returns",
    desc: "30-day return policy",
    icon: "RotateCcw",
    bg: "from-blue-500 to-cyan-500",
  },
  {
    title: "24/7 Support",
    desc: "Always here for you",
    icon: "Headset",
    bg: "from-purple-500 to-pink-500",
  },
];

// Static stats data
export const initialStats = [
  {
    id: 1,
    label: "Happy Customers",
    value: 12000,
    icon: "Users",
  },
  {
    id: 2,
    label: "Premium Punjabi",
    value: 42,
    icon: "ShoppingBag",
  },
  {
    id: 3,
    label: "Orders Delivered",
    value: 35000,
    icon: "Truck",
  },
  {
    id: 4,
    label: "Customer Satisfaction",
    value: 98,
    suffix: "%",
    icon: "Smile",
  },
];