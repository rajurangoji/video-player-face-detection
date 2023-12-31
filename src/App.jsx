import React from 'react'
import VideoPlayer from './VideoPlayer'
import Canvas from './Canvas'

const heading = {
  display: 'flex',
  color: 'green',
}

function App() {
  return (
    <div>
      <h1 className='heading'>Video Player with Face Detection</h1>
      <VideoPlayer />
    </div>
  )
}

export default App
