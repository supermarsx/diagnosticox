import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { securityAPI } from '@/services/securityAPI';
import type { Role, Permission, User } from '@/types';

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  parentRoleId?: string;
}

const INITIAL_ROLE_FORM: RoleFormData = {
  name: '',
  description: '',
  permissions: []
};

export default function RolePermissionsManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState<RoleFormData>(INITIAL_ROLE_FORM);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permissionsData, usersData] = await Promise.all([
        securityAPI.getRoles(),
        securityAPI.getPermissions(),
        securityAPI.getUsers()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load role and permission data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load role and permission data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      const newRole = await securityAPI.createRole(roleForm);
      setRoles(prev => [...prev, newRole]);
      setRoleForm(INITIAL_ROLE_FORM);
      setIsDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Role created successfully'
      });
    } catch (error) {
      console.error('Failed to create role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRole = async (role: Role) => {
    try {
      const updatedRole = await securityAPI.updateRole(role.id, {
        name: role.name,
        description: role.description,
        permissions: role.permissions
      });
      setRoles(prev => prev.map(r => r.id === role.id ? updatedRole : r));
      toast({
        title: 'Success',
        description: 'Role updated successfully'
      });
    } catch (error) {
      console.error('Failed to update role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await securityAPI.deleteRole(roleId);
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast({
        title: 'Success',
        description: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete role',
        variant: 'destructive'
      });
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getUsersCountForRole = (roleId: string) => {
    return users.filter(user => user.roles.includes(roleId)).length;
  };

  const getPermissionName = (permissionId: string) => {
    const permission = permissions.find(p => p.id === permissionId);
    return permission ? permission.name : 'Unknown Permission';
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  const getInheritedRoles = (roleId: string) => {
    return roles.filter(role => role.parentRoleId === roleId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading roles and permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role & Permissions Management</h1>
          <p className="text-muted-foreground mt-2">
            Configure user roles and assign permissions to control access
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Role</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Define a new role and assign permissions to it
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={roleForm.description}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                />
              </div>
              <div className="space-y-2">
                <Label>Parent Role (Optional)</Label>
                <Select
                  value={roleForm.parentRoleId}
                  onValueChange={(value) => setRoleForm(prev => ({ ...prev, parentRoleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded p-3">
                  {permissions.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.id}
                        checked={roleForm.permissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="rounded"
                      />
                      <label htmlFor={permission.id} className="text-sm">
                        {permission.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={!roleForm.name.trim()}
                >
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4">
            {roles.map(role => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{role.name}</span>
                        {role.parentRoleId && (
                          <Badge variant="secondary">
                            Inherits: {getRoleName(role.parentRoleId)}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {getUsersCountForRole(role.id)} users
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={getUsersCountForRole(role.id) > 0}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Permissions</h4>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map(permissionId => (
                          <Badge key={permissionId} variant="secondary">
                            {getPermissionName(permissionId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {getInheritedRoles(role.id).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Inherited Roles</h4>
                        <div className="flex flex-wrap gap-1">
                          {getInheritedRoles(role.id).map(inheritedRole => (
                            <Badge key={inheritedRole.id} variant="outline">
                              {inheritedRole.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Permissions</CardTitle>
              <CardDescription>
                Complete list of available permissions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(permission => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{permission.category}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}