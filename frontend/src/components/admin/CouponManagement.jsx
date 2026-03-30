import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import api from '../../services/api';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';
import {
  Plus, Gift, Edit, Trash2, Copy, Calendar,
  Percent, DollarSign, Users
} from 'lucide-react';

// Mock coupon data
const mockCoupons = [
  {
    id: 'CPN001',
    code: 'WELCOME50',
    title: 'Welcome Offer',
    description: 'Get 50% off on your first order',
    discount_type: 'percentage',
    discount_value: 50,
    min_order_value: 200,
    max_discount: 100,
    usage_limit: 1000,
    used_count: 245,
    is_active: true,
    valid_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    applicable_to: 'all',
    created_by: 'admin1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'CPN002',
    code: 'FREEDEL',
    title: 'Free Delivery',
    description: 'Free delivery on orders above ₹299',
    discount_type: 'delivery',
    discount_value: 30,
    min_order_value: 299,
    max_discount: 30,
    usage_limit: null,
    used_count: 1520,
    is_active: true,
    valid_from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    valid_until: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    applicable_to: 'all',
    created_by: 'admin1',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'CPN003',
    code: 'FLAT100',
    title: 'Flat ₹100 Off',
    description: 'Flat ₹100 discount on orders above ₹500',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_value: 500,
    max_discount: 100,
    usage_limit: 500,
    used_count: 89,
    is_active: true,
    valid_from: new Date(),
    valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    applicable_to: 'restaurants',
    created_by: 'admin1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'CPN004',
    code: 'WEEKEND20',
    title: 'Weekend Special',
    description: '20% off on weekend orders',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_value: 300,
    max_discount: 150,
    usage_limit: 200,
    used_count: 200,
    is_active: false,
    valid_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    valid_until: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    applicable_to: 'all',
    created_by: 'admin1',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }
];

const CouponManagement = () => {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [loading, setLoading] = useState(false);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    applicable_to: 'all'
  });

  const discountTypes = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'delivery', label: 'Delivery Fee' }
  ];

  const applicableOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'new_users', label: 'New Users Only' },
    { value: 'restaurants', label: 'Specific Restaurants' },
    { value: 'premium', label: 'Premium Users' }
  ];

  const resetForm = () => {
    setFormData({
      code: '',
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_value: '',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
      applicable_to: 'all'
    });
    setEditingCoupon(null);
  };

  const generateCouponCode = () => {
    const prefix = formData.title.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'COUP';
    const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${suffix}`;
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    
    try {
      const couponData = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value),
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: new Date(formData.valid_from),
        valid_until: new Date(formData.valid_until)
      };
      
      if (editingCoupon) {
        // Update existing coupon
        setCoupons(prev => prev.map(coupon => 
          coupon.id === editingCoupon.id 
            ? { ...coupon, ...couponData, updated_at: new Date() }
            : coupon
        ));
        toast.success('Coupon updated successfully');
      } else {
        // Create new coupon
        const newCoupon = {
          id: `CPN${String(Date.now()).slice(-3)}`,
          ...couponData,
          used_count: 0,
          is_active: true,
          created_by: 'admin',
          created_at: new Date()
        };
        
        setCoupons(prev => [...prev, newCoupon]);
        toast.success('Coupon created successfully');
      }
      
      setShowCouponForm(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save coupon');
    }
  };

  const handleToggleStatus = async (couponId, isActive) => {
    try {
      setCoupons(prev => prev.map(coupon => 
        coupon.id === couponId ? { ...coupon, is_active: isActive } : coupon
      ));
      
      toast.success(`Coupon ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error('Failed to update coupon status');
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value.toString(),
      max_discount: coupon.max_discount ? coupon.max_discount.toString() : '',
      usage_limit: coupon.usage_limit ? coupon.usage_limit.toString() : '',
      valid_from: new Date(coupon.valid_from).toISOString().split('T')[0],
      valid_until: new Date(coupon.valid_until).toISOString().split('T')[0],
      applicable_to: coupon.applicable_to
    });
    setShowCouponForm(true);
  };

  const handleDeleteCoupon = async () => {
    if (!deletingCoupon) return;
    
    try {
      setCoupons(prev => prev.filter(coupon => coupon.id !== deletingCoupon.id));
      toast.success('Coupon deleted successfully');
    } catch (error) {
      toast.error('Failed to delete coupon');
    } finally {
      setDeletingCoupon(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Coupon code "${text}" copied to clipboard`);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (coupon) => {
    return new Date(coupon.valid_until) < new Date();
  };

  const isUsageLimitReached = (coupon) => {
    return coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
  };

  const getCouponStats = () => {
    return {
      total: coupons.length,
      active: coupons.filter(c => c.is_active && !isExpired(c)).length,
      expired: coupons.filter(c => isExpired(c)).length,
      totalUsage: coupons.reduce((sum, c) => sum + c.used_count, 0)
    };
  };

  const stats = getCouponStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Create and manage discount coupons</p>
        </div>
        <Button 
          onClick={() => setShowCouponForm(true)}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Gift className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Coupons</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Gift className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Coupons</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalUsage}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Coupons</CardTitle>
          <CardDescription>Manage your discount coupons and promotional codes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="font-mono font-bold text-lg bg-orange-100 text-orange-800 px-3 py-1 rounded">
                        {coupon.code}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(coupon.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Badge className={coupon.is_active && !isExpired(coupon) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {isExpired(coupon) ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      {isUsageLimitReached(coupon) && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Limit Reached
                        </Badge>
                      )}
                      
                      <Badge variant="secondary" className="capitalize">
                        {coupon.discount_type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Created: {formatDate(coupon.created_at)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="font-medium text-gray-900 mb-1">{coupon.title}</div>
                    <div className="text-sm text-gray-600">{coupon.description}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600">Discount</div>
                    <div className="font-bold text-lg text-orange-600">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}%` 
                        : `₹${coupon.discount_value}`
                      }
                    </div>
                    {coupon.max_discount && coupon.discount_type === 'percentage' && (
                      <div className="text-xs text-gray-500">Max ₹{coupon.max_discount}</div>
                    )}
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600">Min Order</div>
                    <div className="font-bold">₹{coupon.min_order_value}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600">Usage</div>
                    <div className="font-bold">
                      {coupon.used_count}
                      {coupon.usage_limit && `/${coupon.usage_limit}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div>Valid: {formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}</div>
                  <div>Applicable to: {coupon.applicable_to.replace('_', ' ')}</div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Active</span>
                    <Switch
                      checked={coupon.is_active}
                      onCheckedChange={(checked) => handleToggleStatus(coupon.id, checked)}
                      disabled={isExpired(coupon)}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCoupon(coupon)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingCoupon(coupon)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {coupons.length === 0 && (
            <EmptyState
              icon={<Gift className="w-10 h-10" />}
              title="No coupons yet"
              description="Create your first coupon to start offering discounts"
              action={
                <Button onClick={() => setShowCouponForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Coupon
                </Button>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Coupon Form Modal */}
      {showCouponForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowCouponForm(false);
                  resetForm();
                }}
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Coupon Code *</label>
                  <div className="flex space-x-2 mt-1">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      placeholder="Enter coupon code"
                      required
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({...formData, code: generateCouponCode()})}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter coupon title"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter coupon description"
                  required
                  rows={2}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Discount Type *</label>
                  <Select value={formData.discount_type} onValueChange={(value) => setFormData({...formData, discount_type: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {discountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {formData.discount_type === 'percentage' ? 'Discount %' : 'Discount Amount'} *
                  </label>
                  <Input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '100'}
                    required
                    min="1"
                    max={formData.discount_type === 'percentage' ? '100' : undefined}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Min Order Value *</label>
                  <Input
                    type="number"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData({...formData, min_order_value: e.target.value})}
                    placeholder="200"
                    required
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Max Discount (Optional)</label>
                  <Input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                    placeholder="100"
                    min="1"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Usage Limit (Optional)</label>
                  <Input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    placeholder="1000"
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Valid From *</label>
                  <Input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Valid Until *</label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Applicable To</label>
                  <Select value={formData.applicable_to} onValueChange={(value) => setFormData({...formData, applicable_to: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {applicableOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCouponForm(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deletingCoupon}
        title="Delete Coupon?"
        description={`Are you sure you want to delete the coupon "${deletingCoupon?.code}"? This action cannot be undone.`}
        confirmLabel="Delete Coupon"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleDeleteCoupon}
        onCancel={() => setDeletingCoupon(null)}
      />
    </div>
  );
};

export default CouponManagement;