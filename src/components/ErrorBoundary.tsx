import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[Nocturne] Uncaught error', error, info.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] bg-cream text-canvas flex flex-col items-center justify-center px-6 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-taupe-muted">
            Something went wrong
          </p>
          <h1 className="font-serif text-[clamp(1.75rem,5vw,2.5rem)] tracking-tight mt-4">
            The atelier paused.
          </h1>
          <p className="font-body-italic italic text-sm text-taupe-muted font-light mt-4 max-w-sm leading-relaxed">
            An unexpected error occurred. Return home and try again.
          </p>
          <Link
            to="/"
            onClick={() => this.setState({ hasError: false })}
            className="inline-block mt-10 font-sans text-[10px] uppercase tracking-[0.22em] text-canvas border-b border-canvas/30 pb-px hover:border-canvas transition-colors"
          >
            Return to Nocturne →
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}

/** Resets the error boundary when the route changes so one crash does not lock the whole app. */
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const location = useLocation();
  return <ErrorBoundaryInner key={location.pathname}>{children}</ErrorBoundaryInner>;
}
