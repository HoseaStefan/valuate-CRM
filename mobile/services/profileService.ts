import { fetchJson } from './apiClient';

type UpdateProfilePayload = {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  photoPath?: string | null;
};

export const profileService = {
  async updateProfile(payload: UpdateProfilePayload) {
    return fetchJson('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};
