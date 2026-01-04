// admin/src/app/inventory/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Search,
  BarChart3,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Calendar
} from 'lucide-react';
import { productApi } from '../../../lib/product.api';

interface InventoryItem {
  _id: string;
  title: string;
  sku: string;
  category: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  unitCost: number;
  totalInventoryValue: number;
  warehouseLocation?: {
    warehouse?: string;
    shelf?: string;
    bin?: string;
  };
  inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  variant?: {
    size?: string;
    color?: string;
    material?: string;
  };
  updatedAt: string; // Added date field
}

interface InventoryStats {
  totalItems: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  totalItemsCount: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, [statusFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await productApi.getInventoryReport({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        page: 1,
        limit: 50,
        sortBy: 'availableQuantity',
        sortOrder: 'asc'
      });
      
      if (data.success) {
        const inventoryItems = data.data.map((product: any) => ({
          _id: product._id,
          title: product.title,
          sku: product.sku,
          category: product.category,
          stockQuantity: product.stockQuantity || 0,
          reservedQuantity: product.reservedQuantity || 0,
          availableQuantity: product.availableQuantity || 0,
          lowStockThreshold: product.lowStockThreshold || 10,
          reorderPoint: product.reorderPoint || 20,
          unitCost: product.unitCost || 0,
          totalInventoryValue: product.totalInventoryValue || 0,
          warehouseLocation: product.warehouseLocation,
          inventoryStatus: product.inventoryStatus || 'in_stock',
          variant: product.variant,
          updatedAt: product.updatedAt || product.createdAt || new Date().toISOString() // Add date
        }));
        
        setInventory(inventoryItems);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInventory();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'low_stock': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'out_of_stock': return 'bg-red-100 text-red-800 border border-red-200';
      case 'discontinued': return 'bg-slate-100 text-slate-800 border border-slate-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock': return <CheckCircle size={14} />;
      case 'low_stock': return <AlertTriangle size={14} />;
      case 'out_of_stock': return <XCircle size={14} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      <div className="flex-1 flex flex-col">
        
        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600 mt-1">
                  Track and manage your product stock levels
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  title="Refresh inventory"
                >
                  <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Low Stock</p>
                        <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                        <XCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Out of Stock</p>
                        <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalValue)}</p>
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by SKU or product name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </form>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                  
                  <button
                    onClick={() => {
                      fetchInventory();
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors"
                  >
                    <Filter size={18} className="inline mr-2" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">SKU</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Product</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Stock</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Available</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Value</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Updated</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventory.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.sku}</div>
                          {item.variant && (item.variant.size || item.variant.color) && (
                            <div className="text-xs text-gray-500">
                              {item.variant.size && `Size: ${item.variant.size}`}
                              {item.variant.size && item.variant.color && ' • '}
                              {item.variant.color && `Color: ${item.variant.color}`}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                          {item.warehouseLocation && item.warehouseLocation.warehouse && (
                            <div className="text-xs text-gray-500">
                              Warehouse: {item.warehouseLocation.warehouse}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.stockQuantity}</div>
                          <div className="text-xs text-gray-500">Reserved: {item.reservedQuantity}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`font-bold ${
                            item.availableQuantity <= item.lowStockThreshold
                              ? 'text-amber-600'
                              : item.availableQuantity === 0
                              ? 'text-red-600'
                              : 'text-emerald-600'
                          }`}>
                            {item.availableQuantity}
                          </div>
                          {item.availableQuantity <= item.reorderPoint && (
                            <div className="text-xs text-amber-600">
                              Reorder at: {item.reorderPoint}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{formatCurrency(item.totalInventoryValue)}</div>
                          <div className="text-xs text-gray-500">
                            Cost: {formatCurrency(item.unitCost)}/unit
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.inventoryStatus)}`}>
                            {getStatusIcon(item.inventoryStatus)}
                            {item.inventoryStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">{formatDate(item.updatedAt)}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(item.updatedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {inventory.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No inventory items found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {search || statusFilter !== 'all'
                      ? 'Try adjusting your filters or search terms'
                      : 'No inventory items available'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}