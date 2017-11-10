import React from 'react';
import {render} from 'react-dom';
import {linear} from 'everpolate';

class App extends React.Component {

  componentWillMount() {
    this.audioContext = new AudioContext();

    this.fpb = 512;
    this.setRate(1);
  }

  setRate(desiredRate) {
    this.dir = desiredRate > 0 ? 1 : -1;
    this.size = Math.round(this.fpb * Math.abs(desiredRate));
    this.rate = this.size / this.fpb;
    
    this.x1 = this.arange(0, this.size + 20, 1);
    this.xp5 = this.arange(0, this.size + (20 * this.rate), this.rate);
  }

  play(data) {
    var process = this.audioContext.createScriptProcessor(this.fpb, 0, 1),
      c = 10;
    
    process.onaudioprocess = (e) => {
      var slice = this.dir == 1 ? data.slice(c - 10, c + this.size + 10) : data.slice(c - this.size - 10, c + 10).reverse(),
        interp = linear(this.xp5, this.x1, slice),
        overlap = (interp.length - this.fpb) / 2,
        chopped = interp.slice(overlap, interp.length - overlap);
      c = c + (this.size * this.dir);
        
      e.outputBuffer.getChannelData(0).set(chopped);
    }

    process.connect(this.audioContext.destination);
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

  fart(e) {
    if (e.target.value != 0) {
      this.setRate(e.target.value);
    }
  }

  render () {
    return (
      <div>
        <input onChange={this.load.bind(this)} type="file" id="track" />
        <input style={{width:'100%'}} onChange={this.fart.bind(this)} type="range" max="2" min="-2" step="0.01" defaultValue="1" />
      </div>
    );
  }

}

render(<App/>, document.getElementById('app'));