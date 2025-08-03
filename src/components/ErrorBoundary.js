import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary - getDerivedStateFromError:', error);
    console.error('Error stack:', error.stack);
    return { 
      hasError: true,
      error: error,
      errorInfo: null 
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary - componentDidCatch:', error);
    console.error('ErrorBoundary - Error info:', errorInfo);
    console.error('ErrorBoundary - Component stack:', errorInfo?.componentStack);
    
    this.setState({
      error: error,
      errorInfo: errorInfo || null
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl p-8 max-w-lg mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Please refresh the page to continue.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-left">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Error Message:</h3>
                  <p className="text-xs text-red-700">{this.state.error.message}</p>
                  {this.state.error.stack && (
                    <>
                      <h3 className="text-sm font-semibold text-red-800 mb-1 mt-2">Stack Trace:</h3>
                      <pre className="text-xs text-red-700 overflow-auto max-h-20">{this.state.error.stack}</pre>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Refresh Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 p-4 bg-gray-50 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {this.state.error ? this.state.error.toString() : 'No error details available'}
                  {this.state.errorInfo?.componentStack ? 
                    `\n\nComponent Stack:${this.state.errorInfo.componentStack}` : 
                    '\n\nNo component stack available'
                  }
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
