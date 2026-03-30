import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import {
  Settings, Globe, DollarSign, Truck, Mail,
  Phone, Shield, Database, Clock
} from 'lucide-react';

// Mock system settings
const mockSettings = {
  // Business Settings
  business_name: 'serveDoor',
  business_email: 'support@servedoor.com',
  business_phone: '+91-1234567890',
  business_address: 'Mumbai, Maharashtra, India',
  
  // Delivery Settings
  delivery_radius: 10.0,
  min_order_value: 100.0,
  delivery_fee: 30.0,
  free_delivery_above: 300.0,
  max_delivery_time: 60,
  
  // Commission & Pricing
  commission_rate: 15.0,
  payment_gateway_fee: 2.5,
  gst_rate: 5.0,
  surge_multiplier: 1.5,
  
  // App Settings
  app_maintenance: false,
  maintenance_message: 'We are currently under maintenance. Please try again later.',
  allow_new_registrations: true,
  require_phone_verification: true,
  
  // Notification Settings
  enable_email_notifications: true,
  enable_sms_notifications: true,
  enable_push_notifications: true,
  
  // Payment Settings
  enable_cod: true,
  enable_online_payments: true,
  enable_wallet: false,
  
  // Support Settings
  support_chat_enabled: true,
  support_hours: '24/7',
  
  updated_by: 'admin',
  updated_at: new Date()
};

const SystemSettings = () => {
  const [settings, setSettings] = useState(mockSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('business');
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // const response = await api.admin.getSystemSettings();
      // setSettings(response.data.data || mockSettings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // await api.admin.updateSystemSettings(settings);
      
      toast({
        title: "Success",
        description: "System settings updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update system settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'business', label: 'Business Info', icon: Globe },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'app', label: 'App Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Mail },
    { id: 'support', label: 'Support', icon: Shield }
  ];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderBusinessSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>Business Information</span>
        </CardTitle>
        <CardDescription>Configure your business details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Business Name</label>
          <Input
            value={settings.business_name}
            onChange={(e) => handleInputChange('business_name', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Business Email</label>
          <Input
            type="email"
            value={settings.business_email}
            onChange={(e) => handleInputChange('business_email', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Business Phone</label>
          <Input
            value={settings.business_phone}
            onChange={(e) => handleInputChange('business_phone', e.target.value)}
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Business Address</label>
          <Textarea
            value={settings.business_address}
            onChange={(e) => handleInputChange('business_address', e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderDeliverySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="w-5 h-5" />
          <span>Delivery Settings</span>
        </CardTitle>
        <CardDescription>Configure delivery parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Delivery Radius (km)</label>
            <Input
              type="number"
              value={settings.delivery_radius}
              onChange={(e) => handleInputChange('delivery_radius', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Max Delivery Time (mins)</label>
            <Input
              type="number"
              value={settings.max_delivery_time}
              onChange={(e) => handleInputChange('max_delivery_time', parseInt(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Minimum Order Value (₹)</label>
            <Input
              type="number"
              value={settings.min_order_value}
              onChange={(e) => handleInputChange('min_order_value', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Delivery Fee (₹)</label>
            <Input
              type="number"
              value={settings.delivery_fee}
              onChange={(e) => handleInputChange('delivery_fee', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Free Delivery Above (₹)</label>
          <Input
            type="number"
            value={settings.free_delivery_above}
            onChange={(e) => handleInputChange('free_delivery_above', parseFloat(e.target.value))}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderPricingSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Pricing & Commission</span>
        </CardTitle>
        <CardDescription>Configure pricing and commission rates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Commission Rate (%)</label>
            <Input
              type="number"
              value={settings.commission_rate}
              onChange={(e) => handleInputChange('commission_rate', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Payment Gateway Fee (%)</label>
            <Input
              type="number"
              value={settings.payment_gateway_fee}
              onChange={(e) => handleInputChange('payment_gateway_fee', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">GST Rate (%)</label>
            <Input
              type="number"
              value={settings.gst_rate}
              onChange={(e) => handleInputChange('gst_rate', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Surge Multiplier</label>
            <Input
              type="number"
              step="0.1"
              value={settings.surge_multiplier}
              onChange={(e) => handleInputChange('surge_multiplier', parseFloat(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Payment Methods</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Cash on Delivery</span>
              <Switch
                checked={settings.enable_cod}
                onCheckedChange={(checked) => handleInputChange('enable_cod', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Online Payments</span>
              <Switch
                checked={settings.enable_online_payments}
                onCheckedChange={(checked) => handleInputChange('enable_online_payments', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Wallet Payments</span>
              <Switch
                checked={settings.enable_wallet}
                onCheckedChange={(checked) => handleInputChange('enable_wallet', checked)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAppSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Application Settings</span>
        </CardTitle>
        <CardDescription>Configure app behavior and features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Maintenance Mode</span>
              <p className="text-xs text-gray-500">Put app in maintenance mode</p>
            </div>
            <Switch
              checked={settings.app_maintenance}
              onCheckedChange={(checked) => handleInputChange('app_maintenance', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">New Registrations</span>
              <p className="text-xs text-gray-500">Allow new user registrations</p>
            </div>
            <Switch
              checked={settings.allow_new_registrations}
              onCheckedChange={(checked) => handleInputChange('allow_new_registrations', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Phone Verification</span>
              <p className="text-xs text-gray-500">Require phone verification for new users</p>
            </div>
            <Switch
              checked={settings.require_phone_verification}
              onCheckedChange={(checked) => handleInputChange('require_phone_verification', checked)}
            />
          </div>
        </div>
        
        {settings.app_maintenance && (
          <div>
            <label className="text-sm font-medium text-gray-700">Maintenance Message</label>
            <Textarea
              value={settings.maintenance_message}
              onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
              rows={3}
              className="mt-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5" />
          <span>Notification Settings</span>
        </CardTitle>
        <CardDescription>Configure notification preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Email Notifications</span>
              <p className="text-xs text-gray-500">Send notifications via email</p>
            </div>
            <Switch
              checked={settings.enable_email_notifications}
              onCheckedChange={(checked) => handleInputChange('enable_email_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">SMS Notifications</span>
              <p className="text-xs text-gray-500">Send notifications via SMS</p>
            </div>
            <Switch
              checked={settings.enable_sms_notifications}
              onCheckedChange={(checked) => handleInputChange('enable_sms_notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Push Notifications</span>
              <p className="text-xs text-gray-500">Send push notifications to mobile app</p>
            </div>
            <Switch
              checked={settings.enable_push_notifications}
              onCheckedChange={(checked) => handleInputChange('enable_push_notifications', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSupportSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5" />
          <span>Support Settings</span>
        </CardTitle>
        <CardDescription>Configure customer support options</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium">Support Chat</span>
            <p className="text-xs text-gray-500">Enable in-app support chat</p>
          </div>
          <Switch
            checked={settings.support_chat_enabled}
            onCheckedChange={(checked) => handleInputChange('support_chat_enabled', checked)}
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Support Hours</label>
          <Input
            value={settings.support_hours}
            onChange={(e) => handleInputChange('support_hours', e.target.value)}
            placeholder="e.g., 9 AM - 6 PM"
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'business':
        return renderBusinessSettings();
      case 'delivery':
        return renderDeliverySettings();
      case 'pricing':
        return renderPricingSettings();
      case 'app':
        return renderAppSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'support':
        return renderSupportSettings();
      default:
        return renderBusinessSettings();
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <Button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-orange-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;