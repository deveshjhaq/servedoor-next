import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import {
  DollarSign, TrendingUp, Download, CreditCard,
  Calendar, Filter, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

// Mock financial data
const mockPayouts = [
  {
    id: 'PAY001',
    restaurantId: 'REST001',
    restaurantName: 'Pizza Palace',
    amount: 15000,
    commissionDeducted: 2250,
    netAmount: 12750,
    status: 'pending',
    requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    bankDetails: {
      accountNumber: '****1234',
      ifscCode: 'HDFC0001234',
      accountHolder: 'Pizza Palace Pvt Ltd'
    }
  },
  {
    id: 'PAY002',
    restaurantId: 'REST002',
    restaurantName: 'Burger Barn',
    amount: 8500,
    commissionDeducted: 1275,
    netAmount: 7225,
    status: 'approved',
    requestDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
    processedDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
    transactionId: 'TXN789123456',
    bankDetails: {
      accountNumber: '****5678',
      ifscCode: 'ICICI0005678',
      accountHolder: 'Burger Barn Foods'
    }
  },
  {
    id: 'PAY003',
    restaurantId: 'REST003',
    restaurantName: 'Spice Garden',
    amount: 22000,
    commissionDeducted: 3300,
    netAmount: 18700,
    status: 'processed',
    requestDate: new Date(Date.now() - 72 * 60 * 60 * 1000),
    processedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    transactionId: 'TXN456789123',
    bankDetails: {
      accountNumber: '****9012',
      ifscCode: 'SBI0009012',
      accountHolder: 'Spice Garden Restaurant'
    }
  }
];

const mockTransactions = [
  {
    id: 'TXN001',
    type: 'order_payment',
    orderId: 'ORD123456',
    amount: 398,
    commission: 59.7,
    netAmount: 338.3,
    restaurantName: 'Pizza Palace',
    status: 'completed',
    date: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: 'TXN002',
    type: 'payout',
    payoutId: 'PAY002',
    amount: -7225,
    restaurantName: 'Burger Barn',
    status: 'completed',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000)
  }
];

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState('payouts');
  const [payouts, setPayouts] = useState(mockPayouts);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const { toast } = useToast();

  const getPayoutStats = () => {
    const pending = payouts.filter(p => p.status === 'pending');
    const approved = payouts.filter(p => p.status === 'approved');
    const processed = payouts.filter(p => p.status === 'processed');
    
    return {
      totalPending: pending.reduce((sum, p) => sum + p.netAmount, 0),
      totalApproved: approved.reduce((sum, p) => sum + p.netAmount, 0),
      totalProcessed: processed.reduce((sum, p) => sum + p.netAmount, 0),
      count: {
        pending: pending.length,
        approved: approved.length,
        processed: processed.length
      }
    };
  };

  const handlePayoutAction = async (payoutId, status) => {
    try {
      // In real implementation, call API
      setPayouts(prev => prev.map(payout => 
        payout.id === payoutId 
          ? { 
              ...payout, 
              status, 
              processedDate: status === 'processed' ? new Date() : payout.processedDate,
              transactionId: status === 'processed' ? transactionId : payout.transactionId
            }
          : payout
      ));
      
      toast({
        title: "Success",
        description: `Payout ${status} successfully`
      });
      
      setShowPayoutModal(false);
      setSelectedPayout(null);
      setApprovalComment('');
      setTransactionId('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update payout status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      processed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      processed: <CheckCircle className="w-4 h-4" />,
      rejected: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = getPayoutStats();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
          <p className="text-gray-600 mt-1">Manage payouts and financial transactions</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </Button>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-600">₹{stats.totalPending.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stats.count.pending} requests</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Payouts</p>
                <p className="text-2xl font-bold text-blue-600">₹{stats.totalApproved.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stats.count.approved} approved</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processed Payouts</p>
                <p className="text-2xl font-bold text-green-600">₹{stats.totalProcessed.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stats.count.processed} completed</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">₹2,45,000</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'payouts', label: 'Payout Requests' },
          { id: 'transactions', label: 'All Transactions' },
          { id: 'reports', label: 'Financial Reports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-orange-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payout Requests Tab */}
      {activeTab === 'payouts' && (
        <Card>
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
            <CardDescription>Review and approve restaurant payout requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="font-mono text-sm font-bold text-gray-900">
                        {payout.id}
                      </div>
                      <Badge className={getStatusColor(payout.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payout.status)}
                          <span className="capitalize">{payout.status}</span>
                        </div>
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Requested: {formatDate(payout.requestDate)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="font-medium text-gray-900 mb-1">{payout.restaurantName}</div>
                      <div className="text-sm text-gray-600">
                        Account: {payout.bankDetails.accountNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        IFSC: {payout.bankDetails.ifscCode}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Gross Amount</div>
                      <div className="font-bold text-lg">₹{payout.amount.toLocaleString()}</div>
                      <div className="text-sm text-red-600">Commission: -₹{payout.commissionDeducted.toLocaleString()}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-600">Net Payout</div>
                      <div className="font-bold text-lg text-green-600">₹{payout.netAmount.toLocaleString()}</div>
                      {payout.transactionId && (
                        <div className="text-sm text-gray-600 font-mono">
                          TXN: {payout.transactionId}
                        </div>
                      )}
                    </div>
                  </div>

                  {payout.status === 'pending' && (
                    <div className="flex space-x-2 mt-4 pt-3 border-t border-gray-100">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayout(payout);
                          setShowPayoutModal(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve & Process
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handlePayoutAction(payout.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>All financial transactions and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      txn.type === 'order_payment' ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">
                        {txn.type === 'order_payment' ? 'Order Payment' : 'Payout'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {txn.restaurantName} • {formatDate(txn.date)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      txn.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount).toLocaleString()}
                    </div>
                    <Badge className={getStatusColor(txn.status)}>
                      {txn.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card>
          <CardHeader>
            <CardTitle>Financial Reports</CardTitle>
            <CardDescription>Generate and download financial reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Revenue Reports</h4>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Daily Revenue Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Monthly Revenue Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Commission Report
                </Button>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Payout Reports</h4>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Payout Summary
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Restaurant Earnings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Tax Reports
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout Approval Modal */}
      {showPayoutModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Process Payout</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Restaurant: <strong>{selectedPayout.restaurantName}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Amount: <strong>₹{selectedPayout.netAmount.toLocaleString()}</strong>
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                <Input
                  placeholder="Enter transaction ID"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Comments (Optional)</label>
                <Textarea
                  placeholder="Add processing notes..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPayoutModal(false);
                  setSelectedPayout(null);
                  setApprovalComment('');
                  setTransactionId('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handlePayoutAction(selectedPayout.id, 'processed')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!transactionId.trim()}
              >
                Process Payout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;