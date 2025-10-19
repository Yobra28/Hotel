import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Users, Clock, DollarSign, Waves, Calendar as CalendarIcon, Thermometer, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import poolService from "@/services/poolService";

type ActivityType = 'swimming' | 'water-aerobics' | 'pool-party' | 'swimming-lesson' | 'aqua-therapy' | 'pool-games';

interface PoolFacility {
  id: string;
  name: string;
  type: string;
  status: 'open' | 'closed' | 'maintenance' | 'private-event';
  capacity: number;
  currentOccupancy: number;
  temperature: number;
  depth: {
    min: number;
    max: number;
  };
  operatingHours: {
    open: string;
    close: string;
  };
  amenities: string[];
}

interface SwimmingActivity {
  id: string;
  name: string;
  description: string;
  type: ActivityType;
  poolId: string;
  instructor?: string;
  price: number;
  duration: number;
  capacity: number;
  currentParticipants: number;
  skillLevel: string;
  ageRequirement: {
    min: number;
    max?: number;
  };
  isActive: boolean;
  nextSession: Date;
}

const GuestSwimmingActivities = () => {
  const { user } = useAuth();
  const [poolFacilities, setPoolFacilities] = useState<PoolFacility[]>([]);
  const [swimmingActivities, setSwimmingActivities] = useState<SwimmingActivity[]>([]);
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | "all">("all");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<SwimmingActivity | null>(null);
  const [selectedPool, setSelectedPool] = useState<PoolFacility | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadPoolsAndActivities();
  }, []);

  // Load pools and activities from API
  const loadPoolsAndActivities = async () => {
    try {
      setLoading(true);
      const [pools, activities] = await Promise.all([
        poolService.getTransformedPools(),
        poolService.getTransformedActivities()
      ]);
      setPoolFacilities(pools.filter(pool => pool.status === "open"));
      setSwimmingActivities(activities.filter(activity => activity.isActive));
    } catch (error) {
      console.error('Error loading pools and activities:', error);
      toast.error('Failed to load pool facilities and activities');
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = swimmingActivities.filter(activity => {
    return selectedActivityType === "all" || activity.type === selectedActivityType;
  });

  const handleBookActivity = (activity: SwimmingActivity) => {
    setSelectedActivity(activity);
    setSelectedPool(poolFacilities.find(pool => pool.id === activity.poolId) || null);
    setIsBookingOpen(true);
  };

  const handleBookPool = (pool: PoolFacility) => {
    setSelectedActivity(null);
    setSelectedPool(pool);
    setIsBookingOpen(true);
  };

  const handleSubmitBooking = async (formData: FormData) => {
    try {
      const bookingData = {
        poolId: formData.get('poolId') as string,
        activityId: formData.get('activityId') as string || undefined,
        bookingDate: formData.get('date') as string,
        startTime: formData.get('startTime') as string,
        endTime: formData.get('endTime') as string,
        numberOfParticipants: parseInt(formData.get('participants') as string),
        specialRequests: formData.get('specialRequests') as string || undefined
      };

      await poolService.createPoolBooking(bookingData);
      toast.success("Reservation submitted successfully! You'll receive a confirmation shortly.");
      setIsBookingOpen(false);
      setSelectedActivity(null);
      setSelectedPool(null);
      setSelectedDate(undefined);
    } catch (error: any) {
      console.error('Error creating pool booking:', error);
      toast.error(error.message || 'Failed to create reservation');
    }
  };

  const getPoolStatusBadge = (status: string) => {
    const statusMap = {
      open: { color: "bg-green-100 text-green-800", label: "Open" },
      closed: { color: "bg-red-100 text-red-800", label: "Closed" },
      maintenance: { color: "bg-yellow-100 text-yellow-800", label: "Maintenance" },
      "private-event": { color: "bg-purple-100 text-purple-800", label: "Private Event" }
    };
    
    const status_info = statusMap[status as keyof typeof statusMap];
    return (
      <Badge className={status_info.color}>
        {status_info.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Swimming & Activities</h3>
          <p className="text-sm text-muted-foreground">Book pool access and join activities</p>
        </div>
      </div>

      {/* Pool Facilities */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Pool Facilities</h4>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : poolFacilities.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {poolFacilities.map((pool) => (
            <Card key={pool.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{pool.name}</CardTitle>
                  {getPoolStatusBadge(pool.status)}
                </div>
                <CardDescription>
                  {pool.type.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Capacity:</span>
                    <span>{pool.currentOccupancy}/{pool.capacity}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Thermometer className="mr-1 h-3 w-3" />
                      Temperature:
                    </span>
                    <span>{pool.temperature}°C</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Depth:</span> {pool.depth.min}m - {pool.depth.max}m
                  </div>
                  
                  <div className="text-sm">
                    <span className="font-medium">Hours:</span> {pool.operatingHours.open} - {pool.operatingHours.close}
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-sm font-medium">Amenities:</span>
                    <div className="flex flex-wrap gap-1">
                      {pool.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {pool.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{pool.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={() => handleBookPool(pool)}
                    disabled={pool.currentOccupancy >= pool.capacity}
                  >
                    <Waves className="mr-2 h-4 w-4" />
                    {pool.currentOccupancy >= pool.capacity ? "Pool Full" : "Book Pool Access"}
                  </Button>
                </div>
              </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No pool facilities available at the moment</p>
            <Button onClick={loadPoolsAndActivities} variant="outline">
              Refresh Facilities
            </Button>
          </div>
        )}
      </div>

      {/* Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium">Swimming Activities</h4>
          <Select value={selectedActivityType} onValueChange={(value) => setSelectedActivityType(value as ActivityType | "all")}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="swimming">Swimming</SelectItem>
              <SelectItem value="water-aerobics">Water Aerobics</SelectItem>
              <SelectItem value="pool-party">Pool Party</SelectItem>
              <SelectItem value="swimming-lesson">Swimming Lessons</SelectItem>
              <SelectItem value="aqua-therapy">Aqua Therapy</SelectItem>
              <SelectItem value="pool-games">Pool Games</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredActivities.map((activity) => (
            <Card key={activity.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{activity.name}</CardTitle>
                  <Badge variant={activity.isActive ? "default" : "secondary"}>
                    {activity.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>{activity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">
                      KES {activity.price.toLocaleString()}
                    </span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {activity.duration} min
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span>Participants:</span>
                    <span>{activity.currentParticipants}/{activity.capacity}</span>
                  </div>
                  
                  {activity.instructor && (
                    <div className="text-sm">
                      <span className="font-medium">Instructor:</span> {activity.instructor}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.skillLevel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace("-", " ")}
                    </Badge>
                  </div>
                  
                  {activity.ageRequirement && (
                    <div className="text-sm text-muted-foreground">
                      Age: {activity.ageRequirement.min}
                      {activity.ageRequirement.max ? `-${activity.ageRequirement.max}` : "+"} years
                    </div>
                  )}
                  
                  <div className="text-sm">
                    <span className="font-medium">Next Session:</span>
                    <br />
                    {new Date(activity.nextSession).toLocaleString()}
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => handleBookActivity(activity)}
                    disabled={activity.currentParticipants >= activity.capacity}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    {activity.currentParticipants >= activity.capacity ? "Activity Full" : "Join Activity"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No swimming activities available at the moment</p>
            <Button onClick={loadPoolsAndActivities} variant="outline">
              Refresh Activities
            </Button>
          </div>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedActivity ? `Book ${selectedActivity.name}` : `Book ${selectedPool?.name}`}
            </DialogTitle>
            <DialogDescription>
              {selectedActivity 
                ? "Reserve your spot in this activity" 
                : "Book access to this pool facility"
              }
            </DialogDescription>
          </DialogHeader>
          
          <form action={handleSubmitBooking} className="space-y-4">
            <input type="hidden" name="poolId" value={selectedPool?.id || ""} />
            <input type="hidden" name="activityId" value={selectedActivity?.id || ""} />
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <input 
                type="hidden" 
                name="date" 
                value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""} 
              />
            </div>
            
            {!selectedActivity && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" name="startTime" type="time" required />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" name="endTime" type="time" required />
                  </div>
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="participants">Number of Participants</Label>
              <Input 
                id="participants" 
                name="participants" 
                type="number" 
                min="1" 
                max={selectedActivity ? 
                  (selectedActivity.capacity - selectedActivity.currentParticipants) : 
                  (selectedPool ? selectedPool.capacity - selectedPool.currentOccupancy : 1)
                }
                defaultValue="1"
                required 
              />
            </div>
            
            <div>
              <Label htmlFor="specialRequests">Special Requests</Label>
              <Textarea 
                id="specialRequests" 
                name="specialRequests" 
                placeholder="Any special requirements or requests..."
              />
            </div>
            
            {selectedActivity && (
              <div className="bg-muted p-3 rounded">
                <div className="text-sm">
                  <span className="font-medium">Price:</span> KES {selectedActivity.price.toLocaleString()} per person
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedActivity ? "Book Activity" : "Book Pool Access"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestSwimmingActivities;