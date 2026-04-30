import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ValuateColors } from '@/constants/theme';

/**
 * Higher Order Component to protect routes
 * Redirects to login if not authenticated
 */
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string = 'ProtectedComponent'
) => {
  const ProtectedComponent = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
      // If not loading and not authenticated, redirect to login
      if (!loading && !isAuthenticated) {
        console.log(`[ProtectedRoute] ${componentName} - User not authenticated, redirecting to login`);
        router.replace('/login');
      }
    }, [isAuthenticated, loading]);

    // Show loading spinner while checking auth
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: ValuateColors.navBackground }}>
          <ActivityIndicator size="large" color={ValuateColors.primary} />
        </View>
      );
    }

    // If not authenticated, don't render component
    if (!isAuthenticated) {
      return null;
    }

    // Render the protected component
    return <Component {...props} />;
  };

  ProtectedComponent.displayName = `withProtectedRoute(${componentName})`;
  return ProtectedComponent;
};
