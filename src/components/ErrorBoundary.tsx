"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: send error to telemetry / logging service
    console.error('Unhandled error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    // Reload the current window — better UX than full redirect for now
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-4">An unexpected error occurred while rendering the application. You can reload the page or contact support if the problem persists.</p>
            <div className="flex gap-3">
              <Button onClick={this.handleReload}>Reload</Button>
              <Button variant="outline" onClick={() => {
                // copy error message to clipboard for easier bug reports
                try {
                  const msg = this.state.error ? `${this.state.error.name}: ${this.state.error.message}\n\n${this.state.error.stack}` : 'No error details';
                  navigator.clipboard?.writeText(msg);
                } catch (e) {
                  // ignore clipboard failures
                }
              }}>Copy error</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
