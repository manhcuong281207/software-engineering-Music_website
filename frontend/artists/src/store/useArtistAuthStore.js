import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useArtistAuthStore = create(
  persist(
    (set) => ({
      artist: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (accessToken, refreshToken, artist) => {
        set({
          accessToken,
          refreshToken,
          artist,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          artist: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: !!accessToken,
        }));
      },

      updateArtist: (updatedFields) => {
        set((state) => ({
          artist: state.artist ? { ...state.artist, ...updatedFields } : updatedFields,
        }));
      },
    }),
    {
      name: "mc-music-artist-auth",
    }
  )
);

