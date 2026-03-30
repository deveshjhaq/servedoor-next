import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import api from '../../services/api';
import usePagination from '../../hooks/usePagination';
import ConfirmDialog from '../shared/ConfirmDialog';
import EmptyState from '../shared/EmptyState';
import { TableRowSkeleton } from '../shared/PageSkeleton';
import {
  Search, User, Mail,
  Shield, ShieldOff, MoreVertical, Calendar
} from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const { toast } = useToast();

  const { data, total, pages, currentPage, setPage, loading, refetch } = usePagination(
    ({ page, limit }) => api.admin.getUsers({ page, limit }),
    { page: 1, limit: 20 }
  );

  const users = data || [];

  const filteredUsers = useMemo(
    () => users.filter((user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    ),
    [users, searchTerm]
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleUserStatus = async (userId, nextIsActive) => {
    try {
      await api.admin.toggleUserStatus(userId, nextIsActive);
      toast({
        title: 'Success',
        description: `User ${nextIsActive ? 'activated' : 'deactivated'} successfully`
      });
      await refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage customer accounts and activities</p>
        </div>
        <Badge variant="secondary">Total Users: {total}</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter((u) => !u.isActive).length}
                </p>
              </div>
              <ShieldOff className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Page</p>
                <p className="text-2xl font-bold text-purple-600">{currentPage}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Accounts</CardTitle>
          <CardDescription>
            Showing {filteredUsers.length} of {users.length} users on this page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <table className="w-full"><tbody>{[...Array(5)].map((_, i) => <TableRowSkeleton key={i} columns={5} />)}</tbody></table>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                        <Badge
                          variant={user.isActive ? 'default' : 'secondary'}
                          className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Joined {formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={user.isActive ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => setConfirmAction({ userId: user._id, isActive: user.isActive })}
                    >
                      {user.isActive ? (
                        <>
                          <ShieldOff className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" aria-label="More user actions">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <EmptyState
              icon={<User className="w-10 h-10" />}
              title="No records found"
              description="Try adjusting your search criteria"
            />
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">Page {currentPage} of {pages || 1}</div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setPage(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage(Math.min(currentPage + 1, pages))} disabled={currentPage >= pages}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmAction?.isActive ? 'Deactivate user?' : 'Activate user?'}
        description="Are you sure you want to update this user status?"
        confirmLabel="Yes, continue"
        destructive={Boolean(confirmAction?.isActive)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (confirmAction) {
            await toggleUserStatus(confirmAction.userId, !confirmAction.isActive);
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
};

export default UserManagement;
