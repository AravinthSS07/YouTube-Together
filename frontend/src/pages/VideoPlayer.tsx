import React, { useState, useEffect, ChangeEvent } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import 'primeflex/primeflex.css';
import './VideoPlayer.css';

interface RoomParams {
  room: string;
}

interface YouTubePlayer extends YT.Player {
  getDuration: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
}

const socket: Socket = io('https://youtubetogether.azurewebsites.net/'); // Connect to the WebSocket server

function VideoPlayer() {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [videoQueue, setVideoQueue] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [seekTime, setSeekTime] = useState<number>(0);
  const [playerReady, setPlayerReady] = useState<boolean>(false);  // New state
  const { room } = useParams<Record<string, string | undefined>>(); // Room name from the URL
  const location = useLocation();
  const { username } = location.state as { username: string };

  useEffect(() => {
    if (room) {
      socket.emit('join-room', room); // Join the specific room
    }

    socket.on('load-queue', (queue: string[]) => {
      setVideoQueue(queue);
    });

    socket.on('update-queue', (queue: string[]) => {
      setVideoQueue(queue);
    });

    socket.on('play-next-video', (videoId: string) => {
      setCurrentVideo(videoId);
      player?.loadVideoById(videoId);
    });

    socket.on('play-video', () => {
      player?.playVideo();
    });

    socket.on('pause-video', () => {
      player?.pauseVideo();
    });

    socket.on('seek-video', (time: number) => {
      player?.seekTo(time, true);
    });

    return () => {
      socket.off('play-video');
      socket.off('pause-video');
      socket.off('seek-video');
      socket.off('update-queue');
      socket.off('play-next-video');
    };
  }, [player, room]);

  useEffect(() => {
    // Load the YouTube IFrame API
    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player('player', {
        height: '360',
        width: '640',
        videoId: '',  // Initial video will be loaded later
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
        },
      }) as YouTubePlayer;
      setPlayer(newPlayer);
    };

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  }, []);

  const onPlayerReady = (event: YT.PlayerEvent) => {
    // Player is ready, set the playerReady state to true
    setPlayerReady(true);
  };

  const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      setIsPlaying(false);
    }
  };

  const handlePlay = () => {
    socket.emit('play-video', room);
  };

  const handlePause = () => {
    socket.emit('pause-video', room);
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setSeekTime(newTime);
    if (playerReady && player) {
      socket.emit('seek-video', room, newTime);
    }
  };

  const addVideoToQueue = () => {
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      socket.emit('add-video', room, videoId);
      setVideoUrl('');
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const playNextVideo = () => {
    socket.emit('next-video', room);
  };

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <div className="App">
        <div className='video-container'>
            <h2>Welcome, {username}!</h2>
            <div id="player" style={{ border: '1px solid red' }}></div>

            <div className="controls">
              <Button className='flex align-items-center justify-content-center w-4rem h-4rem bg-primary font-bold border-round m-2' label="Play" onClick={handlePlay} />
              <Button className='flex align-items-center justify-content-center w-4rem h-4rem bg-primary font-bold border-round m-2' label="Pause" onClick={handlePause} />
              <Button className='flex align-items-center justify-content-center w-4rem h-4rem bg-primary font-bold border-round m-2' label="Next" onClick={playNextVideo} />
            </div>
        </div>

      <div className="queue-input">
        <InputText
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
        />
        <Button label="Add to Queue" onClick={addVideoToQueue} />
      </div>

      <div className="queue-table">
        <h3>Video Queue</h3>
        <DataTable className='centered box' value={videoQueue.map(videoId => ({ videoId }))}>
          <Column field="videoId" header="Video ID" />
        </DataTable>
      </div>
    </div>
  );
}

export default VideoPlayer;
