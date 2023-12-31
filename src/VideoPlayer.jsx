import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import * as faceapi from 'face-api.js';

import './App.css'

function VideoPlayer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Load face-api.js models
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    ]).then(() => console.log('Face-api.js models loaded'));
  }, []);

  useEffect(() => {
    const canvas = new fabric.Canvas('fabricCanvas');
    canvas.setHeight(500);
    canvas.setWidth(1100);

    const fabricVideo = new fabric.Image(videoRef.current, {
      left: 0,
      top: 0,
      width: 640,
      height: 360,
      selectable: true,
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
        startFaceDetection();
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
        context.drawImage(video, 0, 0, 300, 400);
      }
    }, 33); // 30 frames per second
  };

  const startFaceDetection = async () => {
    const video = videoRef.current;

    if (video) {
      await faceapi.loadTinyFaceDetectorModel('/models');
      await faceapi.loadFaceLandmarkModel('/models');
      await faceapi.loadFaceRecognitionModel('/models');

      const displaySize = { width: video.width, height: video.height };

      faceapi.matchDimensions(canvasRef.current, displaySize);

      setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors();

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, faceapi.resizeResults(detections, displaySize));
      }, 100);
    }
  };

  return (
    <div>
      <div className='input-container'>
        <input type="file" accept="video/*" onChange={handleFileChange} />
        <button onClick={handlePlayPause} className="button-87" >{isPlaying ? 'Pause' : 'Play'}</button>

      </div>
      <div className='container'>
        <div className="instructions">
          <h3>Instructions :</h3>
          <ul>
            <li>Click on the choose file to upload the vedio.</li>
            <li>After Uploading the video <b><u>click on the play buton</u></b>, The video player will start the face detection afrer 1 secound. </li>
            <li>click on Pause button to detect the face.</li>
          </ul>
        </div>
        <div className="canvas-container">
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
      </div>
    </div>
  );
}

export default VideoPlayer;
