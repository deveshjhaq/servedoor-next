import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import usePagination from '../../hooks/usePagination';
import EmptyState from '../shared/EmptyState';
import { TableRowSkeleton } from '../shared/PageSkeleton';
import {
  Search, Package, Clock, CheckCircle, Truck,
  MapPin, User, Eye
} from 'lucide-react';

const statusOptions = [
  { value: 'all', label: 'All Orders' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'on_way', label: 'On the Way' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

const getStatusColor = (status) => {
  const colors = {
    placed: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    on_way: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const { toast } = useToast();

  const { data, total, pages, currentPage, setPage, loading, refetch } = usePagination(
    ({ page, limit }) => api.admin.getOrders({ page, limit }),
    { page: 1, limit: 20 }
  );

  const orders = data || [];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderId = order.orderId || order.id || '';
      const restaurantName = order.restaurantName || '';
      const matchesSearch =
        orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.admin.updateOrderStatus(orderId, { status: newStatus });
      toast({ title: 'Success', description: `Order status updated to ${newStatus}` });
      await refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const stats = {
    total,
    active: orders.filter((o) => ['placed', 'confirmed', 'preparing', 'on_way'].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">Track and manage customer orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Total Orders</p><p className="text-2xl font-bold">{stats.total}</p></div><Package className="w-8 h-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Active Orders</p><p className="text-2xl font-bold text-orange-600">{stats.active}</p></div><Clock className="w-8 h-8 text-orange-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Delivered</p><p className="text-2xl font-bold text-green-600">{stats.delivered}</p></div><CheckCircle className="w-8 h-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-gray-600">Cancelled</p><p className="text-2xl font-bold text-red-600">{stats.cancelled}</p></div><Truck className="w-8 h-8 text-red-600" /></div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by order id or restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Showing {filteredOrders.length} of {orders.length} orders on this page</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <table className="w-full"><tbody>{[...Array(6)].map((_, i) => <TableRowSkeleton key={i} columns={6} />)}</tbody></table>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const orderId = order.id || order._id;
                const humanId = order.orderId || orderId;
                return (
                  <div key={orderId} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="font-mono text-sm font-bold text-gray-900">#{humanId}</div>
                        <Badge className={getStatusColor(order.status)}>
                          <span className="capitalize">{(order.status || '').replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="font-medium text-gray-900">{order.restaurantName || 'Restaurant'}</div>
                        <div className="text-sm text-gray-600">Items: {(order.items || []).length}</div>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-700">
                          <User className="w-4 h-4 mr-1" />
                          {order.userId || '-'}
                        </div>
                        <div className="text-sm text-gray-600">Payment: {order.paymentMethod || '-'}</div>
                      </div>

                      <div>
                        <div className="flex items-center text-sm text-gray-700">
                          <MapPin className="w-4 h-4 mr-1" />
                          ₹{order.total || order.totalAmount || 0}
                        </div>
                        <div className="text-sm text-gray-600">{order.deliveryAddress?.city || '-'}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        {order.status === 'placed' && <Button size="sm" onClick={() => updateOrderStatus(orderId, 'confirmed')} className="bg-green-600 hover:bg-green-700">Confirm</Button>}
                        {order.status === 'confirmed' && <Button size="sm" onClick={() => updateOrderStatus(orderId, 'preparing')} className="bg-yellow-600 hover:bg-yellow-700">Preparing</Button>}
                        {order.status === 'preparing' && <Button size="sm" onClick={() => updateOrderStatus(orderId, 'on_way')} className="bg-purple-600 hover:bg-purple-700">Out for Delivery</Button>}
                        {order.status === 'on_way' && <Button size="sm" onClick={() => updateOrderStatus(orderId, 'delivered')} className="bg-green-600 hover:bg-green-700">Delivered</Button>}
                      </div>

                      <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && filteredOrders.length === 0 && (
            <EmptyState icon={<Package className="w-10 h-10" />} title="No records found" description="Try adjusting your search or filters" />
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">Page {currentPage} of {pages || 1}</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(Math.min(currentPage + 1, pages))} disabled={currentPage >= pages}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <Button variant="outline" size="sm" onClick={() => setShowOrderModal(false)}>x</Button>
            </div>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(selectedOrder, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
