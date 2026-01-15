// // admin/src/app/products/form.tsx

// admin/src/app/products/form.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Tag,
  Image as ImageIcon,
  Layers,
  TrendingUp,
  Sparkles,
  X,
  Upload,
  DollarSign,
  Package,
  AlertCircle,
  Plus,
  Trash2,
  Percent,
  BadgePercent,
} from "lucide-react";
import Link from "next/link";
import { checkAuthAndRedirect, getAuthToken } from "../../../utils/auth";

const categories = ["regular-panjabi", "premium-panjabi", "luxury-panjabi"];

interface SizeStock {
  size: string;
  stock: number;
}

interface ProductForm {
  title: string;
  description: string;
  category: string;
  normalPrice: number;
  offerPrice: number;
  image?: File | null;
  additionalImages: File[];
  sizes: SizeStock[];
  tags: string[];
  featured: boolean;
  isBestSelling: boolean;
  isNew: boolean;
  hasOffer: boolean;
  stock: number;
  status: string;
}

// ==================== UTILITY FUNCTIONS ====================

// Get API URL with fallback - IMPROVED VERSION
const getApiBaseUrl = (): string => {
  // Check environment variable first
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // Ensure URL has protocol
    if (!envUrl.startsWith('http')) {
      // Determine protocol based on environment
      const isProduction = typeof window !== 'undefined' ? 
        !window.location.hostname.includes('localhost') : 
        process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        console.log('🚀 Production mode detected, using HTTPS');
        return `https://${envUrl}`;
      } else {
        console.log('🌐 Development mode detected, using HTTP');
        return `http://${envUrl}`;
      }
    }
    return envUrl;
  }
  
  // No environment variable, detect based on current location
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
    
    if (isLocalhost) {
      console.log('🌐 Local development: Using http://localhost:4000');
      return 'http://localhost:4000';
    } else {
      console.log('🚀 Production: Using https://taskin-panjabi-server.onrender.com');
      return 'https://taskin-panjabi-server.onrender.com';
    }
  }
  
  // Fallback for server-side rendering
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using default: http://localhost:4000');
  return 'http://localhost:4000';
};

// Get API URL for requests
const getApiUrl = (): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
};

// Convert relative image path to full URL - FIXED VERSION
const getFullImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath || imagePath === "undefined" || imagePath === "null") {
    // Return a placeholder image
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
  }
  
  // Already a full URL (http, https, data, or blob URLs)
  if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // Handle "undefined" in path
  if (imagePath.includes('undefined')) {
    console.error('Found "undefined" in image path:', imagePath);
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
  }
  
  // Convert relative path to full URL
  const baseUrl = getApiBaseUrl();
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  // Handle different path formats
  if (imagePath.startsWith('uploads/') || imagePath.includes('/uploads/')) {
    return `${baseUrl}/${cleanPath}`;
  }
  
  // If it's just a filename, assume it's in uploads folder
  return `${baseUrl}/uploads/${cleanPath}`;
};

// ==================== MAIN COMPONENT ====================

export default function ProductFormPage({ productId }: { productId?: string }) {
  const [form, setForm] = useState<ProductForm>({
    title: "",
    description: "",
    category: categories[0],
    normalPrice: 0,
    offerPrice: 0,
    image: null,
    additionalImages: [],
    sizes: [{ size: "M", stock: 10 }],
    tags: [],
    featured: false,
    isBestSelling: false,
    isNew: false,
    hasOffer: false,
    stock: 10,
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
  const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [additionalImageErrors, setAdditionalImageErrors] = useState<string[]>([]);
  const [offerPercentage, setOfferPercentage] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [keepExistingImage, setKeepExistingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!checkAuthAndRedirect(router)) {
      toast.error("Please login first");
      return;
    }
  }, [router]);

  // Calculate offer percentage when normalPrice or offerPrice changes
  useEffect(() => {
    if (form.normalPrice > 0 && form.offerPrice > 0 && form.offerPrice < form.normalPrice) {
      const percentage = ((form.normalPrice - form.offerPrice) / form.normalPrice) * 100;
      setOfferPercentage(Math.round(percentage));
      setForm(prev => ({ ...prev, hasOffer: true }));
    } else {
      setOfferPercentage(0);
      setForm(prev => ({ ...prev, hasOffer: false }));
    }
  }, [form.normalPrice, form.offerPrice]);

  // Fetch product for editing
  useEffect(() => {
    if (!productId) return;

    const token = getAuthToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const apiUrl = getApiUrl();
        console.log("🌐 Fetching product from:", `${apiUrl}/products/${productId}`);
        console.log("📱 Current environment:", typeof window !== 'undefined' ? window.location.hostname : 'server-side');

        const response = await fetch(`${apiUrl}/products/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const productData = data.data || data;
        console.log("✅ Fetched product data:", productData);

        // Calculate prices
        const normalPrice = productData.normalPrice || 0;
        const salePrice = productData.salePrice || productData.offerPrice || normalPrice;
        const hasOffer = salePrice < normalPrice;

        // Parse sizes
        let sizesData = [{ size: "M", stock: 10 }];
        if (productData.variants && Array.isArray(productData.variants)) {
          // New model with variants
          sizesData = productData.variants.map((v: any) => ({
            size: v.size || "M",
            stock: v.stockQuantity || v.stock || 0
          }));
        } else if (productData.sizes) {
          // Old model with sizes field
          try {
            if (typeof productData.sizes === 'string') {
              sizesData = JSON.parse(productData.sizes);
            } else if (Array.isArray(productData.sizes)) {
              sizesData = productData.sizes;
            }
          } catch (e) {
            console.error("Error parsing sizes:", e);
          }
        }

        // Parse tags
        let tagsData = [];
        if (productData.tags) {
          try {
            if (typeof productData.tags === 'string') {
              tagsData = JSON.parse(productData.tags);
            } else if (Array.isArray(productData.tags)) {
              tagsData = productData.tags;
            }
          } catch (e) {
            console.error("Error parsing tags:", e);
            tagsData = [];
          }
        }

        // Filter out null/empty tags
        tagsData = tagsData.filter((tag: any) => tag != null && String(tag).trim() !== "");

        // Set form state
        setForm({
          title: productData.title || "",
          description: productData.description || "",
          category: productData.category || categories[0],
          normalPrice: normalPrice,
          offerPrice: salePrice,
          image: null,
          additionalImages: [],
          sizes: sizesData,
          tags: tagsData,
          featured: productData.featured || false,
          isBestSelling: productData.isBestSelling || false,
          isNew: productData.isNew || productData.isNewProduct || false,
          hasOffer: hasOffer,
          stock: productData.stockQuantity || productData.stock || 
                sizesData.reduce((sum, size) => sum + (size.stock || 0), 0) || 10,
          status: productData.productStatus || productData.status || "active",
        });

        // Set main image preview using getFullImageUrl - FIXED
        if (productData.imageUrl && productData.imageUrl !== "undefined" && productData.imageUrl !== "null") {
          const previewUrl = getFullImageUrl(productData.imageUrl);
          console.log("🖼️ Setting main image preview:", {
            original: productData.imageUrl,
            preview: previewUrl,
            baseUrl: getApiBaseUrl()
          });
          
          // Use setTimeout to ensure state update happens properly
          setTimeout(() => {
            setImagePreview(previewUrl);
            setKeepExistingImage(true);
          }, 0);
        }

        // Set existing additional images previews using getFullImageUrl - FIXED
        if (productData.additionalImages && Array.isArray(productData.additionalImages)) {
          const previews = productData.additionalImages
            .filter((img: string) => img && img !== "undefined" && img !== "null" && img.trim() !== "")
            .map((img: string) => getFullImageUrl(img));
          
          console.log("🖼️ Setting additional images previews:", {
            original: productData.additionalImages,
            previews: previews
          });
          
          // Use setTimeout to ensure state update happens properly
          setTimeout(() => {
            setExistingAdditionalImages(previews);
            setAdditionalPreviews(previews);
          }, 0);
        }
      } catch (err: any) {
        console.error("❌ Fetch error:", err);
        if (err.message.includes("401")) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("admin-token");
          localStorage.removeItem("admin-user");
          router.push("/login");
        } else if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
          toast.error("Cannot connect to server. Check your internet connection.");
          console.log("🌐 Current API URL:", getApiUrl());
          console.log("🔧 Backend URL:", getApiBaseUrl());
        } else {
          toast.error(err.message || "Failed to fetch product");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  // Image preview for main image - FIXED
  useEffect(() => {
    if (!form.image) return;

    // Validate image file
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(form.image.type)) {
      setImageError("Only JPG, PNG, and WebP images are allowed");
      setForm(prev => ({ ...prev, image: null }));
      return;
    }

    if (form.image.size > maxSize) {
      setImageError("Image size should be less than 5MB");
      setForm(prev => ({ ...prev, image: null }));
      return;
    }

    setImageError(null);
    setKeepExistingImage(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Store the preview in state
      setImagePreview(result);
    };
    reader.readAsDataURL(form.image);
  }, [form.image]);

  // Handle additional images preview - FIXED
  useEffect(() => {
    const newPreviews: string[] = [];
    const newErrors: string[] = [];
    
    form.additionalImages.forEach((file, index) => {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        newErrors[index] = "Invalid file type";
        return;
      }

      if (file.size > maxSize) {
        newErrors[index] = "File too large (max 5MB)";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews[index] = reader.result as string;
        if (newPreviews.length === form.additionalImages.length) {
          // Combine existing images with new ones
          setAdditionalPreviews([...existingAdditionalImages, ...newPreviews]);
          setAdditionalImageErrors(newErrors);
        }
      };
      reader.readAsDataURL(file);
    });

    // Handle empty state
    if (form.additionalImages.length === 0 && existingAdditionalImages.length > 0) {
      setAdditionalPreviews(existingAdditionalImages);
      setAdditionalImageErrors([]);
    } else if (form.additionalImages.length === 0) {
      setAdditionalPreviews([]);
      setAdditionalImageErrors([]);
    }
  }, [form.additionalImages, existingAdditionalImages]);

  // Keep image preview stable during component updates - NEW FIX
  useEffect(() => {
    // Keep image preview stable during component updates
    if (imagePreview && !form.image && keepExistingImage) {
      // If we have a preview but no new image file, and we want to keep existing image
      // This prevents the preview from disappearing during re-renders
      return;
    }
  }, [imagePreview, form.image, keepExistingImage]);

  // Keep additional images previews stable - NEW FIX
  useEffect(() => {
    // Keep additional images previews stable
    if (additionalPreviews.length > 0 && form.additionalImages.length === 0 && existingAdditionalImages.length > 0) {
      // Keep existing previews if no new images are being uploaded
      return;
    }
  }, [additionalPreviews, form.additionalImages, existingAdditionalImages]);

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = "Product title is required";
    }

    if (!form.normalPrice || form.normalPrice <= 0) {
      newErrors.normalPrice = "Normal price must be greater than 0";
    }

    if (form.offerPrice < 0) {
      newErrors.offerPrice = "Offer price cannot be negative";
    }

    if (form.offerPrice > form.normalPrice) {
      newErrors.offerPrice = "Offer price cannot be greater than normal price";
    }

    // Validate sizes
    const validSizes = form.sizes.filter(
      (size) => size && size.size && size.size.trim() !== "" && (size.stock || 0) >= 0
    );
    if (validSizes.length === 0) {
      newErrors.sizes = "At least one valid size is required";
    }

    // Validate at least one size has stock > 0
    const hasStock = form.sizes.some(size => (size.stock || 0) > 0);
    if (!hasStock) {
      newErrors.stock = "At least one size must have stock quantity";
    }

    // Validate additional images (max 4 including existing ones)
    const totalAdditionalImages = existingAdditionalImages.length + form.additionalImages.length;
    if (totalAdditionalImages > 4) {
      newErrors.additionalImages = "Maximum 4 additional images allowed (including existing ones)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("normalPrice", form.normalPrice.toString());
      
      // Add salePrice for backend
      if (form.hasOffer && form.offerPrice > 0 && form.offerPrice < form.normalPrice) {
        formData.append("salePrice", form.offerPrice.toString());
        formData.append("originalPrice", form.normalPrice.toString());
      } else {
        formData.append("salePrice", form.normalPrice.toString());
      }

      // Validate and format sizes for backend
      const validatedSizes = form.sizes
        .filter(
          (size) =>
            size && 
            size.size && 
            size.size.trim() !== "" && 
            !isNaN(size.stock || 0) && 
            (size.stock || 0) >= 0
        )
        .map((size) => ({
          size: size.size.toUpperCase(),
          stock: Number(size.stock || 0),
        }));

      formData.append("sizes", JSON.stringify(validatedSizes));

      // Validate tags
      const validatedTags = form.tags.filter((tag) => tag && tag.trim() !== "");
      formData.append("tags", JSON.stringify(validatedTags));

      formData.append("featured", String(form.featured));
      formData.append("isBestSelling", String(form.isBestSelling));
      formData.append("isNew", String(form.isNew));

      // Calculate total stock
      const totalStock = validatedSizes.reduce(
        (sum, size) => sum + (size.stock || 0),
        0
      );
      formData.append("stock", totalStock.toString());

      formData.append("productStatus", form.status);

      // Append main image - FIXED
      if (form.image) {
        console.log("📤 Appending main image:", form.image.name, form.image.type, form.image.size);
        formData.append("image", form.image);
      } else if (productId) {
        // When editing without uploading new image
        if (imagePreview) {
          if (keepExistingImage) {
            // Keep existing image from database
            formData.append("keepExistingImage", "true");
            console.log("🖼️ Keeping existing image from database");
          } else if (imagePreview.startsWith('blob:') || imagePreview.startsWith('data:')) {
            // This is a newly uploaded image that was previewed
            // We need to handle it differently or tell backend to use existing
            formData.append("keepExistingImage", "true");
          }
        } else {
          // No image preview means image was removed
          formData.append("removeImage", "true");
          console.log("🗑️ Removing existing image");
        }
      }

      // Append additional images
      form.additionalImages.forEach((file) => {
        formData.append("additionalImages", file);
      });

      // If there are existing additional images and we're not uploading new ones,
      // we need to tell the backend to keep them
      if (productId && existingAdditionalImages.length > 0 && form.additionalImages.length === 0) {
        formData.append("keepExistingAdditionalImages", "true");
        console.log("🖼️ Keeping existing additional images");
      }

      console.log("🚀 Submitting product...");
      console.log("📦 Form data entries:");
      for (let pair of (formData as any).entries()) {
        console.log(pair[0], pair[1]);
      }

      const apiUrl = getApiUrl();
      const url = productId
        ? `${apiUrl}/products/${productId}`
        : `${apiUrl}/products`;

      const method = productId ? "PUT" : "POST";

      console.log(`🌐 Sending ${method} request to: ${url}`);
      console.log(`🔗 Backend base URL: ${getApiBaseUrl()}`);

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`✅ ${productId ? "Update" : "Create"} response:`, data);

      toast.success(
        `Product ${productId ? "updated" : "created"} successfully!`
      );
      router.push("/products");
    } catch (err: any) {
      console.error("❌ Submit error:", err);

      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-user");
        router.push("/login");
      } else if (
        err.message.includes("NetworkError") ||
        err.message.includes("Failed to fetch")
      ) {
        toast.error("Cannot connect to server. Make sure backend is running.");
        console.log("🌐 Current API URL:", getApiUrl());
        console.log("🔧 Backend base URL:", getApiBaseUrl());
        console.log("📱 Environment:", process.env.NODE_ENV);
      } else {
        toast.error(err.message || "Failed to save product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Update stock when sizes change
  useEffect(() => {
    const totalStock = form.sizes.reduce((acc, size) => {
      if (!size) return acc;
      const stockValue = Number(size.stock);
      return acc + (isNaN(stockValue) ? 0 : stockValue);
    }, 0);
    
    setForm((prev) => ({ ...prev, stock: totalStock }));
  }, [form.sizes]);

  // Handle input changes
  const handleInputChange = (field: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle main image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      setKeepExistingImage(false);
    }
    // Reset input value to allow selecting same file again
    e.target.value = "";
  };

  // Handle additional images upload
  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      // Reset input value immediately to allow re-selection
      if (e.target) {
        e.target.value = "";
      }
      
      // Limit to 4 additional images including existing ones
      const remainingSlots = 4 - (existingAdditionalImages.length + form.additionalImages.length);
      const filesToAdd = files.slice(0, remainingSlots);
      
      if (filesToAdd.length < files.length) {
        toast.error(`Maximum 4 additional images allowed. Added ${filesToAdd.length} of ${files.length}`);
      }
      
      if (filesToAdd.length > 0) {
        setForm(prev => ({
          ...prev,
          additionalImages: [...prev.additionalImages, ...filesToAdd]
        }));
      }
    }
  };

  // Remove main image - FIXED
  const removeImage = () => {
    if (productId && imagePreview && !imagePreview.startsWith('data:') && !form.image && keepExistingImage) {
      // For editing mode: we're removing an existing image from database
      setForm(prev => ({ ...prev, image: null }));
      setImagePreview(null);
      setImageError(null);
      setKeepExistingImage(false);
      
      toast.success("Existing image will be removed on save");
    } else {
      // For new images or when uploading
      setForm(prev => ({ ...prev, image: null }));
      setImagePreview(null);
      setImageError(null);
      setKeepExistingImage(false);
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove existing additional image - FIXED
  const removeExistingAdditionalImage = (index: number) => {
    const updatedImages = [...existingAdditionalImages];
    updatedImages.splice(index, 1);
    setExistingAdditionalImages(updatedImages);
    setAdditionalPreviews(updatedImages);
    
    toast.success("Existing additional image will be removed on save");
  };

  // Remove new additional image - FIXED
  const removeAdditionalImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  // Handle price changes
  const handleNormalPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    setForm(prev => ({ ...prev, normalPrice: price }));
    
    if (errors.normalPrice) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.normalPrice;
        return newErrors;
      });
    }
  };

  const handleOfferPriceChange = (value: string) => {
    const price = parseFloat(value) || 0;
    setForm(prev => ({ ...prev, offerPrice: price }));
    
    if (errors.offerPrice) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.offerPrice;
        return newErrors;
      });
    }
  };

  // Handle offer percentage change
  const handleOfferPercentageChange = (percentage: number) => {
    if (percentage >= 0 && percentage <= 100) {
      setOfferPercentage(percentage);
      const calculatedOfferPrice = form.normalPrice * (1 - percentage / 100);
      setForm(prev => ({ 
        ...prev, 
        offerPrice: Math.round(calculatedOfferPrice),
        hasOffer: percentage > 0
      }));
    }
  };

  // Handle size changes
  const handleSizeChange = (index: number, field: 'size' | 'stock', value: string) => {
    const updatedSizes = [...form.sizes];
    
    if (field === 'size') {
      updatedSizes[index].size = value.toUpperCase();
    } else {
      updatedSizes[index].stock = parseInt(value) || 0;
    }
    
    setForm(prev => ({ ...prev, sizes: updatedSizes }));
    
    // Clear size errors
    if (errors.sizes || errors.stock) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.sizes;
        delete newErrors.stock;
        return newErrors;
      });
    }
  };

  // Handle tag addition
  const handleAddTag = (tag: string) => {
    if (tag.trim() && !form.tags.includes(tag.trim())) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field: "featured" | "isBestSelling" | "isNew" | "hasOffer") => {
    setForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  if (loading && productId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-slate-600 font-medium">
                Loading product data...
              </p>
              <p className="text-slate-400 text-sm">
                Connecting to: {getApiBaseUrl()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 text-slate-600 hover:text-amber-700 font-medium group transition-colors mb-6"
          >
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-amber-200 group-hover:bg-amber-50 transition-all">
              <ArrowLeft size={18} />
            </div>
            Back to Products
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {productId ? "Edit Product" : "Create New Product"}
              </h1>
              <p className="text-slate-500 mt-2">
                {productId
                  ? "Update existing product details"
                  : "Add a new product to your catalog"}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                Backend: {getApiBaseUrl()}
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Form Header */}
          <div className="border-b border-slate-100 px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow">
                <Layers className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Product Details
                </h2>
                <p className="text-slate-500 text-sm">
                  Fill in the essential information about your product
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Product Title *
                    </label>
                    <input
                      className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                        errors.title ? 'border-red-500' : 'border-slate-300'
                      }`}
                      placeholder="Enter product name"
                      value={form.title}
                      onChange={handleInputChange('title')}
                      required
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 appearance-none transition-all duration-200 text-slate-800"
                        value={form.category}
                        onChange={handleInputChange('category')}
                      >
                        {categories.map((c) => (
                          <option key={c} value={c} className="py-2">
                            {c.replace("-", " ").toUpperCase()}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400 min-h-[120px]"
                    placeholder="Describe the product features, materials, and details..."
                    value={form.description}
                    onChange={handleInputChange('description')}
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <DollarSign className="text-amber-600" size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Pricing Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Normal Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 ${
                          errors.normalPrice ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="0.00"
                        value={form.normalPrice || ""}
                        onChange={(e) => handleNormalPriceChange(e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    {errors.normalPrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.normalPrice}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">
                      Regular price of the product
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Offer Price
                      </label>
                      {offerPercentage > 0 && (
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          {offerPercentage}% OFF
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                        ৳
                      </span>
                      <input
                        type="number"
                        className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 ${
                          errors.offerPrice ? 'border-red-500' : 'border-slate-300'
                        }`}
                        placeholder="0.00"
                        value={form.offerPrice || ""}
                        onChange={(e) => handleOfferPriceChange(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.offerPrice && (
                      <p className="text-red-500 text-sm mt-1">{errors.offerPrice}</p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">
                      Leave empty or set to 0 for no offer
                    </p>
                    
                    {/* Offer Percentage Slider */}
                    {form.normalPrice > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-slate-600">Set discount percentage:</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={offerPercentage}
                              onChange={(e) => handleOfferPercentageChange(parseInt(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
                            />
                            <span className="text-sm text-slate-600">%</span>
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={offerPercentage}
                          onChange={(e) => handleOfferPercentageChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>0%</span>
                          <span>25%</span>
                          <span>50%</span>
                          <span>75%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Price Summary */}
                {form.hasOffer && form.normalPrice > 0 && form.offerPrice > 0 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Price Summary</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-lg font-bold text-slate-800">৳{form.offerPrice.toFixed(2)}</span>
                          <span className="text-slate-500 line-through">৳{form.normalPrice.toFixed(2)}</span>
                          <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            Save ৳{(form.normalPrice - form.offerPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <BadgePercent className="text-green-500" size={24} />
                    </div>
                  </div>
                )}
              </div>

              {/* Sizes & Stock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Size-wise Stock Management
                    </label>
                    <p className="text-sm text-slate-500">
                      Add sizes and their individual stock quantities
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
                    <Package size={16} />
                    <div className="text-right">
                      <span className="text-sm font-medium block">Total Stock</span>
                      <span className="text-lg font-bold">{form.stock} items</span>
                    </div>
                  </div>
                </div>

                {(errors.sizes || errors.stock) && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.sizes || errors.stock}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {form.sizes.map((s, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Size</label>
                        <input
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400"
                          placeholder="e.g., M, L, XL, XXL"
                          value={s.size}
                          onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 mb-1">Stock Quantity</label>
                        <input
                          type="number"
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800"
                          placeholder="Enter quantity"
                          value={s.stock}
                          onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)}
                          min="0"
                        />
                      </div>
                      {form.sizes.length > 1 && (
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedSizes = form.sizes.filter(
                                (_, i) => i !== idx
                              );
                              setForm({ ...form, sizes: updatedSizes });
                            }}
                            className="px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
                            title="Remove size"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      sizes: [...form.sizes, { size: "", stock: 0 }],
                    })
                  }
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors duration-200 group"
                >
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors duration-200">
                    <span className="text-amber-600 text-lg font-bold">+</span>
                  </div>
                  Add New Size Variant
                </button>
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-slate-500" />
                  Product Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-200"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400"
                  placeholder="Type a tag and press Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      handleAddTag(e.currentTarget.value.trim());
                      e.currentTarget.value = "";
                      e.preventDefault();
                    }
                  }}
                />
              </div>

              {/* Status Section */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Product Status
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 appearance-none transition-all duration-200 text-slate-800"
                    value={form.status}
                    onChange={handleInputChange('status')}
                  >
                    <option value="active" className="text-green-600">
                      Active
                    </option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                    <option value="low-stock" className="text-orange-600">
                      Low Stock
                    </option>
                    <option value="out-of-stock" className="text-red-600">
                      Out of Stock
                    </option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Main Image Upload - FIXED SECTION */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <ImageIcon size={16} className="text-slate-500" />
                  Main Product Image {!productId && "*"}
                </label>

                {imageError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-red-600 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {imageError}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/50 rounded-2xl p-8 text-center transition-colors duration-200">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-input"
                    />
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="text-amber-500" size={28} />
                      </div>
                      <div>
                        <p className="text-slate-700 font-medium mb-1">
                          {form.image
                            ? form.image.name
                            : imagePreview
                            ? "Existing image loaded successfully"
                            : "Drag & drop or click to upload"}
                        </p>
                        <p className="text-slate-500 text-sm">
                          JPG, PNG or WebP (Max 5MB)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium shadow-sm hover:shadow"
                      >
                        <Upload size={16} className="inline mr-2" />
                        {imagePreview ? "Change Image" : "Browse Files"}
                      </button>
                    </div>
                  </div>

                  {imagePreview && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-slate-700">
                          {form.image ? "New Image Preview" : "Current Image"}
                        </p>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="text-sm text-slate-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={16} />
                          {form.image ? "Remove New Image" : "Remove Image"}
                        </button>
                      </div>
                      <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Image failed to load:", imagePreview);
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                      </div>
                    </div>
                  )}

                  {/* Help Text */}
                  <div className="text-xs text-slate-500 mt-2">
                    {!productId ? (
                      <p>* Main image is required for new products</p>
                    ) : (
                      <p>Leave empty to keep existing main image</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Images Section - FIXED */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <ImageIcon size={16} className="text-slate-500" />
                    Additional Images (Max 4)
                  </label>
                  <span className="text-sm text-slate-500">
                    {existingAdditionalImages.length + form.additionalImages.length}/4 images
                  </span>
                </div>

                {errors.additionalImages && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors.additionalImages}</p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* File input for additional images */}
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 ${
                    (existingAdditionalImages.length + form.additionalImages.length) >= 4 
                      ? "border-red-200 bg-red-50/50 cursor-not-allowed" 
                      : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
                  }`}
                  >
                    <input
                      ref={additionalFileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleAdditionalImagesUpload}
                      className="hidden"
                      id="additional-images-input"
                      disabled={(existingAdditionalImages.length + form.additionalImages.length) >= 4}
                    />
                    
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                        {(existingAdditionalImages.length + form.additionalImages.length) >= 4 ? (
                          <X className="text-blue-500" size={28} />
                        ) : (
                          <Plus className="text-blue-500" size={28} />
                        )}
                      </div>
                      <div>
                        <p className="text-slate-700 font-medium mb-1">
                          {(existingAdditionalImages.length + form.additionalImages.length) >= 4 
                            ? "Maximum 4 images reached" 
                            : "Click to upload additional images"}
                        </p>
                        <p className="text-slate-500 text-sm">
                          Upload up to 4 additional images (JPG, PNG, WebP, Max 5MB each)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if ((existingAdditionalImages.length + form.additionalImages.length) < 4) {
                            additionalFileInputRef.current?.click();
                          }
                        }}
                        disabled={(existingAdditionalImages.length + form.additionalImages.length) >= 4}
                        className={`px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-200 ${
                          (existingAdditionalImages.length + form.additionalImages.length) >= 4
                            ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                        }`}
                      >
                        <Upload size={16} className="inline mr-2" />
                        Add More Images
                      </button>
                    </div>
                  </div>

                  {/* Additional Images Preview */}
                  {(existingAdditionalImages.length > 0 || form.additionalImages.length > 0) && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-slate-700">
                          Additional Images Preview ({(existingAdditionalImages.length + form.additionalImages.length)}/4)
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, additionalImages: [] }));
                            setExistingAdditionalImages([]);
                            setAdditionalPreviews([]);
                          }}
                          className="text-sm text-slate-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} />
                          Remove All
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing images from database */}
                        {existingAdditionalImages.map((imgUrl, index) => (
                          <div key={`existing-${index}`} className="relative group">
                            <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                              <img
                                src={imgUrl}
                                alt={`Existing additional ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.error("Additional image failed to load:", imgUrl);
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
                                }}
                              />
                              
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeExistingAdditionalImage(index)}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {/* File info */}
                            <div className="mt-2">
                              <p className="text-xs font-medium text-slate-700 truncate">
                                Existing Image {index + 1}
                              </p>
                              <p className="text-xs text-slate-500">
                                From database
                              </p>
                            </div>
                          </div>
                        ))}
                        
                        {/* New uploaded images */}
                        {form.additionalImages.map((file, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                              {additionalPreviews[existingAdditionalImages.length + index] ? (
                                <img
                                  src={additionalPreviews[existingAdditionalImages.length + index]}
                                  alt={`New additional ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                  <ImageIcon className="text-slate-400" size={24} />
                                </div>
                              )}
                              
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalImage(index)}
                                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {/* File info */}
                            <div className="mt-2">
                              <p className="text-xs font-medium text-slate-700 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            
                            {/* Error message */}
                            {additionalImageErrors[index] && (
                              <div className="absolute -bottom-2 left-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                {additionalImageErrors[index]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Empty slots indicator */}
                      {(existingAdditionalImages.length + form.additionalImages.length) < 4 && (
                        <div className="mt-4 text-sm text-slate-500">
                          <p>
                            {4 - (existingAdditionalImages.length + form.additionalImages.length)} slot(s) remaining for additional images
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Flags */}
              <div className="bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="text-amber-500" size={20} />
                  <h3 className="text-lg font-semibold text-slate-800">
                    Product Flags & Features
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Featured",
                      description: "Highlight on homepage",
                      icon: Sparkles,
                      field: "featured",
                      checked: form.featured,
                    },
                    {
                      label: "Bestseller",
                      description: "Top selling product",
                      icon: TrendingUp,
                      field: "isBestSelling",
                      checked: form.isBestSelling,
                    },
                    {
                      label: "New Arrival",
                      description: "Recently added",
                      field: "isNew",
                      checked: form.isNew,
                    },
                    {
                      label: "Special Offer",
                      description: "Discounted price",
                      icon: Percent,
                      field: "hasOffer",
                      checked: form.hasOffer,
                    },
                  ].map((flag) => (
                    <div
                      key={flag.label}
                      className={`flex items-center justify-between p-4 bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
                        flag.checked
                          ? flag.field === "hasOffer" 
                            ? "border-green-300 bg-green-50/50"
                            : "border-amber-300 bg-amber-50/50"
                          : "border-slate-200"
                      }`}
                      onClick={() => handleCheckboxChange(flag.field as any)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            flag.checked
                              ? flag.field === "hasOffer"
                                ? "bg-gradient-to-br from-green-400 to-green-500"
                                : "bg-gradient-to-br from-amber-400 to-amber-500"
                              : "bg-slate-100"
                          }`}
                        >
                          {flag.icon ? (
                            <flag.icon
                              className={
                                flag.checked ? "text-white" : "text-slate-400"
                              }
                              size={18}
                            />
                          ) : (
                            <span
                              className={`font-bold text-sm ${
                                flag.checked ? "text-white" : "text-slate-400"
                              }`}
                            >
                              NEW
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-800 font-semibold">
                            {flag.label}
                          </span>
                          <p className="text-slate-500 text-xs">
                            {flag.description}
                          </p>
                        </div>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={flag.checked}
                          onChange={() => {}}
                          className="sr-only"
                        />
                        <div
                          className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                            flag.checked
                              ? flag.field === "hasOffer"
                                ? "bg-green-500"
                                : "bg-amber-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                              flag.checked ? "left-5" : "left-1"
                            }`}
                          ></div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200">
                <button
                  onClick={() => router.push("/products")}
                  className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl hover:from-slate-950 hover:to-slate-800 font-semibold shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {productId ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <>
                      <span className="relative z-10">
                        {productId ? "Update Product" : "Create Product"}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-slate-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "react-hot-toast";
// import {
//   ArrowLeft,
//   Tag,
//   Image as ImageIcon,
//   Layers,
//   TrendingUp,
//   Sparkles,
//   X,
//   Upload,
//   DollarSign,
//   Package,
//   AlertCircle,
//   Plus,
//   Trash2,
//   Percent,
//   BadgePercent,
// } from "lucide-react";
// import Link from "next/link";
// import { checkAuthAndRedirect, getAuthToken } from "../../../utils/auth";

// const categories = ["regular-panjabi", "premium-panjabi", "luxury-panjabi"];

// interface SizeStock {
//   size: string;
//   stock: number;
// }

// interface ProductForm {
//   title: string;
//   description: string;
//   category: string;
//   normalPrice: number;
//   offerPrice: number;
//   image?: File | null;
//   additionalImages: File[];
//   sizes: SizeStock[];
//   tags: string[];
//   featured: boolean;
//   isBestSelling: boolean;
//   isNew: boolean;
//   hasOffer: boolean;
//   stock: number;
//   status: string;
// }

// // ==================== UTILITY FUNCTIONS ====================

// // Get API URL with fallback - IMPROVED VERSION
// const getApiBaseUrl = (): string => {
//   // Check environment variable first
//   const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
//   if (envUrl) {
//     // Ensure URL has protocol
//     if (!envUrl.startsWith('http')) {
//       // Determine protocol based on environment
//       const isProduction = typeof window !== 'undefined' ? 
//         !window.location.hostname.includes('localhost') : 
//         process.env.NODE_ENV === 'production';
      
//       if (isProduction) {
//         console.log('🚀 Production mode detected, using HTTPS');
//         return `https://${envUrl}`;
//       } else {
//         console.log('🌐 Development mode detected, using HTTP');
//         return `http://${envUrl}`;
//       }
//     }
//     return envUrl;
//   }
  
//   // No environment variable, detect based on current location
//   if (typeof window !== 'undefined') {
//     const isLocalhost = window.location.hostname === 'localhost' || 
//                         window.location.hostname === '127.0.0.1' ||
//                         window.location.hostname === '';
    
//     if (isLocalhost) {
//       console.log('🌐 Local development: Using http://localhost:4000');
//       return 'http://localhost:4000';
//     } else {
//       console.log('🚀 Production: Using https://taskin-panjabi-server.onrender.com');
//       return 'https://taskin-panjabi-server.onrender.com';
//     }
//   }
  
//   // Fallback for server-side rendering
//   console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using default: http://localhost:4000');
//   return 'http://localhost:4000';
// };

// // Get API URL for requests
// const getApiUrl = (): string => {
//   const baseUrl = getApiBaseUrl();
//   return `${baseUrl}/api`;
// };

// // Convert relative image path to full URL
// const getFullImageUrl = (imagePath: string | undefined): string => {
//   if (!imagePath) {
//     // Return a placeholder image
//     return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
//   }
  
//   // Already a full URL
//   if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
//     return imagePath;
//   }
  
//   // Handle "undefined" in path
//   if (imagePath.includes('undefined')) {
//     console.error('Found "undefined" in image path:', imagePath);
//     return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
//   }
  
//   // Convert relative path to full URL
//   const baseUrl = getApiBaseUrl();
  
//   // Remove leading slash if present to avoid double slashes
//   const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
//   // Handle different path formats
//   if (imagePath.startsWith('uploads/') || imagePath.includes('/uploads/')) {
//     return `${baseUrl}/${cleanPath}`;
//   }
  
//   // If it's just a filename, assume it's in uploads folder
//   return `${baseUrl}/uploads/${cleanPath}`;
// };

// // ==================== MAIN COMPONENT ====================

// export default function ProductFormPage({ productId }: { productId?: string }) {
//   const [form, setForm] = useState<ProductForm>({
//     title: "",
//     description: "",
//     category: categories[0],
//     normalPrice: 0,
//     offerPrice: 0,
//     image: null,
//     additionalImages: [],
//     sizes: [{ size: "M", stock: 10 }],
//     tags: [],
//     featured: false,
//     isBestSelling: false,
//     isNew: false,
//     hasOffer: false,
//     stock: 10,
//     status: "active",
//   });
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);
//   const [existingAdditionalImages, setExistingAdditionalImages] = useState<string[]>([]);
//   const [imageError, setImageError] = useState<string | null>(null);
//   const [additionalImageErrors, setAdditionalImageErrors] = useState<string[]>([]);
//   const [offerPercentage, setOfferPercentage] = useState<number>(0);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const additionalFileInputRef = useRef<HTMLInputElement>(null);
//   const router = useRouter();

//   // Check authentication
//   useEffect(() => {
//     if (!checkAuthAndRedirect(router)) {
//       toast.error("Please login first");
//       return;
//     }
//   }, [router]);

//   // Calculate offer percentage when normalPrice or offerPrice changes
//   useEffect(() => {
//     if (form.normalPrice > 0 && form.offerPrice > 0 && form.offerPrice < form.normalPrice) {
//       const percentage = ((form.normalPrice - form.offerPrice) / form.normalPrice) * 100;
//       setOfferPercentage(Math.round(percentage));
//       setForm(prev => ({ ...prev, hasOffer: true }));
//     } else {
//       setOfferPercentage(0);
//       setForm(prev => ({ ...prev, hasOffer: false }));
//     }
//   }, [form.normalPrice, form.offerPrice]);

//   // Fetch product for editing
//   useEffect(() => {
//     if (!productId) return;

//     const token = getAuthToken();
//     if (!token) {
//       router.push("/login");
//       return;
//     }

//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         const apiUrl = getApiUrl();
//         console.log("🌐 Fetching product from:", `${apiUrl}/products/${productId}`);
//         console.log("📱 Current environment:", typeof window !== 'undefined' ? window.location.hostname : 'server-side');

//         const response = await fetch(`${apiUrl}/products/${productId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const data = await response.json();
//         const productData = data.data || data;
//         console.log("✅ Fetched product data:", productData);

//         // Calculate prices
//         const normalPrice = productData.normalPrice || 0;
//         const salePrice = productData.salePrice || productData.offerPrice || normalPrice;
//         const hasOffer = salePrice < normalPrice;

//         // Parse sizes
//         let sizesData = [{ size: "M", stock: 10 }];
//         if (productData.variants && Array.isArray(productData.variants)) {
//           // New model with variants
//           sizesData = productData.variants.map((v: any) => ({
//             size: v.size || "M",
//             stock: v.stockQuantity || v.stock || 0
//           }));
//         } else if (productData.sizes) {
//           // Old model with sizes field
//           try {
//             if (typeof productData.sizes === 'string') {
//               sizesData = JSON.parse(productData.sizes);
//             } else if (Array.isArray(productData.sizes)) {
//               sizesData = productData.sizes;
//             }
//           } catch (e) {
//             console.error("Error parsing sizes:", e);
//           }
//         }

//         // Parse tags
//         let tagsData = [];
//         if (productData.tags) {
//           try {
//             if (typeof productData.tags === 'string') {
//               tagsData = JSON.parse(productData.tags);
//             } else if (Array.isArray(productData.tags)) {
//               tagsData = productData.tags;
//             }
//           } catch (e) {
//             console.error("Error parsing tags:", e);
//             tagsData = [];
//           }
//         }

//         // Filter out null/empty tags
//         tagsData = tagsData.filter((tag: any) => tag != null && String(tag).trim() !== "");

//         setForm({
//           title: productData.title || "",
//           description: productData.description || "",
//           category: productData.category || categories[0],
//           normalPrice: normalPrice,
//           offerPrice: salePrice,
//           image: null,
//           additionalImages: [],
//           sizes: sizesData,
//           tags: tagsData,
//           featured: productData.featured || false,
//           isBestSelling: productData.isBestSelling || false,
//           isNew: productData.isNew || productData.isNewProduct || false,
//           hasOffer: hasOffer,
//           stock: productData.stockQuantity || productData.stock || 
//                 sizesData.reduce((sum, size) => sum + (size.stock || 0), 0) || 10,
//           status: productData.productStatus || productData.status || "active",
//         });

//         // Set main image preview using getFullImageUrl
//         if (productData.imageUrl) {
//           const previewUrl = getFullImageUrl(productData.imageUrl);
//           console.log("🖼️ Setting main image preview:", {
//             original: productData.imageUrl,
//             preview: previewUrl,
//             baseUrl: getApiBaseUrl()
//           });
//           setImagePreview(previewUrl);
//         }

//         // Set existing additional images previews using getFullImageUrl
//         if (productData.additionalImages && Array.isArray(productData.additionalImages)) {
//           const previews = productData.additionalImages
//             .filter((img: string) => img && img !== "undefined")
//             .map((img: string) => getFullImageUrl(img));
          
//           console.log("🖼️ Setting additional images previews:", {
//             original: productData.additionalImages,
//             previews: previews
//           });
          
//           setExistingAdditionalImages(previews);
//           setAdditionalPreviews(previews);
//         }
//       } catch (err: any) {
//         console.error("❌ Fetch error:", err);
//         if (err.message.includes("401")) {
//           toast.error("Session expired. Please login again.");
//           localStorage.removeItem("admin-token");
//           localStorage.removeItem("admin-user");
//           router.push("/login");
//         } else if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
//           toast.error("Cannot connect to server. Check your internet connection.");
//           console.log("🌐 Current API URL:", getApiUrl());
//           console.log("🔧 Backend URL:", getApiBaseUrl());
//         } else {
//           toast.error(err.message || "Failed to fetch product");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, [productId, router]);

//   // Image preview for main image
//   useEffect(() => {
//     if (!form.image) return;

//     // Validate image file
//     const allowedTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/webp",
//       "image/gif",
//     ];
//     const maxSize = 5 * 1024 * 1024; // 5MB

//     if (!allowedTypes.includes(form.image.type)) {
//       setImageError("Only JPG, PNG, and WebP images are allowed");
//       setForm(prev => ({ ...prev, image: null }));
//       return;
//     }

//     if (form.image.size > maxSize) {
//       setImageError("Image size should be less than 5MB");
//       setForm(prev => ({ ...prev, image: null }));
//       return;
//     }

//     setImageError(null);

//     const reader = new FileReader();
//     reader.onloadend = () => setImagePreview(reader.result as string);
//     reader.readAsDataURL(form.image);
//   }, [form.image]);

//   // Handle additional images preview
//   useEffect(() => {
//     const newPreviews: string[] = [];
//     const newErrors: string[] = [];
    
//     form.additionalImages.forEach((file, index) => {
//       const allowedTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "image/webp",
//         "image/gif",
//       ];
//       const maxSize = 5 * 1024 * 1024; // 5MB

//       if (!allowedTypes.includes(file.type)) {
//         newErrors[index] = "Invalid file type";
//         return;
//       }

//       if (file.size > maxSize) {
//         newErrors[index] = "File too large (max 5MB)";
//         return;
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         newPreviews[index] = reader.result as string;
//         if (newPreviews.length === form.additionalImages.length) {
//           setAdditionalPreviews([...existingAdditionalImages, ...newPreviews]);
//           setAdditionalImageErrors(newErrors);
//         }
//       };
//       reader.readAsDataURL(file);
//     });

//     // Handle empty state
//     if (form.additionalImages.length === 0) {
//       setAdditionalPreviews(existingAdditionalImages);
//       setAdditionalImageErrors([]);
//     }
//   }, [form.additionalImages, existingAdditionalImages]);

//   // Validate form
//   const validateForm = () => {
//     const newErrors: Record<string, string> = {};

//     if (!form.title.trim()) {
//       newErrors.title = "Product title is required";
//     }

//     if (!form.normalPrice || form.normalPrice <= 0) {
//       newErrors.normalPrice = "Normal price must be greater than 0";
//     }

//     if (form.offerPrice < 0) {
//       newErrors.offerPrice = "Offer price cannot be negative";
//     }

//     if (form.offerPrice > form.normalPrice) {
//       newErrors.offerPrice = "Offer price cannot be greater than normal price";
//     }

//     // Validate sizes
//     const validSizes = form.sizes.filter(
//       (size) => size && size.size && size.size.trim() !== "" && (size.stock || 0) >= 0
//     );
//     if (validSizes.length === 0) {
//       newErrors.sizes = "At least one valid size is required";
//     }

//     // Validate at least one size has stock > 0
//     const hasStock = form.sizes.some(size => (size.stock || 0) > 0);
//     if (!hasStock) {
//       newErrors.stock = "At least one size must have stock quantity";
//     }

//     // Validate additional images (max 4 including existing ones)
//     const totalAdditionalImages = existingAdditionalImages.length + form.additionalImages.length;
//     if (totalAdditionalImages > 4) {
//       newErrors.additionalImages = "Maximum 4 additional images allowed (including existing ones)";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     // Clear previous errors
//     setErrors({});
    
//     // Validate form
//     if (!validateForm()) {
//       toast.error("Please fix the errors in the form");
//       return;
//     }

//     const token = getAuthToken();
//     if (!token) {
//       toast.error("Please login first");
//       router.push("/login");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const formData = new FormData();
//       formData.append("title", form.title);
//       formData.append("description", form.description);
//       formData.append("category", form.category);
//       formData.append("normalPrice", form.normalPrice.toString());
      
//       // Add salePrice for backend
//       if (form.hasOffer && form.offerPrice > 0 && form.offerPrice < form.normalPrice) {
//         formData.append("salePrice", form.offerPrice.toString());
//         formData.append("originalPrice", form.normalPrice.toString());
//       } else {
//         formData.append("salePrice", form.normalPrice.toString());
//       }

//       // Validate and format sizes for backend
//       const validatedSizes = form.sizes
//         .filter(
//           (size) =>
//             size && 
//             size.size && 
//             size.size.trim() !== "" && 
//             !isNaN(size.stock || 0) && 
//             (size.stock || 0) >= 0
//         )
//         .map((size) => ({
//           size: size.size.toUpperCase(),
//           stock: Number(size.stock || 0),
//         }));

//       formData.append("sizes", JSON.stringify(validatedSizes));

//       // Validate tags
//       const validatedTags = form.tags.filter((tag) => tag && tag.trim() !== "");
//       formData.append("tags", JSON.stringify(validatedTags));

//       formData.append("featured", String(form.featured));
//       formData.append("isBestSelling", String(form.isBestSelling));
//       formData.append("isNew", String(form.isNew));

//       // Calculate total stock
//       const totalStock = validatedSizes.reduce(
//         (sum, size) => sum + (size.stock || 0),
//         0
//       );
//       formData.append("stock", totalStock.toString());

//       formData.append("productStatus", form.status);

//       // Append main image
//       if (form.image) {
//         console.log(
//           "📤 Appending main image:",
//           form.image.name,
//           form.image.type,
//           form.image.size
//         );
//         formData.append("image", form.image);
//       } else if (productId && imagePreview && !imagePreview.startsWith('data:')) {
//         // When updating without new image, send a flag to keep existing image
//         formData.append("keepExistingImage", "true");
//       }

//       // Append additional images
//       form.additionalImages.forEach((file) => {
//         formData.append("additionalImages", file);
//       });

//       // If there are existing additional images and we're not uploading new ones,
//       // we need to tell the backend to keep them
//       if (productId && existingAdditionalImages.length > 0 && form.additionalImages.length === 0) {
//         formData.append("keepExistingAdditionalImages", "true");
//       }

//       console.log("🚀 Submitting product...");
//       console.log("📦 Form data entries:");
//       for (let pair of (formData as any).entries()) {
//         console.log(pair[0], pair[1]);
//       }

//       const apiUrl = getApiUrl();
//       const url = productId
//         ? `${apiUrl}/products/${productId}`
//         : `${apiUrl}/products`;

//       const method = productId ? "PUT" : "POST";

//       console.log(`🌐 Sending ${method} request to: ${url}`);
//       console.log(`🔗 Backend base URL: ${getApiBaseUrl()}`);

//       const response = await fetch(url, {
//         method,
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(
//           errorData.message || `HTTP error! status: ${response.status}`
//         );
//       }

//       const data = await response.json();
//       console.log(`✅ ${productId ? "Update" : "Create"} response:`, data);

//       toast.success(
//         `Product ${productId ? "updated" : "created"} successfully!`
//       );
//       router.push("/products");
//     } catch (err: any) {
//       console.error("❌ Submit error:", err);

//       if (err.message.includes("401") || err.message.includes("Unauthorized")) {
//         toast.error("Session expired. Please login again.");
//         localStorage.removeItem("admin-token");
//         localStorage.removeItem("admin-user");
//         router.push("/login");
//       } else if (
//         err.message.includes("NetworkError") ||
//         err.message.includes("Failed to fetch")
//       ) {
//         toast.error("Cannot connect to server. Make sure backend is running.");
//         console.log("🌐 Current API URL:", getApiUrl());
//         console.log("🔧 Backend base URL:", getApiBaseUrl());
//         console.log("📱 Environment:", process.env.NODE_ENV);
//       } else {
//         toast.error(err.message || "Failed to save product");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Update stock when sizes change
//   useEffect(() => {
//     const totalStock = form.sizes.reduce((acc, size) => {
//       if (!size) return acc;
//       const stockValue = Number(size.stock);
//       return acc + (isNaN(stockValue) ? 0 : stockValue);
//     }, 0);
    
//     setForm((prev) => ({ ...prev, stock: totalStock }));
//   }, [form.sizes]);

//   // Handle input changes
//   const handleInputChange = (field: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const value = e.target.value;
//     setForm(prev => ({ ...prev, [field]: value }));
    
//     // Clear error for this field when user starts typing
//     if (errors[field]) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors[field];
//         return newErrors;
//       });
//     }
//   };

//   // Handle main image upload
//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setForm({ ...form, image: file });
//     }
//     e.target.value = "";
//   };

//   // Handle additional images upload
//   const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files || []);
    
//     if (files.length > 0) {
//       // Reset input value immediately to allow re-selection
//       if (e.target) {
//         e.target.value = "";
//       }
      
//       // Limit to 4 additional images including existing ones
//       const remainingSlots = 4 - (existingAdditionalImages.length + form.additionalImages.length);
//       const filesToAdd = files.slice(0, remainingSlots);
      
//       if (filesToAdd.length < files.length) {
//         toast.error(`Maximum 4 additional images allowed. Added ${filesToAdd.length} of ${files.length}`);
//       }
      
//       if (filesToAdd.length > 0) {
//         setForm(prev => ({
//           ...prev,
//           additionalImages: [...prev.additionalImages, ...filesToAdd]
//         }));
//       }
//     }
//   };

//   // Remove main image
//   const removeImage = () => {
//     setForm({ ...form, image: null });
//     setImagePreview(null);
//     setImageError(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // Remove existing additional image
//   const removeExistingAdditionalImage = (index: number) => {
//     const updatedImages = [...existingAdditionalImages];
//     updatedImages.splice(index, 1);
//     setExistingAdditionalImages(updatedImages);
//     setAdditionalPreviews(updatedImages);
//   };

//   // Remove new additional image
//   const removeAdditionalImage = (index: number) => {
//     setForm(prev => ({
//       ...prev,
//       additionalImages: prev.additionalImages.filter((_, i) => i !== index)
//     }));
//   };

//   // Handle price changes
//   const handleNormalPriceChange = (value: string) => {
//     const price = parseFloat(value) || 0;
//     setForm(prev => ({ ...prev, normalPrice: price }));
    
//     if (errors.normalPrice) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors.normalPrice;
//         return newErrors;
//       });
//     }
//   };

//   const handleOfferPriceChange = (value: string) => {
//     const price = parseFloat(value) || 0;
//     setForm(prev => ({ ...prev, offerPrice: price }));
    
//     if (errors.offerPrice) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors.offerPrice;
//         return newErrors;
//       });
//     }
//   };

//   // Handle offer percentage change
//   const handleOfferPercentageChange = (percentage: number) => {
//     if (percentage >= 0 && percentage <= 100) {
//       setOfferPercentage(percentage);
//       const calculatedOfferPrice = form.normalPrice * (1 - percentage / 100);
//       setForm(prev => ({ 
//         ...prev, 
//         offerPrice: Math.round(calculatedOfferPrice),
//         hasOffer: percentage > 0
//       }));
//     }
//   };

//   // Handle size changes
//   const handleSizeChange = (index: number, field: 'size' | 'stock', value: string) => {
//     const updatedSizes = [...form.sizes];
    
//     if (field === 'size') {
//       updatedSizes[index].size = value.toUpperCase();
//     } else {
//       updatedSizes[index].stock = parseInt(value) || 0;
//     }
    
//     setForm(prev => ({ ...prev, sizes: updatedSizes }));
    
//     // Clear size errors
//     if (errors.sizes || errors.stock) {
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors.sizes;
//         delete newErrors.stock;
//         return newErrors;
//       });
//     }
//   };

//   // Handle tag addition
//   const handleAddTag = (tag: string) => {
//     if (tag.trim() && !form.tags.includes(tag.trim())) {
//       setForm(prev => ({
//         ...prev,
//         tags: [...prev.tags, tag.trim()]
//       }));
//     }
//   };

//   // Handle tag removal
//   const handleRemoveTag = (tagToRemove: string) => {
//     setForm(prev => ({
//       ...prev,
//       tags: prev.tags.filter(tag => tag !== tagToRemove)
//     }));
//   };

//   // Handle checkbox changes
//   const handleCheckboxChange = (field: "featured" | "isBestSelling" | "isNew" | "hasOffer") => {
//     setForm(prev => ({ ...prev, [field]: !prev[field] }));
//   };

//   if (loading && productId) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex items-center justify-center h-96">
//             <div className="text-center space-y-4">
//               <div className="relative">
//                 <div className="w-16 h-16 border-4 border-amber-100 rounded-full"></div>
//                 <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
//               </div>
//               <p className="text-slate-600 font-medium">
//                 Loading product data...
//               </p>
//               <p className="text-slate-400 text-sm">
//                 Connecting to: {getApiBaseUrl()}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <Link
//             href="/products"
//             className="inline-flex items-center gap-3 text-slate-600 hover:text-amber-700 font-medium group transition-colors mb-6"
//           >
//             <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-amber-200 group-hover:bg-amber-50 transition-all">
//               <ArrowLeft size={18} />
//             </div>
//             Back to Products
//           </Link>
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-slate-800">
//                 {productId ? "Edit Product" : "Create New Product"}
//               </h1>
//               <p className="text-slate-500 mt-2">
//                 {productId
//                   ? "Update existing product details"
//                   : "Add a new product to your catalog"}
//               </p>
//               <p className="text-slate-400 text-xs mt-1">
//                 Backend: {getApiBaseUrl()}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Main Form */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           {/* Form Header */}
//           <div className="border-b border-slate-100 px-8 py-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow">
//                 <Layers className="text-white" size={24} />
//               </div>
//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">
//                   Product Details
//                 </h2>
//                 <p className="text-slate-500 text-sm">
//                   Fill in the essential information about your product
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Form Content */}
//           <div className="p-8">
//             <div className="space-y-8">
//               {/* Basic Information */}
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-slate-700 mb-3">
//                       Product Title *
//                     </label>
//                     <input
//                       className={`w-full px-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400 ${
//                         errors.title ? 'border-red-500' : 'border-slate-300'
//                       }`}
//                       placeholder="Enter product name"
//                       value={form.title}
//                       onChange={handleInputChange('title')}
//                       required
//                     />
//                     {errors.title && (
//                       <p className="text-red-500 text-sm mt-1">{errors.title}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-slate-700 mb-3">
//                       Category
//                     </label>
//                     <div className="relative">
//                       <select
//                         className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 appearance-none transition-all duration-200 text-slate-800"
//                         value={form.category}
//                         onChange={handleInputChange('category')}
//                       >
//                         {categories.map((c) => (
//                           <option key={c} value={c} className="py-2">
//                             {c.replace("-", " ").toUpperCase()}
//                           </option>
//                         ))}
//                       </select>
//                       <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
//                         <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-700 mb-3">
//                     Description
//                   </label>
//                   <textarea
//                     className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400 min-h-[120px]"
//                     placeholder="Describe the product features, materials, and details..."
//                     value={form.description}
//                     onChange={handleInputChange('description')}
//                   />
//                 </div>
//               </div>

//               {/* Pricing Section */}
//               <div className="bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 border border-amber-100 rounded-2xl p-6">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="p-2 bg-amber-100 rounded-lg">
//                     <DollarSign className="text-amber-600" size={20} />
//                   </div>
//                   <h3 className="text-lg font-semibold text-slate-800">
//                     Pricing Information
//                   </h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-slate-700 mb-3">
//                       Normal Price *
//                     </label>
//                     <div className="relative">
//                       <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
//                         ৳
//                       </span>
//                       <input
//                         type="number"
//                         className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 ${
//                           errors.normalPrice ? 'border-red-500' : 'border-slate-300'
//                         }`}
//                         placeholder="0.00"
//                         value={form.normalPrice || ""}
//                         onChange={(e) => handleNormalPriceChange(e.target.value)}
//                         min="0"
//                         step="0.01"
//                         required
//                       />
//                     </div>
//                     {errors.normalPrice && (
//                       <p className="text-red-500 text-sm mt-1">{errors.normalPrice}</p>
//                     )}
//                     <p className="text-sm text-slate-500 mt-2">
//                       Regular price of the product
//                     </p>
//                   </div>

//                   <div>
//                     <div className="flex items-center justify-between mb-3">
//                       <label className="block text-sm font-semibold text-slate-700">
//                         Offer Price
//                       </label>
//                       {offerPercentage > 0 && (
//                         <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
//                           {offerPercentage}% OFF
//                         </span>
//                       )}
//                     </div>
//                     <div className="relative">
//                       <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
//                         ৳
//                       </span>
//                       <input
//                         type="number"
//                         className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 ${
//                           errors.offerPrice ? 'border-red-500' : 'border-slate-300'
//                         }`}
//                         placeholder="0.00"
//                         value={form.offerPrice || ""}
//                         onChange={(e) => handleOfferPriceChange(e.target.value)}
//                         min="0"
//                         step="0.01"
//                       />
//                     </div>
//                     {errors.offerPrice && (
//                       <p className="text-red-500 text-sm mt-1">{errors.offerPrice}</p>
//                     )}
//                     <p className="text-sm text-slate-500 mt-2">
//                       Leave empty or set to 0 for no offer
//                     </p>
                    
//                     {/* Offer Percentage Slider */}
//                     {form.normalPrice > 0 && (
//                       <div className="mt-4 space-y-2">
//                         <div className="flex items-center justify-between">
//                           <label className="text-sm text-slate-600">Set discount percentage:</label>
//                           <div className="flex items-center gap-2">
//                             <input
//                               type="number"
//                               min="0"
//                               max="100"
//                               value={offerPercentage}
//                               onChange={(e) => handleOfferPercentageChange(parseInt(e.target.value) || 0)}
//                               className="w-16 px-2 py-1 text-sm border border-slate-300 rounded"
//                             />
//                             <span className="text-sm text-slate-600">%</span>
//                           </div>
//                         </div>
//                         <input
//                           type="range"
//                           min="0"
//                           max="100"
//                           value={offerPercentage}
//                           onChange={(e) => handleOfferPercentageChange(parseInt(e.target.value))}
//                           className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
//                         />
//                         <div className="flex justify-between text-xs text-slate-500">
//                           <span>0%</span>
//                           <span>25%</span>
//                           <span>50%</span>
//                           <span>75%</span>
//                           <span>100%</span>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Price Summary */}
//                 {form.hasOffer && form.normalPrice > 0 && form.offerPrice > 0 && (
//                   <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className="text-sm text-slate-600">Price Summary</p>
//                         <div className="flex items-center gap-3 mt-1">
//                           <span className="text-lg font-bold text-slate-800">৳{form.offerPrice.toFixed(2)}</span>
//                           <span className="text-slate-500 line-through">৳{form.normalPrice.toFixed(2)}</span>
//                           <span className="text-sm font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
//                             Save ৳{(form.normalPrice - form.offerPrice).toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                       <BadgePercent className="text-green-500" size={24} />
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Sizes & Stock */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <label className="block text-sm font-semibold text-slate-700 mb-2">
//                       Size-wise Stock Management
//                     </label>
//                     <p className="text-sm text-slate-500">
//                       Add sizes and their individual stock quantities
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
//                     <Package size={16} />
//                     <div className="text-right">
//                       <span className="text-sm font-medium block">Total Stock</span>
//                       <span className="text-lg font-bold">{form.stock} items</span>
//                     </div>
//                   </div>
//                 </div>

//                 {(errors.sizes || errors.stock) && (
//                   <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <p className="text-red-600 text-sm">{errors.sizes || errors.stock}</p>
//                   </div>
//                 )}

//                 <div className="space-y-3">
//                   {form.sizes.map((s, idx) => (
//                     <div key={idx} className="flex gap-3">
//                       <div className="flex-1">
//                         <label className="block text-xs text-slate-500 mb-1">Size</label>
//                         <input
//                           className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400"
//                           placeholder="e.g., M, L, XL, XXL"
//                           value={s.size}
//                           onChange={(e) => handleSizeChange(idx, 'size', e.target.value)}
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <label className="block text-xs text-slate-500 mb-1">Stock Quantity</label>
//                         <input
//                           type="number"
//                           className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800"
//                           placeholder="Enter quantity"
//                           value={s.stock}
//                           onChange={(e) => handleSizeChange(idx, 'stock', e.target.value)}
//                           min="0"
//                         />
//                       </div>
//                       {form.sizes.length > 1 && (
//                         <div className="flex items-end">
//                           <button
//                             type="button"
//                             onClick={() => {
//                               const updatedSizes = form.sizes.filter(
//                                 (_, i) => i !== idx
//                               );
//                               setForm({ ...form, sizes: updatedSizes });
//                             }}
//                             className="px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-200"
//                             title="Remove size"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setForm({
//                       ...form,
//                       sizes: [...form.sizes, { size: "", stock: 0 }],
//                     })
//                   }
//                   className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors duration-200 group"
//                 >
//                   <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors duration-200">
//                     <span className="text-amber-600 text-lg font-bold">+</span>
//                   </div>
//                   Add New Size Variant
//                 </button>
//               </div>

//               {/* Tags Section */}
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                   <Tag size={16} className="text-slate-500" />
//                   Product Tags
//                 </label>
//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {form.tags.map((t) => (
//                     <span
//                       key={t}
//                       className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-200"
//                     >
//                       {t}
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveTag(t)}
//                         className="text-slate-400 hover:text-slate-600 transition-colors"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//                 <input
//                   type="text"
//                   className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 transition-all duration-200 text-slate-800 placeholder-slate-400"
//                   placeholder="Type a tag and press Enter"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && e.currentTarget.value.trim()) {
//                       handleAddTag(e.currentTarget.value.trim());
//                       e.currentTarget.value = "";
//                       e.preventDefault();
//                     }
//                   }}
//                 />
//               </div>

//               {/* Status Section */}
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-3">
//                   Product Status
//                 </label>
//                 <div className="relative">
//                   <select
//                     className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-amber-500/20 focus:border-amber-500 appearance-none transition-all duration-200 text-slate-800"
//                     value={form.status}
//                     onChange={handleInputChange('status')}
//                   >
//                     <option value="active" className="text-green-600">
//                       Active
//                     </option>
//                     <option value="draft">Draft</option>
//                     <option value="archived">Archived</option>
//                     <option value="low-stock" className="text-orange-600">
//                       Low Stock
//                     </option>
//                     <option value="out-of-stock" className="text-red-600">
//                       Out of Stock
//                     </option>
//                   </select>
//                   <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
//                     <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 transform rotate-45"></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Main Image Upload */}
//               <div>
//                 <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
//                   <ImageIcon size={16} className="text-slate-500" />
//                   Main Product Image {!productId && "*"}
//                 </label>

//                 {imageError && (
//                   <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
//                     <p className="text-red-600 text-sm flex items-center gap-2">
//                       <AlertCircle size={16} />
//                       {imageError}
//                     </p>
//                   </div>
//                 )}

//                 <div className="space-y-4">
//                   <div className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/50 rounded-2xl p-8 text-center transition-colors duration-200">
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageUpload}
//                       className="hidden"
//                       id="image-upload-input"
//                     />
//                     <div className="flex flex-col items-center justify-center gap-4">
//                       <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center">
//                         <ImageIcon className="text-amber-500" size={28} />
//                       </div>
//                       <div>
//                         <p className="text-slate-700 font-medium mb-1">
//                           {form.image
//                             ? form.image.name
//                             : imagePreview
//                             ? "Existing image will be kept"
//                             : "Drag & drop or click to upload"}
//                         </p>
//                         <p className="text-slate-500 text-sm">
//                           JPG, PNG or WebP (Max 5MB)
//                         </p>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => fileInputRef.current?.click()}
//                         className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium shadow-sm hover:shadow"
//                       >
//                         <Upload size={16} className="inline mr-2" />
//                         {imagePreview ? "Change Image" : "Browse Files"}
//                       </button>
//                     </div>
//                   </div>

//                   {imagePreview && (
//                     <div className="mt-6">
//                       <div className="flex items-center justify-between mb-3">
//                         <p className="text-sm font-semibold text-slate-700">
//                           {form.image ? "New Image Preview" : "Current Image"}
//                         </p>
//                         <button
//                           type="button"
//                           onClick={removeImage}
//                           className="text-sm text-slate-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
//                         >
//                           <Trash2 size={16} />
//                           {form.image ? "Remove New Image" : "Remove Image"}
//                         </button>
//                       </div>
//                       <div className="relative w-56 h-56 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
//                         <img
//                           src={imagePreview}
//                           alt="Preview"
//                           className="w-full h-full object-cover"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Help Text */}
//                   <div className="text-xs text-slate-500 mt-2">
//                     {!productId ? (
//                       <p>* Main image is required for new products</p>
//                     ) : (
//                       <p>Leave empty to keep existing main image</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Images Section */}
//               <div className="mt-8">
//                 <div className="flex items-center justify-between mb-3">
//                   <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
//                     <ImageIcon size={16} className="text-slate-500" />
//                     Additional Images (Max 4)
//                   </label>
//                   <span className="text-sm text-slate-500">
//                     {existingAdditionalImages.length + form.additionalImages.length}/4 images
//                   </span>
//                 </div>

//                 {errors.additionalImages && (
//                   <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <p className="text-red-600 text-sm">{errors.additionalImages}</p>
//                   </div>
//                 )}

//                 <div className="space-y-4">
//                   {/* File input for additional images */}
//                   <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-200 ${
//                     (existingAdditionalImages.length + form.additionalImages.length) >= 4 
//                       ? "border-red-200 bg-red-50/50 cursor-not-allowed" 
//                       : "border-slate-300 hover:border-blue-400 bg-slate-50/50"
//                   }`}
//                   >
//                     <input
//                       ref={additionalFileInputRef}
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={handleAdditionalImagesUpload}
//                       className="hidden"
//                       id="additional-images-input"
//                       disabled={(existingAdditionalImages.length + form.additionalImages.length) >= 4}
//                     />
                    
//                     <div className="flex flex-col items-center justify-center gap-4">
//                       <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
//                         {(existingAdditionalImages.length + form.additionalImages.length) >= 4 ? (
//                           <X className="text-blue-500" size={28} />
//                         ) : (
//                           <Plus className="text-blue-500" size={28} />
//                         )}
//                       </div>
//                       <div>
//                         <p className="text-slate-700 font-medium mb-1">
//                           {(existingAdditionalImages.length + form.additionalImages.length) >= 4 
//                             ? "Maximum 4 images reached" 
//                             : "Click to upload additional images"}
//                         </p>
//                         <p className="text-slate-500 text-sm">
//                           Upload up to 4 additional images (JPG, PNG, WebP, Max 5MB each)
//                         </p>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           if ((existingAdditionalImages.length + form.additionalImages.length) < 4) {
//                             additionalFileInputRef.current?.click();
//                           }
//                         }}
//                         disabled={(existingAdditionalImages.length + form.additionalImages.length) >= 4}
//                         className={`px-6 py-3 rounded-xl font-medium shadow-sm hover:shadow transition-all duration-200 ${
//                           (existingAdditionalImages.length + form.additionalImages.length) >= 4
//                             ? "bg-slate-300 text-slate-500 cursor-not-allowed"
//                             : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
//                         }`}
//                       >
//                         <Upload size={16} className="inline mr-2" />
//                         Add More Images
//                       </button>
//                     </div>
//                   </div>

//                   {/* Additional Images Preview */}
//                   {(existingAdditionalImages.length > 0 || form.additionalImages.length > 0) && (
//                     <div className="mt-6">
//                       <div className="flex items-center justify-between mb-3">
//                         <p className="text-sm font-semibold text-slate-700">
//                           Additional Images Preview ({(existingAdditionalImages.length + form.additionalImages.length)}/4)
//                         </p>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setForm(prev => ({ ...prev, additionalImages: [] }));
//                             setExistingAdditionalImages([]);
//                             setAdditionalPreviews([]);
//                           }}
//                           className="text-sm text-slate-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors"
//                         >
//                           <Trash2 size={14} />
//                           Remove All
//                         </button>
//                       </div>
                      
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         {/* Existing images from database */}
//                         {existingAdditionalImages.map((imgUrl, index) => (
//                           <div key={`existing-${index}`} className="relative group">
//                             <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
//                               <img
//                                 src={imgUrl}
//                                 alt={`Existing additional ${index + 1}`}
//                                 className="w-full h-full object-cover"
//                               />
                              
//                               {/* Overlay on hover */}
//                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
//                                 <button
//                                   type="button"
//                                   onClick={() => removeExistingAdditionalImage(index)}
//                                   className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                                 >
//                                   <Trash2 size={18} />
//                                 </button>
//                               </div>
//                             </div>
                            
//                             {/* File info */}
//                             <div className="mt-2">
//                               <p className="text-xs font-medium text-slate-700 truncate">
//                                 Existing Image {index + 1}
//                               </p>
//                               <p className="text-xs text-slate-500">
//                                 From database
//                               </p>
//                             </div>
//                           </div>
//                         ))}
                        
//                         {/* New uploaded images */}
//                         {form.additionalImages.map((file, index) => (
//                           <div key={`new-${index}`} className="relative group">
//                             <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
//                               {additionalPreviews[existingAdditionalImages.length + index] ? (
//                                 <img
//                                   src={additionalPreviews[existingAdditionalImages.length + index]}
//                                   alt={`New additional ${index + 1}`}
//                                   className="w-full h-full object-cover"
//                                 />
//                               ) : (
//                                 <div className="w-full h-full bg-slate-100 flex items-center justify-center">
//                                   <ImageIcon className="text-slate-400" size={24} />
//                                 </div>
//                               )}
                              
//                               {/* Overlay on hover */}
//                               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
//                                 <button
//                                   type="button"
//                                   onClick={() => removeAdditionalImage(index)}
//                                   className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
//                                 >
//                                   <Trash2 size={18} />
//                                 </button>
//                               </div>
//                             </div>
                            
//                             {/* File info */}
//                             <div className="mt-2">
//                               <p className="text-xs font-medium text-slate-700 truncate">
//                                 {file.name}
//                               </p>
//                               <p className="text-xs text-slate-500">
//                                 {(file.size / 1024 / 1024).toFixed(2)} MB
//                               </p>
//                             </div>
                            
//                             {/* Error message */}
//                             {additionalImageErrors[index] && (
//                               <div className="absolute -bottom-2 left-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded">
//                                 {additionalImageErrors[index]}
//                               </div>
//                             )}
//                           </div>
//                         ))}
//                       </div>
                      
//                       {/* Empty slots indicator */}
//                       {(existingAdditionalImages.length + form.additionalImages.length) < 4 && (
//                         <div className="mt-4 text-sm text-slate-500">
//                           <p>
//                             {4 - (existingAdditionalImages.length + form.additionalImages.length)} slot(s) remaining for additional images
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Product Flags */}
//               <div className="bg-gradient-to-r from-amber-50/50 via-white to-amber-50/30 border border-amber-100 rounded-2xl p-6">
//                 <div className="flex items-center gap-3 mb-6">
//                   <Sparkles className="text-amber-500" size={20} />
//                   <h3 className="text-lg font-semibold text-slate-800">
//                     Product Flags & Features
//                   </h3>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                   {[
//                     {
//                       label: "Featured",
//                       description: "Highlight on homepage",
//                       icon: Sparkles,
//                       field: "featured",
//                       checked: form.featured,
//                     },
//                     {
//                       label: "Bestseller",
//                       description: "Top selling product",
//                       icon: TrendingUp,
//                       field: "isBestSelling",
//                       checked: form.isBestSelling,
//                     },
//                     {
//                       label: "New Arrival",
//                       description: "Recently added",
//                       field: "isNew",
//                       checked: form.isNew,
//                     },
//                     {
//                       label: "Special Offer",
//                       description: "Discounted price",
//                       icon: Percent,
//                       field: "hasOffer",
//                       checked: form.hasOffer,
//                     },
//                   ].map((flag) => (
//                     <div
//                       key={flag.label}
//                       className={`flex items-center justify-between p-4 bg-white rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-sm ${
//                         flag.checked
//                           ? flag.field === "hasOffer" 
//                             ? "border-green-300 bg-green-50/50"
//                             : "border-amber-300 bg-amber-50/50"
//                           : "border-slate-200"
//                       }`}
//                       onClick={() => handleCheckboxChange(flag.field as any)}
//                     >
//                       <div className="flex items-center space-x-3">
//                         <div
//                           className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                             flag.checked
//                               ? flag.field === "hasOffer"
//                                 ? "bg-gradient-to-br from-green-400 to-green-500"
//                                 : "bg-gradient-to-br from-amber-400 to-amber-500"
//                               : "bg-slate-100"
//                           }`}
//                         >
//                           {flag.icon ? (
//                             <flag.icon
//                               className={
//                                 flag.checked ? "text-white" : "text-slate-400"
//                               }
//                               size={18}
//                             />
//                           ) : (
//                             <span
//                               className={`font-bold text-sm ${
//                                 flag.checked ? "text-white" : "text-slate-400"
//                               }`}
//                             >
//                               NEW
//                             </span>
//                           )}
//                         </div>
//                         <div>
//                           <span className="text-slate-800 font-semibold">
//                             {flag.label}
//                           </span>
//                           <p className="text-slate-500 text-xs">
//                             {flag.description}
//                           </p>
//                         </div>
//                       </div>
//                       <label className="inline-flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           checked={flag.checked}
//                           onChange={() => {}}
//                           className="sr-only"
//                         />
//                         <div
//                           className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
//                             flag.checked
//                               ? flag.field === "hasOffer"
//                                 ? "bg-green-500"
//                                 : "bg-amber-500"
//                               : "bg-slate-300"
//                           }`}
//                         >
//                           <div
//                             className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
//                               flag.checked ? "left-5" : "left-1"
//                             }`}
//                           ></div>
//                         </div>
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-4 pt-6 border-t border-slate-200">
//                 <button
//                   onClick={() => router.push("/products")}
//                   className="flex-1 px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-400 font-semibold transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSubmit}
//                   disabled={submitting}
//                   className="flex-1 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl hover:from-slate-950 hover:to-slate-800 font-semibold shadow-sm hover:shadow disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden group"
//                 >
//                   {submitting ? (
//                     <span className="flex items-center justify-center gap-3">
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       {productId ? "Updating..." : "Creating..."}
//                     </span>
//                   ) : (
//                     <>
//                       <span className="relative z-10">
//                         {productId ? "Update Product" : "Create Product"}
//                       </span>
//                       <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-slate-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }