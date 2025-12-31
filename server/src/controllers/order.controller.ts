// server/src/controllers/order.controllers.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Order } from "../models/order.models";
import Product, { IProduct } from "../models/product.models";

// ✅ Database Transaction Helper
const runTransaction = async (operations: () => Promise<any>) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await operations();
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// ✅ Helper function to update inventory directly
const updateInventoryDirectly = async (orderId: string, oldStatus: string, newStatus: string, adminId?: string) => {
  try {
    console.log(`🔄 Updating inventory for order ${orderId}: ${oldStatus} → ${newStatus}`);
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (!product || !(product as IProduct).manageStock) {
          console.warn(`⚠️ Product ${item.productId} not found or stock management disabled`);
          continue;
        }
        
        const productData = product as IProduct;
        console.log(`📦 Processing product: ${productData.title}, Quantity: ${item.quantity}`);
        console.log(`📊 Before update - Stock: ${productData.stockQuantity}, Reserved: ${productData.reservedQuantity || 0}, Available: ${productData.availableQuantity || productData.stockQuantity}`);
        
        let updateType = '';
        let previousStock = productData.stockQuantity;
        let previousReserved = productData.reservedQuantity || 0;
        
        // Handle status transitions
        if (newStatus === 'shipped' && oldStatus !== 'shipped') {
          // Stock is shipped - deduct from actual stock and reduce reserved
          console.log(`🚚 Shipping order - deducting stock`);
          
          if (productData.stockQuantity >= item.quantity) {
            productData.stockQuantity -= item.quantity;
            // Reduce reserved quantity since it's now shipped
            productData.reservedQuantity = Math.max(0, (productData.reservedQuantity || 0) - item.quantity);
            updateType = 'stock_shipped';
          } else {
            throw new Error(`Insufficient stock to ship ${productData.title}. Available: ${productData.stockQuantity}, Needed: ${item.quantity}`);
          }
        } 
        else if (newStatus === 'cancelled' && oldStatus !== 'cancelled') {
          // Order cancelled - release reserved stock
          console.log(`❌ Order cancelled - releasing reserved stock`);
          
          if (['pending', 'confirmed', 'processing'].includes(oldStatus)) {
            // Release reserved stock
            productData.reservedQuantity = Math.max(0, (productData.reservedQuantity || 0) - item.quantity);
            updateType = 'stock_released';
          } else if (['shipped', 'delivered'].includes(oldStatus)) {
            // Restock since it was already shipped
            console.log(`🔄 Order cancelled after shipping - restocking`);
            productData.stockQuantity += item.quantity;
            updateType = 'stock_restocked';
          }
        }
        // Stock is already reserved when order is created
        else if (newStatus === 'confirmed' && oldStatus === 'pending') {
          // Order confirmed - ensure stock is reserved
          console.log(`✅ Order confirmed - verifying stock reservation`);
          updateType = 'order_confirmed';
        }
        else if (newStatus === 'delivered' && oldStatus === 'shipped') {
          // Order delivered - release any remaining reserved stock and finalize
          console.log(`🎉 Order delivered - finalizing inventory`);
          
          // Release any remaining reserved stock
          if (productData.reservedQuantity && productData.reservedQuantity > 0) {
            const reservedToRelease = Math.min(item.quantity, productData.reservedQuantity);
            productData.reservedQuantity = Math.max(0, productData.reservedQuantity - reservedToRelease);
            console.log(`📦 Released ${reservedToRelease} reserved units for ${productData.title}`);
          }
          
          updateType = 'order_delivered';
        }
        else if (newStatus === 'processing' && oldStatus === 'confirmed') {
          // Processing - no stock changes
          console.log(`⚙️ Order processing`);
          updateType = 'order_processing';
        }
        
        // Update available quantity
        productData.availableQuantity = productData.stockQuantity - (productData.reservedQuantity || 0);
        
        // Update inventory status
        if (productData.availableQuantity <= 0) {
          productData.inventoryStatus = 'out_of_stock';
        } else if (productData.availableQuantity <= productData.lowStockThreshold) {
          productData.inventoryStatus = 'low_stock';
        } else {
          productData.inventoryStatus = 'in_stock';
        }
        
        // Add to inventory history
        if (!productData.inventoryHistory) {
          productData.inventoryHistory = [];
        }
        
        if (updateType) {
          let historyType: 'stock_in' | 'stock_out' | 'adjustment' | 'reservation' | 'release' | 'damage' | 'return';
          let quantityChanged = item.quantity;
          let previousQty = previousStock;
          let newQty = productData.stockQuantity;
          
          if (updateType === 'stock_shipped') {
            historyType = 'stock_out';
            previousQty = previousStock;
            newQty = productData.stockQuantity;
          } else if (updateType === 'stock_released') {
            historyType = 'release';
            previousQty = previousReserved;
            newQty = productData.reservedQuantity || 0;
          } else if (updateType === 'stock_restocked') {
            historyType = 'stock_in';
            previousQty = previousStock;
            newQty = productData.stockQuantity;
          } else if (updateType === 'order_delivered') {
            historyType = 'release';
            previousQty = previousReserved;
            newQty = productData.reservedQuantity || 0;
          } else {
            historyType = 'adjustment';
          }
          
          productData.inventoryHistory.push({
            date: new Date(),
            type: historyType,
            quantity: quantityChanged,
            previousQuantity: previousQty,
            newQuantity: newQty,
            reason: `Order ${order.orderNumber}: ${oldStatus} → ${newStatus}`,
            reference: order.orderNumber,
            performedBy: adminId as any
          });
        }
        
        await product.save({ session });
        console.log(`📊 After update - Stock: ${productData.stockQuantity}, Reserved: ${productData.reservedQuantity || 0}, Available: ${productData.availableQuantity}`);
        console.log(`✅ Updated ${productData.title} - ${updateType}`);
      }
      
      await session.commitTransaction();
      console.log(`✅ Transaction committed for order ${orderId}`);
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error('❌ Update inventory error:', error);
    throw error;
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log('🛒 Creating new order...');
    
    const result = await runTransaction(async () => {
      const order = new Order(req.body);
      
      console.log(`Order Number: ${order.orderNumber || 'Pending'}`);
      console.log(`Items: ${order.items.length}`);
      
      // Reserve stock for all items
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        
        if (product && (product as IProduct).manageStock) {
          const productData = product as IProduct;
          console.log(`📦 Processing: ${productData.title}, Quantity: ${item.quantity}`);
          console.log(`📊 Before - Stock: ${productData.stockQuantity}, Reserved: ${productData.reservedQuantity || 0}, Available: ${productData.availableQuantity || productData.stockQuantity}`);
          
          // Check if enough stock is available
          const available = productData.stockQuantity - (productData.reservedQuantity || 0);
          if (available < item.quantity) {
            throw new Error(`Insufficient stock for ${productData.title}. Available: ${available}, Requested: ${item.quantity}`);
          }
          
          // Reserve stock immediately (for pending orders)
          productData.reservedQuantity = (productData.reservedQuantity || 0) + item.quantity;
          productData.availableQuantity = productData.stockQuantity - productData.reservedQuantity;
          
          // Update inventory status
          if (productData.availableQuantity <= 0) {
            productData.inventoryStatus = 'out_of_stock';
          } else if (productData.availableQuantity <= productData.lowStockThreshold) {
            productData.inventoryStatus = 'low_stock';
          } else {
            productData.inventoryStatus = 'in_stock';
          }
          
          // Add to inventory history
          if (!productData.inventoryHistory) {
            productData.inventoryHistory = [];
          }
          
          productData.inventoryHistory.push({
            date: new Date(),
            type: 'reservation',
            quantity: item.quantity,
            previousQuantity: (productData.reservedQuantity || 0) - item.quantity,
            newQuantity: productData.reservedQuantity,
            reason: `Order created: ${order.orderNumber || 'Pending'}`,
            reference: order.orderNumber || 'Pending',
            performedBy: (req as any).admin?._id as any
          });
          
          await product.save();
          console.log(`📊 After - Stock: ${productData.stockQuantity}, Reserved: ${productData.reservedQuantity}, Available: ${productData.availableQuantity}`);
          console.log(`✅ Stock reserved for: ${productData.title}`);
        } else {
          console.log(`ℹ️ Product ${item.productId} not found or stock management disabled`);
        }
      }
      
      // Save the order after stock updates
      await order.save();
      console.log(`✅ Order created successfully: ${order.orderNumber}`);
      
      return order;
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: "Order created and stock reserved successfully"
    });
  } catch (error: any) {
    console.error('❌ Order creation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const {
      status,
      paymentStatus,
      search,
      page = "1",
      limit = "20",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query: any = {};

    if (status && status !== "all") query.status = status;
    if (paymentStatus && paymentStatus !== "all")
      query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: "i" } },
        { "shippingInfo.fullName": { $regex: search, $options: "i" } },
        { "shippingInfo.phone": { $regex: search, $options: "i" } },
        { "shippingInfo.email": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sort: any = {};
    sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;

    const [orders, total] = await Promise.all([
      Order.find(query).sort(sort).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    // Get stats
    const stats = {
      totalOrders: await Order.countDocuments(),
      pendingOrders: await Order.countDocuments({ status: "pending" }),
      confirmedOrders: await Order.countDocuments({ status: "confirmed" }),
      processingOrders: await Order.countDocuments({ status: "processing" }),
      shippedOrders: await Order.countDocuments({ status: "shipped" }),
      deliveredOrders: await Order.countDocuments({ status: "delivered" }),
      cancelledOrders: await Order.countDocuments({ status: "cancelled" }),
      totalRevenue: await Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]).then((result) => result[0]?.total || 0),
      todayOrders: await Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      todayRevenue: await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
              $lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]).then((result) => result[0]?.total || 0),
    };

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
      stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status, notes, trackingNumber } = req.body;
    
    console.log(`🔄 Updating order status for ID: ${req.params.id}`);
    console.log(`New status: ${status}`);
    
    const result = await runTransaction(async () => {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      const oldStatus = order.status;
      console.log(`Old status: ${oldStatus}`);
      
      // Only proceed if status is changing
      if (status === oldStatus) {
        console.log(`Status unchanged, updating notes/tracking only`);
        if (notes !== undefined) order.notes = notes;
        if (trackingNumber) order.trackingNumber = trackingNumber;
        await order.save();
        return { order, inventoryUpdated: false };
      }
      
      // ✅ IMPORTANT: Update inventory BEFORE changing order status
      console.log(`🔄 Order status changing from ${oldStatus} to ${status}`);
      try {
        await updateInventoryDirectly(
          order._id.toString(),
          oldStatus,
          status,
          (req as any).admin?._id?.toString()
        );
        console.log(`✅ Inventory updated successfully`);
      } catch (error: any) {
        console.error('❌ Error updating inventory:', error.message);
        throw error; // Don't proceed with order update if inventory fails
      }
      
      // Update order
      order.status = status;
      if (notes !== undefined) order.notes = notes;
      if (trackingNumber) order.trackingNumber = trackingNumber;
      
      // When order is delivered, mark payment as paid if COD
      if (status === 'delivered') {
        order.paymentStatus = 'paid';
        console.log(`💰 Payment marked as paid for delivered order`);
      }
      
      await order.save();
      console.log(`✅ Order ${order.orderNumber} updated to ${status}`);
      
      return { order, inventoryUpdated: true };
    });
    
    res.json({
      success: true,
      data: result.order,
      message: `Order status updated to ${status}${result.inventoryUpdated ? ' and inventory updated' : ''}`
    });
  } catch (error: any) {
    console.error('❌ Update order status error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // If order is not cancelled, release reserved stock
    if (['pending', 'confirmed', 'processing'].includes(order.status)) {
      await runTransaction(async () => {
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          
          if (product && (product as IProduct).manageStock) {
            const productData = product as IProduct;
            productData.reservedQuantity = Math.max(0, (productData.reservedQuantity || 0) - item.quantity);
            productData.availableQuantity = productData.stockQuantity - productData.reservedQuantity;
            
            await product.save();
          }
        }
        
        await Order.findByIdAndDelete(req.params.id);
      });
    } else {
      await Order.findByIdAndDelete(req.params.id);
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getOrderStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery: any = {};

    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate as string);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate as string);
    }

    const stats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          paidOrders: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        paidOrders: 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ MANUAL INVENTORY SYNC
export const manualInventorySync = async (req: Request, res: Response) => {
  try {
    console.log('🔄 Starting manual inventory sync...');
    
    // Get all products with stock management
    const products = await Product.find({ manageStock: true });
    console.log(`Found ${products.length} products with stock management`);
    
    let updatedProducts = 0;
    let errors: string[] = [];
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      for (const product of products) {
        try {
          const productData = product as IProduct;
          console.log(`\n📦 Syncing product: ${productData.title} (${productData.sku})`);
          console.log(`Current - Stock: ${productData.stockQuantity}, Reserved: ${productData.reservedQuantity || 0}, Available: ${productData.availableQuantity || productData.stockQuantity}`);
          
          // Calculate reserved stock from pending/confirmed/processing orders
          const pendingOrders = await Order.find({
            'items.productId': product._id.toString(),
            status: { $in: ['pending', 'confirmed', 'processing'] }
          }).session(session);
          
          let totalReserved = 0;
          pendingOrders.forEach(order => {
            order.items.forEach(orderItem => {
              if (orderItem.productId === product._id.toString()) {
                totalReserved += orderItem.quantity;
              }
            });
          });
          
          // Calculate shipped stock (already deducted)
          const shippedOrders = await Order.find({
            'items.productId': product._id.toString(),
            status: { $in: ['shipped', 'delivered'] }
          }).session(session);
          
          let totalShipped = 0;
          shippedOrders.forEach(order => {
            order.items.forEach(orderItem => {
              if (orderItem.productId === product._id.toString()) {
                totalShipped += orderItem.quantity;
              }
            });
          });
          
          // Update product inventory
          const previousReserved = productData.reservedQuantity || 0;
          
          // Update reserved quantity
          productData.reservedQuantity = totalReserved;
          
          // Calculate available quantity
          productData.availableQuantity = productData.stockQuantity - productData.reservedQuantity;
          
          // Update inventory status
          if (productData.availableQuantity <= 0) {
            productData.inventoryStatus = 'out_of_stock';
          } else if (productData.availableQuantity <= productData.lowStockThreshold) {
            productData.inventoryStatus = 'low_stock';
          } else {
            productData.inventoryStatus = 'in_stock';
          }
          
          // Add to inventory history if there were changes
          if (previousReserved !== productData.reservedQuantity) {
            if (!productData.inventoryHistory) {
              productData.inventoryHistory = [];
            }
            
            productData.inventoryHistory.push({
              date: new Date(),
              type: 'adjustment',
              quantity: Math.abs(productData.reservedQuantity - previousReserved),
              previousQuantity: previousReserved,
              newQuantity: productData.reservedQuantity,
              reason: 'Manual inventory sync',
              notes: `Reserved: ${totalReserved}, Shipped: ${totalShipped}`,
              performedBy: (req as any).admin?._id as any
            });
          }
          
          await product.save({ session });
          updatedProducts++;
          
          console.log(`✅ Synced - Stock: ${productData.stockQuantity}, Reserved: ${productData.reservedQuantity}, Available: ${productData.availableQuantity}, Status: ${productData.inventoryStatus}`);
          
        } catch (error: any) {
          const errorMsg = `Product ${(product as IProduct).title}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }
      
      await session.commitTransaction();
      console.log(`\n✅ Inventory sync completed. Updated ${updatedProducts} products.`);
      
      res.json({
        success: true,
        message: `Inventory sync completed. Updated ${updatedProducts} products.`,
        updatedCount: updatedProducts,
        totalProducts: products.length,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error('❌ Manual inventory sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ GET ORDER INVENTORY IMPACT
export const getOrderInventoryImpact = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    const impact: Array<{
      productId: any;
      productName: string;
      sku: string;
      quantity: number;
      status: string;
      stockImpact: string;
      stockChange: number;
      currentStock: number;
      reservedStock: number;
      availableStock: number;
    }> = [];
    
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      
      if (product) {
        const productData = product as IProduct;
        let stockImpact = '';
        let stockChange = 0;
        
        if (order.status === 'shipped' || order.status === 'delivered') {
          stockImpact = 'deducted';
          stockChange = -item.quantity;
        } else if (order.status === 'cancelled') {
          stockImpact = 'released';
          stockChange = item.quantity;
        } else if (['pending', 'confirmed', 'processing'].includes(order.status)) {
          stockImpact = 'reserved';
          stockChange = -item.quantity;
        } else {
          stockImpact = 'no change';
          stockChange = 0;
        }
        
        impact.push({
          productId: item.productId,
          productName: productData.title,
          sku: productData.sku,
          quantity: item.quantity,
          status: productData.inventoryStatus,
          stockImpact,
          stockChange,
          currentStock: productData.stockQuantity,
          reservedStock: productData.reservedQuantity || 0,
          availableStock: productData.availableQuantity || productData.stockQuantity
        });
      }
    }
    
    res.json({
      success: true,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      impact
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ FIX INVENTORY DATA (Run once to fix existing data)
export const fixInventoryData = async (req: Request, res: Response) => {
  try {
    console.log('🔧 Starting inventory data fix...');
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Step 1: Reset all reserved quantities
      await Product.updateMany(
        { manageStock: true },
        { $set: { reservedQuantity: 0, availableQuantity: null } },
        { session }
      );
      
      console.log('✅ Step 1: Reset all reserved quantities to 0');
      
      // Step 2: Process shipped/delivered orders (deduct stock)
      const shippedOrders = await Order.find({
        status: { $in: ['shipped', 'delivered'] }
      }).session(session);
      
      console.log(`Found ${shippedOrders.length} shipped/delivered orders`);
      
      for (const order of shippedOrders) {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.productId, manageStock: true },
            { 
              $inc: { stockQuantity: -item.quantity },
              $setOnInsert: { reservedQuantity: 0 }
            },
            { session }
          );
        }
      }
      
      console.log('✅ Step 2: Deducted stock for shipped/delivered orders');
      
      // Step 3: Process pending/confirmed/processing orders (reserve stock)
      const pendingOrders = await Order.find({
        status: { $in: ['pending', 'confirmed', 'processing'] }
      }).session(session);
      
      console.log(`Found ${pendingOrders.length} pending/confirmed/processing orders`);
      
      for (const order of pendingOrders) {
        for (const item of order.items) {
          await Product.updateOne(
            { _id: item.productId, manageStock: true },
            { 
              $inc: { reservedQuantity: item.quantity },
              $setOnInsert: { stockQuantity: 0 }
            },
            { session }
          );
        }
      }
      
      console.log('✅ Step 3: Reserved stock for pending/confirmed/processing orders');
      
      // Step 4: Calculate available quantity for all products
      const products = await Product.find({ manageStock: true }).session(session);
      
      for (const product of products) {
        const productData = product as IProduct;
        const available = productData.stockQuantity - (productData.reservedQuantity || 0);
        
        let inventoryStatus = 'in_stock';
        if (available <= 0) {
          inventoryStatus = 'out_of_stock';
        } else if (available <= productData.lowStockThreshold) {
          inventoryStatus = 'low_stock';
        }
        
        await Product.updateOne(
          { _id: product._id },
          { 
            $set: { 
              availableQuantity: available,
              inventoryStatus: inventoryStatus
            }
          },
          { session }
        );
      }
      
      console.log('✅ Step 4: Calculated available quantities and statuses');
      
      await session.commitTransaction();
      
      // Get final counts
      const totalProducts = await Product.countDocuments({ manageStock: true });
      const outOfStock = await Product.countDocuments({ 
        manageStock: true, 
        inventoryStatus: 'out_of_stock' 
      });
      const lowStock = await Product.countDocuments({ 
        manageStock: true, 
        inventoryStatus: 'low_stock' 
      });
      
      res.json({
        success: true,
        message: 'Inventory data fixed successfully',
        summary: {
          totalProducts,
          outOfStock,
          lowStock,
          inStock: totalProducts - outOfStock - lowStock
        }
      });
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error('❌ Fix inventory data error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ NEW: Fix delivery inventory issue specifically
export const fixDeliveryInventory = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    
    console.log(`🔧 Fixing delivery inventory for order ${orderId}`);
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Order is not in delivered status'
      });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const updates = [];
      
      for (const item of order.items) {
        const product = await Product.findById(item.productId).session(session);
        
        if (product && (product as IProduct).manageStock) {
          const productData = product as IProduct;
          const previousReserved = productData.reservedQuantity || 0;
          
          console.log(`Fixing ${productData.title}: Reserved=${previousReserved}, Stock=${productData.stockQuantity}`);
          
          // Release any reserved stock that should be released for delivered items
          if (productData.reservedQuantity > 0) {
            const reservedToRelease = Math.min(item.quantity, productData.reservedQuantity);
            productData.reservedQuantity -= reservedToRelease;
            
            // Update available quantity
            productData.availableQuantity = productData.stockQuantity - productData.reservedQuantity;
            
            // Update inventory status
            if (productData.availableQuantity <= 0) {
              productData.inventoryStatus = 'out_of_stock';
            } else if (productData.availableQuantity <= productData.lowStockThreshold) {
              productData.inventoryStatus = 'low_stock';
            } else {
              productData.inventoryStatus = 'in_stock';
            }
            
            // Add to inventory history
            if (!productData.inventoryHistory) {
              productData.inventoryHistory = [];
            }
            
            productData.inventoryHistory.push({
              date: new Date(),
              type: 'release',
              quantity: reservedToRelease,
              previousQuantity: previousReserved,
              newQuantity: productData.reservedQuantity,
              reason: `Delivery fix for order ${order.orderNumber}`,
              reference: order.orderNumber,
              performedBy: (req as any).admin?._id as any
            });
            
            await product.save({ session });
            
            updates.push({
              productId: item.productId,
              productName: productData.title,
              reservedReleased: reservedToRelease,
              newReserved: productData.reservedQuantity,
              newAvailable: productData.availableQuantity,
              newStatus: productData.inventoryStatus
            });
            
            console.log(`✅ Fixed ${productData.title}: Released ${reservedToRelease} reserved units`);
          }
        }
      }
      
      await session.commitTransaction();
      
      res.json({
        success: true,
        message: 'Delivery inventory fixed successfully',
        orderNumber: order.orderNumber,
        updates
      });
      
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error('❌ Fix delivery inventory error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};