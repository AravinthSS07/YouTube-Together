// src/youtube.d.ts
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }

  namespace YT {
    class Player {
      constructor(elementId: string, options: PlayerOptions);
      playVideo(): void;
      pauseVideo(): void;
      loadVideoById(videoId: string): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      getDuration(): number;
      getCurrentTime(): number;
    }

    interface PlayerOptions {
      height: string;
      width: string;
      videoId: string;
      events: {
        onReady: (event: PlayerEvent) => void;
        onStateChange: (event: OnStateChangeEvent) => void;
      };
    }

    interface PlayerEvent {
      target: Player;
    }

    interface OnStateChangeEvent {
      data: number;
      target: Player;
    }

    // Add the PlayerState enum
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }
  }
}

export {};
