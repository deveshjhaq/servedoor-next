import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { AlertTriangle } from 'lucide-react';

/**
 * ErrorFallback UI component displayed when an error is caught
 */
function ErrorFallback({ error, onReset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">S</span>
            </div>
          </div>
          <div className="flex justify-center mb-2">
            <AlertTriangle className="w-12 h-12 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription className="mt-2">
            We're sorry, but something unexpected happened. Please try reloading the page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-gray-100 rounded-md p-3 text-sm text-gray-600 font-mono overflow-auto max-h-32">
              {error.toString()}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={onReset}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Reload Page
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * ErrorBoundary component that catches React render errors
 * Wraps components to prevent entire app crashes
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error('[ErrorBoundary] Caught an error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    // Store error info in state
    this.setState({
      errorInfo
    });

    // Optional: Send to remote logging service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    // Reload the page to recover from the error
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
