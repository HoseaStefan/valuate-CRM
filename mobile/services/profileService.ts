import { fetchJson } from './apiClient';

export type UpdateProfilePayload = {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  photoPath?: string | null;
};

export type UpdateProfileResponse = UpdateProfilePayload & {
  id?: string;
  email?: string;
  role?: string;
  managerId?: string | null;
  baseSalary?: number;
  createdAt?: string;
  updatedAt?: string;
};

export const profileService = {
  async updateProfile(formData: FormData) {
    return fetchJson<UpdateProfileResponse>('/profile', {
      method: 'PUT',
      body: formData,
    });
  },
};
