import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Plus, Edit, Trash2, Users, Shield, UserCheck, UserX, Search } from "lucide-react";
import { toast } from "sonner";
import adminService, { type StaffUserApi } from "@/services/adminService";

interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string;
  idNumber: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffUser[]>([]);

  const [selectedUser, setSelectedUser] = useState<StaffUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "receptionist" as UserRole,
    phone: "",
    idNumber: "",
    department: "",
  });

  const filteredStaff = staff; // Server-side filtering applied via query params

  const handleAddStaff = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.idNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await adminService.createStaff({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        idNumber: formData.idNumber,
        department: formData.department,
      });
      await loadStaff();
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Staff member added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add staff member");
    }
  };

  const handleEditStaff = async () => {
    if (!selectedUser || !formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.idNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      await adminService.updateStaff(selectedUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        idNumber: formData.idNumber,
        department: formData.department,
      });
      await loadStaff();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      resetForm();
      toast.success("Staff member updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update staff member");
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteStaff(selectedUser.id);
      await loadStaff();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success("Staff member deleted successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete staff member");
    }
  };

  const toggleStaffStatus = async (staffId: string) => {
    try {
      const updated = await adminService.toggleStaffStatus(staffId);
      setStaff(prev => prev.map(m => m.id === staffId ? { ...m, isActive: updated.isActive } : m));
      toast.success("Staff status updated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update staff status");
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "receptionist",
      phone: "",
      idNumber: "",
      department: "",
    });
  };

  const toStaffUser = (apiUser: StaffUserApi): StaffUser => ({
    id: apiUser._id,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    email: apiUser.email,
    role: apiUser.role,
    phone: apiUser.phone || "",
    idNumber: apiUser.idNumber || "",
    department: apiUser.department || "",
    isActive: apiUser.isActive,
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt).toISOString().split('T')[0] : '',
    lastLogin: apiUser.lastLogin,
  });

  const loadStaff = async () => {
    try {
      const res = await adminService.getStaff({
        search: searchTerm || undefined,
        role: roleFilter !== "all" ? (roleFilter as UserRole) : undefined,
        limit: 100,
        sort: '-createdAt',
      });
      setStaff(res.items.map(toStaffUser));
    } catch (error: any) {
      toast.error(error.message || "Failed to load staff");
    }
  };

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadStaff();
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const openEditDialog = (member: StaffUser) => {
    setSelectedUser(member);
    setFormData({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      role: member.role,
      phone: member.phone,
      idNumber: member.idNumber,
      department: member.department || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: StaffUser) => {
    setSelectedUser(member);
    setIsDeleteDialogOpen(true);
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      admin: { label: "Admin", variant: "destructive" as const, icon: Shield },
      receptionist: { label: "Receptionist", variant: "default" as const, icon: UserCheck },
      housekeeping: { label: "Housekeeping", variant: "secondary" as const, icon: Users },
      guest: { label: "Guest", variant: "outline" as const, icon: Users }
    };

    const config = roleConfig[role];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getDepartmentForRole = (role: UserRole) => {
    switch (role) {
      case "receptionist": return "Front Desk";
      case "housekeeping": return "Housekeeping";
      case "admin": return "Management";
      default: return "N/A";
    }
  };

  // Only allow admins to access this page
  if (user?.role !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">Only administrators can access user management.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage staff members and system users • {filteredStaff.length} staff found
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="staff@hotel.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+254 712 345 678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input
                      id="idNumber"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                      placeholder="Enter ID number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as UserRole, department: getDepartmentForRole(value as UserRole)})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receptionist">Receptionist</SelectItem>
                      <SelectItem value="housekeeping">Housekeeping</SelectItem>
                      <SelectItem value="guest">Guest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Department"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleAddStaff} className="flex-1">Add Staff</Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles (Staff)</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Staff Table */}
        <Card>
          <CardHeader>
            <CardTitle>Staff Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.firstName} {member.lastName}
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{getRoleBadge(member.role)}</TableCell>
                    <TableCell>{member.department}</TableCell>
                    <TableCell>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                    </TableCell>
                    <TableCell>
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                          onClick={() => toggleStaffStatus(member.id)}
                    >
                          {member.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                          onClick={() => openDeleteDialog(member)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>

        {/* Edit Staff Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="staff@hotel.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+254 712 345 678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-idNumber">ID Number</Label>
                  <Input
                    id="edit-idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    placeholder="Enter ID number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as UserRole, department: getDepartmentForRole(value as UserRole)})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receptionist">Receptionist</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Department"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditStaff} className="flex-1">Update Staff</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Staff Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedUser?.firstName} {selectedUser?.lastName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStaff} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default UserManagement;