import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { initAppUpdateChecker } from './services/appUpdateCheckerService';
import { initDynamicGoogleVerification } from './utils/seoVerification';

// Initialize background update checker for real-time code deployments
initAppUpdateChecker();
initDynamicGoogleVerification();

// Intercept benign third-party script errors (e.g. translation widgets in sandboxed iframes)
window.addEventListener('error', (event) => {
  if (
    event.message === 'Script error.' ||
    (event.filename && event.filename.includes('translate.google.com')) ||
    (event.message && (event.message.includes('Da`prod') || event.message.includes('Ea')))
  ) {
    event.preventDefault();
    return true;
  }
});

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Instant Météo Application Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('instant_meteo_display_preferences');
      window.history.replaceState(null, '', '/direct');
    } catch {
      // ignore
    }
    window.location.href = '/direct';
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl font-black">
              ⚡
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white">Instant Météo</h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Une interruption temporaire d'affichage a été interceptée. Vos réglages et données restent protégés.
              </p>
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm shadow-lg transition cursor-pointer"
            >
              Recharger l'Observatoire en Direct
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Register Service Worker for static asset caching
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => {
        console.log('Instant Météo ServiceWorker registered successfully:', reg.scope);
      })
      .catch((err) => {
        console.warn('Instant Météo ServiceWorker registration failed:', err);
      });
  });
}

