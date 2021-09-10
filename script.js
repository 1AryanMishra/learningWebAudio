const visualizer = document.getElementById('visualizer')
var freq = document.getElementById("freq");
var arr = document.getElementById("arr");



var freqHistory = [];

const context = new AudioContext()
const analyserNode = new AnalyserNode(context)
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
  
  for(var i = 0; i < freqHistory.length; i++){    
    canvasContext.fillStyle = `#fff`;
    const y = height - (freqHistory[i]/1024)*(height);
    canvasContext.fillRect(i, y, 2, 2);
  }
  canvasContext.fillRect(freqHistory.length, height, height, 1)

  if(freqHistory.length > (width*80)/100){
    freqHistory.splice(0, 1);
  }
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}

