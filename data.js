// ============================================================
// ReLoop — Mock Data
// All data here is demo/example data for hackathon purposes.
// ============================================================

const MOCK_LISTINGS = [
  {
    id: 1,
    title: "Reclaimed Wood Coffee Table",
    category: "Furniture",
    material: "Wood",
    condition: "Good",
    price: 2500,
    currency: "৳",
    location: "Dhanmondi, Dhaka",
    sellerRole: "Individual",
    sellerName: "Rahim Uddin",
    tag: "reusable",
    image: null,
    emoji: "🪑",
    description: "Solid wooden coffee table in excellent used condition. Great for home use, cafes, or restoration projects.",
    listedAt: "2 days ago"
  },
  {
    id: 2,
    title: "PET Plastic Bottles (50 pcs)",
    category: "Recyclable",
    material: "PET Plastic",
    condition: "Used",
    price: 0,
    currency: "৳",
    location: "Mirpur, Dhaka",
    sellerRole: "Individual",
    sellerName: "Nasrin Begum",
    tag: "recyclable",
    image: null,
    emoji: "♻️",
    description: "Clean, sorted PET plastic bottles ready for recycling. Ideal for recyclers or upcycling makers.",
    listedAt: "1 day ago"
  },
  {
    id: 3,
    title: "Handmade Bottle Planter",
    category: "Handmade",
    material: "Recycled Plastic",
    condition: "New",
    price: 450,
    currency: "৳",
    location: "Uttara, Dhaka",
    sellerRole: "Maker",
    sellerName: "EcoCraft Studio",
    tag: "handmade",
    image: null,
    emoji: "🌱",
    description: "Beautiful planters handcrafted from recycled plastic bottles. Perfect for balconies and desks.",
    listedAt: "3 hours ago"
  },
  {
    id: 4,
    title: "Used Study Chair",
    category: "Furniture",
    material: "Wood & Metal",
    condition: "Fair",
    price: 800,
    currency: "৳",
    location: "Mohammadpur, Dhaka",
    sellerRole: "Individual",
    sellerName: "Karim Hossain",
    tag: "reusable",
    image: null,
    emoji: "🪑",
    description: "Functional study chair with minor scratches. Great for students or upcyclers.",
    listedAt: "5 hours ago"
  },
  {
    id: 5,
    title: "Cardboard Boxes (20 pcs)",
    category: "Recyclable",
    material: "Cardboard",
    condition: "Used",
    price: 0,
    currency: "৳",
    location: "Chattogram",
    sellerRole: "Individual",
    sellerName: "Sumaiya Rahman",
    tag: "recyclable",
    image: null,
    emoji: "📦",
    description: "Used cardboard boxes in good condition. Ready for recycling or reuse for moving/storage.",
    listedAt: "Yesterday"
  },
  {
    id: 6,
    title: "Recycled Denim Tote Bag",
    category: "Handmade",
    material: "Recycled Denim",
    condition: "New",
    price: 650,
    currency: "৳",
    location: "Dhanmondi, Dhaka",
    sellerRole: "Maker",
    sellerName: "ReThread",
    tag: "handmade",
    image: null,
    emoji: "👜",
    description: "Stylish tote bag made from upcycled denim jeans. Each piece is unique.",
    listedAt: "4 hours ago"
  },
  {
    id: 7,
    title: "Old Laptop for Parts",
    category: "Electronics",
    material: "Mixed",
    condition: "Broken",
    price: 1200,
    currency: "৳",
    location: "Gulshan, Dhaka",
    sellerRole: "Individual",
    sellerName: "Tanvir Ahmed",
    tag: "reusable",
    image: null,
    emoji: "💻",
    description: "Non-functional laptop. Screen, keyboard, and RAM may be usable. Ideal for repair shops or e-waste recyclers.",
    listedAt: "2 hours ago"
  },
  {
    id: 8,
    title: "Glass Jars (Set of 12)",
    category: "Recyclable",
    material: "Glass",
    condition: "Good",
    price: 300,
    currency: "৳",
    location: "Uttara, Dhaka",
    sellerRole: "Individual",
    sellerName: "Fatema Khanam",
    tag: "reusable",
    image: null,
    emoji: "🫙",
    description: "Clean glass jars from food products. Excellent for home storage, crafts, or kitchen organization.",
    listedAt: "6 hours ago"
  },
  {
    id: 9,
    title: "Bundle of Old Clothes",
    category: "Clothes",
    material: "Mixed Fabric",
    condition: "Fair",
    price: 0,
    currency: "৳",
    location: "Mohammadpur, Dhaka",
    sellerRole: "Individual",
    sellerName: "Aisha Siddiqua",
    tag: "donate",
    image: null,
    emoji: "👕",
    description: "Assorted clothing items, clean and wearable. Donating to someone in need or a maker who upcycles textiles.",
    listedAt: "1 hour ago"
  },
  {
    id: 10,
    title: "Aluminum Scrap Metal",
    category: "Recyclable",
    material: "Aluminum",
    condition: "Scrap",
    price: 1800,
    currency: "৳",
    location: "Narayanganj",
    sellerRole: "Individual",
    sellerName: "Jamal Mia",
    tag: "recyclable",
    image: null,
    emoji: "🔩",
    description: "Approximately 15 kg of aluminum scrap from construction. Suitable for metal recyclers.",
    listedAt: "Yesterday"
  },
  {
    id: 11,
    title: "Upcycled Tin Can Lanterns",
    category: "Handmade",
    material: "Recycled Tin",
    condition: "New",
    price: 280,
    currency: "৳",
    location: "Dhanmondi, Dhaka",
    sellerRole: "Maker",
    sellerName: "TinCraft BD",
    tag: "handmade",
    image: null,
    emoji: "🕯️",
    description: "Beautiful decorative lanterns handcrafted from upcycled tin cans. Great for home decor.",
    listedAt: "Today"
  },
  {
    id: 12,
    title: "Old Mobile Phones (5 units)",
    category: "Electronics",
    material: "Mixed",
    condition: "Broken",
    price: 500,
    currency: "৳",
    location: "Mirpur, Dhaka",
    sellerRole: "Individual",
    sellerName: "Rubel Hasan",
    tag: "recyclable",
    image: null,
    emoji: "📱",
    description: "Non-functional mobile phones. Good for e-waste recyclers or parts recovery.",
    listedAt: "3 days ago"
  }
];

const MOCK_MATERIALS = [
  {
    id: 1,
    company: "ABC Plastics Ltd.",
    seeking: "PET Plastic",
    quantity: "500 kg/month",
    location: "Gazipur, Dhaka",
    status: "Actively Sourcing",
    category: "Plastic",
    emoji: "🏭",
    contact: "abc.plastics@demo.bd",
    description: "PET plastic bottles and containers preferred. Minimum 50 kg per batch."
  },
  {
    id: 2,
    company: "GreenMetal Ltd.",
    seeking: "Aluminum Scrap",
    quantity: "200 kg/month",
    location: "Narayanganj",
    status: "Actively Sourcing",
    category: "Metal",
    emoji: "⚙️",
    contact: "greenmetal@demo.bd",
    description: "Clean aluminum scrap from construction or household. No mixed metal."
  },
  {
    id: 3,
    company: "EcoBoard Factory",
    seeking: "Compressed Cardboard",
    quantity: "1 ton/month",
    location: "Savar, Dhaka",
    status: "Actively Sourcing",
    category: "Paper",
    emoji: "📋",
    contact: "ecoboard@demo.bd",
    description: "Dry, clean cardboard boxes and packaging material."
  },
  {
    id: 4,
    company: "ReFiber BD",
    seeking: "Discarded Textiles",
    quantity: "300 kg/month",
    location: "Ashulia, Dhaka",
    status: "Paused",
    category: "Textile",
    emoji: "🧶",
    contact: "refiber@demo.bd",
    description: "Cotton and denim scraps preferred. For fiber recovery and insulation manufacturing."
  },
  {
    id: 5,
    company: "BDGlass Recyclers",
    seeking: "Glass Bottles & Jars",
    quantity: "150 kg/month",
    location: "Chittagong",
    status: "Actively Sourcing",
    category: "Glass",
    emoji: "🫙",
    contact: "bdglass@demo.bd",
    description: "Clean glass containers of any color. Labels can be on."
  },
  {
    id: 6,
    company: "ElectoRecycle BD",
    seeking: "E-Waste / Electronics",
    quantity: "Any quantity",
    location: "Dhaka",
    status: "Actively Sourcing",
    category: "Electronics",
    emoji: "💡",
    contact: "electobd@demo.bd",
    description: "Old phones, laptops, circuit boards, and cables accepted. Responsible disposal guaranteed."
  }
];

const MOCK_MAKERS = [
  {
    id: 1,
    name: "EcoCraft Studio",
    specialty: "Plastic & Wood Upcycling",
    products: ["Bottle Planters", "Mosaic Art", "Wooden Shelves"],
    materials: ["PET Plastic", "Reclaimed Wood", "Tin Cans"],
    location: "Uttara, Dhaka",
    category: "Maker",
    emoji: "🎨",
    rating: 4.8,
    itemsSold: 142,
    description: "We transform plastic bottles and reclaimed wood into beautiful home and garden products."
  },
  {
    id: 2,
    name: "ReThread",
    specialty: "Textile Upcycling",
    products: ["Denim Tote Bags", "Patchwork Quilts", "Upcycled Jackets"],
    materials: ["Old Denim", "Fabric Scraps", "Discarded Clothes"],
    location: "Dhanmondi, Dhaka",
    category: "Maker",
    emoji: "🧵",
    rating: 4.9,
    itemsSold: 98,
    description: "Fashion with a conscience. We stitch new life into discarded fabrics and textiles."
  },
  {
    id: 3,
    name: "TinCraft BD",
    specialty: "Metal Upcycling",
    products: ["Tin Lanterns", "Herb Planters", "Wall Art"],
    materials: ["Tin Cans", "Aluminum Scraps", "Wire"],
    location: "Dhanmondi, Dhaka",
    category: "Maker",
    emoji: "🔨",
    rating: 4.6,
    itemsSold: 65,
    description: "From cans to crafts. Every discarded tin can become a beautiful home accessory."
  },
  {
    id: 4,
    name: "GlassArt Chittagong",
    specialty: "Glass Art & Repurposing",
    products: ["Mosaic Frames", "Bottle Vases", "Glass Lamps"],
    materials: ["Glass Bottles", "Glass Jars", "Broken Glass"],
    location: "Chittagong",
    category: "Maker",
    emoji: "✨",
    rating: 4.7,
    itemsSold: 54,
    description: "Creating artistic glasswork from discarded glass bottles and containers."
  },
  {
    id: 5,
    name: "CircleWood",
    specialty: "Furniture Restoration",
    products: ["Restored Chairs", "Reclaimed Tables", "Wooden Shelves"],
    materials: ["Old Furniture", "Reclaimed Wood", "Pallets"],
    location: "Mohammadpur, Dhaka",
    category: "Maker",
    emoji: "🪵",
    rating: 4.5,
    itemsSold: 37,
    description: "We restore and repurpose old wooden furniture, giving them decades more of useful life."
  }
];

const MOCK_RECYCLERS = [
  {
    id: 1,
    name: "GreenCycle BD",
    materials: ["PET Plastic", "HDPE Plastic", "Cardboard", "Paper"],
    collection: true,
    area: "Dhaka (All Zones)",
    minQuantity: "5 kg",
    emoji: "♻️",
    rating: 4.7,
    certified: true,
    contact: "greencycle@demo.bd",
    description: "One of Dhaka's leading plastic and paper recyclers. Licensed and certified by DoE."
  },
  {
    id: 2,
    name: "EcoMetal Recyclers",
    materials: ["Aluminum", "Steel", "Copper", "Iron Scrap"],
    collection: true,
    area: "Dhaka & Narayanganj",
    minQuantity: "10 kg",
    emoji: "🔩",
    rating: 4.5,
    certified: true,
    contact: "ecometal@demo.bd",
    description: "Specialized metal scrap collection and recycling with fair pricing."
  },
  {
    id: 3,
    name: "E-Waste Safe BD",
    materials: ["Laptops", "Phones", "Batteries", "Cables", "Circuit Boards"],
    collection: true,
    area: "Dhaka",
    minQuantity: "Any",
    emoji: "💻",
    rating: 4.8,
    certified: true,
    contact: "ewaste.safe@demo.bd",
    description: "Responsible e-waste collection and certified disposal. Your data is safely wiped before processing."
  },
  {
    id: 4,
    name: "PaperCycle Dhaka",
    materials: ["Newspaper", "Cardboard", "Office Paper", "Books"],
    collection: false,
    area: "Mirpur, Mohammadpur",
    minQuantity: "20 kg",
    emoji: "📄",
    rating: 4.3,
    certified: false,
    contact: "papercycle@demo.bd",
    description: "Paper and cardboard recycling. Drop-off locations in Mirpur and Mohammadpur."
  },
  {
    id: 5,
    name: "ChittagongRecycle Co.",
    materials: ["Mixed Plastic", "Glass", "Metal", "Cardboard"],
    collection: true,
    area: "Chittagong",
    minQuantity: "15 kg",
    emoji: "🌿",
    rating: 4.4,
    certified: true,
    contact: "ctgrecycle@demo.bd",
    description: "Chittagong's go-to recycler for mixed materials. Serving communities since 2018."
  }
];

const DEMO_ITEMS = [
  {
    id: "demo1",
    label: "Plastic Bottles",
    description: "I have about 15 used plastic PET bottles that I want to get rid of.",
    emoji: "🍶"
  },
  {
    id: "demo2",
    label: "Old Wooden Chair",
    description: "An old wooden chair with a broken leg. Still mostly solid.",
    emoji: "🪑"
  },
  {
    id: "demo3",
    label: "Used Clothing",
    description: "A bag of old clothes — shirts, jeans, and a jacket. Clean but worn.",
    emoji: "👕"
  },
  {
    id: "demo4",
    label: "Broken Electronics",
    description: "An old laptop and two smartphones that no longer turn on.",
    emoji: "💻"
  }
];

const IMPACT_STATS = {
  itemsDiverted: 1248,
  materialsRecovered: 486,
  communityListings: 237,
  localMakers: 84
};

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = { MOCK_LISTINGS, MOCK_MATERIALS, MOCK_MAKERS, MOCK_RECYCLERS, DEMO_ITEMS, IMPACT_STATS };
}
