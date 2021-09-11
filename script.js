const visualizer = document.getElementById('visualizer')
var freq = document.getElementById("freq");
var arr = document.getElementById("arr");



var freqHistory = [];

const context = new AudioContext()
const analyserNode = new AnalyserNode(context);
const sr = context.sampleRate;
const ffts = analyserNode.fftSize;

setupContext()
resize()
drawVisualizer();

async function setupContext() {
  const guitar = await getGuitar()
  if (context.state === 'suspended') {
    await context.resume()
  }
  const source = context.createMediaStreamSource(guitar)
  source
  .connect(analyserNode)
}

function getGuitar() {
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
  
  const bufferLength = analyserNode.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyserNode.getByteFrequencyData(dataArray)
  const width = visualizer.width
  const height = visualizer.height
  const barWidth = width / bufferLength

  const canvasContext = visualizer.getContext('2d')
  canvasContext.clearRect(0, 0, width, height)
  
  var maxi = 0;
  dataArray.forEach((item, index) => {
    if(item > dataArray[maxi]){
      maxi = index;
    }
  })
  
  freqHistory.push(maxi*(sr/ffts));
  freq.textContent = `${maxi*(sr/ffts)}`
  
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

  if(freqHistory.length > (width*30)/100){
    freqHistory.splice(0, 1);
  }
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}

