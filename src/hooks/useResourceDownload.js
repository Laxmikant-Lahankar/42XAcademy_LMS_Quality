import { useCallback } from "react";

import { mediaService } from "../services/media/mediaService";
import { useToast } from "./useToast";

// Asks the backend for a download URL (OneDrive) and opens it.
// In mock mode files have no URL yet, so a short message is shown instead.
export function useResourceDownload() {
  const showToast = useToast();

  return useCallback(
    async (resource) => {
      try {
        const { url } = await mediaService.getResourceDownloadUrl(resource);
        if (url) {
          window.open(url, "_blank", "noopener");
        } else {
          showToast(`“${resource.title}” will be downloadable once OneDrive is connected.`, "info");
        }
      } catch (error) {
        showToast(error.message || "Download failed. Please try again.", "error");
      }
    },
    [showToast]
  );
}
