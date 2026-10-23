package com.academy42x.lms.controller;

import com.academy42x.lms.dto.UrlDto;
import com.academy42x.lms.service.MediaService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/** Video stream and file download links (OneDrive integration point — see MediaService). */
@RestController
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @GetMapping("/lectures/{lectureId}/stream-url")
    public UrlDto lectureStreamUrl(@AuthenticationPrincipal Jwt jwt, @PathVariable String lectureId) {
        return mediaService.lectureStreamUrl(jwt, lectureId);
    }

    @GetMapping("/resources/{resourceId}/download-url")
    public UrlDto resourceDownloadUrl(@AuthenticationPrincipal Jwt jwt, @PathVariable String resourceId) {
        return mediaService.resourceDownloadUrl(jwt, resourceId);
    }
}
