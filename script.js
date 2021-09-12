const visualizer = document.getElementById('visualizer')
var freq = document.getElementById("freq");
var arr = document.getElementById("arr");
var audio = new Audio('an.mp3');

const singerCtx = new AudioContext();
const singerAnalyser = singerCtx.createAnalyser();
const sr = singerCtx.sampleRate;
const ffts = singerAnalyser.fftSize;

var freqHistory = [];

const songCtx = new AudioContext()
const songAnalyser = songCtx.createAnalyser();

const ssr = songCtx.sampleRate;
const sffts = songAnalyser.fftSize;

setupContext()
resize()
drawVisualizer();

async function setupContext() {
  const singer = getSinger()
  if (songCtx.state === 'suspended') {
    await singerCtx.resume();
    await songCtx.resume()
  }
  const SingerSource = singerCtx.createMediaStreamSource(singer);
  SingerSource.connect(songAnalyser);

  const SongSource = songCtx.createMediaElementSource(audio);
  SongSource.connect(songAnalyser)
  SongSource.connect(songCtx.destination)
  audio.play();
}

function getSinger() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      latency: 0,
      echoCancellation : false,
      autoGainControl : false,
      noiseSuppression : false
    }
  })
}


function drawVisualizer() {

  requestAnimationFrame(drawVisualizer);

  const SingerBufferLength = singerAnalyser.frequencyBinCount;
  const SingerDataArray = new Uint8Array(SingerBufferLength);
  singerAnalyser.getByteFrequencyData(SingerDataArray);
  
  const SongBufferLength = songAnalyser.frequencyBinCount
  const SongDataArray = new Uint8Array(SongBufferLength)
  songAnalyser.getByteFrequencyData(SongDataArray)
  const width = visualizer.width
  const height = visualizer.height

  const canvasContext = visualizer.getContext('2d')
  canvasContext.clearRect(0, 0, width, height)
  
  var maxi = 0;
  SingerDataArray.forEach((item, index) => {
    if(item > SingerDataArray[maxi]){
      maxi = index;
    }
  })
  
  freqHistory.push(maxi*(ssr/sffts));
  freq.textContent = `${maxi*(ssr/sffts)}`
  
  canvasContext.beginPath();
  canvasContext.moveTo(0, height);
  canvasContext.strokeStyle = `#909090`;
  for(var i = 0; i < freqHistory.length; i++){
    const y = height - (freqHistory[i]/46)*(height/10);
    canvasContext.lineTo(i, y);
  }
  canvasContext.moveTo(i, 0);
  canvasContext.lineTo(i, height);

  canvasContext.stroke();

  if(freqHistory.length > (width*90)/100){
    freqHistory.splice(0, 1);
  }
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}

