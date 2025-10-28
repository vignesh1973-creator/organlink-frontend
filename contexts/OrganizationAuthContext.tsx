import React, { createContext, useContext, useState, useEffect } from 'react';

interface Organization {
  organization_id: number;
  name: string;
  email: string;
  country: string;
  description: string;
}

interface OrganizationAuthContextType {
  user: Organization | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const OrganizationAuthContext = createContext<OrganizationAuthContextType | undefined>(undefined);

export const useOrganizationAuth = () => {
  const context = useContext(OrganizationAuthContext);
  if (context === undefined) {
    throw new Error('useOrganizationAuth must be used within an OrganizationAuthProvider');
  }
  return context;
};

interface OrganizationAuthProviderProps {
  children: React.ReactNode;
}

export const OrganizationAuthProvider: React.FC<OrganizationAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('organization_token');
      
      if (storedToken) {
        try {
          const response = await fetch('/api/organization/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();

          if (response.ok && data.success) {
            setToken(storedToken);
            setUser(data.organization);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('organization_token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('organization_token');
          setToken(null);
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/organization/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setToken(data.token);
        setUser(data.organization);
        localStorage.setItem('organization_token', data.token);
        
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('organization_token');
    
    // Call logout API to clear server-side session
    fetch('/api/organization/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      console.error('Logout API error:', error);
    });
  };

  const value: OrganizationAuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <OrganizationAuthContext.Provider value={value}>
      {children}
    </OrganizationAuthContext.Provider>
  );
};