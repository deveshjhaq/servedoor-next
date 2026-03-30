import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Eye, EyeOff, Loader2, Phone, Mail, User, ArrowLeft } from 'lucide-react';
import { loginSchema, registerSchema, otpLoginSchema, otpRegisterSchema, emailSchema, passwordSchema } from '../../lib/validationSchemas';
import { sanitizeObject } from '../../utils/sanitize';

const EnhancedAuth = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [step, setStep] = useState(1); // 1: phone/email, 2: otp, 3: details (for registration)
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    name: '',
    otp: ''
  });
  
  const { 
    registerWithOTP, 
    verifyRegistrationOTP,
    loginWithOTP,
    verifyLoginOTP,
    login,
    register,
    loading 
  } = useAuth();
  const { toast } = useToast();

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeObject(formData);
    const parsed = otpLoginSchema.safeParse({ phone: sanitized.phone });
    if (!parsed.success) {
      toast({
        title: 'Error',
        description: parsed.error.issues[0]?.message || 'Invalid input',
        variant: 'destructive'
      });
      return;
    }

    const result = await loginWithOTP(sanitized.phone);
    
    if (result.success) {
      setStep(2);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the OTP"
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    const result = await verifyLoginOTP(formData.phone, formData.otp);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome back to serveDoor!"
      });
      onBack();
    } else {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleRegistrationStart = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeObject(formData);
    const parsed = otpRegisterSchema.safeParse({
      name: sanitized.name,
      phone: sanitized.phone,
      email: sanitized.email,
    });
    if (!parsed.success) {
      toast({
        title: "Error",
        description: parsed.error.issues[0]?.message || 'Invalid input',
        variant: "destructive"
      });
      return;
    }

    const result = await registerWithOTP({
      phone: sanitized.phone,
      name: sanitized.name,
      email: sanitized.email
    });
    
    if (result.success) {
      setStep(2);
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the OTP"
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleRegistrationComplete = async (e) => {
    e.preventDefault();
    
    if (!formData.otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    const result = await verifyRegistrationOTP(
      formData.phone, 
      formData.otp, 
      formData.email
    );
    
    if (result.success) {
      toast({
        title: "Registration Successful",
        description: "Welcome to serveDoor!"
      });
      onBack();
    } else {
      toast({
        title: "Registration Failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeObject(formData);
    const parsed = loginSchema.safeParse({
      email: sanitized.email,
      password: sanitized.password,
    });
    if (!parsed.success) {
      toast({
        title: 'Login Failed',
        description: parsed.error?.issues?.[0]?.message || 'Invalid email or password',
        variant: 'destructive'
      });
      return;
    }

    const result = await login(sanitized.email, sanitized.password);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome back to serveDoor!"
      });
      onBack();
    } else {
      toast({
        title: "Login Failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const handleTraditionalRegister = async (e) => {
    e.preventDefault();
    const sanitized = sanitizeObject(formData);
    const parsed = registerSchema.safeParse({
      name: sanitized.name,
      phone: sanitized.phone,
      email: sanitized.email,
      password: sanitized.password,
    });
    if (!parsed.success) {
      toast({
        title: 'Registration Failed',
        description: parsed.error?.issues?.[0]?.message || 'Invalid form data',
        variant: 'destructive'
      });
      return;
    }

    const result = await register({
      name: sanitized.name,
      email: sanitized.email,
      password: sanitized.password,
      phone: sanitized.phone
    });
    
    if (result.success) {
      toast({
        title: "Registration Successful",
        description: "Welcome to serveDoor!"
      });
      onBack();
    } else {
      toast({
        title: "Registration Failed",
        description: result.error,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      phone: '',
      email: '',
      password: '',
      name: '',
      otp: ''
    });
    setStep(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const renderOTPStep = () => (
    <form onSubmit={activeTab === 'login' ? handleOTPLogin : handleRegistrationComplete}>
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">
            {activeTab === 'login' ? 'Verify Login' : 'Verify Registration'}
          </h3>
          <p className="text-sm text-gray-600">
            OTP sent to {formData.phone}
          </p>
        </div>
        
        <div>
          <Input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6)})}
            className="text-center text-lg tracking-wider"
            maxLength={6}
          />
        </div>
        
        <div className="flex space-x-3">
          <Button 
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            disabled={loading || formData.otp.length !== 6}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify
          </Button>
        </div>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === 2 ? 'Verify OTP' : 'Welcome to serveDoor'}
          </CardTitle>
          <CardDescription>
            {step === 2 
              ? 'Enter the OTP sent to your phone'
              : 'Your favorite food, delivered fast'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {step === 2 ? renderOTPStep() : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-6">
                {/* OTP Login */}
                <div className="space-y-4">
                  <h3 className="font-medium">Login with OTP</h3>
                  <form onSubmit={handlePhoneLogin}>
                    <div className="space-y-4">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send OTP
                      </Button>
                    </div>
                  </form>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                {/* Traditional Login */}
                <form onSubmit={handleTraditionalLogin}>
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button 
                      type="submit" 
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Login with Password
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-6">
                {/* OTP Registration */}
                <div className="space-y-4">
                  <h3 className="font-medium">Sign up with OTP</h3>
                  <form onSubmit={handleRegistrationStart}>
                    <div className="space-y-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Enter full name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type="email"
                          placeholder="Enter email (optional)"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="pl-10"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send OTP
                      </Button>
                    </div>
                  </form>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                {/* Traditional Registration */}
                <form onSubmit={handleTraditionalRegister}>
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button 
                      type="submit" 
                      variant="outline"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign Up with Password
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              className="text-sm text-orange-600 hover:text-orange-500"
              onClick={onBack}
            >
              ← Back to serveDoor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAuth;