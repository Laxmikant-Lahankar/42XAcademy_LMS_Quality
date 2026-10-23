// OneDrive integration point for lecture videos and downloadable files.
//
// Recorded lectures already live on OneDrive. The frontend never stores videos.
// In production the Spring Boot backend will use Microsoft Graph (with its own credentials)
// to return a short-lived, protected URL for the logged-in student.

import { api, withMock } from "../apiClient";

export const mediaService = {
  // Returns { url } — a playable video URL, or url: null while no source is connected.
  getLectureStreamUrl: (lecture) =>
    withMock(
      () => ({ url: lecture.videoUrl ?? null }),
      () => api.get(`/lectures/${lecture.id}/stream-url`)
    ),

  // Returns { url } — a download URL for a note, PDF or assignment.
  getResourceDownloadUrl: (resource) =>
    withMock(
      () => ({ url: resource.fileUrl ?? null }),
      () => api.get(`/resources/${resource.id}/download-url`)
    ),
};
