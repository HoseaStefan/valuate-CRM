import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type UserContextType = {
  user: any;
  detailedUser: any;
  profileImageUrl: string | null;
  loading: boolean;
  refreshUserData: (force?: boolean) => Promise<void>;
  updateProfileImage: (url: string) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  detailedUser: null,
  profileImageUrl: null,
  loading: false,
  refreshUserData: async () => {},
  updateProfileImage: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [detailedUser, setDetailedUser] = useState<any>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser?.data) {
      setUser(authUser.data);
      // Dummy detailed user
      setDetailedUser({
        ...authUser.data,
        namaLengkap: authUser.data.fullName || authUser.data.namaLengkap,
      });
    } else {
      setUser(null);
      setDetailedUser(null);
    }
  }, [authUser]);

  const refreshUserData = async (force = false) => {
    setLoading(true);
    // Add real API fetch here if needed
    setLoading(false);
  };

  const updateProfileImage = (url: string) => {
    setProfileImageUrl(url);
  };

  return (
    <UserContext.Provider value={{ user, detailedUser, profileImageUrl, loading, refreshUserData, updateProfileImage }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
