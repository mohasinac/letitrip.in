/**
 * Admin Dashboard Page
 * Path: /admin/dashboard
 * 
 * Overview statistics and quick actions for admins
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, Typography, Button } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { THEME_CONSTANTS } from '@/constants/theme';
import { apiClient } from '@/lib/api-client';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    disabled: number;
    admins: number;
  };
  trips: {
    total: number;
  };
  bookings: {
    total: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { themed } = THEME_CONSTANTS;

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/admin/dashboard');

      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.error || 'Failed to load statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary} flex items-center justify-center`}>
        <Typography variant="primary">Loading dashboard...</Typography>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary} p-8`}>
        <Card>
          <Typography variant="primary" className="text-red-600">
            {error}
          </Typography>
          <Button onClick={loadStats} variant="primary" className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Typography variant="h1" className="mb-2">
              Admin Dashboard
            </Typography>
            <Typography variant="secondary" className={themed.textSecondary}>
              System overview and management
            </Typography>
          </div>

          <Link href="/admin/users">
            <Button variant="primary">Manage Users</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <Card>
              <Typography variant="secondary" className={themed.textSecondary}>
                Total Users
              </Typography>
              <Typography variant="h1" className="mt-2">
                {stats.users.total.toLocaleString()}
              </Typography>
              <Typography variant="secondary" className="mt-1 text-green-600">
                +{stats.users.newThisMonth} this month
              </Typography>
            </Card>

            {/* Active Users */}
            <Card>
              <Typography variant="secondary" className={themed.textSecondary}>
                Active Users
              </Typography>
              <Typography variant="h1" className="mt-2">
                {stats.users.active.toLocaleString()}
              </Typography>
              <Typography variant="secondary" className="mt-1">
                {((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total
              </Typography>
            </Card>

            {/* Disabled Users */}
            <Card>
              <Typography variant="secondary" className={themed.textSecondary}>
                Disabled Users
              </Typography>
              <Typography variant="h1" className="mt-2">
                {stats.users.disabled.toLocaleString()}
              </Typography>
              <Typography variant="secondary" className="mt-1 text-red-600">
                {((stats.users.disabled / stats.users.total) * 100).toFixed(1)}% of total
              </Typography>
            </Card>

            {/* Admin Users */}
            <Card>
              <Typography variant="secondary" className={themed.textSecondary}>
                Administrators
              </Typography>
              <Typography variant="h1" className="mt-2">
                {stats.users.admins.toLocaleString()}
              </Typography>
            </Card>
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trips */}
            <Card>
              <Typography variant="h2" className="mb-4">
                Trips
              </Typography>
              <Typography variant="primary" className="text-3xl">
                {stats.trips.total.toLocaleString()}
              </Typography>
              <Typography variant="secondary" className={`mt-2 ${themed.textSecondary}`}>
                Total trips created
              </Typography>
            </Card>

            {/* Bookings */}
            <Card>
              <Typography variant="h2" className="mb-4">
                Bookings
              </Typography>
              <Typography variant="primary" className="text-3xl">
                {stats.bookings.total.toLocaleString()}
              </Typography>
              <Typography variant="secondary" className={`mt-2 ${themed.textSecondary}`}>
                Total bookings made
              </Typography>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <Typography variant="h2" className="mb-4">
              Quick Actions
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/users">
                <Button variant="secondary" className="w-full">
                  View All Users
                </Button>
              </Link>
              <Link href="/admin/users?filter=disabled">
                <Button variant="secondary" className="w-full">
                  Review Disabled Accounts
                </Button>
              </Link>
              <Button
                variant="secondary"
                onClick={loadStats}
                className="w-full"
              >
                Refresh Statistics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
