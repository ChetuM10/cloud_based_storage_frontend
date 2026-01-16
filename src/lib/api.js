import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to avoid infinite loop
    const isAuthEndpoint = originalRequest.url?.includes("/api/auth/");

    // If token expired, try to refresh (but not for auth endpoints)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/api/auth/refresh");
        return api(originalRequest);
      } catch (refreshError) {
        // Don't redirect, just reject - let the auth store handle it
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post("/api/auth/register", data),
  login: (data) => api.post("/api/auth/login", data),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get("/api/auth/me"),
  refresh: () => api.post("/api/auth/refresh"),
};

// Files API
export const filesAPI = {
  initUpload: (data) => api.post("/api/files/init", data),
  completeUpload: (data) => api.post("/api/files/complete", data),
  getFile: (id) => api.get(`/api/files/${id}`),
  updateFile: (id, data) => api.patch(`/api/files/${id}`, data),
  deleteFile: (id) => api.delete(`/api/files/${id}`),
  getVersions: (id) => api.get(`/api/files/${id}/versions`),
  revertToVersion: (id, versionId) =>
    api.post(`/api/files/${id}/revert/${versionId}`),
};

// Folders API
export const foldersAPI = {
  create: (data) => api.post("/api/folders", data),
  getFolder: (id) => api.get(`/api/folders/${id}`),
  getFolderPath: (id) => api.get(`/api/folders/${id}/path`),
  updateFolder: (id, data) => api.patch(`/api/folders/${id}`, data),
  deleteFolder: (id) => api.delete(`/api/folders/${id}`),
};

// Shares API
export const sharesAPI = {
  create: (data) => api.post("/api/shares", data),
  getShares: (resourceType, resourceId) =>
    api.get(`/api/shares/${resourceType}/${resourceId}`),
  deleteShare: (id) => api.delete(`/api/shares/${id}`),
  getSharedWithMe: () => api.get("/api/shares/shared-with-me"),
  createLinkShare: (data) => api.post("/api/shares/links", data),
  getLinkShares: (resourceType, resourceId) =>
    api.get(`/api/shares/links/${resourceType}/${resourceId}`),
  deleteLinkShare: (id) => api.delete(`/api/shares/links/${id}`),
  accessLink: (token, password) =>
    api.post(`/api/shares/link/${token}`, { password }),
};

// Utilities API
export const utilsAPI = {
  search: (params) => api.get("/api/search", { params }),
  getStarred: () => api.get("/api/starred"),
  addStar: (data) => api.post("/api/stars", data),
  removeStar: (data) => api.delete("/api/stars", { data }),
  getTrash: () => api.get("/api/trash"),
  restore: (data) => api.post("/api/trash/restore", data),
  permanentDelete: (data) => api.post("/api/trash/delete", data),
  getRecent: () => api.get("/api/recent"),
  getStorageUsage: () => api.get("/api/storage"),
  getActivities: (limit) => api.get("/api/activities", { params: { limit } }),
  // Tags
  getTags: () => api.get("/api/tags"),
  createTag: (data) => api.post("/api/tags", data),
  deleteTag: (id) => api.delete(`/api/tags/${id}`),
  updateResourceTags: (data) => api.put("/api/tags/resource", data),
};

export default api;
