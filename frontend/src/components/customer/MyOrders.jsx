import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Package, MapPin, Clock, Download, RefreshCw, ChevronRight, Star, X } from 'lucide-react';
import { Button } from '../ui/button';
import api from '../../services/api';
import OrderTracking from './OrderTracking';
import RatingModal from './RatingModal';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';
import { OrderRowSkeleton } from '../shared/PageSkeleton';

const STATUS_CONFIG = {
  placed: { label: 'Order Placed', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  confirmed: { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  preparing: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  on_way: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const OrderCard = ({ order, onTrack, onDownloadInvoice, onReorder, onRate, onCancel }) => {
  const [downloading, setDownloading] = useState(false);
  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.placed;
  const canTrack = ['placed', 'confirmed', 'preparing', 'on_way'].includes(order.status);
  const canCancel = ['placed', 'confirmed'].includes(order.status);
  const canInvoice = order.status === 'delivered';
  const canRate = order.status === 'delivered' && !order.rating;
  const hasRating = !!order.rating;
  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await onDownloadInvoice(order.id || order._id);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden" data-testid={`order-card-${order.orderId}`}>
      {/* Top strip */}
      <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #FF5200, #FF8C00)' }} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">{order.restaurantName}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{createdAt} · #{order.orderId?.slice(-8)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* Items */}
        <div className="mb-3">
          {(order.items || []).slice(0, 3).map((item, i) => (
            <p key={i} className="text-sm text-gray-600">
              {item.quantity}× {item.menuItemName}
              {item.isVeg !== undefined && (
                <span className={`ml-1 text-xs font-medium ${item.isVeg ? 'text-green-600' : 'text-red-600'}`}>
                  {item.isVeg ? '[V]' : '[NV]'}
                </span>
              )}
            </p>
          ))}
          {(order.items || []).length > 3 && (
            <p className="text-xs text-gray-400">+{order.items.length - 3} more items</p>
          )}
        </div>

        {/* Existing rating display */}
        {hasRating && (
          <div className="mb-3 flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= (order.rating?.rating || order.rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-amber-700">
              You rated this {order.rating?.rating || order.rating}/5
            </span>
            {order.rating?.review && (
              <span className="text-xs text-gray-400 truncate max-w-[140px]">
                — "{order.rating.review}"
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400">Total</p>
            <p className="font-bold text-gray-900">₹{order.total?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 text-xs h-8"
                onClick={() => onCancel(order)}
                data-testid={`cancel-btn-${order.orderId}`}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            )}
            {canTrack && (
              <Button
                size="sm"
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 text-xs h-8"
                onClick={() => onTrack(order.id || order._id)}
                data-testid={`track-btn-${order.orderId}`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Track
              </Button>
            )}
            {canRate && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs h-8 shadow-sm"
                onClick={() => onRate(order)}
                data-testid={`rate-btn-${order.orderId}`}
              >
                <Star className="w-3 h-3 mr-1 fill-white" />
                Rate
              </Button>
            )}
            {canInvoice && (
              <Button
                size="sm"
                variant="outline"
                className="border-green-200 text-green-600 hover:bg-green-50 text-xs h-8"
                onClick={handleDownload}
                disabled={downloading}
                data-testid={`invoice-btn-${order.orderId}`}
              >
                {downloading ? (
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Download className="w-3 h-3 mr-1" />
                )}
                Invoice
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-500 hover:text-orange-500 text-xs h-8"
              onClick={() => onReorder(order.id || order._id)}
              data-testid={`reorder-btn-${order.orderId}`}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reorder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MyOrders = ({ onClose }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') || '1');
  const [orders, setOrders] = useState([]);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getAll({ page: currentPage, limit: 10 });
      if (response.data?.success) {
        const items = response.data.data || response.data.orders || [];
        setOrders(items);
        setPages(response.data.pagination?.pages || 1);
        setTotal(response.data.pagination?.total || items.length);
      }
    } catch (err) {
      console.error('Orders fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId, friendlyId) => {
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to download');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${friendlyId || orderId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded successfully!');
    } catch (err) {
      toast.error('Invoice download failed. Please try again.');
    }
  };

  const handleReorder = async (orderId) => {
    try {
      await api.orders.reorder(orderId);
      toast.success('Items added to cart!');
    } catch (err) {
      toast.error('Reorder failed. Try again.');
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    
    try {
      const response = await api.orders.cancel(cancellingOrder.id || cancellingOrder._id, 'Customer request');
      if (response.data?.success) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) =>
            (o.id === cancellingOrder.id || o._id === cancellingOrder._id)
              ? { ...o, status: 'cancelled', cancellationReason: 'Customer request' }
              : o
          )
        );
        toast.success('Order cancelled successfully');
      } else {
        toast.error(response.data?.message || 'Failed to cancel order');
      }
    } catch (err) {
      toast.error('Failed to cancel order. Try again.');
    } finally {
      setCancellingOrder(null);
    }
  };

  const handleRated = (orderId, ratingValue, reviewText) => {
    // Update local order state so the "Rate" button disappears
    setOrders((prev) =>
      prev.map((o) =>
        (o.id === orderId || o._id === orderId)
          ? { ...o, rating: { rating: ratingValue, review: reviewText, ratedAt: new Date().toISOString() } }
          : o
      )
    );
    toast.success('Thanks for your feedback! 🎉');
  };

  return (
    <>
      <Helmet>
        <title>My Orders - serveDoor</title>
      </Helmet>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-end z-[150]" onClick={onClose}>
        <div
          className="bg-white h-full w-full max-w-xl shadow-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          data-testid="my-orders-panel"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
              <p className="text-sm text-gray-400">{total} orders</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close my orders">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <OrderRowSkeleton key={i} />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={<Package className="w-12 h-12" />}
                title="You haven't placed any orders yet"
                description="Browse restaurants and place your first order."
                action={
                  <Button onClick={onClose} className="bg-orange-500 hover:bg-orange-600 text-white">
                    Browse Restaurants
                  </Button>
                }
              />
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard
                    key={order.id || order.orderId}
                    order={order}
                    onTrack={(id) => setTrackingOrderId(id)}
                    onDownloadInvoice={(id) => handleDownloadInvoice(id, order.orderId)}
                    onReorder={handleReorder}
                    onRate={(ord) => setRatingOrder(ord)}
                    onCancel={(ord) => setCancellingOrder(ord)}
                  />
                ))}
              </div>
            )}

            {!loading && pages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setSearchParams({ page: String(Math.max(currentPage - 1, 1)) })}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">Page {currentPage} of {pages}</span>
                <Button
                  variant="outline"
                  disabled={currentPage >= pages}
                  onClick={() => setSearchParams({ page: String(Math.min(currentPage + 1, pages)) })}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tracking Modal */}
      {trackingOrderId && (
        <OrderTracking
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
        />
      )}

      {/* Rating Modal */}
      {ratingOrder && (
        <RatingModal
          order={ratingOrder}
          onClose={() => setRatingOrder(null)}
          onRated={handleRated}
        />
      )}

      {/* Cancel Order Confirmation */}
      <ConfirmDialog
        open={!!cancellingOrder}
        title="Cancel Order?"
        description="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        destructive
        onConfirm={handleCancelOrder}
        onCancel={() => setCancellingOrder(null)}
      />
    </>
  );
};

export default MyOrders;

