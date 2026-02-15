import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * @desc    Get comprehensive dashboard analytics
 * @route   GET /api/analytics/dashboard
 * @access  Private (admin)
 *
 * Returns a rich set of KPIs, trends, and breakdowns for the admin dashboard.
 * All aggregations are done server-side for performance.
 */
router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  asyncHandler(async (req, res) => {
    const now = new Date();

    // ─── Parallel aggregations for performance ───
    const [
      totalProducts,
      lowStockProducts,
      totalCustomers,
      orderStats,
      revenueAgg,
      monthlyTrend,
      categoryAgg,
      topProductsAgg,
      dailyOrdersAgg,
      supplierAgg,
      recentOrders,
      orderStatusAgg,
    ] = await Promise.all([
      // 1. Total product count
      Product.countDocuments(),

      // 2. Low stock products (stock < minStock)
      Product.find({ $expr: { $lt: ["$stock", "$minStock"] } })
        .select("name stock minStock category")
        .sort({ stock: 1 })
        .limit(10),

      // 3. Total customers
      User.countDocuments({ role: "customer" }),

      // 4. Order statistics
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            acceptedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
            },
            rejectedOrders: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
          },
        },
      ]),

      // 5. Total revenue (accepted orders only)
      Order.aggregate([
        { $match: { status: "accepted" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            avgOrderValue: { $avg: "$total" },
          },
        },
      ]),

      // 6. Monthly revenue trend (last 12 months)
      (() => {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        return Order.aggregate([
          {
            $match: {
              status: "accepted",
              createdAt: { $gte: twelveMonthsAgo },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              revenue: { $sum: "$total" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]);
      })(),

      // 7. Inventory by category
      Product.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
          },
        },
        { $sort: { totalValue: -1 } },
      ]),

      // 8. Top selling products (by quantity in accepted orders)
      Order.aggregate([
        { $match: { status: "accepted" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 8 },
      ]),

      // 9. Daily order trend (last 30 days)
      (() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return Order.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              orders: { $sum: 1 },
              revenue: { $sum: "$total" },
            },
          },
          { $sort: { _id: 1 } },
        ]);
      })(),

      // 10. Supplier breakdown
      Product.aggregate([
        {
          $group: {
            _id: "$supplier",
            products: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            avgPrice: { $avg: "$price" },
            totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
          },
        },
        { $sort: { totalValue: -1 } },
      ]),

      // 11. Recent orders (last 10)
      Order.find()
        .populate("customer", "name")
        .sort({ createdAt: -1 })
        .limit(10)
        .select("orderNumber customerName total status createdAt items"),

      // 12. Order status distribution
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    // ─── Process expiring products ───
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringProducts = await Product.find({
      expiry: { $lte: thirtyDaysFromNow, $gte: now },
    })
      .select("name batch expiry category")
      .sort({ expiry: 1 })
      .limit(10);

    const expiredProducts = await Product.countDocuments({
      expiry: { $lt: now },
    });

    // ─── Format monthly trend ───
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesData = monthlyTrend.map((item) => ({
      name: months[item._id.month - 1],
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.orders,
    }));

    // ─── Format daily orders ───
    const dailyOrders = dailyOrdersAgg.map((d) => ({
      date: d._id,
      orders: d.orders,
      revenue: Math.round(d.revenue * 100) / 100,
    }));

    // ─── Format category data ───
    const categoryData = categoryAgg.map((c) => ({
      name: c._id || "Uncategorized",
      count: c.count,
      totalStock: c.totalStock,
      totalValue: Math.round(c.totalValue * 100) / 100,
    }));

    // ─── Format supplier data ───
    const supplierData = supplierAgg.map((s) => ({
      name: s._id,
      products: s.products,
      totalStock: s.totalStock,
      avgPrice: Math.round(s.avgPrice * 100) / 100,
      totalValue: Math.round(s.totalValue * 100) / 100,
    }));

    // ─── Format order status ───
    const statusColors = { pending: "#f59e0b", accepted: "#10b981", rejected: "#ef4444" };
    const orderStatusData = orderStatusAgg.map((s) => ({
      name: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      value: s.count,
      color: statusColors[s._id] || "#94a3b8",
    }));

    // ─── Format top products ───
    const topProducts = topProductsAgg.map((p) => ({
      name: p.name,
      quantity: p.totalQuantity,
      revenue: Math.round(p.totalRevenue * 100) / 100,
    }));

    // ─── Stock alerts ───
    const stockAlerts = lowStockProducts.map((p) => ({
      id: p._id,
      name: p.name,
      stock: p.stock,
      minStock: p.minStock,
      category: p.category,
      severity: p.stock === 0 ? "critical" : p.stock < p.minStock * 0.5 ? "high" : "medium",
    }));

    // ─── Extract KPIs ───
    const stats = orderStats[0] || { totalOrders: 0, pendingOrders: 0, acceptedOrders: 0, rejectedOrders: 0 };
    const rev = revenueAgg[0] || { totalRevenue: 0, avgOrderValue: 0 };

    res.json({
      // KPI Summary
      totalProducts,
      lowStockCount: lowStockProducts.length,
      expiringCount: expiringProducts.length,
      expiredCount: expiredProducts,
      totalRevenue: Math.round(rev.totalRevenue * 100) / 100,
      avgOrderValue: Math.round(rev.avgOrderValue * 100) / 100,
      totalOrders: stats.totalOrders,
      pendingOrders: stats.pendingOrders,
      acceptedOrders: stats.acceptedOrders,
      rejectedOrders: stats.rejectedOrders,
      totalCustomers,

      // Charts & tables
      salesData,
      dailyOrders,
      categoryData,
      topProducts,
      orderStatusData,
      supplierData,
      stockAlerts,
      expiringProducts,
      recentOrders,
    });
  })
);

export default router;