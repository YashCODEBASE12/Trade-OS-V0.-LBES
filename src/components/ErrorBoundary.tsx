import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[40vh] max-w-xl items-center justify-center rounded-[28px] border border-white/70 bg-white/70 p-6 text-center shadow-[0_20px_50px_rgba(27,39,76,0.12)]">
          <div>
            <p className="text-lg font-semibold text-text-primary">Something went sideways.</p>
            <p className="mt-2 text-sm text-text-secondary">The trading workspace needs a quick refresh. Please reload the app and try again.</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
