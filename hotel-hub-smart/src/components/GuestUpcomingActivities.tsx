import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Waves, ChefHat, Car, Calendar as CalendarIcon, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import activityService from "@/services/activityService";

interface Activity {
  id: string;
  type: "pool" | "spa" | "restaurant" | "transport" | "event";
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: "confirmed" | "pending" | "cancelled";
  capacity?: number;
  attendees?: number;
  price?: number;
  bookingReference?: string;
}

const GuestUpcomingActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load activities from API
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async (retryCount = 0) => {
    try {
      setLoading(true);
      const data = await activityService.getTransformedMyActivities();
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error loading activities:', error);
      
      // Retry mechanism for network errors
      if (retryCount < 2 && error?.code !== 401 && error?.code !== 403) {
        setTimeout(() => loadActivities(retryCount + 1), 1000);
        return;
      }
      
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to load activities. Please try again.';
      
      toast.error(errorMessage);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };


  const getActivityIcon = (type: string) => {
    switch (type) {
      case "pool":
        return <Waves className="h-5 w-5 text-blue-600" />;
      case "spa":
        return <Calendar className="h-5 w-5 text-purple-600" />;
      case "restaurant":
        return <ChefHat className="h-5 w-5 text-orange-600" />;
      case "transport":
        return <Car className="h-5 w-5 text-green-600" />;
      case "event":
        return <CalendarIcon className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCancelActivity = async (activityId: string) => {
    try {
      await activityService.cancelActivity(activityId, 'Cancelled by guest');
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, status: "cancelled" as const }
            : activity
        )
      );
      toast.success("Activity cancelled successfully");
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel activity');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isToday = (date: string) => {
    const today = new Date().toDateString();
    const activityDate = new Date(date).toDateString();
    return today === activityDate;
  };

  const isTomorrow = (date: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const activityDate = new Date(date).toDateString();
    return tomorrow.toDateString() === activityDate;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Upcoming Activities</h2>
          <p className="text-muted-foreground">View and manage your scheduled activities</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const upcomingActivities = activities.filter(activity => activity.status !== "cancelled");
  const todayActivities = upcomingActivities.filter(activity => isToday(activity.date));
  const tomorrowActivities = upcomingActivities.filter(activity => isTomorrow(activity.date));
  const laterActivities = upcomingActivities.filter(activity => !isToday(activity.date) && !isTomorrow(activity.date));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-2">Upcoming Activities</h2>
          <p className="text-muted-foreground">View and manage your scheduled activities</p>
        </div>
        <Button
          variant="outline"
          onClick={() => loadActivities()}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingActivities.length}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todayActivities.length}</p>
                <p className="text-sm text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activities.filter(a => a.type === "pool").length}</p>
                <p className="text-sm text-muted-foreground">Pool Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activities */}
      {todayActivities.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Today's Activities
          </h3>
          <div className="space-y-4">
            {todayActivities.map((activity) => (
              <Card key={activity.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <h4 className="font-semibold text-lg">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        {activity.bookingReference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {activity.bookingReference}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.time} ({activity.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.location}</span>
                    </div>
                    {activity.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.attendees}/{activity.capacity} attendees</span>
                      </div>
                    )}
                    {activity.price && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">KES {activity.price}</span>
                      </div>
                    )}
                  </div>

                  {activity.status === "confirmed" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelActivity(activity.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tomorrow's Activities */}
      {tomorrowActivities.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-600" />
            Tomorrow's Activities
          </h3>
          <div className="space-y-4">
            {tomorrowActivities.map((activity) => (
              <Card key={activity.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <h4 className="font-semibold text-lg">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        {activity.bookingReference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {activity.bookingReference}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.time} ({activity.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.location}</span>
                    </div>
                    {activity.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.attendees}/{activity.capacity} attendees</span>
                      </div>
                    )}
                    {activity.price && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">KES {activity.price}</span>
                      </div>
                    )}
                  </div>

                  {activity.status === "confirmed" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelActivity(activity.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Later Activities */}
      {laterActivities.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Later Activities
          </h3>
          <div className="space-y-4">
            {laterActivities.map((activity) => (
              <Card key={activity.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <h4 className="font-semibold text-lg">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-sm font-medium text-muted-foreground mt-1">
                          {formatDate(activity.date)}
                        </p>
                        {activity.bookingReference && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Ref: {activity.bookingReference}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.time} ({activity.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{activity.location}</span>
                    </div>
                    {activity.capacity && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{activity.attendees}/{activity.capacity} attendees</span>
                      </div>
                    )}
                    {activity.price && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">KES {activity.price}</span>
                      </div>
                    )}
                  </div>

                  {activity.status === "confirmed" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelActivity(activity.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {upcomingActivities.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Upcoming Activities Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              You currently don't have any scheduled activities from the API. Book hotel services to see them appear here.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <Button 
                onClick={() => window.dispatchEvent(new CustomEvent("changeGuestTab", { detail: { tab: "swimming-activities" } }))}
                className="w-full"
              >
                <Waves className="h-4 w-4 mr-2" />
                Pool & Activities
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.dispatchEvent(new CustomEvent("changeGuestTab", { detail: { tab: "food-ordering" } }))}
                className="w-full"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Dining
              </Button>
            </div>
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground mb-3">
                Real-time activities from database will appear when you:
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Book a pool session or swimming activity</p>
                <p>• Make a restaurant reservation (dine-in)</p>
                <p>• Schedule spa treatments</p>
                <p>• Book transportation services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GuestUpcomingActivities;