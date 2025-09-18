// /apps/latest-mobile/data/homeScreenData.js

// Categories data with enhanced visual elements
export const categories = [
  { id: "all", name: "All", icon: "🌟", color: "#6366F1" },
  {
    id: "bengali-special",
    name: "Bengali Special",
    icon: "🍽️",
    color: "#EC4899",
  },
  {
    id: "vegetables",
    name: "Fresh Vegetables",
    icon: "🥬",
    color: "#10B981",
  },
  { id: "fruits", name: "Fresh Fruits", icon: "🍎", color: "#F59E0B" },
  { id: "groceries", name: "Groceries", icon: "🛒", color: "#8B5CF6" },
  {
    id: "eggs-meat-fish",
    name: "Eggs Meat & Fish",
    icon: "🥚",
    color: "#EF4444",
  },
  { id: "dairy", name: "Dairy", icon: "🥛", color: "#06B6D4" },
];

// Special offers carousel data
export const offers = [
  {
    id: 1,
    title: "50% OFF",
    subtitle: "Fresh Vegetables",
    description: "Limited time offer on all organic vegetables",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=250&fit=crop",
    backgroundColor: "#FF6B6B",
  },
  {
    id: 2,
    title: "Buy 2 Get 1",
    subtitle: "Seasonal Fruits",
    description: "Mix and match any seasonal fruits",
    image:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=250&fit=crop",
    backgroundColor: "#4ECDC4",
  },
  {
    id: 3,
    title: "30% OFF",
    subtitle: "Dairy Products",
    description: "Fresh milk, cheese, and yogurt",
    image:
      "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=250&fit=crop",
    backgroundColor: "#45B7D1",
  },
  {
    id: 4,
    title: "Free Delivery",
    subtitle: "Orders Above $50",
    description: "No minimum quantity required",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
    backgroundColor: "#96CEB4",
  },
];

// Flash deals with countdown
export const flashDeals = [
  {
    id: 1,
    title: "Organic Tomatoes",
    originalPrice: 60,
    discountPrice: 45,
    discount: 25,
    timeLeft: "2h 15m",
    image:
      "https://www.bigbasket.com/media/uploads/p/l/10000025_26-fresho-tomato-local.jpg",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: 2,
    title: "Fresh Spinach",
    originalPrice: 30,
    discountPrice: 25,
    discount: 17,
    timeLeft: "1h 45m",
    image:
      "https://www.bigbasket.com/media/uploads/p/l/10000146_15-fresho-spinach.jpg",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: 3,
    title: "Alphonso Mango",
    originalPrice: 200,
    discountPrice: 150,
    discount: 25,
    timeLeft: "3h 20m",
    image:
      "https://www.bigbasket.com/media/uploads/p/l/20000911_16-fresho-mango-alphonso.jpg",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
];

// Trending categories with dynamic data
export const trendingCategories = [
  {
    id: 1,
    title: "Bengali\nDelights",
    subtitle: "Authentic flavors",
    icon: "🐟",
    bgColor: "#FFF1F2",
    borderColor: "#FB7185",
    route: "/category/bengali-special",
  },
  {
    id: 2,
    title: "Farm Fresh\nVeggies",
    subtitle: "Just harvested",
    icon: "🌱",
    bgColor: "#F0FDF4",
    borderColor: "#4ADE80",
    route: "/category/fresh-vegetables",
  },
  {
    id: 3,
    title: "Seasonal\nFruits",
    subtitle: "Sweet & juicy",
    icon: "🍓",
    bgColor: "#FEF3C7",
    borderColor: "#FBBF24",
    route: "/category/fresh-fruits",
  },
  {
    id: 4,
    title: "Daily\nEssentials",
    subtitle: "Kitchen basics",
    icon: "🌾",
    bgColor: "#EDE9FE",
    borderColor: "#A78BFA",
    route: "/category/groceries",
  },
  {
    id: 5,
    title: "Protein\nPower",
    subtitle: "Fresh & clean",
    icon: "🥩",
    bgColor: "#FEF2F2",
    borderColor: "#F87171",
    route: "/category/eggs-meat-fish",
  },
  {
    id: 6,
    title: "Dairy\nFresh",
    subtitle: "Pure & natural",
    icon: "🧀",
    bgColor: "#F0F9FF",
    borderColor: "#38BDF8",
    route: "/category/dairy",
  },
];

// Popular this week with enhanced visuals
export const popularWeek = [
  {
    id: 1,
    title: "Weekly\nBestsellers",
    subtitle: "Top picks",
    icon: "🔥",
    bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#FFFFFF",
  },
  {
    id: 2,
    title: "Monsoon\nSpecials",
    subtitle: "Season's best",
    icon: "🌧️",
    bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    textColor: "#FFFFFF",
  },
  {
    id: 3,
    title: "Health\nBooster",
    subtitle: "Immunity care",
    icon: "💪",
    bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    textColor: "#FFFFFF",
  },
];

// Weekly staples - frequently bought products
export const weeklyStaples = [
  {
    id: 1,
    title: "Basmati Rice",
    subtitle: "Premium Quality",
    price: 180,
    unit: "1kg",
    timesOrdered: 12,
    image:
      "https://www.bigbasket.com/media/uploads/p/l/40076906_8-india-gate-basmati-rice-classic.jpg",
    inStock: true,
  },
  {
    id: 2,
    title: "Tata Tea Gold",
    subtitle: "Tea Leaves",
    price: 140,
    unit: "250g",
    timesOrdered: 8,
    image:
      "https://www.bigbasket.com/media/uploads/p/l/1204600_1-tata-tea-gold-leaf-tea.jpg",
    inStock: true,
  },
  {
    id: 3,
    title: "Amul Milk",
    subtitle: "Full Cream",
    price: 28,
    unit: "500ml",
    timesOrdered: 15,
    image:
      "https://www.bigbasket.com/media/uploads/p/l/40018448_6-amul-milk-full-cream.jpg",
    inStock: true,
  },
  {
    id: 4,
    title: "Maggi Noodles",
    subtitle: "Masala Flavor",
    price: 96,
    unit: "8 pack",
    timesOrdered: 6,
    image:
      "https://www.bigbasket.com/media/uploads/p/l/40052820_1-maggi-2-minute-noodles-masala.jpg",
    inStock: true,
  },
  {
    id: 5,
    title: "Aashirvaad Atta",
    subtitle: "Whole Wheat",
    price: 220,
    unit: "5kg",
    timesOrdered: 4,
    image:
      "https://www.bigbasket.com/media/uploads/p/l/40011359_5-aashirvaad-atta-whole-wheat.jpg",
    inStock: false,
  },
];
