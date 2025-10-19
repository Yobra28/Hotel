import { Layout } from "@/components/Layout";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { HousekeepingTask as MockTask } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Clock, AlertCircle, Plus, Edit, Trash2, User, Calendar, Search, RefreshCw, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import housekeepingService from "@/services/housekeepingService";
import roomService from "@/services/roomService";

type HKTask = {
  id: string;
  roomId: string;
  assignedTo: string;
  taskType: 'cleaning' | 'maintenance' | 'inspection' | 'deep_clean';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  createdAt: string;
  updatedAt: string;
};

const Housekeeping = () => {
  const { user } = useAuth();
  
  // Available housekeepers for task assignment
  const housekeepers = [
    "Mary Johnson",
    "Peter Kamau", 
    "Sarah Muthoni",
    "John Ochieng",
    "Grace Wanjiku"
  ];
  const [tasks, setTasks] = useState<HKTask[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [backendTasks, backendRooms] = await Promise.all([
          user?.role === 'housekeeping' ? housekeepingService.myTasks() : housekeepingService.listTasks(),
          roomService.getTransformedRooms(),
        ]);
        const t = (backendTasks || []).map((bt: any) => ({
          id: bt._id,
          roomId: bt.roomId,
          assignedTo: bt.assignedTo,
          taskType: bt.taskType,
          status: bt.status,
          priority: bt.priority,
          description: bt.description,
          createdAt: bt.createdAt,
          updatedAt: bt.updatedAt,
        }));
        setTasks(t);
        setRooms(backendRooms || []);
      } catch (e) {
        console.error('Failed to load housekeeping data', e);
        toast.error('Failed to load housekeeping data');
      }
    };
    load();
  }, [user?.role]);
  const [selectedTask, setSelectedTask] = useState<HKTask | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    roomId: "",
    assignedTo: "",
    priority: "medium" as "low" | "medium" | "high",
    description: "",
  });

  // Role-based permissions
  const canCreateTasks = user?.role === "admin";
  const canDeleteTasks = user?.role === "admin";
  const canViewAllTasks = user?.role === "admin";
  const canUpdateTaskStatus = user?.role === "housekeeping";

  const filteredTasks = tasks.filter((task) => {
    const room = rooms.find((r: any) => r.id === task.roomId);
    const matchesSearch = 
      room?.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const updated = await housekeepingService.updateStatus(taskId, newStatus as any);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: updated.status, updatedAt: new Date().toISOString() } : t));
      toast.success(`Task #${taskId} marked as ${newStatus}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update status');
    }
  };

  const handleAddTask = async () => {
    if (!formData.roomId || !formData.assignedTo) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const created = await housekeepingService.createTask({
        roomId: formData.roomId,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        description: formData.description,
        taskType: 'cleaning',
      } as any);
      const newTask: HKTask = {
        id: created._id,
        roomId: created.roomId,
        assignedTo: created.assignedTo,
        priority: created.priority,
        taskType: created.taskType,
        status: created.status,
        description: created.description,
        createdAt: created.createdAt as any,
        updatedAt: created.updatedAt as any,
      };
      setTasks(prev => [...prev, newTask]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Task created successfully!");
    } catch (e: any) {
      toast.error(e.message || 'Failed to create task');
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask || !formData.roomId || !formData.assignedTo) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      if (!selectedTask) return;
      const updated = await housekeepingService.updateTask(selectedTask.id, {
        roomId: formData.roomId,
        assignedTo: formData.assignedTo,
        priority: formData.priority,
        description: formData.description,
      } as any);
      setTasks(prev => prev.map(task => task.id === selectedTask.id ? {
        ...task,
        roomId: updated.roomId,
        assignedTo: updated.assignedTo,
        priority: updated.priority,
        description: updated.description,
        updatedAt: new Date().toISOString(),
      } : task));
      setIsEditDialogOpen(false);
      setSelectedTask(null);
      resetForm();
      toast.success("Task updated successfully!");
    } catch (e: any) {
      toast.error(e.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;

    if (!selectedTask) return;
    try {
      await housekeepingService.deleteTask(selectedTask.id);
      setTasks(prev => prev.filter(task => task.id !== selectedTask.id));
      setIsDeleteDialogOpen(false);
      setSelectedTask(null);
      toast.success("Task deleted successfully!");
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({
      roomId: "",
      assignedTo: "",
      priority: "medium",
      description: "",
    });
  };

  const openEditDialog = (task: HKTask) => {
    setSelectedTask(task);
    setFormData({
      roomId: task.roomId,
      assignedTo: task.assignedTo,
      priority: task.priority,
      description: task.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (task: HKTask) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const createTaskFromCheckout = (roomId: string) => {
    setFormData({
      roomId: roomId,
      assignedTo: "",
      priority: "medium",
      description: "",
    });
    setIsAddDialogOpen(true);
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "medium":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle className="h-4 w-4 text-success" />;
    }
  };

  // Filter tasks based on user role
  const getTasksForUser = () => {
    if (user?.role === "housekeeping") {
      // Housekeeping staff only see their assigned tasks
      return filteredTasks.filter(task => task.assignedTo === user.name);
    }
    return filteredTasks;
  };

  const userTasks = getTasksForUser();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Housekeeping {user?.role === "admin" ? "Management" : "Tasks"}</h1>
            <p className="text-muted-foreground mt-1">
              {user?.role === "housekeeping" 
                ? "View your assigned tasks and mark them as complete" 
                : user?.role === "admin"
                ? "Create, assign, and manage cleaning tasks for housekeeping staff"
                : "Track and monitor cleaning tasks"
              }
            </p>
          </div>
          {canCreateTasks && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Cleaning Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="roomId">Room</Label>
                    <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room: any) => (
                          <SelectItem key={room.id} value={room.id}>
                            Room {room.number} - {room.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assignedTo">Assign to</Label>
                    <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select housekeeper" />
                      </SelectTrigger>
                      <SelectContent>
                        {housekeepers.map((housekeeper) => (
                          <SelectItem key={housekeeper} value={housekeeper}>
                            {housekeeper}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Task Description</Label>
                    <Input 
                      id="description" 
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the cleaning task..."
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddTask} className="flex-1">Create Task</Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Pending Tasks</p>
                <p className="text-4xl font-bold text-warning">
                  {userTasks.filter((t) => t.status === "pending").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">In Progress</p>
                <p className="text-4xl font-bold text-info">
                  {userTasks.filter((t) => t.status === "in-progress").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Completed</p>
                <p className="text-4xl font-bold text-success">
                  {userTasks.filter((t) => t.status === "completed").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Admin Only */}
        {canViewAllTasks && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {userTasks.map((task) => {
            const room = rooms.find((r: any) => r.id === task.roomId);
            return (
              <Card key={task.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold">Room {room?.number}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{room?.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <span className="text-sm font-medium capitalize">{task.priority}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <StatusBadge status={task.status} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Assigned to:</span>
                        <span className="font-medium">{task.assignedTo}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="font-medium">
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {task.description && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{task.description}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      {canUpdateTaskStatus && task.status !== "completed" && (
                        <Button
                          onClick={() => handleUpdateStatus(task.id, "completed")}
                          className="flex-1 bg-gradient-primary"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      {canUpdateTaskStatus && task.status === "completed" && (
                        <div className="flex-1 text-center text-success font-medium py-2 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Task Completed
                        </div>
                      )}
                      
                      {canViewAllTasks && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(task)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Task
                          </Button>
                          {canDeleteTasks && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openDeleteDialog(task)}
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Cleaning Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-roomId">Room</Label>
                <Select value={formData.roomId} onValueChange={(value) => setFormData({...formData, roomId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room: any) => (
                      <SelectItem key={room.id} value={room.id}>
                        Room {room.number} - {room.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-assignedTo">Assign to</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData({...formData, assignedTo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select housekeeper" />
                  </SelectTrigger>
                  <SelectContent>
                    {housekeepers.map((housekeeper) => (
                      <SelectItem key={housekeeper} value={housekeeper}>
                        {housekeeper}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Task Description</Label>
                  <Input 
                    id="edit-description" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the cleaning task..."
                  />
                </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditTask} className="flex-1">Update Task</Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Task Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this cleaning task? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Housekeeping;
