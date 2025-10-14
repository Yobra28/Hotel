import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Hotel, Users, UserPlus, LogIn, Star, Wifi, Coffee, Car, Waves, MapPin, Phone, Mail, Shield, Clock, Award, Zap, Calendar, ChevronRight, CheckCircle, Play, Menu, X, ChevronDown, MessageCircle, Camera, Globe, Heart } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [email, setEmail] = useState("");
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Business Traveler",
      content: "Exceptional service and modern amenities. The smart room controls and seamless check-in process made my stay incredibly comfortable.",
      rating: 5,
      image: "👩‍💼"
    },
    {
      name: "Michael Chen",
      role: "Vacation Guest",
      content: "The best hotel experience I've had in Kenya. The staff went above and beyond, and the facilities are top-notch.",
      rating: 5,
      image: "👨‍🦱"
    },
    {
      name: "Emily Rodriguez",
      role: "Event Organizer",
      content: "Perfect venue for our corporate event. The event spaces are modern and well-equipped, with excellent catering services.",
      rating: 5,
      image: "👩‍💻"
    }
  ];

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    
    const testimonialTimer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(testimonialTimer);
    };
  }, [testimonials.length]);

  const handleNewsletterSignup = () => {
    if (email) {
      // Simulate newsletter signup
      alert(`Thank you for subscribing! We'll send updates to ${email}`);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <Hotel className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Hotel
                </h1>
                <p className="text-xs text-gray-500">Premium Experience</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Home</a>
              <a href="#rooms" className="text-gray-700 hover:text-blue-600 transition-colors">Rooms</a>
              <a href="#amenities" className="text-gray-700 hover:text-blue-600 transition-colors">Amenities</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
            </nav>
            
            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/guest-login")}
                className="text-gray-700 hover:text-blue-600"
              >
                Guest Login
              </Button>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Staff Login
              </Button>
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-6 space-y-4">
              <a href="#home" className="block text-gray-700 hover:text-blue-600">Home</a>
              <a href="#rooms" className="block text-gray-700 hover:text-blue-600">Rooms</a>
              <a href="#amenities" className="block text-gray-700 hover:text-blue-600">Amenities</a>
              <a href="#contact" className="block text-gray-700 hover:text-blue-600">Contact</a>
              <div className="pt-4 space-y-2">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/guest-login")}
                  className="w-full"
                >
                  Guest Login
                </Button>
                <Button 
                  onClick={() => navigate("/guest-register")}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600"
                >
                  Register as Guest
                </Button>
                <Button 
                  onClick={() => navigate("/login")}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Staff Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
          </div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="text-center">
            {/* Hero Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-8">
              <Award className="h-4 w-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">#1 Rated Hotel in Nairobi</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-8">
              <span className="block text-gray-900 mb-2">Experience</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Luxury Redefined
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover the perfect blend of modern technology and timeless hospitality. 
              Your extraordinary journey begins with Smart Hotel.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={() => navigate("/guest-register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 group"
              >
                <Calendar className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Book Your Stay
                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 rounded-full border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 group"
                  >
                    <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Watch Tour
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Virtual Hotel Tour</DialogTitle>
                  </DialogHeader>
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                      <p className="text-gray-600">Virtual tour video would be embedded here</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-gray-200/50">
              {[
                { number: "500+", label: "Happy Guests" },
                { number: "50+", label: "Luxury Rooms" },
                { number: "24/7", label: "Concierge" },
                { number: "4.9★", label: "Guest Rating" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="amenities" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-600 hover:bg-blue-100">World-Class Amenities</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Exceptional <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Services & Facilities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every detail is designed to exceed your expectations and create unforgettable memories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Wifi, 
                title: "High-Speed WiFi", 
                description: "Complimentary fiber internet throughout the property with business-grade connectivity",
                color: "blue"
              },
              { 
                icon: Shield, 
                title: "24/7 Security", 
                description: "Round-the-clock security with advanced surveillance and keycard access systems",
                color: "green"
              },
              { 
                icon: Car, 
                title: "Valet Parking", 
                description: "Complimentary valet parking with premium car care services available",
                color: "purple"
              },
              { 
                icon: Waves, 
                title: "Spa & Wellness", 
                description: "Full-service spa with massage, sauna, and state-of-the-art fitness center",
                color: "pink"
              },
              { 
                icon: Coffee, 
                title: "Gourmet Dining", 
                description: "Multiple restaurants featuring international cuisine and 24/7 room service",
                color: "orange"
              },
              { 
                icon: Clock, 
                title: "Concierge Service", 
                description: "Personal concierge to assist with reservations, tours, and special requests",
                color: "teal"
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white hover:bg-gray-50">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 bg-${feature.color}-100`}>
                    <feature.icon className={`h-8 w-8 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Room Categories */}
      <section id="rooms" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-600 hover:bg-purple-100">Luxury Accommodations</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Perfect <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Stay</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From elegant comfort to ultimate luxury, find the perfect room for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                category: "Smart Economy", 
                price: "5,000", 
                originalPrice: "7,000",
                color: "from-gray-500 to-gray-600", 
                features: ["25m² Space", "Smart Controls", "Premium WiFi", "Modern Bath"],
                popular: false
              },
              { 
                category: "Business Suite", 
                price: "12,000", 
                originalPrice: "15,000",
                color: "from-blue-500 to-cyan-500", 
                features: ["40m² Space", "Work Desk", "City View", "Mini Bar"],
                popular: true
              },
              { 
                category: "Premium Deluxe", 
                price: "18,000", 
                originalPrice: "22,000",
                color: "from-purple-500 to-pink-500", 
                features: ["55m² Space", "Balcony", "Jacuzzi", "Butler Service"],
                popular: false
              },
              { 
                category: "Presidential", 
                price: "35,000", 
                originalPrice: "45,000",
                color: "from-yellow-500 to-orange-500", 
                features: ["120m² Space", "Private Terrace", "Personal Chef", "Helicopter Pad Access"],
                popular: false
              },
            ].map((room, index) => (
              <Card key={index} className={`relative overflow-hidden group hover:shadow-2xl transition-all duration-500 border-2 hover:border-blue-300 ${room.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                {room.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-blue-500 text-white px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                
                <div className={`h-40 bg-gradient-to-r ${room.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Hotel className="h-10 w-10 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-bold text-lg">{room.category}</p>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        KES {room.price}
                      </span>
                      <span className="text-lg text-gray-400 line-through">{room.originalPrice}</span>
                    </div>
                    <p className="text-sm text-gray-600">per night</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {room.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => navigate("/guest-register")}
                    className={`w-full ${room.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-gray-900 hover:bg-gray-800'} transition-all duration-300`}
                  >
                    Book Now
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-600 hover:bg-green-100">Guest Reviews</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Guests <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Say About Us</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Read authentic reviews from our valued guests who experienced the Smart Hotel difference
            </p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="text-6xl mb-6">{testimonials[currentTestimonial].image}</div>
                  <div className="flex justify-center mb-6">
                    {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                      <Star key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed italic">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{testimonials[currentTestimonial].name}</p>
                    <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial Indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <Globe className="h-16 w-16 mx-auto mb-8 opacity-80" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stay Connected with Smart Hotel
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto">
              Get exclusive offers, room upgrades, and insider tips delivered to your inbox
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-14 px-6 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              />
              <Button
                onClick={handleNewsletterSignup}
                className="bg-white text-blue-600 hover:bg-gray-100 h-14 px-8 text-lg font-semibold"
              >
                Subscribe
                <Heart className="h-5 w-5 ml-2" />
              </Button>
            </div>
            
            <p className="text-sm mt-6 opacity-70">
              Join 10,000+ guests who receive our exclusive updates. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Information */}
      <section id="contact" className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold mb-8">
                Get in <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed">
                Ready to experience luxury? Contact us for reservations, special requests, or any inquiries.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Location</h3>
                    <p className="text-gray-300">123 Luxury Avenue<br />Nairobi Central Business District<br />Nairobi, Kenya</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Phone</h3>
                    <p className="text-gray-300">+254 700 123 456<br />+254 20 1234 567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Email</h3>
                    <p className="text-gray-300">reservations@smarthotel.co.ke<br />info@smarthotel.co.ke</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Operating Hours</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Reception</h4>
                      <div className="space-y-2 text-gray-300">
                        <div className="flex justify-between">
                          <span>24/7</span>
                          <Badge className="bg-green-600 text-white">Always Open</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Check Times</h4>
                      <div className="space-y-2 text-gray-300">
                        <div className="flex justify-between">
                          <span>Check-in:</span>
                          <span>3:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Check-out:</span>
                          <span>11:00 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-700">
                    <h4 className="text-lg font-semibold text-white mb-4">Services</h4>
                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Room Service 24/7</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Concierge 24/7</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Valet Parking</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span>Airport Transfer</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <Hotel className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Smart Hotel
                  </h3>
                  <p className="text-gray-400 text-sm">Luxury Redefined</p>
                </div>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-md">
                Where modern technology meets timeless hospitality. Experience the future of luxury accommodation in the heart of Nairobi.
              </p>
              <div className="flex items-center gap-4">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Us
                </Button>
                <Badge className="bg-green-100 text-green-700 px-3 py-1">
                  ⭐ 4.9/5 Rating
                </Badge>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <div className="space-y-3">
                <a href="#home" className="block text-gray-300 hover:text-white transition-colors">Home</a>
                <a href="#rooms" className="block text-gray-300 hover:text-white transition-colors">Rooms & Suites</a>
                <a href="#amenities" className="block text-gray-300 hover:text-white transition-colors">Amenities</a>
                <a href="#contact" className="block text-gray-300 hover:text-white transition-colors">Contact Us</a>
                <button onClick={() => navigate("/guest-login")} className="block text-blue-400 hover:text-blue-300 transition-colors">
                  Guest Login
                </button>
              </div>
            </div>
            
            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <div className="space-y-3 text-gray-300">
                <p>• Restaurant & Bar</p>
                <p>• Spa & Wellness</p>
                <p>• Business Center</p>
                <p>• Event Spaces</p>
                <p>• Airport Transfer</p>
                <p>• Concierge Service</p>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-gray-400 mb-4 md:mb-0">
                © 2024 Smart Hotel Kenya. All rights reserved. | Privacy Policy | Terms of Service
              </div>
              <div className="flex items-center gap-6">
                <span className="text-gray-400 text-sm">Powered by Smart Technology</span>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400">Smart Systems</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;