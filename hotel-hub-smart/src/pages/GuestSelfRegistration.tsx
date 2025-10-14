import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockRooms, Room } from "@/data/mockData";
import { useAuth } from "@/contexts/AuthContext";
import { Hotel, UserPlus, Calendar, Users, CreditCard, MapPin, Phone, Mail, Star, Wifi, Car, Coffee, Waves } from "lucide-react";
import { toast } from "sonner";

const GuestSelfRegistration = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const [availableRooms] = useState<Room[]>(mockRooms.filter(room => room.status === "available"));
  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [guestData, setGuestData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    idNumber: "",
    nationality: "",
    address: "",
    specialRequests: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  });

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    adults: "1",
    children: "0",
    paymentMethod: "cash",
    specialRequests: "",
  });

  const handleNextStep = () => {
    if (step === 1) {
      // Validate personal information
      if (!guestData.firstName || !guestData.lastName || !guestData.email || !guestData.password || !guestData.phone || !guestData.idNumber) {
        toast.error("Please fill in all required personal information");
        return;
      }
      if (guestData.password !== guestData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (guestData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }
    } else if (step === 2) {
      // Validate booking information
      if (!bookingData.checkIn || !bookingData.checkOut) {
        toast.error("Please select check-in and check-out dates");
        return;
      }
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      if (checkInDate >= checkOutDate) {
        toast.error("Check-out date must be after check-in date");
        return;
      }
    } else if (step === 3 && !selectedRoom) {
      toast.error("Please select a room");
      return;
    }
    
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleCompleteRegistration = async () => {
    try {
      // Register the guest user
      await register({
        firstName: guestData.firstName,
        lastName: guestData.lastName,
        email: guestData.email,
        password: guestData.password,
        role: "guest",
        phone: guestData.phone,
        idNumber: guestData.idNumber,
        department: "Guest"
      });

      // Calculate booking details
      const checkInDate = new Date(bookingData.checkIn);
      const checkOutDate = new Date(bookingData.checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
      const totalAmount = selectedRoom ? selectedRoom.price * nights : 0;

      // Store booking request in localStorage for now (in real app, this would be sent to backend)
      const bookingRequest = {
        guest: guestData,
        booking: {
          ...bookingData,
          roomId: selectedRoom?.id,
          nights,
          totalAmount,
          status: "pending_approval"
        }
      };
      
      localStorage.setItem("pendingBookingRequest", JSON.stringify(bookingRequest));

      toast.success("Registration completed! Redirecting to your dashboard...");
      
      // Redirect to guest dashboard after a short delay
      setTimeout(() => {
        navigate("/guest-dashboard");
      }, 2000);

    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  const getRoomCategoryColor = (category: string) => {
    switch (category) {
      case "luxury": return "bg-gradient-to-r from-purple-500 to-pink-500";
      case "premium": return "bg-gradient-to-r from-blue-500 to-cyan-500";
      case "standard": return "bg-gradient-to-r from-green-500 to-blue-500";
      case "economy": return "bg-gradient-to-r from-gray-500 to-gray-600";
      default: return "bg-gradient-to-r from-gray-500 to-gray-600";
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="h-4 w-4" />;
      case "parking": return <Car className="h-4 w-4" />;
      case "coffee maker": return <Coffee className="h-4 w-4" />;
      case "jacuzzi": return <Waves className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Hotel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Smart Hotel</h1>
                <p className="text-sm text-gray-600">Guest Registration Portal</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/login")}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              Already have an account? Sign In
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  stepNumber === step 
                    ? "bg-blue-600 text-white" 
                    : stepNumber < step 
                      ? "bg-green-500 text-white" 
                      : "bg-gray-200 text-gray-600"
                }`}>
                  {stepNumber < step ? "✓" : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    stepNumber < step ? "bg-green-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-sm text-gray-600">
            <div className="grid grid-cols-4 gap-8 text-center">
              <span>Personal Info</span>
              <span>Booking Details</span>
              <span>Select Room</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={guestData.firstName}
                    onChange={(e) => setGuestData({...guestData, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={guestData.lastName}
                    onChange={(e) => setGuestData({...guestData, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={guestData.email}
                      onChange={(e) => setGuestData({...guestData, email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={guestData.phone}
                      onChange={(e) => setGuestData({...guestData, phone: e.target.value})}
                      placeholder="+254712345678"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={guestData.password}
                    onChange={(e) => setGuestData({...guestData, password: e.target.value})}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={guestData.confirmPassword}
                    onChange={(e) => setGuestData({...guestData, confirmPassword: e.target.value})}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idNumber">ID/Passport Number *</Label>
                  <Input
                    id="idNumber"
                    value={guestData.idNumber}
                    onChange={(e) => setGuestData({...guestData, idNumber: e.target.value})}
                    placeholder="12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={guestData.nationality}
                    onChange={(e) => setGuestData({...guestData, nationality: e.target.value})}
                    placeholder="Kenyan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="address"
                    className="pl-10"
                    value={guestData.address}
                    onChange={(e) => setGuestData({...guestData, address: e.target.value})}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Emergency Contact (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      value={guestData.emergencyContactName}
                      onChange={(e) => setGuestData({...guestData, emergencyContactName: e.target.value})}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={guestData.emergencyContactPhone}
                      onChange={(e) => setGuestData({...guestData, emergencyContactPhone: e.target.value})}
                      placeholder="+254712345678"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={guestData.emergencyContactRelationship}
                    onChange={(e) => setGuestData({...guestData, emergencyContactRelationship: e.target.value})}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 px-8">
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Booking Details */}
        {step === 2 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="checkIn">Check-in Date *</Label>
                  <Input
                    id="checkIn"
                    type="date"
                    value={bookingData.checkIn}
                    onChange={(e) => setBookingData({...bookingData, checkIn: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="checkOut">Check-out Date *</Label>
                  <Input
                    id="checkOut"
                    type="date"
                    value={bookingData.checkOut}
                    onChange={(e) => setBookingData({...bookingData, checkOut: e.target.value})}
                    min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adults">Number of Adults</Label>
                  <Select value={bookingData.adults} onValueChange={(value) => setBookingData({...bookingData, adults: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Adult{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="children">Number of Children</Label>
                  <Select value={bookingData.children} onValueChange={(value) => setBookingData({...bookingData, children: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0,1,2,3,4,5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Child' : 'Children'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
                <Select value={bookingData.paymentMethod} onValueChange={(value) => setBookingData({...bookingData, paymentMethod: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Payment</SelectItem>
                    <SelectItem value="mpesa">M-Pesa</SelectItem>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                  placeholder="Any special requests or requirements"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Previous Step
                </Button>
                <Button onClick={handleNextStep} className="bg-blue-600 hover:bg-blue-700 px-8">
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Room Selection */}
        {step === 3 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hotel className="h-5 w-5" />
                Select Your Room
              </CardTitle>
              <p className="text-sm text-gray-600">
                {bookingData.checkIn && bookingData.checkOut && (
                  <>Available rooms for {bookingData.checkIn} to {bookingData.checkOut}</>
                )}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableRooms.map((room) => {
                  const nights = bookingData.checkIn && bookingData.checkOut 
                    ? Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 3600 * 24))
                    : 1;
                  const totalPrice = room.price * nights;
                  
                  return (
                    <div 
                      key={room.id} 
                      className={`border rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedRoom?.id === room.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className={`w-full h-32 rounded-lg mb-4 ${getRoomCategoryColor(room.category)} flex items-center justify-center`}>
                        <div className="text-white text-center">
                          <Hotel className="h-8 w-8 mx-auto mb-2" />
                          <p className="font-bold">Room {room.number}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold capitalize">{room.type} Room</h3>
                          <Badge variant="outline" className="capitalize font-medium">
                            {room.category}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm">{room.description}</p>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Up to {room.capacity} guests</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {room.amenities.slice(0, 4).map((amenity, index) => (
                            <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {getAmenityIcon(amenity)}
                              <span>{amenity}</span>
                            </div>
                          ))}
                          {room.amenities.length > 4 && (
                            <div className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              +{room.amenities.length - 4} more
                            </div>
                          )}
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Rate per night:</span>
                            <span className="font-semibold">KES {room.price.toLocaleString()}</span>
                          </div>
                          {nights > 1 && (
                            <div className="flex justify-between text-sm">
                              <span>{nights} nights:</span>
                              <span className="font-semibold">KES {totalPrice.toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold text-blue-600">
                            <span>Total:</span>
                            <span>KES {totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Previous Step
                </Button>
                <Button 
                  onClick={handleNextStep} 
                  disabled={!selectedRoom}
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Booking Confirmation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Guest Information</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {guestData.firstName} {guestData.lastName}</p>
                      <p><strong>Email:</strong> {guestData.email}</p>
                      <p><strong>Phone:</strong> {guestData.phone}</p>
                      <p><strong>ID Number:</strong> {guestData.idNumber}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Room Details</h4>
                    {selectedRoom && (
                      <div className="space-y-1 text-sm">
                        <p><strong>Room:</strong> {selectedRoom.number} ({selectedRoom.type})</p>
                        <p><strong>Category:</strong> <span className="capitalize">{selectedRoom.category}</span></p>
                        <p><strong>Capacity:</strong> Up to {selectedRoom.capacity} guests</p>
                        <p><strong>Rate:</strong> KES {selectedRoom.price}/night</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Stay Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Check-in:</strong> {bookingData.checkIn}</p>
                      <p><strong>Check-out:</strong> {bookingData.checkOut}</p>
                      <p><strong>Guests:</strong> {bookingData.adults} Adult(s), {bookingData.children} Children</p>
                      <p><strong>Payment Method:</strong> <span className="capitalize">{bookingData.paymentMethod.replace('_', ' ')}</span></p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Cost Breakdown</h4>
                    {selectedRoom && bookingData.checkIn && bookingData.checkOut && (
                      <div className="space-y-1 text-sm">
                        {(() => {
                          const nights = Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 3600 * 24));
                          const subtotal = selectedRoom.price * nights;
                          const tax = Math.round(subtotal * 0.16);
                          const total = subtotal + tax;
                          
                          return (
                            <>
                              <p><strong>Nights:</strong> {nights}</p>
                              <p><strong>Subtotal:</strong> KES {subtotal.toLocaleString()}</p>
                              <p><strong>Tax (16%):</strong> KES {tax.toLocaleString()}</p>
                              <p className="text-lg font-bold text-blue-600"><strong>Total:</strong> KES {total.toLocaleString()}</p>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Notice</h4>
                <p className="text-sm text-yellow-700">
                  Your booking request will be sent to the hotel for approval. You will receive a confirmation email 
                  within 24 hours. Payment will be processed upon arrival or as per the hotel's payment policy.
                </p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePreviousStep}>
                  Previous Step
                </Button>
                <Button 
                  onClick={handleCompleteRegistration}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                >
                  {isLoading ? "Processing..." : "Complete Registration"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuestSelfRegistration;