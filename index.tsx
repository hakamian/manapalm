
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import * as Sentry from "@sentry/react";
import App from './App';
import { AppProvider } from './AppContext';
import CrashFallback from './components/CrashFallback';

// Initialize Sentry
// NOTE: Ensure VITE_SENTRY_DSN is set in your .env file
const sentryDsn = (import.meta as any).env?.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
} else {
  console.warn("Sentry DSN not found. Error monitoring is disabled.");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => <CrashFallback error={error} resetErrorBoundary={resetError} />}>
      <HelmetProvider>
        <AppProvider>
          <div className="relative min-h-screen text-white overflow-x-hidden selection:bg-amber-500/30 selection:text-amber-100">
            <div className="aurora-bg">
              <div className="aurora-blob blob-1"></div>
              <div className="aurora-blob blob-2"></div>
              <div className="aurora-blob blob-3"></div>
            </div>
            <div className="noise-overlay"></div>

            <App />
          </div>
        </AppProvider>
      </HelmetProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
