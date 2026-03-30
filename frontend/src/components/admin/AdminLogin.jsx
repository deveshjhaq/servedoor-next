import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAdmin } from '../../contexts/AdminContext';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const AdminLogin = ({ onLoginSuccess }) => {
  const [step, setStep] = useState(1); // 1: phone, 2: otp+password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  const { checkAdminPhone, loginAdmin, loading } = useAdmin();
  const { toast } = useToast();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }

    const result = await checkAdminPhone(phone);
    
    if (result.is_admin && result.success) {
      setOtpSent(true);
      setStep(2);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the OTP"
      });
    } else {
      // Don't reveal that it's not an admin number
      toast({
        title: "Error",
        description: result.message || "Please check your phone number and try again",
        variant: "destructive"
      });
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    
    if (!otp.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both OTP and password",
        variant: "destructive"
      });
      return;
    }

    const result = await loginAdmin(phone, otp, password);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome to Admin Dashboard"
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleBackToPhone = () => {
    setStep(1);
    setOtp('');
    setPassword('');
    setOtpSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Admin Access' : 'Verify & Login'}
          </CardTitle>
          <CardDescription>
            {step === 1 
              ? 'Enter your phone number to continue'
              : 'Enter the OTP and your password'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full"
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleBackToPhone}
                  className="flex-1"
                  disabled={loading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </div>
            </form>
          )}
          
          {step === 1 && (
            <div className="mt-6 text-center">
              <Button 
                variant="ghost" 
                className="text-sm text-orange-600 hover:text-orange-500"
                onClick={() => window.location.href = '/'}
              >
                ← Back to serveDoor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;