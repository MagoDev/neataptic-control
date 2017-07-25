import React, { Component } from 'react';
// import './App.css';
import { Network, Methods } from 'neataptic'
import { trainingSet } from './data/training-set'
import ReactDOM from 'react-dom';

import ReactHighcharts from 'react-highcharts' // Expects that Highcharts was loaded in the code.

const config = {
  /* HighchartsConfig */
};


class App extends Component {

  constructor(props) {
    super(props)
    this.state = {
      error: null,
      input: [], targetoutput: [], output: [],
      config: {

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
    }
    this.options = {
      // mutation: Methods.Mutation.ALL,
      equal: true,
      elitism: 5,
      iterations: 1500,
      error: 0.001
    }
  }

  componentDidMount() {
    this.run(trainingSet, this.options)
  }

  run(set, options) {
    var network = new Network(set[0].input.length, set[0].output.length);
    var results = network.evolve(set, options);
    let input = this.state.input
    let targetoutput = this.state.targetoutput
    let output = this.state.output

    var s = '';
    for (var i = 0; i < set.length; i++) {
      let newinput = set[i].input;
      let newtargetoutput = set[i].output;
      let newoutput = network.activate(set[i].input);

      for (var j = 0; j < newoutput.length; j++) {
        newoutput[j] = Math.round(newoutput[j] * 1000) / 1000;
      }

      // newoutput = JSON.stringify(newoutput);
      s += (`Input: ${newinput}, wanted output: ${newtargetoutput}, actual: ${newoutput}\n`);

      input = input.concat(...newinput)
      output = output.concat(...newoutput)
      targetoutput = targetoutput.concat(...newtargetoutput)
      console.log(s)
    }
    this.setState({ input, output, targetoutput })
    // let error = 'Error ' + Math.round(-results.error * 1000) / 1000

    // this.setState({ error, s })
  }

  render() {
    let { error, config, input, targetoutput, output } = this.state
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
