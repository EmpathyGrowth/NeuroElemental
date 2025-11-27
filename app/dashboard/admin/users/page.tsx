'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  MoreVertical,
  Edit,
  Shield,
  Ban,
  Mail,
  Eye,
  UserCog,
  Users,
  CheckCircle,
  Award,
  Briefcase,
} from 'lucide-react';
import { useAsync } from '@/hooks/use-async';
import { logger } from '@/lib/logging';
import { formatDate } from '@/lib/utils';

/** Delay in ms for debouncing search input */
const SEARCH_DEBOUNCE_DELAY = 300;

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  instructorStatus: string | null;
  enrolledCourses: number;
  certificates: number;
  createdAt: string | null;
  lastActive: string | null;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  instructors: number;
  pendingInstructors: number;
}

interface UsersData {
  users: User[];
  stats: Stats;
  total: number;
  page: number;
  limit: number;
}

const defaultData: UsersData = {
  users: [],
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    instructors: 0,
    pendingInstructors: 0,
  },
  total: 0,
  page: 1,
  limit: 50,
};

const roleLabels = {
  admin: { label: 'Admin', icon: Shield, className: 'bg-red-500/10 text-red-500' },
  instructor: { label: 'Instructor', icon: Award, className: 'bg-purple-500/10 text-purple-500' },
  student: { label: 'Student', icon: Users, className: 'bg-blue-500/10 text-blue-500' },
  business: { label: 'Business', icon: Briefcase, className: 'bg-green-500/10 text-green-500' },
  school: { label: 'School', icon: Briefcase, className: 'bg-cyan-500/10 text-cyan-500' },
  registered: { label: 'Registered', icon: Users, className: 'bg-gray-500/10 text-gray-500' },
};

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data: usersData, loading, execute } = useAsync<UsersData>();

  const data = usersData || defaultData;
  const users = data.users;
  const stats = data.stats;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, SEARCH_DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, roleFilter]);

  const fetchUsers = () => {
    execute(async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (roleFilter && roleFilter !== 'all') params.set('role', roleFilter);

      const res = await fetch(`/api/dashboard/admin/users?${params.toString()}`);
      if (!res.ok) {
        logger.error('Failed to fetch users:', new Error(`Status: ${res.status}`));
        return defaultData;
      }
      const result = await res.json();
      if (result.error) {
        logger.error('Error fetching users:', new Error(result.error));
        return defaultData;
      }
      return result;
    });
  };

  if (loading && !usersData) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All time registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructors</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.instructors}</div>
            <p className="text-xs text-muted-foreground">
              Certified instructors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInstructors}</div>
            <p className="text-xs text-muted-foreground">
              Instructor applications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search users by name or email"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              Export Users
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            {data.total} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Certificates</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roleConfig = roleLabels[user.role as keyof typeof roleLabels] || roleLabels.registered;
                const RoleIcon = roleConfig.icon;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge className={roleConfig.className}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {roleConfig.label}
                        </Badge>
                        {user.instructorStatus === 'pending' && (
                          <Badge variant="secondary" className="block w-fit bg-orange-500/10 text-orange-500">
                            Pending Approval
                          </Badge>
                        )}
                        {user.instructorStatus === 'approved' && (
                          <Badge variant="secondary" className="block w-fit bg-green-500/10 text-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Certified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.enrolledCourses}</TableCell>
                    <TableCell>{user.certificates}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.createdAt ? formatDate(user.createdAt) : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.lastActive ? formatDate(user.lastActive) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Open user actions menu">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          {user.instructorStatus === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-green-600">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve Instructor
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {users.length === 0 && !loading && (
            <div className="text-center py-12 text-muted-foreground">
              No users found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
