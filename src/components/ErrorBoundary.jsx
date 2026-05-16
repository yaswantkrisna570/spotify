import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 text-center">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={48} className="text-red-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
          <p className="text-[#b3b3b3] max-w-md mb-8">
            The app encountered an unexpected error. Don't worry, your playlists and likes are safe.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-8 py-3 bg-spotify-green text-black font-bold rounded-full hover:scale-105 transition-transform shadow-xl"
          >
            <RefreshCw size={20} />
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
