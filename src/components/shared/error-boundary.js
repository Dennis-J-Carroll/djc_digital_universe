import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0a0e14 0%, #1a1f2c 100%)',
            color: '#fff',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              padding: '3rem',
              background: 'rgba(15, 20, 30, 0.8)',
              borderRadius: '16px',
              border: '1px solid rgba(0, 188, 212, 0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div
              style={{
                fontSize: '4rem',
                marginBottom: '1rem',
              }}
            >
              [!]
            </div>

            <h1
              style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                background: 'linear-gradient(45deg, #00bcd4, #7c4dff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Something Went Wrong
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: '#b8b8b8',
                marginBottom: '2rem',
                lineHeight: '1.6',
              }}
            >
              We're sorry for the inconvenience. An unexpected error occurred while loading this page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginBottom: '2rem',
                  textAlign: 'left',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  color: '#ff6b6b',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  Error Details (Development Only)
                </summary>
                <p style={{ marginTop: '0.5rem' }}>
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      overflow: 'auto',
                      fontSize: '0.8rem',
                      maxHeight: '200px',
                    }}
                  >
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #00bcd4, #7c4dff)',
                  border: 'none',
                  borderRadius: '50px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                }}
              >
                Refresh Page
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '2px solid #00bcd4',
                  borderRadius: '50px',
                  color: '#00bcd4',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#00bcd4';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#00bcd4';
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
