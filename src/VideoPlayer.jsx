import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';

function VideoPlayer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas('fabricCanvas');
    canvas.setHeight(360);
    canvas.setWidth(640);

    const fabricVideo = new fabric.Image(videoRef.current, {
      left: 0,
      top: 0,
      width: 640,
      height: 360,
      selectable: true, // Allows the video to be selected and moved
    });

    canvas.add(fabricVideo);

    setIsPlaying(false);
  }, [videoUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setVideoUrl(videoUrl);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
        playVideoOnCanvas();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playVideoOnCanvas = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const context = canvas.getContext('2d');
    const intervalId = setInterval(() => {
      if (video.paused || video.ended) {
        clearInterval(intervalId);
        setIsPlaying(false);
      } else {
        context.drawImage(video, 0, 0, 640, 360);
      }
    }, 33); // 30 frames per second
  };

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>

      <canvas id="fabricCanvas" ref={canvasRef}></canvas>

      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          width={200}
          height={360}
          style={{ display: 'none' }}
        ></video>
      )}
    </div>
  );
}

export default VideoPlayer;