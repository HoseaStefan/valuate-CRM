import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type UserContextType = {
  user: any;
  detailedUser: any;
  profileImageUrl: string | null;
  loading: boolean;
  refreshUserData: (force?: boolean) => Promise<void>;
  updateProfileImage: (url: string) => void;
  updateUserProfile: (profile: { fullName?: string; phoneNumber?: string; address?: string; photoPath?: string | null }) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  detailedUser: null,
  profileImageUrl: null,
  loading: false,
  refreshUserData: async () => {},
  updateProfileImage: () => {},
  updateUserProfile: () => {},
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

  const updateUserProfile = (profile: { fullName?: string; phoneNumber?: string; address?: string; photoPath?: string | null }) => {
    setUser((prev: any) => ({
      ...prev,
      ...profile,
    }));

    setDetailedUser((prev: any) => ({
      ...prev,
      ...profile,
      namaLengkap: profile.fullName || prev?.namaLengkap,
    }));

    if (profile.photoPath !== undefined) {
      setProfileImageUrl(profile.photoPath || null);
    }
  };

  return (
    <UserContext.Provider value={{ user, detailedUser, profileImageUrl, loading, refreshUserData, updateProfileImage, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
