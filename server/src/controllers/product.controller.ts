// server/src/controller/product.controller.ts

// server/src/controller/product.controller.ts

// Using any type to bypass TypeScript errors
import Product from '../models/product.models';
import fs from "fs";
import path from "path";

// Helper function to delete old image files
const deleteOldImages = (imagePaths: string | string[]) => {
  if (!imagePaths) return;

  const paths = Array.isArray(imagePaths) ? imagePaths : [imagePaths];
  
  paths.forEach((imagePath) => {
    if (imagePath && imagePath.startsWith("/uploads/")) {
      const fullPath = path.join(__dirname, "../../..", imagePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted old image: ${fullPath}`);
        } catch (error) {
          console.error(`Error deleting image ${fullPath}:`, error);
        }
      }
    }
  });
};

// Create product
export const createProduct = async (req: any, res: any) => {
  try {
    console.log("=== CREATE PRODUCT ===");
    console.log("Admin:", req.admin?.email);
    console.log("Files:", req.files);
    console.log("Body fields:", Object.keys(req.body));

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const {
      title,
      description,
      category,
      normalPrice,
      originalPrice,
      salePrice,
      sizes,
      tags,
      featured,
      isBestSelling,
      isNew,
      stock,
      keepExistingImage,
    } = req.body;

    // Get files
    const files = req.files as { [fieldname: string]: any[] };
    
    // Process main image
    let imageUrl = "";
    if (files && files.image && files.image[0]) {
      imageUrl = `/uploads/${files.image[0].filename}`;
    }

    // Process additional images
    let additionalImages: string[] = [];
    if (files && files.additionalImages) {
      additionalImages = files.additionalImages.map(
        (file: any) => `/uploads/${file.filename}`
      );
      console.log(`Added ${additionalImages.length} additional images`);
    }

    // Parse sizes and calculate total stock
    let totalStock = 0;
    let variants = [];
    
    if (sizes) {
      try {
        const sizesArray = JSON.parse(sizes);
        totalStock = sizesArray.reduce(
          (acc: number, s: any) => acc + (parseInt(s.stock) || 0),
          0
        );
        
        // Create variants from sizes
        variants = sizesArray.map((size: any, index: number) => ({
          sku: `${req.body.sku || `VAR-${Date.now()}-${index}`}`,
          size: size.size || "M",
          stockQuantity: parseInt(size.stock) || 0,
          reservedQuantity: 0,
          availableQuantity: parseInt(size.stock) || 0,
          status: (parseInt(size.stock) || 0) > 0 ? 'in_stock' : 'out_of_stock'
        }));
      } catch (e) {
        console.error("Error parsing sizes:", e);
        totalStock = parseInt(stock) || 0;
      }
    } else {
      totalStock = parseInt(stock) || 0;
    }

    // Generate SKU from title if not provided
    let sku = req.body.sku;
    if (!sku && title) {
      const titleAbbr = title
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 4);
      
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const timestamp = Date.now().toString().slice(-4);
      
      sku = `${titleAbbr}-${randomNum}-${timestamp}`.toUpperCase();
    }

    // Determine inventory status
    let inventoryStatus = 'in_stock';
    if (totalStock <= 0) {
      inventoryStatus = 'out_of_stock';
    } else if (totalStock <= 10) {
      inventoryStatus = 'low_stock';
    }

    const productData: any = {
      title,
      description,
      category,
      normalPrice: parseFloat(normalPrice) || 0,
      originalPrice: originalPrice ? parseFloat(originalPrice) : parseFloat(normalPrice) || 0,
      salePrice: salePrice ? parseFloat(salePrice) : undefined,
      sku,
      manageStock: true,
      stockQuantity: totalStock,
      availableQuantity: totalStock,
      reservedQuantity: 0,
      lowStockThreshold: 10,
      reorderPoint: 20,
      reorderQuantity: 50,
      unitCost: 0,
      totalInventoryValue: 0,
      isNewProduct: isNew === "true" || isNew === true,
      isBestSelling: isBestSelling === "true" || isBestSelling === true,
      featured: featured === "true" || featured === true,
      productStatus: req.body.productStatus || "active",
      inventoryStatus,
      imageUrl,
      images: additionalImages,
      additionalImages,
      hasVariants: variants.length > 0,
      variants: variants,
      tags: tags ? JSON.parse(tags) : [],
      createdBy: req.admin._id,
    };

    console.log("Creating product:", productData.title);
    console.log("SKU:", productData.sku);
    console.log("Stock quantity:", productData.stockQuantity);

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (err: any) {
    console.error("Create product error:", err);
    res.status(500).json({
      success: false,
      message: "Server error creating product",
      error: err.message,
    });
  }
};

// Update product
export const updateProduct = async (req: any, res: any) => {
  try {
    console.log("=== UPDATE PRODUCT ===");
    console.log("Product ID:", req.params.id);
    console.log("Admin:", req.admin?.email);
    console.log("Files:", req.files);

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Find existing product first
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateData: any = {};
    const files = req.files as { [fieldname: string]: any[] };

    // Parse basic fields
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.normalPrice !== undefined) updateData.normalPrice = parseFloat(req.body.normalPrice);
    if (req.body.originalPrice !== undefined) updateData.originalPrice = parseFloat(req.body.originalPrice);
    if (req.body.salePrice !== undefined) updateData.salePrice = parseFloat(req.body.salePrice);
    if (req.body.sku !== undefined) updateData.sku = req.body.sku;

    // Parse boolean fields - use new field names
    if (req.body.featured !== undefined) {
      updateData.featured = req.body.featured === "true" || req.body.featured === true;
    }
    if (req.body.isBestSelling !== undefined) {
      updateData.isBestSelling = req.body.isBestSelling === "true" || req.body.isBestSelling === true;
    }
    if (req.body.isNew !== undefined) {
      updateData.isNewProduct = req.body.isNew === "true" || req.body.isNew === true;
    }

    // Handle product status
    if (req.body.productStatus !== undefined) {
      updateData.productStatus = req.body.productStatus;
    } else if (req.body.status !== undefined) {
      updateData.productStatus = req.body.status;
    }

    // Parse sizes and update variants
    if (req.body.sizes) {
      try {
        const sizesArray = JSON.parse(req.body.sizes);
        const totalStock = sizesArray.reduce((acc: number, s: any) => acc + (parseInt(s.stock) || 0), 0);
        
        updateData.hasVariants = true;
        updateData.variants = sizesArray.map((size: any, index: number) => ({
          sku: `${existingProduct.sku}-${size.size}-${index}`,
          size: size.size || "M",
          stockQuantity: parseInt(size.stock) || 0,
          reservedQuantity: 0,
          availableQuantity: parseInt(size.stock) || 0,
          status: (parseInt(size.stock) || 0) > 0 ? 'in_stock' : 'out_of_stock'
        }));
        
        updateData.stockQuantity = totalStock;
        updateData.availableQuantity = totalStock - (existingProduct.reservedQuantity || 0);
      } catch (e) {
        console.error("Error parsing sizes:", e);
      }
    }

    // Handle stock updates if no sizes provided
    if (req.body.stock !== undefined && !req.body.sizes) {
      updateData.stockQuantity = parseInt(req.body.stock) || 0;
      updateData.availableQuantity = updateData.stockQuantity - (existingProduct.reservedQuantity || 0);
    }

    // Update inventory status
    if (updateData.availableQuantity !== undefined) {
      if (updateData.availableQuantity <= 0) {
        updateData.inventoryStatus = 'out_of_stock';
      } else if (updateData.availableQuantity <= (existingProduct.lowStockThreshold || 10)) {
        updateData.inventoryStatus = 'low_stock';
      } else {
        updateData.inventoryStatus = 'in_stock';
      }
    }

    if (req.body.tags) {
      try {
        updateData.tags = JSON.parse(req.body.tags);
      } catch (e) {
        console.error("Error parsing tags:", e);
      }
    }

    // Handle main image update
    if (files && files.image && files.image[0]) {
      // Delete old main image
      if (existingProduct.imageUrl) {
        deleteOldImages(existingProduct.imageUrl);
      }
      updateData.imageUrl = `/uploads/${files.image[0].filename}`;
    } else if (req.body.keepExistingImage !== "true") {
      // If no new image and not keeping existing, remove image
      if (existingProduct.imageUrl) {
        deleteOldImages(existingProduct.imageUrl);
      }
      updateData.imageUrl = "";
    }

    // Handle additional images
    if (files && files.additionalImages && files.additionalImages.length > 0) {
      // Delete old additional images
      if (existingProduct.additionalImages && existingProduct.additionalImages.length > 0) {
        deleteOldImages(existingProduct.additionalImages);
      }
      
      updateData.additionalImages = files.additionalImages.map(
        (file: any) => `/uploads/${file.filename}`
      );
      updateData.images = updateData.additionalImages;
    } else if (req.body.keepExistingAdditionalImages !== "true") {
      // If no new additional images and not keeping existing, clear them
      if (existingProduct.additionalImages && existingProduct.additionalImages.length > 0) {
        deleteOldImages(existingProduct.additionalImages);
      }
      updateData.additionalImages = [];
      updateData.images = [];
    }

    console.log("Update data:", updateData);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found after update",
      });
    }

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (err: any) {
    console.error("Update product error:", err);
    res.status(500).json({
      success: false,
      message: "Server error updating product",
      error: err.message,
    });
  }
};

// Get all products
export const getAllProducts = async (req: any, res: any) => {
  try {
    console.log("=== GET ALL PRODUCTS ===");

    const products = await Product.find().sort({ createdAt: -1 });

    // Transform all products to match frontend expectations
    const transformedProducts = products.map((product) => {
      const productObj = product.toObject();
      return {
        _id: productObj._id,
        title: productObj.title || "",
        description: productObj.description || "",
        category: productObj.category || "",
        normalPrice: productObj.normalPrice || 0,
        salePrice: productObj.salePrice || undefined,
        originalPrice: productObj.originalPrice || productObj.normalPrice,
        imageUrl: productObj.imageUrl || "",
        additionalImages: productObj.additionalImages || [],
        rating: productObj.rating || 0,
        reviewCount: 0,
        isBestSelling: productObj.isBestSelling || false,
        isNew: productObj.isNewProduct || false,
        featured: productObj.featured || false,
        stock: productObj.stockQuantity || 0,
        brand: "",
        sizes: productObj.variants?.map((v: any) => ({ 
          size: v.size, 
          stock: v.stockQuantity 
        })) || [],
        colors: [],
        discountPercentage:
          productObj.salePrice && productObj.originalPrice
            ? Math.round(
                ((productObj.originalPrice - productObj.salePrice) /
                  productObj.originalPrice) *
                  100
              )
            : 0,
        tags: productObj.tags || [],
        status: productObj.productStatus || "active",
        sku: productObj.sku || "",
        inventoryStatus: productObj.inventoryStatus || 'in_stock',
        createdAt: productObj.createdAt,
        updatedAt: productObj.updatedAt,
      };
    });

    console.log(`Found ${transformedProducts.length} products`);

    res.json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts,
    });
  } catch (err: any) {
    console.error("Get all products error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching products",
    });
  }
};

// Get product by ID
export const getProductById = async (req: any, res: any) => {
  try {
    console.log("=== GET PRODUCT BY ID ===");
    console.log("Product ID:", req.params.id);

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get the plain object from mongoose
    const productObj = product.toObject();

    // Transform to match frontend expectations
    const transformedProduct = {
      _id: productObj._id,
      title: productObj.title || "",
      description: productObj.description || "",
      category: productObj.category || "",
      normalPrice: productObj.normalPrice || 0,
      salePrice: productObj.salePrice || undefined,
      originalPrice: productObj.originalPrice || productObj.normalPrice,
      imageUrl: productObj.imageUrl || "",
      additionalImages: productObj.additionalImages || [],
      rating: productObj.rating || 0,
      reviewCount: 0,
      isBestSelling: productObj.isBestSelling || false,
      isNew: productObj.isNewProduct || false,
      featured: productObj.featured || false,
      stock: productObj.stockQuantity || 0,
      brand: "",
      sizes: productObj.variants?.map((v: any) => ({ 
        size: v.size, 
        stock: v.stockQuantity 
      })) || [],
      colors: [],
      discountPercentage:
        productObj.salePrice && productObj.originalPrice
          ? Math.round(
              ((productObj.originalPrice - productObj.salePrice) /
                productObj.originalPrice) *
                100
            )
          : 0,
      tags: productObj.tags || [],
      status: productObj.productStatus || "active",
      sku: productObj.sku || "",
      inventoryStatus: productObj.inventoryStatus || 'in_stock',
      availableQuantity: productObj.availableQuantity || 0,
      reservedQuantity: productObj.reservedQuantity || 0,
      createdAt: productObj.createdAt,
      updatedAt: productObj.updatedAt,
    };

    console.log("Transformed product for frontend:", {
      id: transformedProduct._id,
      title: transformedProduct.title,
      sku: transformedProduct.sku,
      stock: transformedProduct.stock,
      available: transformedProduct.availableQuantity,
    });

    res.json({
      success: true,
      data: transformedProduct,
    });
  } catch (err: any) {
    console.error("Get product by ID error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching product",
      error: err.message,
    });
  }
};

// Delete product
export const deleteProduct = async (req: any, res: any) => {
  try {
    console.log("=== DELETE PRODUCT ===");
    console.log("Product ID:", req.params.id);
    console.log("Admin:", req.admin?.email);

    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Check if product exists first
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(`Deleting product: ${existingProduct.title} (${existingProduct._id})`);

    // Delete all images
    if (existingProduct.imageUrl) {
      deleteOldImages(existingProduct.imageUrl);
    }
    
    if (existingProduct.additionalImages && existingProduct.additionalImages.length > 0) {
      deleteOldImages(existingProduct.additionalImages);
    }

    // Delete the product
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Product deleted successfully:", product.title);

    res.json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: {
        id: product._id,
        title: product.title,
      },
    });
  } catch (err: any) {
    console.error("Delete product error:", err);
    res.status(500).json({
      success: false,
      message: "Server error deleting product",
      error: err.message,
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req: any, res: any) => {
  try {
    const products = await Product.find({
      category: req.params.slug,
      productStatus: "active",
    });

    const transformedProducts = products.map((product) => {
      const productObj = product.toObject();
      return {
        _id: productObj._id,
        title: productObj.title || "",
        description: productObj.description || "",
        category: productObj.category || "",
        normalPrice: productObj.normalPrice || 0,
        salePrice: productObj.salePrice || undefined,
        originalPrice: productObj.originalPrice || productObj.normalPrice,
        imageUrl: productObj.imageUrl || "",
        additionalImages: productObj.additionalImages || [],
        rating: productObj.rating || 0,
        isBestSelling: productObj.isBestSelling || false,
        isNew: productObj.isNewProduct || false,
        stock: productObj.stockQuantity || 0,
        discountPercentage:
          productObj.salePrice && productObj.originalPrice
            ? Math.round(
                ((productObj.originalPrice - productObj.salePrice) /
                  productObj.originalPrice) *
                  100
              )
            : 0,
        sku: productObj.sku || "",
        inventoryStatus: productObj.inventoryStatus || 'in_stock',
      };
    });

    res.json({
      success: true,
      count: transformedProducts.length,
      data: transformedProducts,
    });
  } catch (err: any) {
    console.error("Get products by category error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// INVENTORY METHODS
export const getInventoryReport = async (req: any, res: any) => {
  try {
    const { 
      status, 
      search, 
      page = '1', 
      limit = '50',
      sortBy = 'availableQuantity',
      sortOrder = 'asc'
    } = req.query;
    
    const query: any = { manageStock: true };
    
    if (status && status !== 'all') {
      query.inventoryStatus = status;
    }
    
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .select('title sku category stockQuantity availableQuantity reservedQuantity inventoryStatus unitCost totalInventoryValue lowStockThreshold reorderPoint warehouseLocation lastRestocked')
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);
    
    // Calculate inventory stats
    const stats = {
      totalItems: total,
      inStock: await Product.countDocuments({ ...query, inventoryStatus: 'in_stock' }),
      lowStock: await Product.countDocuments({ ...query, inventoryStatus: 'low_stock' }),
      outOfStock: await Product.countDocuments({ ...query, inventoryStatus: 'out_of_stock' }),
      totalValue: await Product.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalInventoryValue' } } }
      ]).then(result => result[0]?.total || 0),
      totalItemsCount: await Product.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$stockQuantity' } } }
      ]).then(result => result[0]?.total || 0)
    };
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      stats
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateProductStock = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { quantity, action, reason } = req.body;
    
    if (!['add', 'remove'].includes(action)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid action. Use "add" or "remove"'
      });
    }
    
    const quantityNum = parseInt(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be a positive number'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    if (!product.manageStock) {
      return res.status(400).json({
        success: false,
        error: 'Stock management not enabled for this product'
      });
    }
    
    // Update stock
    if (action === 'add') {
      product.stockQuantity += quantityNum;
    } else {
      product.stockQuantity = Math.max(0, product.stockQuantity - quantityNum);
    }
    
    // Update inventory status
    product.availableQuantity = product.stockQuantity - product.reservedQuantity;
    
    if (product.availableQuantity <= 0) {
      product.inventoryStatus = 'out_of_stock';
    } else if (product.availableQuantity <= product.lowStockThreshold) {
      product.inventoryStatus = 'low_stock';
    } else {
      product.inventoryStatus = 'in_stock';
    }
    
    // Update total value
    product.totalInventoryValue = product.stockQuantity * product.unitCost;
    product.lastRestocked = new Date();
    
    // Add to inventory history
    if (!product.inventoryHistory) {
      product.inventoryHistory = [];
    }
    
    product.inventoryHistory.push({
      date: new Date(),
      type: action === 'add' ? 'stock_in' : 'stock_out',
      quantity: quantityNum,
      previousQuantity: action === 'add' ? product.stockQuantity - quantityNum : product.stockQuantity + quantityNum,
      newQuantity: product.stockQuantity,
      reason: reason || 'Manual adjustment',
      performedBy: req.admin?._id
    });
    
    await product.save();
    
    res.json({
      success: true,
      data: product,
      message: `Stock ${action === 'add' ? 'added' : 'removed'} successfully`
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getLowStockAlerts = async (req: any, res: any) => {
  try {
    const lowStockProducts = await Product.find({
      manageStock: true,
      inventoryStatus: 'low_stock'
    })
    .select('title sku availableQuantity lowStockThreshold reorderPoint')
    .sort({ availableQuantity: 1 })
    .limit(50);
    
    res.json({
      success: true,
      data: lowStockProducts,
      count: lowStockProducts.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const reserveProductStock = async (req: any, res: any) => {
  try {
    const { items } = req.body;
    
    const reservations = [];
    const errors = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        errors.push(`Product ${item.productId} not found`);
        continue;
      }
      
      if (!product.manageStock) {
        reservations.push({
          productId: item.productId,
          quantity: item.quantity,
          reserved: true,
          message: 'Stock management disabled'
        });
        continue;
      }
      
      if (product.availableQuantity < item.quantity) {
        errors.push(`Insufficient stock for ${product.title}. Available: ${product.availableQuantity}, Requested: ${item.quantity}`);
        continue;
      }
      
      // Reserve stock
      product.reservedQuantity += item.quantity;
      product.availableQuantity = product.stockQuantity - product.reservedQuantity;
      
      // Add to history
      if (!product.inventoryHistory) {
        product.inventoryHistory = [];
      }
      
      product.inventoryHistory.push({
        date: new Date(),
        type: 'reservation',
        quantity: item.quantity,
        previousQuantity: product.reservedQuantity - item.quantity,
        newQuantity: product.reservedQuantity,
        reason: 'Order reservation',
        performedBy: req.admin?._id
      });
      
      await product.save();
      
      reservations.push({
        productId: item.productId,
        quantity: item.quantity,
        reserved: true
      });
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
        reservations
      });
    }
    
    res.json({
      success: true,
      message: 'Stock reserved successfully',
      reservations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getInventorySummary = async (req: any, res: any) => {
  try {
    const summary = await Product.aggregate([
      { $match: { manageStock: true } },
      {
        $group: {
          _id: '$inventoryStatus',
          count: { $sum: 1 },
          totalItems: { $sum: '$stockQuantity' },
          totalValue: { $sum: '$totalInventoryValue' },
          avgUnitCost: { $avg: '$unitCost' }
        }
      }
    ]);
    
    const totalStats = await Product.aggregate([
      { $match: { manageStock: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' },
          totalReserved: { $sum: '$reservedQuantity' },
          totalAvailable: { $sum: '$availableQuantity' },
          totalInventoryValue: { $sum: '$totalInventoryValue' }
        }
      }
    ]);
    
    res.json({
      success: true,
      summary,
      totalStats: totalStats[0] || {}
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};