import { useCallback } from "react";

import Icon from "../../common/Icon/Icon";
import { useAsync } from "../../../hooks/useAsync";
import { mediaService } from "../../../services/media/mediaService";
import "./VideoPlayer.css";

// Plays a recorded lecture. The video URL comes from mediaService, which will later
// return a protected OneDrive URL from the backend. Videos are never stored in the frontend.
function VideoPlayer({ lecture }) {
  const { id, videoUrl } = lecture;
  const loadStream = useCallback(() => mediaService.getLectureStreamUrl({ id, videoUrl }), [id, videoUrl]);
  const { data, error } = useAsync(loadStream);

  if (data?.url) {
    return (
      <div className="video-player">
        <video
          key={data.url}
          className="video-player-media"
          src={data.url}
          controls
          preload="metadata"
          controlsList="nodownload"
        >
          Your browser cannot play this video.
        </video>
      </div>
    );
  }

  return (
    <div className="video-player video-player-placeholder">
      <span className="video-player-icon">
        <Icon name={error ? "alert" : "play"} size={28} />
      </span>
      <p className="video-player-title">{lecture.title}</p>
      <p className="video-player-note">
        {error
          ? "The recording could not be loaded. Please try again later."
          : data
            ? "This recording will stream from OneDrive once the video source is connected."
            : "Loading recording…"}
      </p>
    </div>
  );
}

export default VideoPlayer;
