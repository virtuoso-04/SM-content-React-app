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
        <div className="min-h-screen flex items-center justify-center px-4 py-10 text-slate-100" style={{ background: 'radial-gradient(circle at 20% 20%, rgba(248,113,113,0.15), transparent 40%), radial-gradient(circle at 80% 0%, rgba(244,114,182,0.2), transparent 35%), #050f27' }}>
          <div className="glass-panel w-full max-w-lg border-white/15 bg-white/10 p-8 text-center shadow-[0_45px_140px_rgba(2,6,23,0.75)]">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10">
                <svg className="h-8 w-8 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="mb-2 text-2xl font-semibold text-white">Oops! Something went wrong</h2>
              <p className="mb-6 text-slate-300">
                We encountered an unexpected error. Please refresh the page to continue.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-3 text-left">
                  <h3 className="mb-1 text-sm font-semibold text-rose-100">Error Message:</h3>
                  <p className="text-xs text-rose-200">{this.state.error.message}</p>
                  {this.state.error.stack && (
                    <>
                      <h3 className="mt-2 mb-1 text-sm font-semibold text-rose-100">Stack Trace:</h3>
                      <pre className="max-h-20 overflow-auto text-xs text-rose-200">{this.state.error.stack}</pre>
                    </>
                  )}
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="rounded-2xl border border-transparent bg-gradient-to-r from-[#A6FFCB] via-[#12D8FA] to-[#1FA2FF] px-6 py-3 font-semibold text-slate-900 shadow-[0_25px_80px_rgba(15,118,230,0.45)] transition hover:translate-y-[-1px]"
              >
                Refresh Page
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                <summary className="mb-2 cursor-pointer text-sm font-medium text-slate-200">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-slate-300 overflow-auto">
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
