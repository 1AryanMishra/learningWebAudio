const visualizer = document.getElementById('visualizer')
var SingerFreq = document.getElementById("SingerFreq");
var SongFreq = document.getElementById("SongFreq");
var audio = new Audio('naina.mp3');
var SwitchBtn = document.getElementById("switch");


const SingerCtx = new AudioContext();
const SingerAnalyser = SingerCtx.createAnalyser();
const sr = SingerCtx.sampleRate;
const ffts = SingerAnalyser.fftSize;

var SingerFreqHistory = [];
var SongFreqHistory = [];

const songCtx = new AudioContext()
const songAnalyser = songCtx.createAnalyser();

songCtx.sampleRate = sr;
songAnalyser.fftSize = ffts;

setupContext()
resize()
drawVisualizer();

async function setupContext() {
  const singer = await getSinger()
  if (songCtx.state === 'suspended') {
    await SingerCtx.resume();
    await songCtx.resume()
  }
  const SingerSource = SingerCtx.createMediaStreamSource(singer);
  SingerSource.connect(SingerAnalyser);

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

  const SingerBufferLength = SingerAnalyser.frequencyBinCount;
  const SingerDataArray = new Uint8Array(SingerBufferLength);
  SingerAnalyser.getByteFrequencyData(SingerDataArray);
  
  const SongBufferLength = songAnalyser.frequencyBinCount
  const SongDataArray = new Uint8Array(SongBufferLength)
  songAnalyser.getByteFrequencyData(SongDataArray)
  const width = visualizer.width
  const height = visualizer.height

  const canvasContext = visualizer.getContext('2d')
  canvasContext.clearRect(0, 0, width, height)




  var SongMaxi = 0;
  SongDataArray.forEach((item, index) => {
    if(item > SongDataArray[SongMaxi]){
      SongMaxi = index;
    }
  })
  
  SongFreqHistory.push(SongMaxi*(sr/ffts));
  SongFreq.textContent = `${SongMaxi*(sr/ffts)}`
  
  canvasContext.beginPath();
  canvasContext.moveTo(0, height);
  canvasContext.strokeStyle = `#909090`;
  for(var i = 0; i < SongFreqHistory.length; i++){
    const y = height - (SongFreqHistory[i]/46)*(height/20);
    canvasContext.lineTo(i, y);
  }
  canvasContext.moveTo(i, 0);
  canvasContext.lineTo(i, height);

  canvasContext.stroke();

  if(SongFreqHistory.length > (width*40)/100){
    SongFreqHistory.splice(0, 1);
  }


  
  var SingerMaxi = 0;
  SingerDataArray.forEach((item, index) => {
    if(item > SingerDataArray[SingerMaxi]){
      SingerMaxi = index;
    }
  })
  
  SingerFreqHistory.push(SingerMaxi*(sr/ffts));
  SingerFreq.textContent = `${SingerMaxi*(sr/ffts)}`
  
  canvasContext.beginPath();
  canvasContext.moveTo(0, height);
  canvasContext.strokeStyle = `#fff`;
  for(var i = 0; i < SingerFreqHistory.length; i++){
    const y = height - (SingerFreqHistory[i]/46)*(height/20);
    canvasContext.lineTo(i, y);
  }
  canvasContext.moveTo(i, 0);
  canvasContext.lineTo(i, height);

  canvasContext.stroke();

  if(SingerFreqHistory.length > (width*40)/100){
    SingerFreqHistory.splice(0, 1);
  }
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}

SwitchBtn.addEventListener("click", () => {
  audio.src = 'an.mp3'
  audio.load();
  audio.play();
});