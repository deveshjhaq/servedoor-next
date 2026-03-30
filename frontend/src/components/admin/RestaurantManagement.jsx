import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import {
  Search, MapPin, Star, Clock, CheckCircle, X, 
  Eye, Filter, MoreVertical, Store
} from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import OptimizedImage from '../shared/OptimizedImage';

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [approvalComment, setApprovalComment] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, allRes] = await Promise.all([
        api.admin.getPendingRestaurants(),
        api.restaurants.getAll()
      ]);
      
      setPendingApprovals(pendingRes.data.data || []);
      setRestaurants(allRes.data || []);
    } catch (error) {
      console.error('Failed to fetch restaurant data:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedRestaurant) return;
    
    try {
      await api.admin.approveRestaurant(
        selectedRestaurant._id || selectedRestaurant.id, 
        approvalStatus, 
        approvalComment
      );
      
      toast({
        title: "Success",
        description: `Restaurant ${approvalStatus} successfully`
      });
      
      setShowApprovalModal(false);
      setSelectedRestaurant(null);
      setApprovalComment('');
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update restaurant status",
        variant: "destructive"
      });
    }
  };

  const openApprovalModal = (restaurant, status) => {
    setSelectedRestaurant(restaurant);
    setApprovalStatus(status);
    setShowApprovalModal(true);
  };

  const filteredData = activeTab === 'pending' 
    ? pendingApprovals.filter(r => 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : restaurants.filter(r => 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  const tabs = [
    { id: 'pending', label: 'Pending Approvals', count: pendingApprovals.length },
    { id: 'approved', label: 'All Restaurants', count: restaurants.length },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
          <p className="text-gray-600 mt-1">Manage restaurant applications and approvals</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search restaurants by name or cuisine..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filters</span>
        </Button>
      </div>

      {/* Restaurant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((restaurant) => (
          <Card key={restaurant._id || restaurant.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* Restaurant Image */}
              <div className="relative h-48">
                <OptimizedImage
                  src={restaurant.image}
                  alt={restaurant.name}
                  width={400}
                  height={192}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                {restaurant.promoted && (
                  <Badge className="absolute top-2 left-2 bg-orange-500">
                    Promoted
                  </Badge>
                )}
                {restaurant.status && (
                  <Badge 
                    className={`absolute top-2 right-2 ${
                      restaurant.status === 'approved' ? 'bg-green-500' :
                      restaurant.status === 'rejected' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }`}
                  >
                    {restaurant.status}
                  </Badge>
                )}
              </div>

              {/* Restaurant Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg truncate">{restaurant.name}</h3>
                  {restaurant.rating && (
                    <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {restaurant.rating}
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>

                {restaurant.location && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{restaurant.location.area}, {restaurant.location.city}</span>
                  </div>
                )}

                {restaurant.deliveryTime && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{restaurant.deliveryTime}</span>
                  </div>
                )}

                {/* Action Buttons */}
                {activeTab === 'pending' ? (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openApprovalModal(restaurant, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openApprovalModal(restaurant, 'rejected')}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && filteredData.length === 0 && (
        <EmptyState
          icon={<Store className="w-10 h-10" />}
          title="No restaurants found"
          description="Try adjusting your search or check back later"
          action={
            searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            ) : null
          }
        />
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {approvalStatus === 'approved' ? 'Approve Restaurant' : 'Reject Restaurant'}
            </h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Restaurant: <strong>{selectedRestaurant?.name}</strong>
              </p>
              <Textarea
                placeholder={`Add a comment for ${approvalStatus}...`}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRestaurant(null);
                  setApprovalComment('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApproval}
                className={`flex-1 ${
                  approvalStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {approvalStatus === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManagement;