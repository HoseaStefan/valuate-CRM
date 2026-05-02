import { fetchJson } from './apiClient';

type UpdateProfilePayload = {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  photoPath?: string | null;
};

export const profileService = {
  async updateProfile(formData: FormData) {
    return fetchJson('/profile', {
      method: 'PUT',
      body: formData,
    });
  },
};
