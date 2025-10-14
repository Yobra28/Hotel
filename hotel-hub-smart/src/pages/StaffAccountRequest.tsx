import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hotel, Shield, Users, Phone, Mail, ArrowLeft, CheckCircle } from "lucide-react";

const StaffAccountRequest = () => {
  const navigate = useNavigate();

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
                <p className="text-sm text-gray-600">Staff Account Request</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/login")}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full w-20 h-20 mx-auto mb-6">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Staff Account Request
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hotel staff accounts are created and managed by administrators to ensure security and proper access control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* How it Works */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                How Staff Accounts Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Admin Creates Account</p>
                    <p className="text-sm text-gray-600">Hotel administrators create staff accounts through the user management system.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Role Assignment</p>
                    <p className="text-sm text-gray-600">Your role (Receptionist, Housekeeping, etc.) is assigned based on your position.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Credentials Provided</p>
                    <p className="text-sm text-gray-600">You receive your login credentials to access the hotel management system.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Need a Staff Account?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-4">
                Contact your hotel administrator or HR department to request a staff account. They will need the following information:
              </p>
              
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-gray-800 mb-1">Required Information:</p>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Full Name</li>
                    <li>• Email Address</li>
                    <li>• Phone Number</li>
                    <li>• ID Number</li>
                    <li>• Department/Position</li>
                    <li>• Role Required (Receptionist/Housekeeping)</li>
                  </ul>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="font-semibold text-gray-800 mb-2">Contact Administrator:</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>+254 700 123 456 (Ext. 101)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>hr@smarthotel.co.ke</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Shield className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Security & Access Control</h3>
                <p className="text-yellow-700 mb-4">
                  Staff accounts are carefully managed to ensure hotel security and data protection. This process helps us maintain:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-yellow-700">
                  <div>
                    <p className="font-semibold mb-1">🔒 Data Security</p>
                    <p>Protected guest information and booking data</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">👥 Access Control</p>
                    <p>Role-based permissions for different departments</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">📊 Audit Trail</p>
                    <p>Complete logging of system access and activities</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Already have staff credentials?
          </p>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Sign In to Staff Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffAccountRequest;