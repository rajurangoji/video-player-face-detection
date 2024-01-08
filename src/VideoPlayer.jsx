import React, { useState, useRef, useEffect } from 'react';
import { fabric } from 'fabric';
import * as faceapi from 'face-api.js';
import './App.css';

function VideoPlayer() {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const videoCoordinates = useRef([]);

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
    canvas.setHeight(360); // Set the canvas height to match the video
    canvas.setWidth(640); // Set the canvas width to match the video

    setIsPlaying(false);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log(`file : ${JSON.stringify(file)}`)
    console.log(file)
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
        playVideoOnCanvas();
        startFaceDetection();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playVideoOnCanvas = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    video.addEventListener('canplaythrough', () => {
      setIsPlaying(true);

      const fabricVideo = new fabric.Image(video, {
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
        selectable: false,
      });

      canvas.clear();
      canvas.add(fabricVideo);

      const drawFrame = () => {
        if (video.paused || video.ended) {
          setIsPlaying(false);
          return;
        }

        fabricVideo.getElement().currentTime = video.currentTime;

        // Store video frame coordinates in the array
        const coordinates = fabricVideo.getBoundingRect();
        videoCoordinates.current.push(coordinates);

        canvas.renderAll();
        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    });

    video.play();
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
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(
          canvas,
          faceapi.resizeResults(detections, displaySize)
        );
      }, 100);
    }
  };

  return (
    <div>
      <div className='input-container'>
        <input type='file' accept='video/*' onChange={handleFileChange} />
        <button onClick={handlePlayPause} className='button-87'>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      <div className='container'>
        <div className='instructions'>
          <h3>Instructions :</h3>
          <ul>
            <li>Click on the choose file to upload the video.</li>
            <li>
              After uploading the video{' '}
              <b>
                <u>click on the play button</u>
              </b>
              , The video player will start the face detection after 1 second.
            </li>
            <li>Click on Pause button to detect the face.</li>
          </ul>
        </div>
        <div className='canvas-container'>
          <canvas id='fabricCanvas' ref={canvasRef}></canvas>
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
