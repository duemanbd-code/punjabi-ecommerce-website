// client/src/app/product/[id]/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Truck,
  Package,
  Star,
  Check,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  X,
  Palette,
  Ruler,
  Shield,
  RefreshCw,
  Share2,
  Eye,
  Hash,
  Tag,
  Sparkles,
  Zap,
  Image as ImageIcon,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  Clock,
  Truck as TruckIcon,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronUp,
  Percent,
  BadgePercent,
  TrendingUp,
  Send,
  Star as StarIcon,
  Edit,
  Trash2,
  Save,
  XCircle,
  ChevronRight as ChevronRightIcon,
  Menu,
  Grid,
  List,
  Key,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import axios from "axios";
import ProductCard, { Product } from "@/components/ProductCard";

// Fixed Environment configuration
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://puti-client-production.onrender.com");

// FIXED: Proper image URL handling
const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath || imagePath.trim() === "") {
    return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
  }

  // If it's already a full URL (http, https, data, blob), return as is
  if (
    imagePath.startsWith("http") ||
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  // If it contains "undefined", return fallback
  if (imagePath.includes("undefined")) {
    console.warn('Found "undefined" in image path:', imagePath);
    return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
  }

  // Clean the path - remove any leading slash
  let cleanPath = imagePath.startsWith("/")
    ? imagePath.substring(1)
    : imagePath;

  // Remove any duplicate uploads/ prefix
  cleanPath = cleanPath.replace(/^uploads\//, "");

  // Log for debugging
  console.log("Image path processing:", {
    original: imagePath,
    cleaned: cleanPath,
    API_URL,
  });

  // Construct the full URL
  return `${API_URL}/uploads/${cleanPath}`;
};

// Review type definition
interface Review {
  _id: string;
  userId: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
  images?: string[];
  createdAt: string;
}

// Size type definition
interface ProductSize {
  size: string;
  stock: number;
  price?: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [currentImage, setCurrentImage] = useState(0);
  const [zoomViewer, setZoomViewer] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(
    new Set(),
  );
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // New review form state
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    name: "",
  });
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const reviewsEndRef = useRef<HTMLDivElement>(null);

  // Action button states
  type ActionType = "cart" | "love" | "buy";
  const [activeAction, setActiveAction] = useState<ActionType>("buy");
  const [actionMessage, setActionMessage] = useState<{
    type: ActionType;
    message: string;
    icon: React.ReactNode;
  } | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize current user ID
  useEffect(() => {
    const userId =
      localStorage.getItem("currentUserId") || `user_${Date.now()}`;
    if (!localStorage.getItem("currentUserId")) {
      localStorage.setItem("currentUserId", userId);
    }
    setCurrentUserId(userId);
  }, []);

  useEffect(() => {
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching product from:", `${API_URL}/api/products/${id}`);

        const response = await axios.get(`${API_URL}/api/products/${id}`);

        console.log("Product API response:", response.data);

        let productData = null;

        if (response.data && response.data.data) {
          productData = response.data.data;
        } else if (response.data) {
          productData = response.data;
        }

        if (!productData) {
          throw new Error("Product not found");
        }

        const parseSizes = () => {
          if (productData.variants && Array.isArray(productData.variants)) {
            return productData.variants.map((v: any) => ({
              size: v.size || "M",
              stock: v.stockQuantity || v.stock || 0,
            }));
          } else if (productData.sizes) {
            try {
              if (typeof productData.sizes === "string") {
                const parsed = JSON.parse(productData.sizes);
                if (Array.isArray(parsed)) {
                  return parsed.map((s: any) => ({
                    size: s.size || s.Size || "M",
                    stock: s.stock || s.Stock || s.stockQuantity || 0,
                  }));
                }
              } else if (Array.isArray(productData.sizes)) {
                return productData.sizes.map((s: any) => ({
                  size: s.size || s.Size || "M",
                  stock: s.stock || s.Stock || s.stockQuantity || 0,
                }));
              }
            } catch (e) {
              console.error("Error parsing sizes:", e);
            }
          }
          return [
            {
              size: "M",
              stock: productData.stockQuantity || productData.stock || 0,
            },
          ];
        };

        const sizes = parseSizes();

        // FIXED: Proper image processing with debug logging
        const mainImage = getImageUrl(productData.imageUrl);
        console.log("Main image URL:", {
          original: productData.imageUrl,
          processed: mainImage,
        });

        const additionalImages = Array.isArray(productData.additionalImages)
          ? productData.additionalImages.map((img: string) => {
              const processed = getImageUrl(img);
              console.log("Additional image:", { original: img, processed });
              return processed;
            })
          : [];

        // UPDATED: Removed productCode field, using sku as custom product code
        const processedProduct = {
          _id: productData._id,
          title: productData.title || "Product",
          description: productData.description || "",
          category: productData.category || "Uncategorized",
          normalPrice: productData.normalPrice || 0,
          offerPrice:
            productData.salePrice ||
            productData.offerPrice ||
            productData.normalPrice ||
            0,
          originalPrice:
            productData.originalPrice || productData.normalPrice || 0,
          salePrice:
            productData.salePrice ||
            productData.offerPrice ||
            productData.normalPrice ||
            0,
          discountPercentage:
            productData.discountPercentage ||
            (productData.normalPrice > 0 &&
            productData.salePrice > 0 &&
            productData.salePrice < productData.normalPrice
              ? Math.round(
                  ((productData.normalPrice - productData.salePrice) /
                    productData.normalPrice) *
                    100,
                )
              : 0),
          stock: productData.stockQuantity || productData.stock || 0,
          sizes: sizes,
          // FIXED: Use the corrected getImageUrl function
          imageUrl: mainImage,
          additionalImages: additionalImages,
          featured: productData.featured || false,
          isBestSelling: productData.isBestSelling || false,
          isNew: productData.isNew || productData.isNewProduct || false,
          hasOffer:
            (productData.salePrice &&
              productData.salePrice < productData.normalPrice) ||
            false,
          tags: productData.tags || [],
          status: productData.productStatus || productData.status || "active",
          sku: productData.sku || "", // UPDATED: This is now the custom product code from admin
          weight: productData.weight,
          dimensions: productData.dimensions,
          material: productData.material,
          warranty: productData.warranty,
          rating: productData.rating || 0,
          reviewCount: productData.reviewCount || 0,
          views: productData.views || 0,
          sold: productData.sold || 0,
          returnPolicy: productData.returnPolicy || "7 days return policy",
          shippingInfo:
            productData.shippingInfo || "Free shipping on orders above ৳5000",
          minOrder: productData.minOrder || 1,
          maxOrder: productData.maxOrder || productData.stockQuantity || 99,
          features: productData.features || [],
          specifications: productData.specifications || {},
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt,
        };

        console.log("Final processed product:", {
          imageUrl: processedProduct.imageUrl,
          additionalImages: processedProduct.additionalImages,
          sku: processedProduct.sku, // UPDATED: Now showing sku
          API_URL,
        });

        setProduct(processedProduct);

        if (processedProduct.sizes.length > 0) {
          setSelectedSize(processedProduct.sizes[0].size);
        }

        fetchRelatedProducts(processedProduct.category);
        fetchReviews(processedProduct._id);
      } catch (err: any) {
        console.error("Error loading product:", err);
        setError(
          err.response?.data?.message || err.message || "Product not found",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const fetchRelatedProducts = async (category: string) => {
    try {
      setLoadingRelated(true);
      const response = await axios.get(
        `${API_URL}/api/products?category=${category}&limit=4`,
      );

      let productData: Product[] = [];

      if (Array.isArray(response.data)) {
        productData = response.data;
      } else if (response.data && response.data.data) {
        productData = response.data.data;
      }

      const filteredProducts = productData.filter(
        (p: Product) => p._id !== product?._id,
      );

      setRelatedProducts(filteredProducts.slice(0, 4));
    } catch (error) {
      console.error("Error fetching related products:", error);
    } finally {
      setLoadingRelated(false);
    }
  };

  const fetchReviews = async (productId: string) => {
    try {
      const savedReviews = localStorage.getItem(`reviews_${productId}`);

      if (savedReviews) {
        const initialReviews = JSON.parse(savedReviews);
        setReviews(initialReviews);
        calculateReviewStats(initialReviews);
      } else {
        setReviews([]);
        calculateReviewStats([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
      calculateReviewStats([]);
    }
  };

  const calculateReviewStats = (reviewList: Review[]) => {
    const total = reviewList.length;
    const average =
      reviewList.reduce((acc, rev) => acc + rev.rating, 0) / total || 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviewList.forEach((rev) => {
      distribution[rev.rating as keyof typeof distribution]++;
    });

    setReviewStats({
      total,
      average: parseFloat(average.toFixed(1)),
      distribution,
    });
  };

  const saveReviewsToStorage = (reviewList: Review[]) => {
    localStorage.setItem(`reviews_${product._id}`, JSON.stringify(reviewList));
  };

  // Handle button actions
  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;

    setActiveAction("cart");
    setAddingToCart(true);

    try {
      const cartItem = {
        id: product._id,
        title: product.title,
        price: product.offerPrice || product.normalPrice,
        image: product.imageUrl,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
        category: product.category,
        normalPrice: product.normalPrice,
        originalPrice: product.originalPrice,
        offerPrice: product.offerPrice,
        stock: product.stock,
        selectedSize,
        selectedColor,
        variant: `${selectedColor}${selectedSize ? ` - ${selectedSize}` : ""}`,
      };

      await addToCart(cartItem);

      setActionMessage({
        type: "cart",
        message: "Added to Cart!",
        icon: <Check className="w-6 h-6" />,
      });

      setTimeout(() => {
        setActionMessage(null);
        setActiveAction("buy");
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setActionMessage({
        type: "cart",
        message: "Failed to add to cart",
        icon: <X className="w-6 h-6" />,
      });
      setTimeout(() => setActionMessage(null), 2000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    setActiveAction("love");

    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        setActionMessage({
          type: "love",
          message: "Removed from Wishlist",
          icon: <Heart className="w-6 h-6" />,
        });
      } else {
        const wishlistItem = {
          id: product._id,
          title: product.title,
          price: product.offerPrice || product.normalPrice,
          imageUrl: product.imageUrl,
          category: product.category,
          normalPrice: product.normalPrice,
          originalPrice: product.originalPrice,
          offerPrice: product.offerPrice,
          rating: product.rating,
          stock: product.stock,
          hasOffer: product.hasOffer,
        };
        await addToWishlist(wishlistItem);
        setActionMessage({
          type: "love",
          message: "Added to Wishlist!",
          icon: <Heart className="w-6 h-6 fill-current" />,
        });
      }

      setTimeout(() => {
        setActionMessage(null);
        setActiveAction("buy");
      }, 1000);
    } catch (error) {
      console.error("Error updating wishlist:", error);
      setActionMessage({
        type: "love",
        message: "Failed to update wishlist",
        icon: <X className="w-6 h-6" />,
      });
      setTimeout(() => setActionMessage(null), 2000);
    }
  };

  const handleBuyNow = async () => {
    if (!product || product.stock <= 0) return;

    setActiveAction("buy");
    setAddingToCart(true);
    setIsRedirecting(true);

    try {
      const cartItem = {
        id: product._id,
        title: product.title,
        price: product.offerPrice || product.normalPrice,
        image: product.imageUrl,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor,
        category: product.category,
        normalPrice: product.normalPrice,
        originalPrice: product.originalPrice,
        offerPrice: product.offerPrice,
        stock: product.stock,
        selectedSize,
        selectedColor,
        variant: `${selectedColor}${selectedSize ? ` - ${selectedSize}` : ""}`,
      };

      await addToCart(cartItem);

      setActionMessage({
        type: "buy",
        message: "Continue to Payment",
        icon: <Check className="w-6 h-6" />,
      });

      setTimeout(() => {
        router.push("/cart");
      }, 1000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setActionMessage({
        type: "buy",
        message: "Failed to add to cart",
        icon: <X className="w-6 h-6" />,
      });
      setTimeout(() => {
        setActionMessage(null);
        setIsRedirecting(false);
      }, 2000);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;

    const newQuantity = Math.max(
      product.minOrder || 1,
      Math.min(product.maxOrder || product.stock || 99, quantity + delta),
    );
    setQuantity(newQuantity);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!showZoom || !product) return;

    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  // Handle new review submission
  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      alert("Please write a review comment");
      return;
    }

    if (!newReview.name.trim()) {
      alert("Please enter your name");
      return;
    }

    setSubmittingReview(true);

    try {
      const newReviewObj: Review = {
        _id: `review_${Date.now()}`,
        userId: currentUserId,
        user: {
          name: newReview.name,
          avatar: `https://i.pravatar.cc/150?u=${currentUserId}`,
        },
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        helpful: 0,
        notHelpful: 0,
        verified: false,
        createdAt: new Date().toISOString(),
      };

      const updatedReviews = [...reviews, newReviewObj];
      setReviews(updatedReviews);
      saveReviewsToStorage(updatedReviews);
      calculateReviewStats(updatedReviews);

      setNewReview({
        rating: 5,
        comment: "",
        name: "",
      });
      setShowReviewForm(false);

      alert("Thank you for your review! It has been submitted successfully.");

      if (reviewsEndRef.current) {
        reviewsEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle review edit
  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setNewReview({
      rating: review.rating,
      comment: review.comment,
      name: review.user.name,
    });
    setShowReviewForm(true);
  };

  // Handle review update
  const handleUpdateReview = async () => {
    if (!editingReview || !newReview.comment.trim()) {
      alert("Please write a review comment");
      return;
    }

    if (!newReview.name.trim()) {
      alert("Please enter your name");
      return;
    }

    setSubmittingReview(true);

    try {
      const updatedReview: Review = {
        ...editingReview,
        user: {
          ...editingReview.user,
          name: newReview.name,
        },
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        createdAt: new Date().toISOString(),
      };

      const updatedReviews = reviews.map((review) =>
        review._id === editingReview._id ? updatedReview : review,
      );

      setReviews(updatedReviews);
      saveReviewsToStorage(updatedReviews);
      calculateReviewStats(updatedReviews);

      setEditingReview(null);
      setNewReview({
        rating: 5,
        comment: "",
        name: "",
      });
      setShowReviewForm(false);

      alert("Your review has been updated successfully!");
    } catch (error) {
      console.error("Error updating review:", error);
      alert("Failed to update review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle review deletion
  const handleDeleteReview = (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    const updatedReviews = reviews.filter((review) => review._id !== reviewId);
    setReviews(updatedReviews);
    saveReviewsToStorage(updatedReviews);
    calculateReviewStats(updatedReviews);

    alert("Review deleted successfully!");
  };

  // Handle review helpful click
  const handleHelpfulClick = (
    reviewId: string,
    type: "helpful" | "notHelpful",
  ) => {
    const updatedReviews = reviews.map((review) =>
      review._id === reviewId
        ? {
            ...review,
            [type]: review[type] + 1,
          }
        : review,
    );

    setReviews(updatedReviews);
    saveReviewsToStorage(updatedReviews);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingReview(null);
    setNewReview({
      rating: 5,
      comment: "",
      name: "",
    });
    setShowReviewForm(false);
  };

  // Check if review belongs to current user
  const isCurrentUserReview = (review: Review) => {
    return review.userId === currentUserId;
  };

  // Calculate prices and discounts
  const calculatePriceData = () => {
    if (!product)
      return {
        currentPrice: 0,
        originalPrice: 0,
        discountPercentage: 0,
        discountAmount: 0,
        hasOffer: false,
      };

    let currentPrice = product.normalPrice;
    let originalPrice = product.originalPrice || product.normalPrice;
    let hasOffer = false;

    if (product.salePrice && product.salePrice < product.normalPrice) {
      currentPrice = product.salePrice;
      originalPrice = product.normalPrice;
      hasOffer = true;
    } else if (product.offerPrice && product.offerPrice < product.normalPrice) {
      currentPrice = product.offerPrice;
      originalPrice = product.normalPrice;
      hasOffer = true;
    }

    const discountPercentage =
      hasOffer && originalPrice > 0
        ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
        : 0;

    const discountAmount = hasOffer ? originalPrice - currentPrice : 0;

    return {
      currentPrice,
      originalPrice,
      discountPercentage,
      discountAmount,
      hasOffer,
    };
  };

  const { currentPrice, originalPrice, discountPercentage, discountAmount } =
    calculatePriceData();

  const isWishlisted = product ? isInWishlist(product._id) : false;
  const allImages = product
    ? [product.imageUrl, ...product.additionalImages].filter(Boolean)
    : [];
  const isLowStock = product?.stock && product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product?.stock === 0;

  const selectedSizeObj = product?.sizes?.find(
    (s: any) => s.size === selectedSize,
  );
  const sizeStock = selectedSizeObj?.stock || product?.stock || 0;

  // Mobile navigation handler
  const scrollToTab = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Product Description
            </h3>
            <div className="space-y-4 text-slate-700">
              <p>{product?.description}</p>

              {/* Features */}
              {product?.features && product.features.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-slate-900 mb-4">
                    Key Features
                  </h4>
                  <ul className="space-y-3">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product?.specifications &&
                Object.keys(product.specifications).length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-xl font-bold text-slate-900 mb-4">
                      Specifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(
                        ([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between py-2 border-b border-slate-200"
                          >
                            <span className="text-slate-600 capitalize">
                              {key}
                            </span>
                            <span className="font-medium text-slate-900">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        );

      case "shipping":
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Shipping & Returns
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
                    <TruckIcon size={24} className="text-white" />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">
                    Shipping Policy
                  </h5>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>Free shipping on orders above ৳5000</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>Standard delivery: 3-5 business days</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>Express delivery available</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>Cash on Delivery available</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    <Package size={24} className="text-white" />
                  </div>
                  <h5 className="font-bold text-slate-900 mb-2">
                    Return Policy
                  </h5>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>7 days hassle-free return policy</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>Free returns for defective items</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>Items must be in original condition</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} className="text-emerald-600" />
                      <span>Refund processed within 7 business days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "reviews":
        return (
          <div className="space-y-8">
            {/* Reviews Header with Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Customer Reviews
                </h3>

                {/* Overall Rating */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-slate-900 mb-1">
                      {reviewStats.average.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          size={20}
                          className={`${
                            i < Math.floor(reviewStats.average)
                              ? "text-amber-500 fill-amber-500"
                              : i < reviewStats.average
                                ? "text-amber-500 fill-amber-500"
                                : "text-slate-300"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-slate-600 mt-2">
                      {reviewStats.total} reviews
                    </div>
                  </div>

                  {/* Rating Distribution */}
                  <div className="flex-1 space-y-2 min-w-0">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count =
                        reviewStats.distribution[
                          rating as keyof typeof reviewStats.distribution
                        ];
                      const percentage =
                        reviewStats.total > 0
                          ? (count / reviewStats.total) * 100
                          : 0;

                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm text-slate-600">
                              {rating}
                            </span>
                            <StarIcon size={16} className="text-amber-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm text-slate-600 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Add/Edit Review Button */}
              <button
                onClick={() => {
                  if (editingReview) {
                    handleCancelEdit();
                  } else {
                    setShowReviewForm(!showReviewForm);
                  }
                }}
                className={`px-4 sm:px-6 py-3 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 w-full md:w-auto ${
                  editingReview
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
                }`}
              >
                {editingReview ? (
                  <>
                    <XCircle size={20} />
                    <span className="hidden sm:inline">Cancel Edit</span>
                    <span className="sm:hidden">Cancel</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={20} />
                    {showReviewForm ? (
                      <>
                        <span className="hidden sm:inline">Cancel</span>
                        <span className="sm:hidden">Cancel</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Write a Review</span>
                        <span className="sm:hidden">Review</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>

            {/* Add/Edit Review Form */}
            {(showReviewForm || editingReview) && (
              <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-6">
                <h4 className="text-xl font-bold text-slate-900">
                  {editingReview ? "Edit Your Review" : "Write Your Review"}
                </h4>

                {/* Rating Selection */}
                <div>
                  <label className="block text-slate-700 mb-3">
                    Your Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating })}
                        className="focus:outline-none transform hover:scale-110 transition-transform"
                      >
                        <StarIcon
                          size={isMobile ? 28 : 32}
                          className={`${
                            rating <= newReview.rating
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-slate-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) =>
                      setNewReview({ ...newReview, name: e.target.value })
                    }
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-slate-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) =>
                      setNewReview({ ...newReview, comment: e.target.value })
                    }
                    placeholder="Share your experience with this product..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Please provide detailed feedback about your experience with
                    this product.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      editingReview ? handleUpdateReview : handleSubmitReview
                    }
                    disabled={
                      submittingReview ||
                      !newReview.comment.trim() ||
                      !newReview.name.trim()
                    }
                    className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
                      submittingReview ||
                      !newReview.comment.trim() ||
                      !newReview.name.trim()
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-xl"
                    }`}
                  >
                    {submittingReview ? (
                      <>
                        <RefreshCw size={20} className="animate-spin" />
                        {editingReview ? "Updating..." : "Submitting..."}
                      </>
                    ) : (
                      <>
                        {editingReview ? (
                          <Save size={20} />
                        ) : (
                          <Send size={20} />
                        )}
                        {editingReview ? "Update Review" : "Submit Review"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => {
                  const isExpanded = expandedReviews.has(review._id);
                  const shouldTruncate = review.comment.length > 200;
                  const isUserReview = isCurrentUserReview(review);

                  return (
                    <div
                      key={review._id}
                      className="bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6 relative"
                    >
                      {/* User Actions (Edit/Delete) */}
                      {isUserReview && (
                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit review"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                            <img
                              src={
                                review.user.avatar ||
                                `https://i.pravatar.cc/150?u=${review.userId}`
                              }
                              alt={review.user.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 flex items-center gap-2 truncate">
                              {review.user.name}
                              {isUserReview && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
                                  You
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-slate-600 mt-1">
                              <div className="flex items-center gap-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                      key={i}
                                      size={14}
                                      className={
                                        i < review.rating
                                          ? "text-amber-500 fill-amber-500"
                                          : "text-slate-300"
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="ml-1">{review.rating}.0</span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>{review.date}</span>
                              </div>

                              {review.verified && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full w-fit">
                                  <Check size={10} />
                                  <span>Verified Purchase</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p
                          className={`text-slate-700 leading-relaxed ${
                            !isExpanded && shouldTruncate ? "line-clamp-3" : ""
                          }`}
                        >
                          {review.comment}
                        </p>

                        {shouldTruncate && (
                          <button
                            onClick={() => toggleReviewExpansion(review._id)}
                            className="text-amber-600 hover:text-amber-700 font-medium text-sm mt-2 flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                Show Less <ChevronUp size={16} />
                              </>
                            ) : (
                              <>
                                Read More <ChevronDown size={16} />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Review Images */}
                      {review.images?.length > 0 && (
                        <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                          {review.images.map((img, idx) => (
                            <div
                              key={idx}
                              className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 cursor-pointer flex-shrink-0"
                              onClick={() => window.open(img, "_blank")}
                            >
                              <img
                                src={img}
                                alt={`Review image ${idx + 1}`}
                                className="w-full h-full object-cover hover:scale-110 transition-transform"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Helpful Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-3">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              handleHelpfulClick(review._id, "helpful")
                            }
                            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
                          >
                            <ThumbsUp size={16} />
                            <span>Helpful ({review.helpful})</span>
                          </button>

                          <button
                            onClick={() =>
                              handleHelpfulClick(review._id, "notHelpful")
                            }
                            className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
                          >
                            <ThumbsDown size={16} />
                            <span>Not Helpful ({review.notHelpful})</span>
                          </button>
                        </div>

                        {isUserReview && (
                          <div className="text-xs text-slate-500">
                            Your review
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200">
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-slate-900 mb-2">
                    No Reviews Yet
                  </h4>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto px-4">
                    Be the first to share your thoughts about this product!
                  </p>
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
                  >
                    <MessageSquare size={20} />
                    Write the First Review
                  </button>
                </div>
              )}
            </div>

            {/* Reference for scrolling */}
            <div ref={reviewsEndRef} />
          </div>
        );

      case "related":
        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-slate-900">
                Related Products
              </h3>
              <Link
                href={`/products?category=${product?.category}`}
                className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
              >
                View All
                <ChevronRightIcon size={16} />
              </Link>
            </div>

            {loadingRelated ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent" />
              </div>
            ) : relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct._id}
                    product={relatedProduct}
                    viewMode="grid"
                    showQuickView={false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No related products found</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            <Package className="absolute inset-0 m-auto h-8 w-8 text-amber-600" />
          </div>
          <p className="text-slate-600 font-medium">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <Package className="w-20 h-20 text-slate-400 mx-auto mb-4" />
            <div className="absolute -top-2 -right-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                <Hash className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-slate-900">
            Product Not Found
          </h1>
          <p className="text-slate-600 mb-6">
            The product with ID{" "}
            <code className="bg-slate-100 px-2 py-1 rounded-lg font-mono break-all">
              {id}
            </code>{" "}
            was not found.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/all-collections"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all"
            >
              <ArrowLeft size={18} />
              Browse Products
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Action Success Message Popup - Responsive */}
      {actionMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="animate-in fade-in zoom-in duration-300 w-full max-w-sm">
            <div
              className={`px-6 py-5 sm:px-8 sm:py-6 rounded-2xl shadow-2xl${
                actionMessage.type === "cart"
                  ? "bg-gradient-to-r from-emerald-700 to-emerald-500"
                  : actionMessage.type === "love"
                    ? "bg-gradient-to-r from-rose-500 to-rose-600"
                    : "bg-gradient-to-r from-amber-500 to-amber-600"
              } text-white`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  {actionMessage.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold truncate">
                    {actionMessage.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Viewer Modal - Responsive */}
      {zoomViewer && (
        <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-2 sm:p-4">
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setZoomViewer(false)}
              className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-amber-400 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
              <img
                src={allImages[currentImage]}
                alt={product.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error(
                    "Failed to load zoom image:",
                    allImages[currentImage],
                  );
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
                }}
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 overflow-x-auto pb-2">
                {allImages.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      currentImage === index
                        ? "border-amber-500"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("Failed to load thumbnail in zoom:", img);
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/all-collections"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} />
            <span className="truncate">Back to Products</span>
          </Link>
        </div>

        {/* Main Product Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          {/* Left Column: Images with Zoom */}
          <div className="space-y-4 sm:space-y-6">
            {/* Main Image with Zoom */}
            <div
              className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 cursor-crosshair"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setZoomViewer(true)}
            >
              <img
                src={allImages[currentImage]}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  console.error(
                    "Failed to load main image:",
                    allImages[currentImage],
                  );
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
                }}
              />

              {/* Zoom Lens - Only on desktop */}
              {!isMobile && showZoom && (
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute w-full h-full bg-no-repeat"
                    style={{
                      backgroundImage: `url(${allImages[currentImage]})`,
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      backgroundSize: "200%",
                      transform: "scale(1.5)",
                    }}
                  />
                </div>
              )}

              {/* Share Button */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                <button
                  onClick={handleShare}
                  className="p-2 sm:p-3 bg-white/95 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  title="Share this product"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                </button>
              </div>

              {/* Product Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex flex-col gap-2">
                {product.hasOffer && discountPercentage > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full blur-sm"></div>
                    <div className="relative px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Percent size={12} className="sm:w-4 sm:h-4" />
                        {discountPercentage}% OFF
                      </div>
                    </div>
                  </div>
                )}

                {product.isNew && (
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Sparkles size={12} className="sm:w-4 sm:h-4" />
                      NEW
                    </div>
                  </div>
                )}

                {product.isBestSelling && (
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <TrendingUp size={12} className="sm:w-4 sm:h-4" />
                      BEST
                    </div>
                  </div>
                )}

                {product.featured && (
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Sparkles size={12} className="sm:w-4 sm:h-4" />
                      FEATURED
                    </div>
                  </div>
                )}
              </div>

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10">
                  <div className="px-2 py-1.5 sm:px-3 sm:py-2 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
                    {currentImage + 1} / {allImages.length}
                  </div>
                </div>
              )}

              {/* Stock Status */}
              {isOutOfStock && (
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10">
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Package size={12} className="sm:w-4 sm:h-4" />
                      <span>Out of Stock</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Image Thumbnails - Responsive */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                {allImages
                  .slice(0, isMobile ? 4 : 5)
                  .map((img: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                        currentImage === index
                          ? "border-amber-500 shadow-lg shadow-amber-500/25 scale-105"
                          : "border-slate-200 hover:border-amber-300 hover:scale-105"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Failed to load thumbnail:", img);
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop";
                        }}
                      />
                      {currentImage === index && (
                        <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                          <div className="w-4 h-4 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="space-y-6 sm:space-y-8">
            {/* Title and Actions */}
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 break-words">
                  {product.title}
                </h1>

                {/* UPDATED: Product Code Display - Now showing sku as custom product code */}
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-slate-500 mb-4">
                  {/* Custom Product Code from admin (sku field) */}
                  {product.sku && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 rounded-lg border border-amber-200">
                      <Key size={14} className="text-amber-600" />
                      <span className="font-mono font-bold text-amber-700 truncate">
                        Code: {product.sku}
                      </span>
                    </div>
                  )}

                  {/* Views */}
                  {product.views > 0 && (
                    <div className="flex items-center gap-2">
                      <Eye size={14} />
                      <span>{product.views.toLocaleString()} views</span>
                    </div>
                  )}

                  {/* Sold Count */}
                  {product.sold > 0 && (
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={14} />
                      <span>{product.sold.toLocaleString()} sold</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 hover:border-blue-200 hover:scale-105 hover:shadow-lg transition-all duration-300"
                  title="Share"
                >
                  <Share2 size={isMobile ? 18 : 20} />
                </button>
              </div>
            </div>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex flex-col xs:flex-row xs:items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-amber-200 w-fit">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={isMobile ? 14 : 16}
                        className={`${
                          i < Math.floor(product.rating)
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-slate-600">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Price Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  ৳{currentPrice.toLocaleString()}
                </span>

                {product.hasOffer && discountPercentage > 0 && (
                  <>
                    <span className="text-xl sm:text-2xl text-slate-400 line-through">
                      ৳{originalPrice.toLocaleString()}
                    </span>
                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full text-sm sm:text-base">
                      Save {discountPercentage}%
                    </div>
                  </>
                )}
              </div>

              {/* Price Summary */}
              {product.hasOffer && currentPrice < originalPrice && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-slate-600">
                        You Save
                      </p>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1">
                        <span className="text-base sm:text-lg font-bold text-slate-800">
                          ৳{discountAmount.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          {discountPercentage}% OFF
                        </span>
                      </div>
                    </div>
                    <BadgePercent
                      className="text-green-500"
                      size={isMobile ? 20 : 24}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="text-slate-600 leading-relaxed text-sm sm:text-base">
                {product.description}
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                    <Ruler size={isMobile ? 16 : 18} />
                    Select Size
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: ProductSize, index: number) => {
                    const isAvailable = size.stock > 0;
                    const isSelected = selectedSize === size.size;

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(size.size)}
                        disabled={!isAvailable}
                        className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
                          isSelected
                            ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 scale-105"
                            : isAvailable
                              ? "bg-gradient-to-b from-slate-50 to-white border border-slate-300 text-slate-700 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700"
                              : "bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed opacity-50"
                        }`}
                      >
                        {size.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-2 sm:space-y-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Quantity
              </h3>

              <div
                className="flex items-center w-fit
    bg-gradient-to-b from-slate-50 to-white
    rounded-xl sm:rounded-2xl border border-slate-300 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= (product.minOrder || 1)}
                  className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
        text-2xl sm:text-3xl font-bold text-slate-700
        hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200
        active:scale-95
        disabled:opacity-30 disabled:cursor-not-allowed
        transition-all duration-300"
                >
                  −
                </button>

                <div className="w-16 h-12 sm:w-20 sm:h-16 flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {quantity}
                  </span>
                </div>

                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.maxOrder || sizeStock || 99)}
                  className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
        text-2xl sm:text-3xl font-bold text-slate-700
        hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200
        active:scale-95
        disabled:opacity-30 disabled:cursor-not-allowed
        transition-all duration-300"
                >
                  +
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-500">
                Min: {product.minOrder || 1} | Max:{" "}
                {product.maxOrder || sizeStock || 99}
              </p>
            </div>

            {/* Action Buttons - Responsive Stack */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                onMouseEnter={() => setActiveAction("cart")}
                onMouseLeave={() => setActiveAction("buy")}
                disabled={product.stock <= 0 || addingToCart}
                className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
      transition-all duration-300 active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        activeAction === "cart"
          ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg"
          : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
      }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {addingToCart && activeAction === "cart" ? (
                    <RefreshCw
                      size={isMobile ? 18 : 20}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <ShoppingCart
                        size={isMobile ? 18 : 20}
                        className={
                          activeAction === "cart"
                            ? "text-white"
                            : "text-slate-700"
                        }
                      />
                      <span
                        className={
                          activeAction === "cart"
                            ? "text-white"
                            : "text-slate-800"
                        }
                      >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      </span>
                    </>
                  )}
                </div>
              </button>

              {/* Love This Button (Wishlist) */}
              <button
                onClick={handleWishlistToggle}
                onMouseEnter={() => setActiveAction("love")}
                onMouseLeave={() => setActiveAction("buy")}
                className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
      transition-all duration-300 active:scale-[0.98]
      ${
        activeAction === "love"
          ? isWishlisted
            ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg"
            : "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg"
          : isWishlisted
            ? "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-50"
            : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
      }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart
                    size={isMobile ? 18 : 20}
                    className={
                      activeAction === "love"
                        ? isWishlisted
                          ? "fill-white"
                          : "text-white"
                        : isWishlisted
                          ? "fill-rose-600 text-rose-600"
                          : "text-slate-700"
                    }
                  />
                  <span
                    className={
                      activeAction === "love"
                        ? "text-white"
                        : isWishlisted
                          ? "text-rose-700"
                          : "text-slate-800"
                    }
                  >
                    {isWishlisted ? "Liked" : "Like"}
                  </span>
                </div>
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                onMouseEnter={() => setActiveAction("buy")}
                disabled={product.stock <= 0 || isRedirecting}
                className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
      transition-all duration-300 active:scale-[0.98]
      disabled:opacity-50 disabled:cursor-not-allowed
      ${
        activeAction === "buy"
          ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg"
          : "bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:shadow-xl"
      }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isRedirecting ? (
                    <RefreshCw
                      size={isMobile ? 18 : 20}
                      className="animate-spin"
                    />
                  ) : (
                    <>
                      <Zap size={isMobile ? 18 : 20} />
                      <span>Buy Now</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Product Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-4 sm:pt-6 border-t border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Tag size={isMobile ? 14 : 16} />
                  Product Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-b from-slate-50 to-white text-slate-700 rounded-lg text-xs sm:text-sm font-medium border border-slate-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Badges - Responsive Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-b from-slate-50 to-white rounded-lg sm:rounded-xl border border-slate-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck size={isMobile ? 16 : 20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    Free Delivery
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {product.shippingInfo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-b from-slate-50 to-white rounded-lg sm:rounded-xl border border-slate-200">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <RotateCcw size={isMobile ? 16 : 20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    Easy Returns
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {product.returnPolicy}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 py-2 px-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => scrollToTab("description")}
                className={`flex flex-col items-center gap-1 p-2 ${
                  activeTab === "description"
                    ? "text-amber-600"
                    : "text-slate-600"
                }`}
              >
                <List size={20} />
                <span className="text-xs">Details</span>
              </button>
              <button
                onClick={() => scrollToTab("shipping")}
                className={`flex flex-col items-center gap-1 p-2 ${
                  activeTab === "shipping" ? "text-amber-600" : "text-slate-600"
                }`}
              >
                <Truck size={20} />
                <span className="text-xs">Shipping</span>
              </button>
              <button
                onClick={() => scrollToTab("reviews")}
                className={`flex flex-col items-center gap-1 p-2 ${
                  activeTab === "reviews" ? "text-amber-600" : "text-slate-600"
                }`}
              >
                <MessageSquare size={20} />
                <span className="text-xs">Reviews</span>
              </button>
              <button
                onClick={() => scrollToTab("related")}
                className={`flex flex-col items-center gap-1 p-2 ${
                  activeTab === "related" ? "text-amber-600" : "text-slate-600"
                }`}
              >
                <Grid size={20} />
                <span className="text-xs">Related</span>
              </button>
            </div>
          </div>
        )}

        {/* Product Details Tabs - Desktop Only */}
        {!isMobile && (
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-wrap border-b border-slate-200 mb-6 sm:mb-8 overflow-x-auto">
              {[
                { id: "description", label: "Description", icon: null },
                {
                  id: "shipping",
                  label: "Shipping & Returns",
                  icon: <Truck size={16} />,
                },
                {
                  id: "reviews",
                  label: `Reviews (${reviewStats.total})`,
                  icon: <MessageSquare size={16} />,
                },
                {
                  id: "related",
                  label: "Related Products",
                  icon: <Package size={16} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-amber-600 border-b-2 border-amber-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-slate-50 rounded-xl sm:rounded-2xl border border-slate-200">
              {renderTabContent()}
            </div>
          </div>
        )}

        {/* Mobile Tab Content - Separate Sections */}
        {isMobile && (
          <div className="space-y-8 mb-20">
            <section id="description" className="scroll-mt-4">
              <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
                {renderTabContent()}
              </div>
            </section>

            <section id="shipping" className="scroll-mt-4">
              <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
                {activeTab === "shipping" && renderTabContent()}
              </div>
            </section>

            <section id="reviews" className="scroll-mt-4">
              <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
                {activeTab === "reviews" && renderTabContent()}
              </div>
            </section>

            <section id="related" className="scroll-mt-4">
              <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
                {activeTab === "related" && renderTabContent()}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// // client/src/app/product/[id]/page.tsx

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   ShoppingCart,
//   Heart,
//   Truck,
//   Package,
//   Star,
//   Check,
//   ZoomIn,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Palette,
//   Ruler,
//   Shield,
//   RefreshCw,
//   Share2,
//   Eye,
//   Hash,
//   Tag,
//   Sparkles,
//   Zap,
//   Image as ImageIcon,
//   MessageSquare,
//   ThumbsUp,
//   ThumbsDown,
//   Calendar,
//   User,
//   Clock,
//   Truck as TruckIcon,
//   RotateCcw,
//   Award,
//   ChevronDown,
//   ChevronUp,
//   Percent,
//   BadgePercent,
//   TrendingUp,
//   Send,
//   Star as StarIcon,
//   Edit,
//   Trash2,
//   Save,
//   XCircle,
//   ChevronRight as ChevronRightIcon,
//   Menu,
//   Grid,
//   List,
// } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { useWishlist } from "@/context/WishlistContext";
// import axios from "axios";
// import ProductCard, { Product } from "@/components/ProductCard";

// // Fixed Environment configuration
// const API_URL = process.env.NEXT_PUBLIC_API_URL ||
//   (process.env.NODE_ENV === 'development'
//     ? 'http://localhost:4000'
//     : 'https://puti-client-production.onrender.com');

// // FIXED: Proper image URL handling
// const getImageUrl = (imagePath: string | undefined): string => {
//   if (!imagePath || imagePath.trim() === "") {
//     return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
//   }

//   // If it's already a full URL (http, https, data, blob), return as is
//   if (imagePath.startsWith("http") || imagePath.startsWith("data:") || imagePath.startsWith("blob:")) {
//     return imagePath;
//   }

//   // If it contains "undefined", return fallback
//   if (imagePath.includes('undefined')) {
//     console.warn('Found "undefined" in image path:', imagePath);
//     return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
//   }

//   // Clean the path - remove any leading slash
//   let cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

//   // Remove any duplicate uploads/ prefix
//   cleanPath = cleanPath.replace(/^uploads\//, '');

//   // Log for debugging
//   console.log('Image path processing:', { original: imagePath, cleaned: cleanPath, API_URL });

//   // Construct the full URL
//   return `${API_URL}/uploads/${cleanPath}`;
// };

// // Review type definition
// interface Review {
//   _id: string;
//   userId: string;
//   user: {
//     name: string;
//     avatar?: string;
//   };
//   rating: number;
//   comment: string;
//   date: string;
//   helpful: number;
//   notHelpful: number;
//   verified: boolean;
//   images?: string[];
//   createdAt: string;
// }

// // Size type definition
// interface ProductSize {
//   size: string;
//   stock: number;
//   price?: number;
// }

// export default function ProductDetailPage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedSize, setSelectedSize] = useState<string>("");
//   const [selectedColor, setSelectedColor] = useState<string>("");
//   const [currentImage, setCurrentImage] = useState(0);
//   const [zoomViewer, setZoomViewer] = useState(false);
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
//   const [showZoom, setShowZoom] = useState(false);
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [activeTab, setActiveTab] = useState("description");
//   const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
//   const [loadingRelated, setLoadingRelated] = useState(false);
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [reviewStats, setReviewStats] = useState({
//     total: 0,
//     average: 0,
//     distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
//   });
//   const [expandedReviews, setExpandedReviews] = useState<Set<string>>(
//     new Set()
//   );
//   const [isMobile, setIsMobile] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);

//   // New review form state
//   const [newReview, setNewReview] = useState({
//     rating: 5,
//     comment: "",
//     name: "",
//   });
//   const [editingReview, setEditingReview] = useState<Review | null>(null);
//   const [submittingReview, setSubmittingReview] = useState(false);
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string>("");
//   const reviewsEndRef = useRef<HTMLDivElement>(null);

//   // Action button states
//   type ActionType = "cart" | "love" | "buy";
//   const [activeAction, setActiveAction] = useState<ActionType>("buy");
//   const [actionMessage, setActionMessage] = useState<{
//     type: ActionType;
//     message: string;
//     icon: React.ReactNode;
//   } | null>(null);
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   const { addToCart } = useCart();
//   const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

//   // Check if mobile on mount and resize
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Initialize current user ID
//   useEffect(() => {
//     const userId =
//       localStorage.getItem("currentUserId") || `user_${Date.now()}`;
//     if (!localStorage.getItem("currentUserId")) {
//       localStorage.setItem("currentUserId", userId);
//     }
//     setCurrentUserId(userId);
//   }, []);

//   useEffect(() => {
//     if (!id) {
//       setError("No product ID provided");
//       setLoading(false);
//       return;
//     }

//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         console.log('Fetching product from:', `${API_URL}/api/products/${id}`);

//         const response = await axios.get(`${API_URL}/api/products/${id}`);

//         console.log('Product API response:', response.data);

//         let productData = null;

//         if (response.data && response.data.data) {
//           productData = response.data.data;
//         } else if (response.data) {
//           productData = response.data;
//         }

//         if (!productData) {
//           throw new Error("Product not found");
//         }

//         const parseSizes = () => {
//           if (productData.variants && Array.isArray(productData.variants)) {
//             return productData.variants.map((v: any) => ({
//               size: v.size || "M",
//               stock: v.stockQuantity || v.stock || 0,
//             }));
//           }
//           else if (productData.sizes) {
//             try {
//               if (typeof productData.sizes === "string") {
//                 const parsed = JSON.parse(productData.sizes);
//                 if (Array.isArray(parsed)) {
//                   return parsed.map((s: any) => ({
//                     size: s.size || s.Size || "M",
//                     stock: s.stock || s.Stock || s.stockQuantity || 0,
//                   }));
//                 }
//               } else if (Array.isArray(productData.sizes)) {
//                 return productData.sizes.map((s: any) => ({
//                   size: s.size || s.Size || "M",
//                   stock: s.stock || s.Stock || s.stockQuantity || 0,
//                 }));
//               }
//             } catch (e) {
//               console.error("Error parsing sizes:", e);
//             }
//           }
//           return [
//             {
//               size: "M",
//               stock: productData.stockQuantity || productData.stock || 0,
//             },
//           ];
//         };

//         const sizes = parseSizes();

//         // FIXED: Proper image processing with debug logging
//         const mainImage = getImageUrl(productData.imageUrl);
//         console.log('Main image URL:', {
//           original: productData.imageUrl,
//           processed: mainImage
//         });

//         const additionalImages = Array.isArray(productData.additionalImages)
//           ? productData.additionalImages.map((img: string) => {
//               const processed = getImageUrl(img);
//               console.log('Additional image:', { original: img, processed });
//               return processed;
//             })
//           : [];

//         const processedProduct = {
//           _id: productData._id,
//           title: productData.title || "Product",
//           description: productData.description || "",
//           category: productData.category || "Uncategorized",
//           normalPrice: productData.normalPrice || 0,
//           offerPrice:
//             productData.salePrice ||
//             productData.offerPrice ||
//             productData.normalPrice ||
//             0,
//           originalPrice:
//             productData.originalPrice || productData.normalPrice || 0,
//           salePrice:
//             productData.salePrice ||
//             productData.offerPrice ||
//             productData.normalPrice ||
//             0,
//           discountPercentage:
//             productData.discountPercentage ||
//             (productData.normalPrice > 0 &&
//             productData.salePrice > 0 &&
//             productData.salePrice < productData.normalPrice
//               ? Math.round(
//                   ((productData.normalPrice - productData.salePrice) /
//                     productData.normalPrice) *
//                     100
//                 )
//               : 0),
//           stock: productData.stockQuantity || productData.stock || 0,
//           sizes: sizes,
//           // FIXED: Use the corrected getImageUrl function
//           imageUrl: mainImage,
//           additionalImages: additionalImages,
//           featured: productData.featured || false,
//           isBestSelling: productData.isBestSelling || false,
//           isNew: productData.isNew || productData.isNewProduct || false,
//           hasOffer:
//             (productData.salePrice &&
//               productData.salePrice < productData.normalPrice) ||
//             false,
//           tags: productData.tags || [],
//           status: productData.productStatus || productData.status || "active",
//           sku: productData.sku,
//           weight: productData.weight,
//           dimensions: productData.dimensions,
//           material: productData.material,
//           warranty: productData.warranty,
//           rating: productData.rating || 0,
//           reviewCount: productData.reviewCount || 0,
//           views: productData.views || 0,
//           sold: productData.sold || 0,
//           returnPolicy: productData.returnPolicy || "7 days return policy",
//           shippingInfo:
//             productData.shippingInfo || "Free shipping on orders above ৳5000",
//           minOrder: productData.minOrder || 1,
//           maxOrder: productData.maxOrder || productData.stockQuantity || 99,
//           features: productData.features || [],
//           specifications: productData.specifications || {},
//           createdAt: productData.createdAt,
//           updatedAt: productData.updatedAt,
//         };

//         console.log('Final processed product:', {
//           imageUrl: processedProduct.imageUrl,
//           additionalImages: processedProduct.additionalImages,
//           API_URL,
//         });

//         setProduct(processedProduct);

//         if (processedProduct.sizes.length > 0) {
//           setSelectedSize(processedProduct.sizes[0].size);
//         }

//         fetchRelatedProducts(processedProduct.category);
//         fetchReviews(processedProduct._id);
//       } catch (err: any) {
//         console.error("Error loading product:", err);
//         setError(
//           err.response?.data?.message || err.message || "Product not found"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   const fetchRelatedProducts = async (category: string) => {
//     try {
//       setLoadingRelated(true);
//       const response = await axios.get(
//         `${API_URL}/api/products?category=${category}&limit=4`
//       );

//       let productData: Product[] = [];

//       if (Array.isArray(response.data)) {
//         productData = response.data;
//       } else if (response.data && response.data.data) {
//         productData = response.data.data;
//       }

//       const filteredProducts = productData.filter(
//         (p: Product) => p._id !== product?._id
//       );

//       setRelatedProducts(filteredProducts.slice(0, 4));
//     } catch (error) {
//       console.error("Error fetching related products:", error);
//     } finally {
//       setLoadingRelated(false);
//     }
//   };

//   const fetchReviews = async (productId: string) => {
//     try {
//       const savedReviews = localStorage.getItem(`reviews_${productId}`);

//       if (savedReviews) {
//         const initialReviews = JSON.parse(savedReviews);
//         setReviews(initialReviews);
//         calculateReviewStats(initialReviews);
//       } else {
//         setReviews([]);
//         calculateReviewStats([]);
//       }
//     } catch (error) {
//       console.error("Error fetching reviews:", error);
//       setReviews([]);
//       calculateReviewStats([]);
//     }
//   };

//   const calculateReviewStats = (reviewList: Review[]) => {
//     const total = reviewList.length;
//     const average =
//       reviewList.reduce((acc, rev) => acc + rev.rating, 0) / total || 0;
//     const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

//     reviewList.forEach((rev) => {
//       distribution[rev.rating as keyof typeof distribution]++;
//     });

//     setReviewStats({
//       total,
//       average: parseFloat(average.toFixed(1)),
//       distribution,
//     });
//   };

//   const saveReviewsToStorage = (reviewList: Review[]) => {
//     localStorage.setItem(`reviews_${product._id}`, JSON.stringify(reviewList));
//   };

//   // Handle button actions
//   const handleAddToCart = async () => {
//     if (!product || product.stock <= 0) return;

//     setActiveAction("cart");
//     setAddingToCart(true);

//     try {
//       const cartItem = {
//         id: product._id,
//         title: product.title,
//         price: product.offerPrice || product.normalPrice,
//         image: product.imageUrl,
//         quantity: quantity,
//         size: selectedSize,
//         color: selectedColor,
//         category: product.category,
//         normalPrice: product.normalPrice,
//         originalPrice: product.originalPrice,
//         offerPrice: product.offerPrice,
//         stock: product.stock,
//         selectedSize,
//         selectedColor,
//         variant: `${selectedColor}${selectedSize ? ` - ${selectedSize}` : ""}`,
//       };

//       await addToCart(cartItem);

//       setActionMessage({
//         type: "cart",
//         message: "Added to Cart!",
//         icon: <Check className="w-6 h-6" />,
//       });

//       setTimeout(() => {
//         setActionMessage(null);
//         setActiveAction("buy");
//       }, 1000);
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       setActionMessage({
//         type: "cart",
//         message: "Failed to add to cart",
//         icon: <X className="w-6 h-6" />,
//       });
//       setTimeout(() => setActionMessage(null), 2000);
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleWishlistToggle = async () => {
//     if (!product) return;

//     setActiveAction("love");

//     try {
//       if (isInWishlist(product._id)) {
//         await removeFromWishlist(product._id);
//         setActionMessage({
//           type: "love",
//           message: "Removed from Wishlist",
//           icon: <Heart className="w-6 h-6" />,
//         });
//       } else {
//         const wishlistItem = {
//           id: product._id,
//           title: product.title,
//           price: product.offerPrice || product.normalPrice,
//           imageUrl: product.imageUrl,
//           category: product.category,
//           normalPrice: product.normalPrice,
//           originalPrice: product.originalPrice,
//           offerPrice: product.offerPrice,
//           rating: product.rating,
//           stock: product.stock,
//           hasOffer: product.hasOffer,
//         };
//         await addToWishlist(wishlistItem);
//         setActionMessage({
//           type: "love",
//           message: "Added to Wishlist!",
//           icon: <Heart className="w-6 h-6 fill-current" />,
//         });
//       }

//       setTimeout(() => {
//         setActionMessage(null);
//         setActiveAction("buy");
//       }, 1000);
//     } catch (error) {
//       console.error("Error updating wishlist:", error);
//       setActionMessage({
//         type: "love",
//         message: "Failed to update wishlist",
//         icon: <X className="w-6 h-6" />,
//       });
//       setTimeout(() => setActionMessage(null), 2000);
//     }
//   };

//   const handleBuyNow = async () => {
//     if (!product || product.stock <= 0) return;

//     setActiveAction("buy");
//     setAddingToCart(true);
//     setIsRedirecting(true);

//     try {
//       const cartItem = {
//         id: product._id,
//         title: product.title,
//         price: product.offerPrice || product.normalPrice,
//         image: product.imageUrl,
//         quantity: quantity,
//         size: selectedSize,
//         color: selectedColor,
//         category: product.category,
//         normalPrice: product.normalPrice,
//         originalPrice: product.originalPrice,
//         offerPrice: product.offerPrice,
//         stock: product.stock,
//         selectedSize,
//         selectedColor,
//         variant: `${selectedColor}${selectedSize ? ` - ${selectedSize}` : ""}`,
//       };

//       await addToCart(cartItem);

//       setActionMessage({
//         type: "buy",
//         message: "Continue to Payment",
//         icon: <Check className="w-6 h-6" />,
//       });

//       setTimeout(() => {
//         router.push("/cart");
//       }, 1000);
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       setActionMessage({
//         type: "buy",
//         message: "Failed to add to cart",
//         icon: <X className="w-6 h-6" />,
//       });
//       setTimeout(() => {
//         setActionMessage(null);
//         setIsRedirecting(false);
//       }, 2000);
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleQuantityChange = (delta: number) => {
//     if (!product) return;

//     const newQuantity = Math.max(
//       product.minOrder || 1,
//       Math.min(product.maxOrder || product.stock || 99, quantity + delta)
//     );
//     setQuantity(newQuantity);
//   };

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!showZoom || !product) return;

//     const { left, top, width, height } =
//       e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - left) / width) * 100;
//     const y = ((e.clientY - top) / height) * 100;
//     setZoomPosition({ x, y });
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: product.title,
//         text: product.description,
//         url: window.location.href,
//       });
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert("Link copied to clipboard!");
//     }
//   };

//   const toggleReviewExpansion = (reviewId: string) => {
//     const newExpanded = new Set(expandedReviews);
//     if (newExpanded.has(reviewId)) {
//       newExpanded.delete(reviewId);
//     } else {
//       newExpanded.add(reviewId);
//     }
//     setExpandedReviews(newExpanded);
//   };

//   // Handle new review submission
//   const handleSubmitReview = async () => {
//     if (!newReview.comment.trim()) {
//       alert("Please write a review comment");
//       return;
//     }

//     if (!newReview.name.trim()) {
//       alert("Please enter your name");
//       return;
//     }

//     setSubmittingReview(true);

//     try {
//       const newReviewObj: Review = {
//         _id: `review_${Date.now()}`,
//         userId: currentUserId,
//         user: {
//           name: newReview.name,
//           avatar: `https://i.pravatar.cc/150?u=${currentUserId}`,
//         },
//         rating: newReview.rating,
//         comment: newReview.comment,
//         date: new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         helpful: 0,
//         notHelpful: 0,
//         verified: false,
//         createdAt: new Date().toISOString(),
//       };

//       const updatedReviews = [...reviews, newReviewObj];
//       setReviews(updatedReviews);
//       saveReviewsToStorage(updatedReviews);
//       calculateReviewStats(updatedReviews);

//       setNewReview({
//         rating: 5,
//         comment: "",
//         name: "",
//       });
//       setShowReviewForm(false);

//       alert("Thank you for your review! It has been submitted successfully.");

//       if (reviewsEndRef.current) {
//         reviewsEndRef.current.scrollIntoView({ behavior: "smooth" });
//       }
//     } catch (error) {
//       console.error("Error submitting review:", error);
//       alert("Failed to submit review. Please try again.");
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   // Handle review edit
//   const handleEditReview = (review: Review) => {
//     setEditingReview(review);
//     setNewReview({
//       rating: review.rating,
//       comment: review.comment,
//       name: review.user.name,
//     });
//     setShowReviewForm(true);
//   };

//   // Handle review update
//   const handleUpdateReview = async () => {
//     if (!editingReview || !newReview.comment.trim()) {
//       alert("Please write a review comment");
//       return;
//     }

//     if (!newReview.name.trim()) {
//       alert("Please enter your name");
//       return;
//     }

//     setSubmittingReview(true);

//     try {
//       const updatedReview: Review = {
//         ...editingReview,
//         user: {
//           ...editingReview.user,
//           name: newReview.name,
//         },
//         rating: newReview.rating,
//         comment: newReview.comment,
//         date: new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         createdAt: new Date().toISOString(),
//       };

//       const updatedReviews = reviews.map((review) =>
//         review._id === editingReview._id ? updatedReview : review
//       );

//       setReviews(updatedReviews);
//       saveReviewsToStorage(updatedReviews);
//       calculateReviewStats(updatedReviews);

//       setEditingReview(null);
//       setNewReview({
//         rating: 5,
//         comment: "",
//         name: "",
//       });
//       setShowReviewForm(false);

//       alert("Your review has been updated successfully!");
//     } catch (error) {
//       console.error("Error updating review:", error);
//       alert("Failed to update review. Please try again.");
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   // Handle review deletion
//   const handleDeleteReview = (reviewId: string) => {
//     if (!window.confirm("Are you sure you want to delete this review?")) {
//       return;
//     }

//     const updatedReviews = reviews.filter((review) => review._id !== reviewId);
//     setReviews(updatedReviews);
//     saveReviewsToStorage(updatedReviews);
//     calculateReviewStats(updatedReviews);

//     alert("Review deleted successfully!");
//   };

//   // Handle review helpful click
//   const handleHelpfulClick = (
//     reviewId: string,
//     type: "helpful" | "notHelpful"
//   ) => {
//     const updatedReviews = reviews.map((review) =>
//       review._id === reviewId
//         ? {
//             ...review,
//             [type]: review[type] + 1,
//           }
//         : review
//     );

//     setReviews(updatedReviews);
//     saveReviewsToStorage(updatedReviews);
//   };

//   // Cancel edit mode
//   const handleCancelEdit = () => {
//     setEditingReview(null);
//     setNewReview({
//       rating: 5,
//       comment: "",
//       name: "",
//     });
//     setShowReviewForm(false);
//   };

//   // Check if review belongs to current user
//   const isCurrentUserReview = (review: Review) => {
//     return review.userId === currentUserId;
//   };

//   // Calculate prices and discounts
//   const calculatePriceData = () => {
//     if (!product)
//       return {
//         currentPrice: 0,
//         originalPrice: 0,
//         discountPercentage: 0,
//         discountAmount: 0,
//         hasOffer: false,
//       };

//     let currentPrice = product.normalPrice;
//     let originalPrice = product.originalPrice || product.normalPrice;
//     let hasOffer = false;

//     if (product.salePrice && product.salePrice < product.normalPrice) {
//       currentPrice = product.salePrice;
//       originalPrice = product.normalPrice;
//       hasOffer = true;
//     } else if (product.offerPrice && product.offerPrice < product.normalPrice) {
//       currentPrice = product.offerPrice;
//       originalPrice = product.normalPrice;
//       hasOffer = true;
//     }

//     const discountPercentage =
//       hasOffer && originalPrice > 0
//         ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
//         : 0;

//     const discountAmount = hasOffer ? originalPrice - currentPrice : 0;

//     return {
//       currentPrice,
//       originalPrice,
//       discountPercentage,
//       discountAmount,
//       hasOffer,
//     };
//   };

//   const { currentPrice, originalPrice, discountPercentage, discountAmount } =
//     calculatePriceData();

//   const isWishlisted = product ? isInWishlist(product._id) : false;
//   const allImages = product
//     ? [product.imageUrl, ...product.additionalImages].filter(Boolean)
//     : [];
//   const isLowStock = product?.stock && product.stock > 0 && product.stock <= 10;
//   const isOutOfStock = product?.stock === 0;

//   const selectedSizeObj = product?.sizes?.find(
//     (s: any) => s.size === selectedSize
//   );
//   const sizeStock = selectedSizeObj?.stock || product?.stock || 0;

//   // Mobile navigation handler
//   const scrollToTab = (tabId: string) => {
//     setActiveTab(tabId);
//     setShowMobileMenu(false);
//     const tabElement = document.getElementById(tabId);
//     if (tabElement) {
//       tabElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   // Render active tab content
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "description":
//         return (
//           <div className="space-y-6">
//             <h3 className="text-2xl font-bold text-slate-900 mb-6">
//               Product Description
//             </h3>
//             <div className="space-y-4 text-slate-700">
//               <p>{product?.description}</p>

//               {/* Features */}
//               {product?.features && product.features.length > 0 && (
//                 <div className="mt-8">
//                   <h4 className="text-xl font-bold text-slate-900 mb-4">
//                     Key Features
//                   </h4>
//                   <ul className="space-y-3">
//                     {product.features.map((feature: string, index: number) => (
//                       <li key={index} className="flex items-start gap-3">
//                         <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                           <Check size={12} className="text-white" />
//                         </div>
//                         <span className="text-slate-700">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Specifications */}
//               {product?.specifications &&
//                 Object.keys(product.specifications).length > 0 && (
//                   <div className="mt-8">
//                     <h4 className="text-xl font-bold text-slate-900 mb-4">
//                       Specifications
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {Object.entries(product.specifications).map(
//                         ([key, value]: [string, any]) => (
//                           <div
//                             key={key}
//                             className="flex items-center justify-between py-2 border-b border-slate-200"
//                           >
//                             <span className="text-slate-600 capitalize">
//                               {key}
//                             </span>
//                             <span className="font-medium text-slate-900">
//                               {value}
//                             </span>
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 )}
//             </div>
//           </div>
//         );

//       case "shipping":
//         return (
//           <div className="space-y-8">
//             <h3 className="text-2xl font-bold text-slate-900 mb-6">
//               Shipping & Returns
//             </h3>

//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
//                   <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
//                     <TruckIcon size={24} className="text-white" />
//                   </div>
//                   <h5 className="font-bold text-slate-900 mb-2">
//                     Shipping Policy
//                   </h5>
//                   <ul className="space-y-2 text-sm text-slate-600">
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Free shipping on orders above ৳5000</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Standard delivery: 3-5 business days</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Express delivery available</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Cash on Delivery available</span>
//                     </li>
//                   </ul>
//                 </div>

//                 <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
//                   <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
//                     <Package size={24} className="text-white" />
//                   </div>
//                   <h5 className="font-bold text-slate-900 mb-2">
//                     Return Policy
//                   </h5>
//                   <ul className="space-y-2 text-sm text-slate-600">
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>7 days hassle-free return policy</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Free returns for defective items</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Items must be in original condition</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Refund processed within 7 business days</span>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case "reviews":
//         return (
//           <div className="space-y-8">
//             {/* Reviews Header with Stats */}
//             <div className="flex flex-col md:flex-row justify-between items-start gap-6">
//               <div className="flex-1">
//                 <h3 className="text-2xl font-bold text-slate-900 mb-4">
//                   Customer Reviews
//                 </h3>

//                 {/* Overall Rating */}
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
//                   <div className="text-center">
//                     <div className="text-5xl font-bold text-slate-900 mb-1">
//                       {reviewStats.average.toFixed(1)}
//                     </div>
//                     <div className="flex items-center justify-center">
//                       {[...Array(5)].map((_, i) => (
//                         <StarIcon
//                           key={i}
//                           size={20}
//                           className={`${
//                             i < Math.floor(reviewStats.average)
//                               ? "text-amber-500 fill-amber-500"
//                               : i < reviewStats.average
//                               ? "text-amber-500 fill-amber-500"
//                               : "text-slate-300"
//                           }`}
//                         />
//                       ))}
//                     </div>
//                     <div className="text-slate-600 mt-2">
//                       {reviewStats.total} reviews
//                     </div>
//                   </div>

//                   {/* Rating Distribution */}
//                   <div className="flex-1 space-y-2 min-w-0">
//                     {[5, 4, 3, 2, 1].map((rating) => {
//                       const count =
//                         reviewStats.distribution[
//                           rating as keyof typeof reviewStats.distribution
//                         ];
//                       const percentage =
//                         reviewStats.total > 0
//                           ? (count / reviewStats.total) * 100
//                           : 0;

//                       return (
//                         <div key={rating} className="flex items-center gap-3">
//                           <div className="flex items-center gap-1 w-12">
//                             <span className="text-sm text-slate-600">
//                               {rating}
//                             </span>
//                             <StarIcon size={16} className="text-amber-500" />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
//                               <div
//                                 className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
//                                 style={{ width: `${percentage}%` }}
//                               />
//                             </div>
//                           </div>
//                           <span className="text-sm text-slate-600 w-8 text-right">
//                             {count}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>

//               {/* Add/Edit Review Button */}
//               <button
//                 onClick={() => {
//                   if (editingReview) {
//                     handleCancelEdit();
//                   } else {
//                     setShowReviewForm(!showReviewForm);
//                   }
//                 }}
//                 className={`px-4 sm:px-6 py-3 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 w-full md:w-auto ${
//                   editingReview
//                     ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
//                     : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
//                 }`}
//               >
//                 {editingReview ? (
//                   <>
//                     <XCircle size={20} />
//                     <span className="hidden sm:inline">Cancel Edit</span>
//                     <span className="sm:hidden">Cancel</span>
//                   </>
//                 ) : (
//                   <>
//                     <MessageSquare size={20} />
//                     {showReviewForm ? (
//                       <>
//                         <span className="hidden sm:inline">Cancel</span>
//                         <span className="sm:hidden">Cancel</span>
//                       </>
//                     ) : (
//                       <>
//                         <span className="hidden sm:inline">Write a Review</span>
//                         <span className="sm:hidden">Review</span>
//                       </>
//                     )}
//                   </>
//                 )}
//               </button>
//             </div>

//             {/* Add/Edit Review Form */}
//             {(showReviewForm || editingReview) && (
//               <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-6">
//                 <h4 className="text-xl font-bold text-slate-900">
//                   {editingReview ? "Edit Your Review" : "Write Your Review"}
//                 </h4>

//                 {/* Rating Selection */}
//                 <div>
//                   <label className="block text-slate-700 mb-3">
//                     Your Rating
//                   </label>
//                   <div className="flex gap-2">
//                     {[1, 2, 3, 4, 5].map((rating) => (
//                       <button
//                         key={rating}
//                         type="button"
//                         onClick={() => setNewReview({ ...newReview, rating })}
//                         className="focus:outline-none transform hover:scale-110 transition-transform"
//                       >
//                         <StarIcon
//                           size={isMobile ? 28 : 32}
//                           className={`${
//                             rating <= newReview.rating
//                               ? "text-amber-500 fill-amber-500"
//                               : "text-slate-300"
//                           }`}
//                         />
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Name Input */}
//                 <div>
//                   <label className="block text-slate-700 mb-2">Your Name</label>
//                   <input
//                     type="text"
//                     value={newReview.name}
//                     onChange={(e) =>
//                       setNewReview({ ...newReview, name: e.target.value })
//                     }
//                     placeholder="Enter your name"
//                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   />
//                 </div>

//                 {/* Review Text */}
//                 <div>
//                   <label className="block text-slate-700 mb-2">
//                     Your Review
//                   </label>
//                   <textarea
//                     value={newReview.comment}
//                     onChange={(e) =>
//                       setNewReview({ ...newReview, comment: e.target.value })
//                     }
//                     placeholder="Share your experience with this product..."
//                     rows={4}
//                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   />
//                   <p className="text-sm text-slate-500 mt-2">
//                     Please provide detailed feedback about your experience with
//                     this product.
//                   </p>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex flex-col sm:flex-row justify-end gap-3">
//                   <button
//                     onClick={handleCancelEdit}
//                     className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={
//                       editingReview ? handleUpdateReview : handleSubmitReview
//                     }
//                     disabled={
//                       submittingReview ||
//                       !newReview.comment.trim() ||
//                       !newReview.name.trim()
//                     }
//                     className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
//                       submittingReview ||
//                       !newReview.comment.trim() ||
//                       !newReview.name.trim()
//                         ? "bg-slate-300 text-slate-500 cursor-not-allowed"
//                         : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-xl"
//                     }`}
//                   >
//                     {submittingReview ? (
//                       <>
//                         <RefreshCw size={20} className="animate-spin" />
//                         {editingReview ? "Updating..." : "Submitting..."}
//                       </>
//                     ) : (
//                       <>
//                         {editingReview ? (
//                           <Save size={20} />
//                         ) : (
//                           <Send size={20} />
//                         )}
//                         {editingReview ? "Update Review" : "Submit Review"}
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Reviews List */}
//             <div className="space-y-6">
//               {reviews.length > 0 ? (
//                 reviews.map((review) => {
//                   const isExpanded = expandedReviews.has(review._id);
//                   const shouldTruncate = review.comment.length > 200;
//                   const isUserReview = isCurrentUserReview(review);

//                   return (
//                     <div
//                       key={review._id}
//                       className="bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6 relative"
//                     >
//                       {/* User Actions (Edit/Delete) */}
//                       {isUserReview && (
//                         <div className="absolute top-4 right-4 flex gap-2">
//                           <button
//                             onClick={() => handleEditReview(review)}
//                             className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
//                             title="Edit review"
//                           >
//                             <Edit size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteReview(review._id)}
//                             className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Delete review"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       )}

//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex items-start gap-3">
//                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
//                             <img
//                               src={
//                                 review.user.avatar ||
//                                 `https://i.pravatar.cc/150?u=${review.userId}`
//                               }
//                               alt={review.user.name}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                           <div className="min-w-0">
//                             <div className="font-bold text-slate-900 flex items-center gap-2 truncate">
//                               {review.user.name}
//                               {isUserReview && (
//                                 <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
//                                   You
//                                 </span>
//                               )}
//                             </div>
//                             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-slate-600 mt-1">
//                               <div className="flex items-center gap-1">
//                                 <div className="flex">
//                                   {[...Array(5)].map((_, i) => (
//                                     <StarIcon
//                                       key={i}
//                                       size={14}
//                                       className={`${
//                                         i < review.rating
//                                           ? "text-amber-500 fill-amber-500"
//                                           : "text-slate-300"
//                                       }`}
//                                     />
//                                   ))}
//                                 </div>
//                                 <span className="ml-1">{review.rating}.0</span>
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <Calendar size={12} />
//                                 <span>{review.date}</span>
//                               </div>
//                               {review.verified && (
//                                 <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full w-fit">
//                                   <Check size={10} />
//                                   <span>Verified Purchase</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="mb-4">
//                         <p
//                           className={`text-slate-700 leading-relaxed ${
//                             !isExpanded && shouldTruncate ? "line-clamp-3" : ""
//                           }`}
//                         >
//                           {review.comment}
//                         </p>
//                         {shouldTruncate && (
//                           <button
//                             onClick={() => toggleReviewExpansion(review._id)}
//                             className="text-amber-600 hover:text-amber-700 font-medium text-sm mt-2 flex items-center gap-1"
//                           >
//                             {isExpanded ? (
//                               <>
//                                 Show Less <ChevronUp size={16} />
//                               </>
//                             ) : (
//                               <>
//                                 Read More <ChevronDown size={16} />
//                               </>
//                             )}
//                           </button>
//                         )}
//                       </div>

//                       {/* Review Images */}
//                       {review.images && review.images.length > 0 && (
//                         <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
//                           {review.images.map((img, idx) => (
//                             <div
//                               key={idx}
//                               className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 cursor-pointer flex-shrink-0"
//                               onClick={() => window.open(img, "_blank")}
//                             >
//                               <img
//                                 src={img}
//                                 alt={`Review image ${idx + 1}`}
//                                 className="w-full h-full object-cover hover:scale-110 transition-transform"
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       {/* Helpful Actions */}
//                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-3 sm:gap-0">
//                         <div className="flex items-center gap-4">
//                           <button
//                             onClick={() =>
//                               handleHelpfulClick(review._id, "helpful")
//                             }
//                             className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
//                           >
//                             <ThumbsUp size={16} />
//                             <span>Helpful ({review.helpful})</span>
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleHelpfulClick(review._id, "notHelpful")
//                             }
//                             className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
//                           >
//                             <ThumbsDown size={16} />
//                             <span>Not Helpful ({review.notHelpful})</span>
//                           </button>
//                         </div>
//                         {isUserReview && (
//                           <div className="text-xs text-slate-500">
//                             Your review
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="text-center py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200">
//                   <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                   <h4 className="text-xl font-bold text-slate-900 mb-2">
//                     No Reviews Yet
//                   </h4>
//                   <p className="text-slate-600 mb-6 max-w-md mx-auto px-4">
//                     Be the first to share your thoughts about this product!
//                   </p>
//                   <button
//                     onClick={() => setShowReviewForm(true)}
//                     className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
//                   >
//                     <MessageSquare size={20} />
//                     Write the First Review
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Reference for scrolling */}
//             <div ref={reviewsEndRef} />
//           </div>
//         );

//       case "related":
//         return (
//           <div className="space-y-8">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <h3 className="text-2xl font-bold text-slate-900">
//                 Related Products
//               </h3>
//               <Link
//                 href={`/products?category=${product?.category}`}
//                 className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
//               >
//                 View All
//                 <ChevronRightIcon size={16} />
//               </Link>
//             </div>

//             {loadingRelated ? (
//               <div className="flex justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent" />
//               </div>
//             ) : relatedProducts.length > 0 ? (
//               <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
//                 {relatedProducts.map((relatedProduct) => (
//                   <ProductCard
//                     key={relatedProduct._id}
//                     product={relatedProduct}
//                     viewMode="grid"
//                     showQuickView={false}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
//                 <p className="text-slate-600">No related products found</p>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
//         <div className="text-center space-y-4">
//           <div className="relative">
//             <div className="animate-spin h-16 w-16 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
//             <Package className="absolute inset-0 m-auto h-8 w-8 text-amber-600" />
//           </div>
//           <p className="text-slate-600 font-medium">
//             Loading product details...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-4 py-8">
//         <div className="text-center max-w-md">
//           <div className="relative mb-6">
//             <Package className="w-20 h-20 text-slate-400 mx-auto mb-4" />
//             <div className="absolute -top-2 -right-2">
//               <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
//                 <Hash className="w-4 h-4 text-white" />
//               </div>
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold mb-4 text-slate-900">
//             Product Not Found
//           </h1>
//           <p className="text-slate-600 mb-6">
//             The product with ID{" "}
//             <code className="bg-slate-100 px-2 py-1 rounded-lg font-mono break-all">
//               {id}
//             </code>{" "}
//             was not found.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/all-collections"
//               className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all"
//             >
//               <ArrowLeft size={18} />
//               Browse Products
//             </Link>
//             <Link
//               href="/"
//               className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all"
//             >
//               Go Home
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       {/* Action Success Message Popup - Responsive */}
//       {actionMessage && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
//           <div className="animate-in fade-in zoom-in duration-300 w-full max-w-sm">
//             <div
//               className={`px-6 py-5 sm:px-8 sm:py-6 rounded-2xl shadow-2xl${
//                 actionMessage.type === "cart"
//                   ? "bg-gradient-to-r from-emerald-700 to-emerald-500"
//                   : actionMessage.type === "love"
//                   ? "bg-gradient-to-r from-rose-500 to-rose-600"
//                   : "bg-gradient-to-r from-amber-500 to-amber-600"
//               } text-white`}
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//                   {actionMessage.icon}
//                 </div>
//                 <div className="min-w-0">
//                   <p className="text-lg sm:text-2xl font-bold truncate">
//                     {actionMessage.message}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Zoom Viewer Modal - Responsive */}
//       {zoomViewer && (
//         <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-2 sm:p-4">
//           <div className="relative max-w-6xl w-full">
//             <button
//               onClick={() => setZoomViewer(false)}
//               className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-amber-400 transition-colors"
//             >
//               <X size={24} />
//             </button>
//             <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
//               <img
//                 src={allImages[currentImage]}
//                 alt={product.title}
//                 className="w-full h-full object-contain"
//                 onError={(e) => {
//                   console.error('Failed to load zoom image:', allImages[currentImage]);
//                   e.currentTarget.src =
//                     "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
//                 }}
//               />
//             </div>
//             {allImages.length > 1 && (
//               <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 overflow-x-auto pb-2">
//                 {allImages.map((img: string, index: number) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentImage(index)}
//                     className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
//                       currentImage === index
//                         ? "border-amber-500"
//                         : "border-white/30 hover:border-white/60"
//                     }`}
//                   >
//                     <img
//                       src={img}
//                       alt={`${product.title} ${index + 1}`}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         console.error('Failed to load thumbnail in zoom:', img);
//                         e.currentTarget.src =
//                           "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop";
//                       }}
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
//         {/* Breadcrumb */}
//         <div className="mb-4 sm:mb-6">
//           <Link
//             href="/all-collections"
//             className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors text-sm sm:text-base"
//           >
//             <ArrowLeft size={18} />
//             <span className="truncate">Back to Products</span>
//           </Link>
//         </div>

//         {/* Main Product Grid - Responsive */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
//           {/* Left Column: Images with Zoom */}
//           <div className="space-y-4 sm:space-y-6">
//             {/* Main Image with Zoom */}
//             <div
//               className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 cursor-crosshair"
//               onMouseEnter={() => setShowZoom(true)}
//               onMouseLeave={() => setShowZoom(false)}
//               onMouseMove={handleMouseMove}
//               onClick={() => setZoomViewer(true)}
//             >
//               <img
//                 src={allImages[currentImage]}
//                 alt={product.title}
//                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                 onError={(e) => {
//                   console.error('Failed to load main image:', allImages[currentImage]);
//                   e.currentTarget.src =
//                     "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
//                 }}
//               />

//               {/* Zoom Lens - Only on desktop */}
//               {!isMobile && showZoom && (
//                 <div className="absolute inset-0 overflow-hidden">
//                   <div
//                     className="absolute w-full h-full bg-no-repeat"
//                     style={{
//                       backgroundImage: `url(${allImages[currentImage]})`,
//                       backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
//                       backgroundSize: "200%",
//                       transform: "scale(1.5)",
//                     }}
//                   />
//                 </div>
//               )}

//               {/* Share Button */}
//               <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
//                 <button
//                   onClick={handleShare}
//                   className="p-2 sm:p-3 bg-white/95 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"
//                   title="Share this product"
//                 >
//                   <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
//                 </button>
//               </div>

//               {/* Product Badges */}
//               <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex flex-col gap-2">
//                 {product.hasOffer && discountPercentage > 0 && (
//                   <div className="relative">
//                     <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full blur-sm"></div>
//                     <div className="relative px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
//                       <div className="flex items-center gap-1 sm:gap-2">
//                         <Percent size={12} className="sm:w-4 sm:h-4" />
//                         {discountPercentage}% OFF
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {product.isNew && (
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <Sparkles size={12} className="sm:w-4 sm:h-4" />
//                       NEW
//                     </div>
//                   </div>
//                 )}

//                 {product.isBestSelling && (
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <TrendingUp size={12} className="sm:w-4 sm:h-4" />
//                       BEST
//                     </div>
//                   </div>
//                 )}

//                 {product.featured && (
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <Sparkles size={12} className="sm:w-4 sm:h-4" />
//                       FEATURED
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Image Counter */}
//               {allImages.length > 1 && (
//                 <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10">
//                   <div className="px-2 py-1.5 sm:px-3 sm:py-2 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
//                     {currentImage + 1} / {allImages.length}
//                   </div>
//                 </div>
//               )}

//               {/* Stock Status */}
//               {isOutOfStock && (
//                 <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10">
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <Package size={12} className="sm:w-4 sm:h-4" />
//                       <span>Out of Stock</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Image Thumbnails - Responsive */}
//             {allImages.length > 1 && (
//               <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
//                 {allImages.slice(0, isMobile ? 4 : 5).map((img: string, index: number) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentImage(index)}
//                     className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
//                       currentImage === index
//                         ? "border-amber-500 shadow-lg shadow-amber-500/25 scale-105"
//                         : "border-slate-200 hover:border-amber-300 hover:scale-105"
//                     }`}
//                   >
//                     <img
//                       src={img}
//                       alt={`${product.title} ${index + 1}`}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         console.error('Failed to load thumbnail:', img);
//                         e.currentTarget.src =
//                           "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop";
//                       }}
//                     />
//                     {currentImage === index && (
//                       <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
//                         <div className="w-4 h-4 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center">
//                           <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
//                         </div>
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Right Column: Details */}
//           <div className="space-y-6 sm:space-y-8">
//             {/* Title and Actions */}
//             <div className="flex items-start justify-between gap-4">
//               <div className="min-w-0 flex-1">
//                 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 break-words">
//                   {product.title}
//                 </h1>

//                 {/* SKU and Views */}
//                 <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-slate-500 mb-4">
//                   {product.sku && (
//                     <div className="flex items-center gap-2">
//                       <Hash size={14} />
//                       <span className="font-mono truncate">{product.sku}</span>
//                     </div>
//                   )}
//                   {product.views > 0 && (
//                     <div className="flex items-center gap-2">
//                       <Eye size={14} />
//                       <span>{product.views.toLocaleString()} views</span>
//                     </div>
//                   )}
//                   {product.sold > 0 && (
//                     <div className="flex items-center gap-2">
//                       <ShoppingCart size={14} />
//                       <span>{product.sold.toLocaleString()} sold</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleShare}
//                   className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 hover:border-blue-200 hover:scale-105 hover:shadow-lg transition-all duration-300"
//                   title="Share"
//                 >
//                   <Share2 size={isMobile ? 18 : 20} />
//                 </button>
//               </div>
//             </div>

//             {/* Rating */}
//             {product.rating > 0 && (
//               <div className="flex flex-col xs:flex-row xs:items-center gap-3">
//                 <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-amber-200 w-fit">
//                   <div className="flex">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         size={isMobile ? 14 : 16}
//                         className={`${
//                           i < Math.floor(product.rating)
//                             ? "text-amber-500 fill-amber-500"
//                             : "text-slate-300"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="font-bold text-slate-900">
//                     {product.rating.toFixed(1)}
//                   </span>
//                 </div>
//                 <span className="text-slate-600">
//                   ({product.reviewCount || 0} reviews)
//                 </span>
//               </div>
//             )}

//             {/* Price Section */}
//             <div className="space-y-3 sm:space-y-4">
//               <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
//                 <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
//                   ৳{currentPrice.toLocaleString()}
//                 </span>

//                 {product.hasOffer && discountPercentage > 0 && (
//                   <>
//                     <span className="text-xl sm:text-2xl text-slate-400 line-through">
//                       ৳{originalPrice.toLocaleString()}
//                     </span>
//                     <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full text-sm sm:text-base">
//                       Save {discountPercentage}%
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Price Summary */}
//               {product.hasOffer && currentPrice < originalPrice && (
//                 <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-xs sm:text-sm text-slate-600">
//                         You Save
//                       </p>
//                       <div className="flex items-center gap-2 sm:gap-3 mt-1">
//                         <span className="text-base sm:text-lg font-bold text-slate-800">
//                           ৳{discountAmount.toLocaleString()}
//                         </span>
//                         <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
//                           {discountPercentage}% OFF
//                         </span>
//                       </div>
//                     </div>
//                     <BadgePercent className="text-green-500" size={isMobile ? 20 : 24} />
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Description */}
//             {product.description && (
//               <div className="text-slate-600 leading-relaxed text-sm sm:text-base">
//                 {product.description}
//               </div>
//             )}

//             {/* Size Selection */}
//             {product.sizes && product.sizes.length > 0 && (
//               <div className="space-y-2 sm:space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
//                     <Ruler size={isMobile ? 16 : 18} />
//                     Select Size
//                   </h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {product.sizes.map((size: ProductSize, index: number) => {
//                     const isAvailable = size.stock > 0;
//                     const isSelected = selectedSize === size.size;

//                     return (
//                       <button
//                         key={index}
//                         onClick={() => setSelectedSize(size.size)}
//                         disabled={!isAvailable}
//                         className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
//                           isSelected
//                             ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 scale-105"
//                             : isAvailable
//                             ? "bg-gradient-to-b from-slate-50 to-white border border-slate-300 text-slate-700 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700"
//                             : "bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed opacity-50"
//                         }`}
//                       >
//                         {size.size}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Quantity */}
//             <div className="space-y-2 sm:space-y-3">
//               <h3 className="font-bold text-slate-900 text-sm sm:text-base">
//                 Quantity
//               </h3>

//               <div
//                 className="flex items-center w-fit
//     bg-gradient-to-b from-slate-50 to-white
//     rounded-xl sm:rounded-2xl border border-slate-300 overflow-hidden shadow-sm"
//               >
//                 <button
//                   onClick={() => handleQuantityChange(-1)}
//                   disabled={quantity <= (product.minOrder || 1)}
//                   className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
//         text-2xl sm:text-3xl font-bold text-slate-700
//         hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200
//         active:scale-95
//         disabled:opacity-30 disabled:cursor-not-allowed
//         transition-all duration-300"
//                 >
//                   −
//                 </button>

//                 <div className="w-16 h-12 sm:w-20 sm:h-16 flex items-center justify-center">
//                   <span className="text-2xl sm:text-3xl font-bold text-slate-900">
//                     {quantity}
//                   </span>
//                 </div>

//                 <button
//                   onClick={() => handleQuantityChange(1)}
//                   disabled={quantity >= (product.maxOrder || sizeStock || 99)}
//                   className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
//         text-2xl sm:text-3xl font-bold text-slate-700
//         hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200
//         active:scale-95
//         disabled:opacity-30 disabled:cursor-not-allowed
//         transition-all duration-300"
//                 >
//                   +
//                 </button>
//               </div>

//               <p className="text-xs sm:text-sm text-slate-500">
//                 Min: {product.minOrder || 1} | Max:{" "}
//                 {product.maxOrder || sizeStock || 99}
//               </p>
//             </div>

//             {/* Action Buttons - Responsive Stack */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//               {/* Add to Cart Button */}
//               <button
//                 onClick={handleAddToCart}
//                 onMouseEnter={() => setActiveAction("cart")}
//                 onMouseLeave={() => setActiveAction("buy")}
//                 disabled={product.stock <= 0 || addingToCart}
//                 className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
//       transition-all duration-300 active:scale-[0.98]
//       disabled:opacity-50 disabled:cursor-not-allowed
//       ${
//         activeAction === "cart"
//           ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg"
//           : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
//       }`}
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   {addingToCart && activeAction === "cart" ? (
//                     <RefreshCw size={isMobile ? 18 : 20} className="animate-spin" />
//                   ) : (
//                     <>
//                       <ShoppingCart
//                         size={isMobile ? 18 : 20}
//                         className={
//                           activeAction === "cart"
//                             ? "text-white"
//                             : "text-slate-700"
//                         }
//                       />
//                       <span
//                         className={
//                           activeAction === "cart"
//                             ? "text-white"
//                             : "text-slate-800"
//                         }
//                       >
//                         {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
//                       </span>
//                     </>
//                   )}
//                 </div>
//               </button>

//               {/* Love This Button (Wishlist) */}
//               <button
//                 onClick={handleWishlistToggle}
//                 onMouseEnter={() => setActiveAction("love")}
//                 onMouseLeave={() => setActiveAction("buy")}
//                 className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
//       transition-all duration-300 active:scale-[0.98]
//       ${
//         activeAction === "love"
//           ? isWishlisted
//             ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg"
//             : "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg"
//           : isWishlisted
//           ? "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-50"
//           : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
//       }`}
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   <Heart
//                     size={isMobile ? 18 : 20}
//                     className={
//                       activeAction === "love"
//                         ? isWishlisted
//                           ? "fill-white"
//                           : "text-white"
//                         : isWishlisted
//                         ? "fill-rose-600 text-rose-600"
//                         : "text-slate-700"
//                     }
//                   />
//                   <span
//                     className={
//                       activeAction === "love"
//                         ? "text-white"
//                         : isWishlisted
//                         ? "text-rose-700"
//                         : "text-slate-800"
//                     }
//                   >
//                     {isWishlisted ? "Liked" : "Like"}
//                   </span>
//                 </div>
//               </button>

//               {/* Buy Now Button */}
//               <button
//                 onClick={handleBuyNow}
//                 onMouseEnter={() => setActiveAction("buy")}
//                 disabled={product.stock <= 0 || isRedirecting}
//                 className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
//       transition-all duration-300 active:scale-[0.98]
//       disabled:opacity-50 disabled:cursor-not-allowed
//       ${
//         activeAction === "buy"
//           ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg"
//           : "bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:shadow-xl"
//       }`}
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   {isRedirecting ? (
//                     <RefreshCw size={isMobile ? 18 : 20} className="animate-spin" />
//                   ) : (
//                     <>
//                       <Zap size={isMobile ? 18 : 20} />
//                       <span>Buy Now</span>
//                     </>
//                   )}
//                 </div>
//               </button>
//             </div>

//             {/* Product Tags */}
//             {product.tags && product.tags.length > 0 && (
//               <div className="pt-4 sm:pt-6 border-t border-slate-200">
//                 <h3 className="font-bold text-slate-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
//                   <Tag size={isMobile ? 14 : 16} />
//                   Product Tags
//                 </h3>
//                 <div className="flex flex-wrap gap-2">
//                   {product.tags.map((tag: string, index: number) => (
//                     <span
//                       key={index}
//                       className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-b from-slate-50 to-white text-slate-700 rounded-lg text-xs sm:text-sm font-medium border border-slate-200"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Trust Badges - Responsive Grid */}
//             <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
//               <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-b from-slate-50 to-white rounded-lg sm:rounded-xl border border-slate-200">
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Truck size={isMobile ? 16 : 20} className="text-white" />
//                 </div>
//                 <div className="min-w-0">
//                   <p className="font-bold text-slate-900 text-sm sm:text-base">
//                     Free Delivery
//                   </p>
//                   <p className="text-xs text-slate-500 truncate">
//                     {product.shippingInfo}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-b from-slate-50 to-white rounded-lg sm:rounded-xl border border-slate-200">
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <RotateCcw size={isMobile ? 16 : 20} className="text-white" />
//                 </div>
//                 <div className="min-w-0">
//                   <p className="font-bold text-slate-900 text-sm sm:text-base">
//                     Easy Returns
//                   </p>
//                   <p className="text-xs text-slate-500 truncate">
//                     {product.returnPolicy}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Navigation Menu */}
//         {isMobile && (
//           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 py-2 px-4">
//             <div className="flex items-center justify-between">
//               <button
//                 onClick={() => scrollToTab("description")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "description"
//                     ? "text-amber-600"
//                     : "text-slate-600"
//                 }`}
//               >
//                 <List size={20} />
//                 <span className="text-xs">Details</span>
//               </button>
//               <button
//                 onClick={() => scrollToTab("shipping")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "shipping" ? "text-amber-600" : "text-slate-600"
//                 }`}
//               >
//                 <Truck size={20} />
//                 <span className="text-xs">Shipping</span>
//               </button>
//               <button
//                 onClick={() => scrollToTab("reviews")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "reviews" ? "text-amber-600" : "text-slate-600"
//                 }`}
//               >
//                 <MessageSquare size={20} />
//                 <span className="text-xs">Reviews</span>
//               </button>
//               <button
//                 onClick={() => scrollToTab("related")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "related" ? "text-amber-600" : "text-slate-600"
//                 }`}
//               >
//                 <Grid size={20} />
//                 <span className="text-xs">Related</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Product Details Tabs - Desktop Only */}
//         {!isMobile && (
//           <div className="mb-8 sm:mb-12">
//             <div className="flex flex-wrap border-b border-slate-200 mb-6 sm:mb-8 overflow-x-auto">
//               {[
//                 { id: "description", label: "Description", icon: null },
//                 {
//                   id: "shipping",
//                   label: "Shipping & Returns",
//                   icon: <Truck size={16} />,
//                 },
//                 {
//                   id: "reviews",
//                   label: `Reviews (${reviewStats.total})`,
//                   icon: <MessageSquare size={16} />,
//                 },
//                 {
//                   id: "related",
//                   label: "Related Products",
//                   icon: <Package size={16} />,
//                 },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
//                     activeTab === tab.id
//                       ? "text-amber-600 border-b-2 border-amber-600"
//                       : "text-slate-500 hover:text-slate-700"
//                   }`}
//                 >
//                   {tab.icon}
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-slate-50 rounded-xl sm:rounded-2xl border border-slate-200">
//               {renderTabContent()}
//             </div>
//           </div>
//         )}

//         {/* Mobile Tab Content - Separate Sections */}
//         {isMobile && (
//           <div className="space-y-8 mb-20">
//             <section id="description" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {renderTabContent()}
//               </div>
//             </section>

//             <section id="shipping" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {activeTab === "shipping" && renderTabContent()}
//               </div>
//             </section>

//             <section id="reviews" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {activeTab === "reviews" && renderTabContent()}
//               </div>
//             </section>

//             <section id="related" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {activeTab === "related" && renderTabContent()}
//               </div>
//             </section>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // // client/src/app/product/[id]/page.tsx

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   ShoppingCart,
//   Heart,
//   Truck,
//   Package,
//   Star,
//   Check,
//   ZoomIn,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Palette,
//   Ruler,
//   Shield,
//   RefreshCw,
//   Share2,
//   Eye,
//   Hash,
//   Tag,
//   Sparkles,
//   Zap,
//   Image as ImageIcon,
//   MessageSquare,
//   ThumbsUp,
//   ThumbsDown,
//   Calendar,
//   User,
//   Clock,
//   Truck as TruckIcon,
//   RotateCcw,
//   Award,
//   ChevronDown,
//   ChevronUp,
//   Percent,
//   BadgePercent,
//   TrendingUp,
//   Send,
//   Star as StarIcon,
//   Edit,
//   Trash2,
//   Save,
//   XCircle,
//   ChevronRight as ChevronRightIcon,
//   Menu,
//   Grid,
//   List,
// } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { useWishlist } from "@/context/WishlistContext";
// import axios from "axios";
// import ProductCard, { Product } from "@/components/ProductCard";

// // Environment configuration
// const getAPIBaseUrl = (): string => {
//   // Client-side check for environment
//   if (typeof window !== 'undefined') {
//     // Check if we're on localhost
//     const isLocalhost = window.location.hostname === 'localhost' ||
//                        window.location.hostname === '127.0.0.1' ||
//                        window.location.port === '3000';

//     return isLocalhost
//       ? 'http://localhost:4000'
//       : 'https://puti-client-production.onrender.com';
//   }

//   // Server-side or fallback
//   return process.env.NODE_ENV === 'development'
//     ? 'http://localhost:4000'
//     : 'https://puti-client-production.onrender.com';
// };

// const API_URL = getAPIBaseUrl();

// // Helper function to get image URL
// const getImageUrl = (url: string) => {
//   if (!url)
//     return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";

//   if (url.startsWith("http") || url.startsWith("data:")) return url;
//   if (url.startsWith("/uploads")) return `${API_URL}${url}`;
//   if (url.startsWith("/")) return `${API_URL}${url}`;
//   return `${API_URL}/uploads/${url}`;
// };

// // Review type definition
// interface Review {
//   _id: string;
//   userId: string;
//   user: {
//     name: string;
//     avatar?: string;
//   };
//   rating: number;
//   comment: string;
//   date: string;
//   helpful: number;
//   notHelpful: number;
//   verified: boolean;
//   images?: string[];
//   createdAt: string;
// }

// // Size type definition
// interface ProductSize {
//   size: string;
//   stock: number;
//   price?: number;
// }

// export default function ProductDetailPage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const [product, setProduct] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedSize, setSelectedSize] = useState<string>("");
//   const [selectedColor, setSelectedColor] = useState<string>("");
//   const [currentImage, setCurrentImage] = useState(0);
//   const [zoomViewer, setZoomViewer] = useState(false);
//   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
//   const [showZoom, setShowZoom] = useState(false);
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [activeTab, setActiveTab] = useState("description");
//   const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
//   const [loadingRelated, setLoadingRelated] = useState(false);
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const [reviewStats, setReviewStats] = useState({
//     total: 0,
//     average: 0,
//     distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
//   });
//   const [expandedReviews, setExpandedReviews] = useState<Set<string>>(
//     new Set()
//   );
//   const [isMobile, setIsMobile] = useState(false);
//   const [showMobileMenu, setShowMobileMenu] = useState(false);

//   // New review form state
//   const [newReview, setNewReview] = useState({
//     rating: 5,
//     comment: "",
//     name: "",
//   });
//   const [editingReview, setEditingReview] = useState<Review | null>(null);
//   const [submittingReview, setSubmittingReview] = useState(false);
//   const [showReviewForm, setShowReviewForm] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string>("");
//   const reviewsEndRef = useRef<HTMLDivElement>(null);

//   // Action button states
//   type ActionType = "cart" | "love" | "buy";
//   const [activeAction, setActiveAction] = useState<ActionType>("buy");
//   const [actionMessage, setActionMessage] = useState<{
//     type: ActionType;
//     message: string;
//     icon: React.ReactNode;
//   } | null>(null);
//   const [isRedirecting, setIsRedirecting] = useState(false);

//   const { addToCart } = useCart();
//   const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

//   // Check if mobile on mount and resize
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkMobile();
//     window.addEventListener('resize', checkMobile);
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Initialize current user ID
//   useEffect(() => {
//     const userId =
//       localStorage.getItem("currentUserId") || `user_${Date.now()}`;
//     if (!localStorage.getItem("currentUserId")) {
//       localStorage.setItem("currentUserId", userId);
//     }
//     setCurrentUserId(userId);
//   }, []);

//   useEffect(() => {
//     if (!id) {
//       setError("No product ID provided");
//       setLoading(false);
//       return;
//     }

//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await axios.get(`${API_URL}/api/products/${id}`);

//         let productData = null;

//         if (response.data && response.data.data) {
//           productData = response.data.data;
//         } else if (response.data) {
//           productData = response.data;
//         }

//         if (!productData) {
//           throw new Error("Product not found");
//         }

//         const parseSizes = () => {
//           if (productData.variants && Array.isArray(productData.variants)) {
//             return productData.variants.map((v: any) => ({
//               size: v.size || "M",
//               stock: v.stockQuantity || v.stock || 0,
//             }));
//           }
//           else if (productData.sizes) {
//             try {
//               if (typeof productData.sizes === "string") {
//                 const parsed = JSON.parse(productData.sizes);
//                 if (Array.isArray(parsed)) {
//                   return parsed.map((s: any) => ({
//                     size: s.size || s.Size || "M",
//                     stock: s.stock || s.Stock || s.stockQuantity || 0,
//                   }));
//                 }
//               } else if (Array.isArray(productData.sizes)) {
//                 return productData.sizes.map((s: any) => ({
//                   size: s.size || s.Size || "M",
//                   stock: s.stock || s.Stock || s.stockQuantity || 0,
//                 }));
//               }
//             } catch (e) {
//               console.error("Error parsing sizes:", e);
//             }
//           }
//           return [
//             {
//               size: "M",
//               stock: productData.stockQuantity || productData.stock || 0,
//             },
//           ];
//         };

//         const sizes = parseSizes();

//         const processedProduct = {
//           _id: productData._id,
//           title: productData.title || "Product",
//           description: productData.description || "",
//           category: productData.category || "Uncategorized",
//           normalPrice: productData.normalPrice || 0,
//           offerPrice:
//             productData.salePrice ||
//             productData.offerPrice ||
//             productData.normalPrice ||
//             0,
//           originalPrice:
//             productData.originalPrice || productData.normalPrice || 0,
//           salePrice:
//             productData.salePrice ||
//             productData.offerPrice ||
//             productData.normalPrice ||
//             0,
//           discountPercentage:
//             productData.discountPercentage ||
//             (productData.normalPrice > 0 &&
//             productData.salePrice > 0 &&
//             productData.salePrice < productData.normalPrice
//               ? Math.round(
//                   ((productData.normalPrice - productData.salePrice) /
//                     productData.normalPrice) *
//                     100
//                 )
//               : 0),
//           stock: productData.stockQuantity || productData.stock || 0,
//           sizes: sizes,
//           imageUrl: getImageUrl(productData.imageUrl),
//           additionalImages: Array.isArray(productData.additionalImages)
//             ? productData.additionalImages.map(getImageUrl)
//             : [],
//           featured: productData.featured || false,
//           isBestSelling: productData.isBestSelling || false,
//           isNew: productData.isNew || productData.isNewProduct || false,
//           hasOffer:
//             (productData.salePrice &&
//               productData.salePrice < productData.normalPrice) ||
//             false,
//           tags: productData.tags || [],
//           status: productData.productStatus || productData.status || "active",
//           sku: productData.sku,
//           weight: productData.weight,
//           dimensions: productData.dimensions,
//           material: productData.material,
//           warranty: productData.warranty,
//           rating: productData.rating || 0,
//           reviewCount: productData.reviewCount || 0,
//           views: productData.views || 0,
//           sold: productData.sold || 0,
//           returnPolicy: productData.returnPolicy || "30 days return policy",
//           shippingInfo:
//             productData.shippingInfo || "Free shipping on orders above ৳5000",
//           minOrder: productData.minOrder || 1,
//           maxOrder: productData.maxOrder || productData.stockQuantity || 99,
//           features: productData.features || [],
//           specifications: productData.specifications || {},
//           createdAt: productData.createdAt,
//           updatedAt: productData.updatedAt,
//         };

//         setProduct(processedProduct);

//         if (processedProduct.sizes.length > 0) {
//           setSelectedSize(processedProduct.sizes[0].size);
//         }

//         fetchRelatedProducts(processedProduct.category);
//         fetchReviews(processedProduct._id);
//       } catch (err: any) {
//         console.error("Error loading product:", err);
//         setError(
//           err.response?.data?.message || err.message || "Product not found"
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   const fetchRelatedProducts = async (category: string) => {
//     try {
//       setLoadingRelated(true);
//       const response = await axios.get(
//         `${API_URL}/api/products?category=${category}&limit=4`
//       );

//       let productData: Product[] = [];

//       if (Array.isArray(response.data)) {
//         productData = response.data;
//       } else if (response.data && response.data.data) {
//         productData = response.data.data;
//       }

//       const filteredProducts = productData.filter(
//         (p: Product) => p._id !== product?._id
//       );

//       setRelatedProducts(filteredProducts.slice(0, 4));
//     } catch (error) {
//       console.error("Error fetching related products:", error);
//     } finally {
//       setLoadingRelated(false);
//     }
//   };

//   const fetchReviews = async (productId: string) => {
//     try {
//       const savedReviews = localStorage.getItem(`reviews_${productId}`);

//       if (savedReviews) {
//         const initialReviews = JSON.parse(savedReviews);
//         setReviews(initialReviews);
//         calculateReviewStats(initialReviews);
//       } else {
//         setReviews([]);
//         calculateReviewStats([]);
//       }
//     } catch (error) {
//       console.error("Error fetching reviews:", error);
//       setReviews([]);
//       calculateReviewStats([]);
//     }
//   };

//   const calculateReviewStats = (reviewList: Review[]) => {
//     const total = reviewList.length;
//     const average =
//       reviewList.reduce((acc, rev) => acc + rev.rating, 0) / total || 0;
//     const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

//     reviewList.forEach((rev) => {
//       distribution[rev.rating as keyof typeof distribution]++;
//     });

//     setReviewStats({
//       total,
//       average: parseFloat(average.toFixed(1)),
//       distribution,
//     });
//   };

//   const saveReviewsToStorage = (reviewList: Review[]) => {
//     localStorage.setItem(`reviews_${product._id}`, JSON.stringify(reviewList));
//   };

//   // Handle button actions
//   const handleAddToCart = async () => {
//     if (!product || product.stock <= 0) return;

//     setActiveAction("cart");
//     setAddingToCart(true);

//     try {
//       const cartItem = {
//         id: product._id,
//         title: product.title,
//         price: product.offerPrice || product.normalPrice,
//         image: product.imageUrl,
//         quantity: quantity,
//         size: selectedSize,
//         color: selectedColor,
//         category: product.category,
//         normalPrice: product.normalPrice,
//         originalPrice: product.originalPrice,
//         offerPrice: product.offerPrice,
//         stock: product.stock,
//         selectedSize,
//         selectedColor,
//         variant: `${selectedColor}${selectedSize ? ` - ${selectedSize}` : ""}`,
//       };

//       await addToCart(cartItem);

//       setActionMessage({
//         type: "cart",
//         message: "Added to Cart!",
//         icon: <Check className="w-6 h-6" />,
//       });

//       setTimeout(() => {
//         setActionMessage(null);
//         setActiveAction("buy");
//       }, 1000);
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       setActionMessage({
//         type: "cart",
//         message: "Failed to add to cart",
//         icon: <X className="w-6 h-6" />,
//       });
//       setTimeout(() => setActionMessage(null), 2000);
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleWishlistToggle = async () => {
//     if (!product) return;

//     setActiveAction("love");

//     try {
//       if (isInWishlist(product._id)) {
//         await removeFromWishlist(product._id);
//         setActionMessage({
//           type: "love",
//           message: "Removed from Wishlist",
//           icon: <Heart className="w-6 h-6" />,
//         });
//       } else {
//         const wishlistItem = {
//           id: product._id,
//           title: product.title,
//           price: product.offerPrice || product.normalPrice,
//           imageUrl: product.imageUrl,
//           category: product.category,
//           normalPrice: product.normalPrice,
//           originalPrice: product.originalPrice,
//           offerPrice: product.offerPrice,
//           rating: product.rating,
//           stock: product.stock,
//           hasOffer: product.hasOffer,
//         };
//         await addToWishlist(wishlistItem);
//         setActionMessage({
//           type: "love",
//           message: "Added to Wishlist!",
//           icon: <Heart className="w-6 h-6 fill-current" />,
//         });
//       }

//       setTimeout(() => {
//         setActionMessage(null);
//         setActiveAction("buy");
//       }, 1000);
//     } catch (error) {
//       console.error("Error updating wishlist:", error);
//       setActionMessage({
//         type: "love",
//         message: "Failed to update wishlist",
//         icon: <X className="w-6 h-6" />,
//       });
//       setTimeout(() => setActionMessage(null), 2000);
//     }
//   };

//   const handleBuyNow = async () => {
//     if (!product || product.stock <= 0) return;

//     setActiveAction("buy");
//     setAddingToCart(true);
//     setIsRedirecting(true);

//     try {
//       const cartItem = {
//         id: product._id,
//         title: product.title,
//         price: product.offerPrice || product.normalPrice,
//         image: product.imageUrl,
//         quantity: quantity,
//         size: selectedSize,
//         color: selectedColor,
//         category: product.category,
//         normalPrice: product.normalPrice,
//         originalPrice: product.originalPrice,
//         offerPrice: product.offerPrice,
//         stock: product.stock,
//         selectedSize,
//         selectedColor,
//         variant: `${selectedColor}${selectedSize ? ` - ${selectedSize}` : ""}`,
//       };

//       await addToCart(cartItem);

//       setActionMessage({
//         type: "buy",
//         message: "Continue to Payment",
//         icon: <Check className="w-6 h-6" />,
//       });

//       setTimeout(() => {
//         router.push("/cart");
//       }, 1000);
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       setActionMessage({
//         type: "buy",
//         message: "Failed to add to cart",
//         icon: <X className="w-6 h-6" />,
//       });
//       setTimeout(() => {
//         setActionMessage(null);
//         setIsRedirecting(false);
//       }, 2000);
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   const handleQuantityChange = (delta: number) => {
//     if (!product) return;

//     const newQuantity = Math.max(
//       product.minOrder || 1,
//       Math.min(product.maxOrder || product.stock || 99, quantity + delta)
//     );
//     setQuantity(newQuantity);
//   };

//   const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
//     if (!showZoom || !product) return;

//     const { left, top, width, height } =
//       e.currentTarget.getBoundingClientRect();
//     const x = ((e.clientX - left) / width) * 100;
//     const y = ((e.clientY - top) / height) * 100;
//     setZoomPosition({ x, y });
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: product.title,
//         text: product.description,
//         url: window.location.href,
//       });
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       alert("Link copied to clipboard!");
//     }
//   };

//   const toggleReviewExpansion = (reviewId: string) => {
//     const newExpanded = new Set(expandedReviews);
//     if (newExpanded.has(reviewId)) {
//       newExpanded.delete(reviewId);
//     } else {
//       newExpanded.add(reviewId);
//     }
//     setExpandedReviews(newExpanded);
//   };

//   // Handle new review submission
//   const handleSubmitReview = async () => {
//     if (!newReview.comment.trim()) {
//       alert("Please write a review comment");
//       return;
//     }

//     if (!newReview.name.trim()) {
//       alert("Please enter your name");
//       return;
//     }

//     setSubmittingReview(true);

//     try {
//       const newReviewObj: Review = {
//         _id: `review_${Date.now()}`,
//         userId: currentUserId,
//         user: {
//           name: newReview.name,
//           avatar: `https://i.pravatar.cc/150?u=${currentUserId}`,
//         },
//         rating: newReview.rating,
//         comment: newReview.comment,
//         date: new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         helpful: 0,
//         notHelpful: 0,
//         verified: false,
//         createdAt: new Date().toISOString(),
//       };

//       const updatedReviews = [...reviews, newReviewObj];
//       setReviews(updatedReviews);
//       saveReviewsToStorage(updatedReviews);
//       calculateReviewStats(updatedReviews);

//       setNewReview({
//         rating: 5,
//         comment: "",
//         name: "",
//       });
//       setShowReviewForm(false);

//       alert("Thank you for your review! It has been submitted successfully.");

//       if (reviewsEndRef.current) {
//         reviewsEndRef.current.scrollIntoView({ behavior: "smooth" });
//       }
//     } catch (error) {
//       console.error("Error submitting review:", error);
//       alert("Failed to submit review. Please try again.");
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   // Handle review edit
//   const handleEditReview = (review: Review) => {
//     setEditingReview(review);
//     setNewReview({
//       rating: review.rating,
//       comment: review.comment,
//       name: review.user.name,
//     });
//     setShowReviewForm(true);
//   };

//   // Handle review update
//   const handleUpdateReview = async () => {
//     if (!editingReview || !newReview.comment.trim()) {
//       alert("Please write a review comment");
//       return;
//     }

//     if (!newReview.name.trim()) {
//       alert("Please enter your name");
//       return;
//     }

//     setSubmittingReview(true);

//     try {
//       const updatedReview: Review = {
//         ...editingReview,
//         user: {
//           ...editingReview.user,
//           name: newReview.name,
//         },
//         rating: newReview.rating,
//         comment: newReview.comment,
//         date: new Date().toLocaleDateString("en-US", {
//           year: "numeric",
//           month: "long",
//           day: "numeric",
//         }),
//         createdAt: new Date().toISOString(),
//       };

//       const updatedReviews = reviews.map((review) =>
//         review._id === editingReview._id ? updatedReview : review
//       );

//       setReviews(updatedReviews);
//       saveReviewsToStorage(updatedReviews);
//       calculateReviewStats(updatedReviews);

//       setEditingReview(null);
//       setNewReview({
//         rating: 5,
//         comment: "",
//         name: "",
//       });
//       setShowReviewForm(false);

//       alert("Your review has been updated successfully!");
//     } catch (error) {
//       console.error("Error updating review:", error);
//       alert("Failed to update review. Please try again.");
//     } finally {
//       setSubmittingReview(false);
//     }
//   };

//   // Handle review deletion
//   const handleDeleteReview = (reviewId: string) => {
//     if (!window.confirm("Are you sure you want to delete this review?")) {
//       return;
//     }

//     const updatedReviews = reviews.filter((review) => review._id !== reviewId);
//     setReviews(updatedReviews);
//     saveReviewsToStorage(updatedReviews);
//     calculateReviewStats(updatedReviews);

//     alert("Review deleted successfully!");
//   };

//   // Handle review helpful click
//   const handleHelpfulClick = (
//     reviewId: string,
//     type: "helpful" | "notHelpful"
//   ) => {
//     const updatedReviews = reviews.map((review) =>
//       review._id === reviewId
//         ? {
//             ...review,
//             [type]: review[type] + 1,
//           }
//         : review
//     );

//     setReviews(updatedReviews);
//     saveReviewsToStorage(updatedReviews);
//   };

//   // Cancel edit mode
//   const handleCancelEdit = () => {
//     setEditingReview(null);
//     setNewReview({
//       rating: 5,
//       comment: "",
//       name: "",
//     });
//     setShowReviewForm(false);
//   };

//   // Check if review belongs to current user
//   const isCurrentUserReview = (review: Review) => {
//     return review.userId === currentUserId;
//   };

//   // Calculate prices and discounts
//   const calculatePriceData = () => {
//     if (!product)
//       return {
//         currentPrice: 0,
//         originalPrice: 0,
//         discountPercentage: 0,
//         discountAmount: 0,
//         hasOffer: false,
//       };

//     let currentPrice = product.normalPrice;
//     let originalPrice = product.originalPrice || product.normalPrice;
//     let hasOffer = false;

//     if (product.salePrice && product.salePrice < product.normalPrice) {
//       currentPrice = product.salePrice;
//       originalPrice = product.normalPrice;
//       hasOffer = true;
//     } else if (product.offerPrice && product.offerPrice < product.normalPrice) {
//       currentPrice = product.offerPrice;
//       originalPrice = product.normalPrice;
//       hasOffer = true;
//     }

//     const discountPercentage =
//       hasOffer && originalPrice > 0
//         ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
//         : 0;

//     const discountAmount = hasOffer ? originalPrice - currentPrice : 0;

//     return {
//       currentPrice,
//       originalPrice,
//       discountPercentage,
//       discountAmount,
//       hasOffer,
//     };
//   };

//   const { currentPrice, originalPrice, discountPercentage, discountAmount } =
//     calculatePriceData();

//   const isWishlisted = product ? isInWishlist(product._id) : false;
//   const allImages = product
//     ? [product.imageUrl, ...product.additionalImages].filter(Boolean)
//     : [];
//   const isLowStock = product?.stock && product.stock > 0 && product.stock <= 10;
//   const isOutOfStock = product?.stock === 0;

//   const selectedSizeObj = product?.sizes?.find(
//     (s: any) => s.size === selectedSize
//   );
//   const sizeStock = selectedSizeObj?.stock || product?.stock || 0;

//   // Mobile navigation handler
//   const scrollToTab = (tabId: string) => {
//     setActiveTab(tabId);
//     setShowMobileMenu(false);
//     const tabElement = document.getElementById(tabId);
//     if (tabElement) {
//       tabElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   // Render active tab content
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "description":
//         return (
//           <div className="space-y-6">
//             <h3 className="text-2xl font-bold text-slate-900 mb-6">
//               Product Description
//             </h3>
//             <div className="space-y-4 text-slate-700">
//               <p>{product?.description}</p>

//               {/* Features */}
//               {product?.features && product.features.length > 0 && (
//                 <div className="mt-8">
//                   <h4 className="text-xl font-bold text-slate-900 mb-4">
//                     Key Features
//                   </h4>
//                   <ul className="space-y-3">
//                     {product.features.map((feature: string, index: number) => (
//                       <li key={index} className="flex items-start gap-3">
//                         <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
//                           <Check size={12} className="text-white" />
//                         </div>
//                         <span className="text-slate-700">{feature}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {/* Specifications */}
//               {product?.specifications &&
//                 Object.keys(product.specifications).length > 0 && (
//                   <div className="mt-8">
//                     <h4 className="text-xl font-bold text-slate-900 mb-4">
//                       Specifications
//                     </h4>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {Object.entries(product.specifications).map(
//                         ([key, value]: [string, any]) => (
//                           <div
//                             key={key}
//                             className="flex items-center justify-between py-2 border-b border-slate-200"
//                           >
//                             <span className="text-slate-600 capitalize">
//                               {key}
//                             </span>
//                             <span className="font-medium text-slate-900">
//                               {value}
//                             </span>
//                           </div>
//                         )
//                       )}
//                     </div>
//                   </div>
//                 )}
//             </div>
//           </div>
//         );

//       case "shipping":
//         return (
//           <div className="space-y-8">
//             <h3 className="text-2xl font-bold text-slate-900 mb-6">
//               Shipping & Returns
//             </h3>

//             <div className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
//                   <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg flex items-center justify-center mb-4">
//                     <TruckIcon size={24} className="text-white" />
//                   </div>
//                   <h5 className="font-bold text-slate-900 mb-2">
//                     Shipping Policy
//                   </h5>
//                   <ul className="space-y-2 text-sm text-slate-600">
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Free shipping on orders above ৳5000</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Standard delivery: 3-5 business days</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Express delivery available</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Cash on Delivery available</span>
//                     </li>
//                   </ul>
//                 </div>

//                 <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200">
//                   <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
//                     <Package size={24} className="text-white" />
//                   </div>
//                   <h5 className="font-bold text-slate-900 mb-2">
//                     Return Policy
//                   </h5>
//                   <ul className="space-y-2 text-sm text-slate-600">
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>30 days hassle-free return policy</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Free returns for defective items</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Items must be in original condition</span>
//                     </li>
//                     <li className="flex items-center gap-2">
//                       <Check size={14} className="text-emerald-600" />
//                       <span>Refund processed within 7 business days</span>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );

//       case "reviews":
//         return (
//           <div className="space-y-8">
//             {/* Reviews Header with Stats */}
//             <div className="flex flex-col md:flex-row justify-between items-start gap-6">
//               <div className="flex-1">
//                 <h3 className="text-2xl font-bold text-slate-900 mb-4">
//                   Customer Reviews
//                 </h3>

//                 {/* Overall Rating */}
//                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
//                   <div className="text-center">
//                     <div className="text-5xl font-bold text-slate-900 mb-1">
//                       {reviewStats.average.toFixed(1)}
//                     </div>
//                     <div className="flex items-center justify-center">
//                       {[...Array(5)].map((_, i) => (
//                         <StarIcon
//                           key={i}
//                           size={20}
//                           className={`${
//                             i < Math.floor(reviewStats.average)
//                               ? "text-amber-500 fill-amber-500"
//                               : i < reviewStats.average
//                               ? "text-amber-500 fill-amber-500"
//                               : "text-slate-300"
//                           }`}
//                         />
//                       ))}
//                     </div>
//                     <div className="text-slate-600 mt-2">
//                       {reviewStats.total} reviews
//                     </div>
//                   </div>

//                   {/* Rating Distribution */}
//                   <div className="flex-1 space-y-2 min-w-0">
//                     {[5, 4, 3, 2, 1].map((rating) => {
//                       const count =
//                         reviewStats.distribution[
//                           rating as keyof typeof reviewStats.distribution
//                         ];
//                       const percentage =
//                         reviewStats.total > 0
//                           ? (count / reviewStats.total) * 100
//                           : 0;

//                       return (
//                         <div key={rating} className="flex items-center gap-3">
//                           <div className="flex items-center gap-1 w-12">
//                             <span className="text-sm text-slate-600">
//                               {rating}
//                             </span>
//                             <StarIcon size={16} className="text-amber-500" />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
//                               <div
//                                 className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
//                                 style={{ width: `${percentage}%` }}
//                               />
//                             </div>
//                           </div>
//                           <span className="text-sm text-slate-600 w-8 text-right">
//                             {count}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>

//               {/* Add/Edit Review Button */}
//               <button
//                 onClick={() => {
//                   if (editingReview) {
//                     handleCancelEdit();
//                   } else {
//                     setShowReviewForm(!showReviewForm);
//                   }
//                 }}
//                 className={`px-4 sm:px-6 py-3 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 w-full md:w-auto ${
//                   editingReview
//                     ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
//                     : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
//                 }`}
//               >
//                 {editingReview ? (
//                   <>
//                     <XCircle size={20} />
//                     <span className="hidden sm:inline">Cancel Edit</span>
//                     <span className="sm:hidden">Cancel</span>
//                   </>
//                 ) : (
//                   <>
//                     <MessageSquare size={20} />
//                     {showReviewForm ? (
//                       <>
//                         <span className="hidden sm:inline">Cancel</span>
//                         <span className="sm:hidden">Cancel</span>
//                       </>
//                     ) : (
//                       <>
//                         <span className="hidden sm:inline">Write a Review</span>
//                         <span className="sm:hidden">Review</span>
//                       </>
//                     )}
//                   </>
//                 )}
//               </button>
//             </div>

//             {/* Add/Edit Review Form */}
//             {(showReviewForm || editingReview) && (
//               <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-6">
//                 <h4 className="text-xl font-bold text-slate-900">
//                   {editingReview ? "Edit Your Review" : "Write Your Review"}
//                 </h4>

//                 {/* Rating Selection */}
//                 <div>
//                   <label className="block text-slate-700 mb-3">
//                     Your Rating
//                   </label>
//                   <div className="flex gap-2">
//                     {[1, 2, 3, 4, 5].map((rating) => (
//                       <button
//                         key={rating}
//                         type="button"
//                         onClick={() => setNewReview({ ...newReview, rating })}
//                         className="focus:outline-none transform hover:scale-110 transition-transform"
//                       >
//                         <StarIcon
//                           size={isMobile ? 28 : 32}
//                           className={`${
//                             rating <= newReview.rating
//                               ? "text-amber-500 fill-amber-500"
//                               : "text-slate-300"
//                           }`}
//                         />
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Name Input */}
//                 <div>
//                   <label className="block text-slate-700 mb-2">Your Name</label>
//                   <input
//                     type="text"
//                     value={newReview.name}
//                     onChange={(e) =>
//                       setNewReview({ ...newReview, name: e.target.value })
//                     }
//                     placeholder="Enter your name"
//                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   />
//                 </div>

//                 {/* Review Text */}
//                 <div>
//                   <label className="block text-slate-700 mb-2">
//                     Your Review
//                   </label>
//                   <textarea
//                     value={newReview.comment}
//                     onChange={(e) =>
//                       setNewReview({ ...newReview, comment: e.target.value })
//                     }
//                     placeholder="Share your experience with this product..."
//                     rows={4}
//                     className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                   />
//                   <p className="text-sm text-slate-500 mt-2">
//                     Please provide detailed feedback about your experience with
//                     this product.
//                   </p>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex flex-col sm:flex-row justify-end gap-3">
//                   <button
//                     onClick={handleCancelEdit}
//                     className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors w-full sm:w-auto"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={
//                       editingReview ? handleUpdateReview : handleSubmitReview
//                     }
//                     disabled={
//                       submittingReview ||
//                       !newReview.comment.trim() ||
//                       !newReview.name.trim()
//                     }
//                     className={`px-8 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
//                       submittingReview ||
//                       !newReview.comment.trim() ||
//                       !newReview.name.trim()
//                         ? "bg-slate-300 text-slate-500 cursor-not-allowed"
//                         : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-xl"
//                     }`}
//                   >
//                     {submittingReview ? (
//                       <>
//                         <RefreshCw size={20} className="animate-spin" />
//                         {editingReview ? "Updating..." : "Submitting..."}
//                       </>
//                     ) : (
//                       <>
//                         {editingReview ? (
//                           <Save size={20} />
//                         ) : (
//                           <Send size={20} />
//                         )}
//                         {editingReview ? "Update Review" : "Submit Review"}
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Reviews List */}
//             <div className="space-y-6">
//               {reviews.length > 0 ? (
//                 reviews.map((review) => {
//                   const isExpanded = expandedReviews.has(review._id);
//                   const shouldTruncate = review.comment.length > 200;
//                   const isUserReview = isCurrentUserReview(review);

//                   return (
//                     <div
//                       key={review._id}
//                       className="bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-6 relative"
//                     >
//                       {/* User Actions (Edit/Delete) */}
//                       {isUserReview && (
//                         <div className="absolute top-4 right-4 flex gap-2">
//                           <button
//                             onClick={() => handleEditReview(review)}
//                             className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
//                             title="Edit review"
//                           >
//                             <Edit size={16} />
//                           </button>
//                           <button
//                             onClick={() => handleDeleteReview(review._id)}
//                             className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                             title="Delete review"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       )}

//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex items-start gap-3">
//                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
//                             <img
//                               src={
//                                 review.user.avatar ||
//                                 `https://i.pravatar.cc/150?u=${review.userId}`
//                               }
//                               alt={review.user.name}
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                           <div className="min-w-0">
//                             <div className="font-bold text-slate-900 flex items-center gap-2 truncate">
//                               {review.user.name}
//                               {isUserReview && (
//                                 <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex-shrink-0">
//                                   You
//                                 </span>
//                               )}
//                             </div>
//                             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-slate-600 mt-1">
//                               <div className="flex items-center gap-1">
//                                 <div className="flex">
//                                   {[...Array(5)].map((_, i) => (
//                                     <StarIcon
//                                       key={i}
//                                       size={14}
//                                       className={`${
//                                         i < review.rating
//                                           ? "text-amber-500 fill-amber-500"
//                                           : "text-slate-300"
//                                       }`}
//                                     />
//                                   ))}
//                                 </div>
//                                 <span className="ml-1">{review.rating}.0</span>
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <Calendar size={12} />
//                                 <span>{review.date}</span>
//                               </div>
//                               {review.verified && (
//                                 <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full w-fit">
//                                   <Check size={10} />
//                                   <span>Verified Purchase</span>
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="mb-4">
//                         <p
//                           className={`text-slate-700 leading-relaxed ${
//                             !isExpanded && shouldTruncate ? "line-clamp-3" : ""
//                           }`}
//                         >
//                           {review.comment}
//                         </p>
//                         {shouldTruncate && (
//                           <button
//                             onClick={() => toggleReviewExpansion(review._id)}
//                             className="text-amber-600 hover:text-amber-700 font-medium text-sm mt-2 flex items-center gap-1"
//                           >
//                             {isExpanded ? (
//                               <>
//                                 Show Less <ChevronUp size={16} />
//                               </>
//                             ) : (
//                               <>
//                                 Read More <ChevronDown size={16} />
//                               </>
//                             )}
//                           </button>
//                         )}
//                       </div>

//                       {/* Review Images */}
//                       {review.images && review.images.length > 0 && (
//                         <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
//                           {review.images.map((img, idx) => (
//                             <div
//                               key={idx}
//                               className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 cursor-pointer flex-shrink-0"
//                               onClick={() => window.open(img, "_blank")}
//                             >
//                               <img
//                                 src={img}
//                                 alt={`Review image ${idx + 1}`}
//                                 className="w-full h-full object-cover hover:scale-110 transition-transform"
//                               />
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       {/* Helpful Actions */}
//                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-slate-100 gap-3 sm:gap-0">
//                         <div className="flex items-center gap-4">
//                           <button
//                             onClick={() =>
//                               handleHelpfulClick(review._id, "helpful")
//                             }
//                             className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
//                           >
//                             <ThumbsUp size={16} />
//                             <span>Helpful ({review.helpful})</span>
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleHelpfulClick(review._id, "notHelpful")
//                             }
//                             className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors"
//                           >
//                             <ThumbsDown size={16} />
//                             <span>Not Helpful ({review.notHelpful})</span>
//                           </button>
//                         </div>
//                         {isUserReview && (
//                           <div className="text-xs text-slate-500">
//                             Your review
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })
//               ) : (
//                 <div className="text-center py-12 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200">
//                   <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//                   <h4 className="text-xl font-bold text-slate-900 mb-2">
//                     No Reviews Yet
//                   </h4>
//                   <p className="text-slate-600 mb-6 max-w-md mx-auto px-4">
//                     Be the first to share your thoughts about this product!
//                   </p>
//                   <button
//                     onClick={() => setShowReviewForm(true)}
//                     className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
//                   >
//                     <MessageSquare size={20} />
//                     Write the First Review
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Reference for scrolling */}
//             <div ref={reviewsEndRef} />
//           </div>
//         );

//       case "related":
//         return (
//           <div className="space-y-8">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <h3 className="text-2xl font-bold text-slate-900">
//                 Related Products
//               </h3>
//               <Link
//                 href={`/products?category=${product?.category}`}
//                 className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
//               >
//                 View All
//                 <ChevronRightIcon size={16} />
//               </Link>
//             </div>

//             {loadingRelated ? (
//               <div className="flex justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-2 border-amber-500 border-t-transparent" />
//               </div>
//             ) : relatedProducts.length > 0 ? (
//               <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
//                 {relatedProducts.map((relatedProduct) => (
//                   <ProductCard
//                     key={relatedProduct._id}
//                     product={relatedProduct}
//                     viewMode="grid"
//                     showQuickView={false}
//                   />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-12">
//                 <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
//                 <p className="text-slate-600">No related products found</p>
//               </div>
//             )}
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
//         <div className="text-center space-y-4">
//           <div className="relative">
//             <div className="animate-spin h-16 w-16 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
//             <Package className="absolute inset-0 m-auto h-8 w-8 text-amber-600" />
//           </div>
//           <p className="text-slate-600 font-medium">
//             Loading product details...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-4 py-8">
//         <div className="text-center max-w-md">
//           <div className="relative mb-6">
//             <Package className="w-20 h-20 text-slate-400 mx-auto mb-4" />
//             <div className="absolute -top-2 -right-2">
//               <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
//                 <Hash className="w-4 h-4 text-white" />
//               </div>
//             </div>
//           </div>
//           <h1 className="text-2xl font-bold mb-4 text-slate-900">
//             Product Not Found
//           </h1>
//           <p className="text-slate-600 mb-6">
//             The product with ID{" "}
//             <code className="bg-slate-100 px-2 py-1 rounded-lg font-mono break-all">
//               {id}
//             </code>{" "}
//             was not found.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/all-collections"
//               className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/25 transition-all"
//             >
//               <ArrowLeft size={18} />
//               Browse Products
//             </Link>
//             <Link
//               href="/"
//               className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-all"
//             >
//               Go Home
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
//       {/* Action Success Message Popup - Responsive */}
//       {actionMessage && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//           <div className="animate-in fade-in zoom-in duration-300 w-full max-w-sm">
//             <div
//               className={`px-6 py-5 sm:px-8 sm:py-6 rounded-2xl shadow-2xl backdrop-blur-sm ${
//                 actionMessage.type === "cart"
//                   ? "bg-gradient-to-r from-emerald-700 to-emerald-500"
//                   : actionMessage.type === "love"
//                   ? "bg-gradient-to-r from-rose-500 to-rose-600"
//                   : "bg-gradient-to-r from-amber-500 to-amber-600"
//               } text-white`}
//             >
//               <div className="flex items-center gap-4">
//                 <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
//                   {actionMessage.icon}
//                 </div>
//                 <div className="min-w-0">
//                   <p className="text-lg sm:text-2xl font-bold truncate">
//                     {actionMessage.message}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Zoom Viewer Modal - Responsive */}
//       {zoomViewer && (
//         <div className="fixed inset-0 z-40 bg-black/90 flex items-center justify-center p-2 sm:p-4">
//           <div className="relative max-w-6xl w-full">
//             <button
//               onClick={() => setZoomViewer(false)}
//               className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-amber-400 transition-colors"
//             >
//               <X size={24} />
//             </button>
//             <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden">
//               <img
//                 src={allImages[currentImage]}
//                 alt={product.title}
//                 className="w-full h-full object-contain"
//                 onError={(e) => {
//                   e.currentTarget.src =
//                     "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
//                 }}
//               />
//             </div>
//             {allImages.length > 1 && (
//               <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6 overflow-x-auto pb-2">
//                 {allImages.map((img: string, index: number) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentImage(index)}
//                     className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
//                       currentImage === index
//                         ? "border-amber-500"
//                         : "border-white/30 hover:border-white/60"
//                     }`}
//                   >
//                     <img
//                       src={img}
//                       alt={`${product.title} ${index + 1}`}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.currentTarget.src =
//                           "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop";
//                       }}
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
//         {/* Breadcrumb */}
//         <div className="mb-4 sm:mb-6">
//           <Link
//             href="/all-collections"
//             className="inline-flex items-center gap-2 text-slate-600 hover:text-amber-600 transition-colors text-sm sm:text-base"
//           >
//             <ArrowLeft size={18} />
//             <span className="truncate">Back to Products</span>
//           </Link>
//         </div>

//         {/* Main Product Grid - Responsive */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
//           {/* Left Column: Images with Zoom */}
//           <div className="space-y-4 sm:space-y-6">
//             {/* Main Image with Zoom */}
//             <div
//               className="relative group aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 cursor-crosshair"
//               onMouseEnter={() => setShowZoom(true)}
//               onMouseLeave={() => setShowZoom(false)}
//               onMouseMove={handleMouseMove}
//               onClick={() => setZoomViewer(true)}
//             >
//               <img
//                 src={allImages[currentImage]}
//                 alt={product.title}
//                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                 onError={(e) => {
//                   e.currentTarget.src =
//                     "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800&h=800&fit=crop";
//                   e.currentTarget.onerror = null;
//                 }}
//               />

//               {/* Zoom Lens - Only on desktop */}
//               {!isMobile && showZoom && (
//                 <div className="absolute inset-0 overflow-hidden">
//                   <div
//                     className="absolute w-full h-full bg-no-repeat"
//                     style={{
//                       backgroundImage: `url(${allImages[currentImage]})`,
//                       backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
//                       backgroundSize: "200%",
//                       transform: "scale(1.5)",
//                     }}
//                   />
//                 </div>
//               )}

//               {/* Share Button */}
//               <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
//                 <button
//                   onClick={handleShare}
//                   className="p-2 sm:p-3 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"
//                   title="Share this product"
//                 >
//                   <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
//                 </button>
//               </div>

//               {/* Product Badges */}
//               <div className="absolute top-3 sm:top-4 left-3 sm:left-4 z-10 flex flex-col gap-2">
//                 {product.hasOffer && discountPercentage > 0 && (
//                   <div className="relative">
//                     <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full blur-sm"></div>
//                     <div className="relative px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-bold rounded-full shadow-lg text-xs sm:text-sm">
//                       <div className="flex items-center gap-1 sm:gap-2">
//                         <Percent size={12} className="sm:w-4 sm:h-4" />
//                         {discountPercentage}% OFF
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {product.isNew && (
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full shadow-lg backdrop-blur-sm text-xs sm:text-sm">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <Sparkles size={12} className="sm:w-4 sm:h-4" />
//                       NEW
//                     </div>
//                   </div>
//                 )}

//                 {product.isBestSelling && (
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-full shadow-lg backdrop-blur-sm text-xs sm:text-sm">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <TrendingUp size={12} className="sm:w-4 sm:h-4" />
//                       BEST
//                     </div>
//                   </div>
//                 )}

//                 {product.featured && (
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-full shadow-lg backdrop-blur-sm text-xs sm:text-sm">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <Sparkles size={12} className="sm:w-4 sm:h-4" />
//                       FEATURED
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Image Counter */}
//               {allImages.length > 1 && (
//                 <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 z-10">
//                   <div className="px-2 py-1.5 sm:px-3 sm:py-2 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-medium rounded-full">
//                     {currentImage + 1} / {allImages.length}
//                   </div>
//                 </div>
//               )}

//               {/* Stock Status */}
//               {isOutOfStock && (
//                 <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-10">
//                   <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-lg backdrop-blur-sm">
//                     <div className="flex items-center gap-1 sm:gap-2">
//                       <Package size={12} className="sm:w-4 sm:h-4" />
//                       <span>Out of Stock</span>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Image Thumbnails - Responsive */}
//             {allImages.length > 1 && (
//               <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
//                 {allImages.slice(0, isMobile ? 4 : 5).map((img: string, index: number) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentImage(index)}
//                     className={`aspect-square rounded-lg sm:rounded-xl overflow-hidden border-2 transition-all duration-300 ${
//                       currentImage === index
//                         ? "border-amber-500 shadow-lg shadow-amber-500/25 scale-105"
//                         : "border-slate-200 hover:border-amber-300 hover:scale-105"
//                     }`}
//                   >
//                     <img
//                       src={img}
//                       alt={`${product.title} ${index + 1}`}
//                       className="w-full h-full object-cover"
//                       onError={(e) => {
//                         e.currentTarget.src =
//                           "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop";
//                         e.currentTarget.onerror = null;
//                       }}
//                     />
//                     {currentImage === index && (
//                       <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
//                         <div className="w-4 h-4 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center">
//                           <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
//                         </div>
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Right Column: Details */}
//           <div className="space-y-6 sm:space-y-8">
//             {/* Title and Actions */}
//             <div className="flex items-start justify-between gap-4">
//               <div className="min-w-0 flex-1">
//                 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3 break-words">
//                   {product.title}
//                 </h1>

//                 {/* SKU and Views */}
//                 <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4 text-sm text-slate-500 mb-4">
//                   {product.sku && (
//                     <div className="flex items-center gap-2">
//                       <Hash size={14} />
//                       <span className="font-mono truncate">{product.sku}</span>
//                     </div>
//                   )}
//                   {product.views > 0 && (
//                     <div className="flex items-center gap-2">
//                       <Eye size={14} />
//                       <span>{product.views.toLocaleString()} views</span>
//                     </div>
//                   )}
//                   {product.sold > 0 && (
//                     <div className="flex items-center gap-2">
//                       <ShoppingCart size={14} />
//                       <span>{product.sold.toLocaleString()} sold</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleShare}
//                   className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:text-blue-600 hover:border-blue-200 hover:scale-105 hover:shadow-lg transition-all duration-300"
//                   title="Share"
//                 >
//                   <Share2 size={isMobile ? 18 : 20} />
//                 </button>
//               </div>
//             </div>

//             {/* Rating */}
//             {product.rating > 0 && (
//               <div className="flex flex-col xs:flex-row xs:items-center gap-3">
//                 <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-amber-200 w-fit">
//                   <div className="flex">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         size={isMobile ? 14 : 16}
//                         className={`${
//                           i < Math.floor(product.rating)
//                             ? "text-amber-500 fill-amber-500"
//                             : "text-slate-300"
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="font-bold text-slate-900">
//                     {product.rating.toFixed(1)}
//                   </span>
//                 </div>
//                 <span className="text-slate-600">
//                   ({product.reviewCount || 0} reviews)
//                 </span>
//               </div>
//             )}

//             {/* Price Section */}
//             <div className="space-y-3 sm:space-y-4">
//               <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
//                 <span className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
//                   ৳{currentPrice.toLocaleString()}
//                 </span>

//                 {product.hasOffer && discountPercentage > 0 && (
//                   <>
//                     <span className="text-xl sm:text-2xl text-slate-400 line-through">
//                       ৳{originalPrice.toLocaleString()}
//                     </span>
//                     <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full text-sm sm:text-base">
//                       Save {discountPercentage}%
//                     </div>
//                   </>
//                 )}
//               </div>

//               {/* Price Summary */}
//               {product.hasOffer && currentPrice < originalPrice && (
//                 <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-xs sm:text-sm text-slate-600">
//                         You Save
//                       </p>
//                       <div className="flex items-center gap-2 sm:gap-3 mt-1">
//                         <span className="text-base sm:text-lg font-bold text-slate-800">
//                           ৳{discountAmount.toLocaleString()}
//                         </span>
//                         <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
//                           {discountPercentage}% OFF
//                         </span>
//                       </div>
//                     </div>
//                     <BadgePercent className="text-green-500" size={isMobile ? 20 : 24} />
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Description */}
//             {product.description && (
//               <div className="text-slate-600 leading-relaxed text-sm sm:text-base">
//                 {product.description}
//               </div>
//             )}

//             {/* Size Selection */}
//             {product.sizes && product.sizes.length > 0 && (
//               <div className="space-y-2 sm:space-y-3">
//                 <div className="flex items-center justify-between">
//                   <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
//                     <Ruler size={isMobile ? 16 : 18} />
//                     Select Size
//                   </h3>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {product.sizes.map((size: ProductSize, index: number) => {
//                     const isAvailable = size.stock > 0;
//                     const isSelected = selectedSize === size.size;

//                     return (
//                       <button
//                         key={index}
//                         onClick={() => setSelectedSize(size.size)}
//                         disabled={!isAvailable}
//                         className={`px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-300 text-sm sm:text-base ${
//                           isSelected
//                             ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 scale-105"
//                             : isAvailable
//                             ? "bg-gradient-to-b from-slate-50 to-white border border-slate-300 text-slate-700 hover:border-amber-400 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-700"
//                             : "bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 text-slate-400 cursor-not-allowed opacity-50"
//                         }`}
//                       >
//                         {size.size}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {/* Quantity */}
//             <div className="space-y-2 sm:space-y-3">
//               <h3 className="font-bold text-slate-900 text-sm sm:text-base">
//                 Quantity
//               </h3>

//               <div
//                 className="flex items-center w-fit
//     bg-gradient-to-b from-slate-50 to-white
//     rounded-xl sm:rounded-2xl border border-slate-300 overflow-hidden shadow-sm"
//               >
//                 <button
//                   onClick={() => handleQuantityChange(-1)}
//                   disabled={quantity <= (product.minOrder || 1)}
//                   className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
//         text-2xl sm:text-3xl font-bold text-slate-700
//         hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200
//         active:scale-95
//         disabled:opacity-30 disabled:cursor-not-allowed
//         transition-all duration-300"
//                 >
//                   −
//                 </button>

//                 <div className="w-16 h-12 sm:w-20 sm:h-16 flex items-center justify-center">
//                   <span className="text-2xl sm:text-3xl font-bold text-slate-900">
//                     {quantity}
//                   </span>
//                 </div>

//                 <button
//                   onClick={() => handleQuantityChange(1)}
//                   disabled={quantity >= (product.maxOrder || sizeStock || 99)}
//                   className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center
//         text-2xl sm:text-3xl font-bold text-slate-700
//         hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200
//         active:scale-95
//         disabled:opacity-30 disabled:cursor-not-allowed
//         transition-all duration-300"
//                 >
//                   +
//                 </button>
//               </div>

//               <p className="text-xs sm:text-sm text-slate-500">
//                 Min: {product.minOrder || 1} | Max:{" "}
//                 {product.maxOrder || sizeStock || 99}
//               </p>
//             </div>

//             {/* Action Buttons - Responsive Stack */}
//             <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
//               {/* Add to Cart Button */}
//               <button
//                 onClick={handleAddToCart}
//                 onMouseEnter={() => setActiveAction("cart")}
//                 onMouseLeave={() => setActiveAction("buy")}
//                 disabled={product.stock <= 0 || addingToCart}
//                 className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
//       transition-all duration-300 active:scale-[0.98]
//       disabled:opacity-50 disabled:cursor-not-allowed
//       ${
//         activeAction === "cart"
//           ? "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg"
//           : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
//       }`}
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   {addingToCart && activeAction === "cart" ? (
//                     <RefreshCw size={isMobile ? 18 : 20} className="animate-spin" />
//                   ) : (
//                     <>
//                       <ShoppingCart
//                         size={isMobile ? 18 : 20}
//                         className={
//                           activeAction === "cart"
//                             ? "text-white"
//                             : "text-slate-700"
//                         }
//                       />
//                       <span
//                         className={
//                           activeAction === "cart"
//                             ? "text-white"
//                             : "text-slate-800"
//                         }
//                       >
//                         {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
//                       </span>
//                     </>
//                   )}
//                 </div>
//               </button>

//               {/* Love This Button (Wishlist) */}
//               <button
//                 onClick={handleWishlistToggle}
//                 onMouseEnter={() => setActiveAction("love")}
//                 onMouseLeave={() => setActiveAction("buy")}
//                 className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
//       transition-all duration-300 active:scale-[0.98]
//       ${
//         activeAction === "love"
//           ? isWishlisted
//             ? "bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg"
//             : "bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg"
//           : isWishlisted
//           ? "bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-50"
//           : "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50"
//       }`}
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   <Heart
//                     size={isMobile ? 18 : 20}
//                     className={
//                       activeAction === "love"
//                         ? isWishlisted
//                           ? "fill-white"
//                           : "text-white"
//                         : isWishlisted
//                         ? "fill-rose-600 text-rose-600"
//                         : "text-slate-700"
//                     }
//                   />
//                   <span
//                     className={
//                       activeAction === "love"
//                         ? "text-white"
//                         : isWishlisted
//                         ? "text-rose-700"
//                         : "text-slate-800"
//                     }
//                   >
//                     {isWishlisted ? "Liked" : "Like"}
//                   </span>
//                 </div>
//               </button>

//               {/* Buy Now Button */}
//               <button
//                 onClick={handleBuyNow}
//                 onMouseEnter={() => setActiveAction("buy")}
//                 disabled={product.stock <= 0 || isRedirecting}
//                 className={`flex-1 py-3 sm:py-4 md:py-5 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold
//       transition-all duration-300 active:scale-[0.98]
//       disabled:opacity-50 disabled:cursor-not-allowed
//       ${
//         activeAction === "buy"
//           ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg"
//           : "bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:shadow-xl"
//       }`}
//               >
//                 <div className="flex items-center justify-center gap-2">
//                   {isRedirecting ? (
//                     <RefreshCw size={isMobile ? 18 : 20} className="animate-spin" />
//                   ) : (
//                     <>
//                       <Zap size={isMobile ? 18 : 20} />
//                       <span>Buy Now</span>
//                     </>
//                   )}
//                 </div>
//               </button>
//             </div>

//             {/* Product Tags */}
//             {product.tags && product.tags.length > 0 && (
//               <div className="pt-4 sm:pt-6 border-t border-slate-200">
//                 <h3 className="font-bold text-slate-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
//                   <Tag size={isMobile ? 14 : 16} />
//                   Product Tags
//                 </h3>
//                 <div className="flex flex-wrap gap-2">
//                   {product.tags.map((tag: string, index: number) => (
//                     <span
//                       key={index}
//                       className="px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-b from-slate-50 to-white text-slate-700 rounded-lg text-xs sm:text-sm font-medium border border-slate-200"
//                     >
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Trust Badges - Responsive Grid */}
//             <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-200">
//               <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-b from-slate-50 to-white rounded-lg sm:rounded-xl border border-slate-200">
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <Truck size={isMobile ? 16 : 20} className="text-white" />
//                 </div>
//                 <div className="min-w-0">
//                   <p className="font-bold text-slate-900 text-sm sm:text-base">
//                     Free Delivery
//                   </p>
//                   <p className="text-xs text-slate-500 truncate">
//                     {product.shippingInfo}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-b from-slate-50 to-white rounded-lg sm:rounded-xl border border-slate-200">
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
//                   <RotateCcw size={isMobile ? 16 : 20} className="text-white" />
//                 </div>
//                 <div className="min-w-0">
//                   <p className="font-bold text-slate-900 text-sm sm:text-base">
//                     Easy Returns
//                   </p>
//                   <p className="text-xs text-slate-500 truncate">
//                     {product.returnPolicy}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Mobile Navigation Menu */}
//         {isMobile && (
//           <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 py-2 px-4">
//             <div className="flex items-center justify-between">
//               <button
//                 onClick={() => scrollToTab("description")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "description"
//                     ? "text-amber-600"
//                     : "text-slate-600"
//                 }`}
//               >
//                 <List size={20} />
//                 <span className="text-xs">Details</span>
//               </button>
//               <button
//                 onClick={() => scrollToTab("shipping")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "shipping" ? "text-amber-600" : "text-slate-600"
//                 }`}
//               >
//                 <Truck size={20} />
//                 <span className="text-xs">Shipping</span>
//               </button>
//               <button
//                 onClick={() => scrollToTab("reviews")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "reviews" ? "text-amber-600" : "text-slate-600"
//                 }`}
//               >
//                 <MessageSquare size={20} />
//                 <span className="text-xs">Reviews</span>
//               </button>
//               <button
//                 onClick={() => scrollToTab("related")}
//                 className={`flex flex-col items-center gap-1 p-2 ${
//                   activeTab === "related" ? "text-amber-600" : "text-slate-600"
//                 }`}
//               >
//                 <Grid size={20} />
//                 <span className="text-xs">Related</span>
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Product Details Tabs - Desktop Only */}
//         {!isMobile && (
//           <div className="mb-8 sm:mb-12">
//             <div className="flex flex-wrap border-b border-slate-200 mb-6 sm:mb-8 overflow-x-auto">
//               {[
//                 { id: "description", label: "Description", icon: null },
//                 {
//                   id: "shipping",
//                   label: "Shipping & Returns",
//                   icon: <Truck size={16} />,
//                 },
//                 {
//                   id: "reviews",
//                   label: `Reviews (${reviewStats.total})`,
//                   icon: <MessageSquare size={16} />,
//                 },
//                 {
//                   id: "related",
//                   label: "Related Products",
//                   icon: <Package size={16} />,
//                 },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
//                     activeTab === tab.id
//                       ? "text-amber-600 border-b-2 border-amber-600"
//                       : "text-slate-500 hover:text-slate-700"
//                   }`}
//                 >
//                   {tab.icon}
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-slate-50 rounded-xl sm:rounded-2xl border border-slate-200">
//               {renderTabContent()}
//             </div>
//           </div>
//         )}

//         {/* Mobile Tab Content - Separate Sections */}
//         {isMobile && (
//           <div className="space-y-8 mb-20">
//             <section id="description" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {renderTabContent()}
//               </div>
//             </section>

//             <section id="shipping" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {activeTab === "shipping" && renderTabContent()}
//               </div>
//             </section>

//             <section id="reviews" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {activeTab === "reviews" && renderTabContent()}
//               </div>
//             </section>

//             <section id="related" className="scroll-mt-4">
//               <div className="p-4 bg-gradient-to-b from-white to-slate-50 rounded-xl border border-slate-200">
//                 {activeTab === "related" && renderTabContent()}
//               </div>
//             </section>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
