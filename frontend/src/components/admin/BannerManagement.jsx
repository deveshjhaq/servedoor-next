import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import EmptyState from '../shared/EmptyState';
import OptimizedImage from '../shared/OptimizedImage';
import {
  Plus, Image, Edit, Trash2, Eye, EyeOff,
  Calendar, Link, Upload
} from 'lucide-react';

// Mock banner data
const mockBanners = [
  {
    id: 'BNR001',
    title: 'Weekend Special Offer',
    subtitle: 'Get 50% off on selected restaurants',
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=300&fit=crop',
    link_url: '/offers/weekend-special',
    is_active: true,
    position: 1,
    start_date: new Date(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_by: 'admin1',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    id: 'BNR002',
    title: 'Free Delivery Campaign',
    subtitle: 'Free delivery on orders above ₹299',
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&h=300&fit=crop',
    link_url: null,
    is_active: true,
    position: 2,
    start_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    created_by: 'admin1',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'BNR003',
    title: 'New Restaurant Launch',
    subtitle: 'Discover amazing new restaurants in your area',
    image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=300&fit=crop',
    link_url: '/restaurants/new',
    is_active: false,
    position: 3,
    start_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    created_by: 'admin1',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

const BannerManagement = () => {
  const [banners, setBanners] = useState(mockBanners);
  const [loading, setLoading] = useState(false);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    position: 1,
    start_date: '',
    end_date: ''
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image_url: '',
      link_url: '',
      position: 1,
      start_date: '',
      end_date: ''
    });
    setEditingBanner(null);
  };

  const handleCreateBanner = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        // Update existing banner
        setBanners(prev => prev.map(banner => 
          banner.id === editingBanner.id 
            ? { ...banner, ...formData, updated_at: new Date() }
            : banner
        ));
        toast({
          title: "Success",
          description: "Banner updated successfully"
        });
      } else {
        // Create new banner
        const newBanner = {
          id: `BNR${String(Date.now()).slice(-3)}`,
          ...formData,
          is_active: true,
          created_by: 'admin',
          created_at: new Date(),
          start_date: new Date(formData.start_date),
          end_date: new Date(formData.end_date)
        };
        
        setBanners(prev => [...prev, newBanner]);
        toast({
          title: "Success",
          description: "Banner created successfully"
        });
      }
      
      setShowBannerForm(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save banner",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (bannerId, isActive) => {
    try {
      setBanners(prev => prev.map(banner => 
        banner.id === bannerId ? { ...banner, is_active: isActive } : banner
      ));
      
      toast({
        title: "Success",
        description: `Banner ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update banner status",
        variant: "destructive"
      });
    }
  };

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      position: banner.position,
      start_date: banner.start_date ? new Date(banner.start_date).toISOString().split('T')[0] : '',
      end_date: banner.end_date ? new Date(banner.end_date).toISOString().split('T')[0] : ''
    });
    setShowBannerForm(true);
  };

  const handleDeleteBanner = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        setBanners(prev => prev.filter(banner => banner.id !== bannerId));
        toast({
          title: "Success",
          description: "Banner deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete banner",
          variant: "destructive"
        });
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-gray-600 mt-1">Create and manage promotional banners</p>
        </div>
        <Button 
          onClick={() => setShowBannerForm(true)}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4" />
          <span>Create Banner</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Banners</p>
                <p className="text-2xl font-bold">{banners.length}</p>
              </div>
              <Image className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Banners</p>
                <p className="text-2xl font-bold text-green-600">
                  {banners.filter(b => b.is_active).length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Banners</p>
                <p className="text-2xl font-bold text-purple-600">
                  {banners.filter(b => new Date(b.start_date) > new Date()).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <OptimizedImage
                src={banner.image_url}
                alt={banner.title}
                width={800}
                height={192}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 flex space-x-2">
                <Badge className={banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {banner.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="secondary">
                  Position {banner.position}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="mb-3">
                <h3 className="font-bold text-lg mb-1">{banner.title}</h3>
                {banner.subtitle && (
                  <p className="text-gray-600 text-sm">{banner.subtitle}</p>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Start: {formatDate(banner.start_date)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>End: {formatDate(banner.end_date)}</span>
                </div>
                {banner.link_url && (
                  <div className="flex items-center">
                    <Link className="w-4 h-4 mr-2" />
                    <span className="truncate">{banner.link_url}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Active</span>
                  <Switch
                    checked={banner.is_active}
                    onCheckedChange={(checked) => handleToggleStatus(banner.id, checked)}
                  />
                </div>
                
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditBanner(banner)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBanner(banner.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <EmptyState
          icon={<Image className="w-10 h-10" />}
          title="No banners yet"
          description="Create your first promotional banner to get started"
          action={
            <Button onClick={() => setShowBannerForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Banner
            </Button>
          }
        />
      )}

      {/* Banner Form Modal */}
      {showBannerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingBanner ? 'Edit Banner' : 'Create New Banner'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowBannerForm(false);
                  resetForm();
                }}
              >
                ×
              </Button>
            </div>
            
            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter banner title"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Subtitle</label>
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="Enter banner subtitle (optional)"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Image URL *</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="Enter image URL"
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Link URL</label>
                <Input
                  value={formData.link_url}
                  onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                  placeholder="Enter link URL (optional)"
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Position</label>
                  <Input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: parseInt(e.target.value) || 1})}
                    min="1"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBannerForm(false);
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
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;