import React, { useState } from "react";
import AudioPlayer from 'react-h5-audio-player';

//Royalty-free music!!しゃろう
import Fizzy from '../assets/FizzySharou.mp3';
import TenC from '../assets/10CSharou.mp3';
import SummerTriangle from '../assets/SummerTriangleSharou.mp3';

import './PlayerApp.css';
import 'react-h5-audio-player/lib/styles.css';

const playlist = [
  { src: Fizzy },
  { src: TenC },
  { src: SummerTriangle },
]

const PlayerApp = () => {
  const [currentTrack, setTrackIndex] = useState(0)
  const handleClickNext = () => {
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  };

  const handleEnd = () => {
    setTrackIndex((currentTrack) =>
      currentTrack < playlist.length - 1 ? currentTrack + 1 : 0
    );
  }
  return (
    <div className="container">
      <AudioPlayer
        src={playlist[currentTrack].src}
        showSkipControls
        onClickNext={handleClickNext}
        onEnded={handleEnd}
      />
    </div>
  );
}

export default PlayerApp;