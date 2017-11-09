import React from 'react';
import {render} from 'react-dom';
import {linear} from 'everpolate';

class App extends React.Component {

  componentWillMount() {
    this.audioContext = new AudioContext();

    this.fpb = 1024;
    this.rate = 1 / 4.0;
    this.size = this.fpb * this.rate;
    this.fpb = this.size / this.rate;
    
    this.x1 = this.arange(0, this.size + 20, 1);
    this.xp5 = this.arange(0, this.size + 20, this.rate);
  
    console.log(this.fpb, this.size);
  }

  load(e) {
    var reader = new FileReader();
    reader.onload = () => {
      this.playAudio(reader.result);      
    }
    reader.readAsArrayBuffer(e.target.files[0]);
  }

  playAudio(audioData) {
      this.audioContext.decodeAudioData(audioData, (buffer) => {
          this.play(buffer.getChannelData(0));
      }, function(e) { "Error with decoding audio data" + e.err; });
  }

  arange(start, end, step) {
    let array = [];
    for(var x = start; x < end; x += step) {
      array.push(x);
    }
    return array;
  }

  play(data) {
    var process = this.audioContext.createScriptProcessor(this.fpb, 0, 1),
      c = 10;
    
    process.onaudioprocess = (e) => {
      var start = c - 10,
        end = c + this.size + 10,
        slice = data.slice(start, end),
        leftChunk = linear(this.xp5, this.x1, slice),
        overlap = (leftChunk.length - this.fpb) / 2,
        chopped = leftChunk.slice(overlap, leftChunk.length - overlap);

      c = c + this.size
        
      e.outputBuffer.getChannelData(0).set(chopped);
    }

    process.connect(this.audioContext.destination);
  }

  render () {
    return (
      <input onChange={this.load.bind(this)} type="file" id="track" />
    );
  }

}

render(<App/>, document.getElementById('app'));