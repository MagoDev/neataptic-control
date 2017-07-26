import React, { Component } from 'react';
// import './App.css';
import { Network, methods } from 'neataptic'
import { trainingSet } from './data/training-set'

import ReactHighcharts from 'react-highcharts' // Expects that Highcharts was loaded in the code.

const config = {
  title: {
    text: 'Neural Network with Genetic Algorithm Control'
  },

  // subtitle: {
  //   text: 'Neural Network with Genetic Algorithm Control'
  // },

  yAxis: {
    title: {
      text: 'Amplitude'
    }
  },
  legend: {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'middle'
  },

  plotOptions: {
    series: {
      pointStart: 0
    }
  },

  series: [{
    name: 'Reference',
    data: []
  }, {
    name: 'Neural Network',
    data: []
  }]

}

class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      error: null,
      input: [], targetoutput: [], output: []
    }
    this.options = {
      mutation: methods.mutation.FFW,
      activation: methods.activation.SINUSOID,
      equal: true,
      popsize: 100,
      elitism: 5,
      mutationRate: 0.05,
      iterations: 250,
      amount: 1,
      error: 0.01,
      clear: true,
      schedule: { function: function (e) { console.log(e) }, iterations: 1 }
    }
  }

  componentDidMount() {
    this.run(trainingSet, this.options)
  }

  run(set, options) {
    var network = new Network(2, 1);
    var results = network.evolve(set, options);
    let input = this.state.input
    let targetoutput = this.state.targetoutput
    let output = this.state.output

    results.then((res) => {
      this.network = network
      var s = '';
      for (var i = 0; i < set.length; i++) {
        let newinput = set[i].input;
        let newtargetoutput = set[i].output;
        // console.log('set[i].input', set[i].input);
        let newoutput = network.activate(set[i].input);
        // for (var j = 0; j < newoutput.length; j++) {
        //   newoutput[j] = Math.round(newoutput[j] * 1000) / 1000;
        // }

        // newoutput = JSON.stringify(newoutput);
        // s += (`Input: ${newinput}, wanted output: ${newtargetoutput}, actual: ${newoutput}\n`);

        input = input.concat(...newinput)
        output = output.concat(...newoutput)
        targetoutput = targetoutput.concat(...newtargetoutput)
        // console.log(s)
      }
      this.setState({ input, output, targetoutput })
    })
    // let error = 'Error ' + Math.round(-results.error * 1000) / 1000

    // this.setState({ error, s })
  }

  render() {
    let { targetoutput, output } = this.state
    console.log('targetoutput', targetoutput)
    console.log('output', output)
    config.series[0].data = targetoutput
    config.series[1].data = output

    return (
      <div className="App">
        <div className="App-header">
          {/* <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2> */}
          <ReactHighcharts config={config} ref="chart"></ReactHighcharts>
        </div>
      </div>
    );
  }
}

export default App;
