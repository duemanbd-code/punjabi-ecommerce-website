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
    title: "Regular Collections Subtile Craft",
    subtitle: "Clean Elegance",
    description: "",
    image: "/regular1.jpeg",
    buttonText: "Buy Regular Punjabi",
    buttonLink: "/category/regular-panjabi",
    badge: "Regular",
    collection: "Regular Collections",
    category: "normal",
  },
  {
    title: "Premium Collections Refined Zardusi",
    subtitle: "Elevated Style",
    description: "",
    image: "/premium1.jpeg",
    buttonText: "Buy Premium Panjabi",
    buttonLink: "/category/premium-panjabi",
    badge: "Premium",
    collection: "Premium Collections",
    category: "medium",
  },
  {
    title: "Luxury Collections Masterpiece Zardusi",
    subtitle: "Royal Presence",
    description: "",
    image: "/luxury1.jpeg",
    buttonText: "Buy Luxury Panjabi",
    buttonLink: "/category/luxury-panjabi",
    badge: "Luxury",
    collection: "Luxury Collections",
    category: "medium",
  },
];

// Static feature data
export const features = [
  {
    title: "Free Shipping",  
    desc: "On Orders above ৳5,000",
    icon: "Truck",
    bg: "from-amber-500 to-orange-500",
  },
  {
    title: "Quality Guarantee",
    desc: "Premium Fabric & Handcrafted Zardusi",
    icon: "ShieldCheck",
    bg: "from-green-500 to-emerald-600",
  },
  {
    title: "Easy Returns",
    desc: "7 Days Easy Return",
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
 