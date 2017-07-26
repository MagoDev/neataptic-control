import React, { Component } from 'react';
// import './App.css';
import { Network, methods, Neat } from 'neataptic'
import { trainingSet } from './data/training-set'
import ReactDOM from 'react-dom';

import ReactHighcharts from 'react-highcharts';
import population from './population'

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
};
// settings
var START_X = 0;
var START_Y = 0;
var SCORE_RADIUS = 100;

// GA settings
const PLAYER_AMOUNT = 10;
const ITERATIONS = 25; // should be ~250 for real use
const MUTATION_RATE = 0.3;
const ELITISM = Math.round(0.1 * PLAYER_AMOUNT);

// Trained population
const USE_TRAINED_POP = true;

/** Global vars */
let neat = null;
let players = [];
let highestScore = 0;
var walker = new Walker();
var iteration = 0;

class App extends Component {

  constructor(props) {
    super(props)

    this.state = {
      error: null,
      input: [],
      targetoutput: [],
      output: []
    }

    this.options = {
      mutation: methods.mutation.ALL,
      equal: true,
      elitism: 5,
      iterations: 1500,
      error: 0.001
    }
  }

  componentDidMount() {
    this.initNeat();

    // Do some initial mutation
    if (!USE_TRAINED_POP) {
      for (var i = 0; i < 1; i++) neat.mutate();
    }

    this.startEvaluation();
  }

  initNeat() {
    neat = new Neat(6, 1, null,
      {
        mutation: [
          methods.mutation.ADD_NODE,
          methods.mutation.SUB_NODE,
          methods.mutation.ADD_CONN,
          methods.mutation.SUB_CONN,
          methods.mutation.MOD_WEIGHT,
          methods.mutation.MOD_BIAS,
          methods.mutation.MOD_ACTIVATION,
          methods.mutation.ADD_GATE,
          methods.mutation.SUB_GATE,
          methods.mutation.ADD_SELF_CONN,
          methods.mutation.SUB_SELF_CONN,
          methods.mutation.ADD_BACK_CONN,
          methods.mutation.SUB_BACK_CONN
        ],
        popsize: PLAYER_AMOUNT,
        mutationRate: MUTATION_RATE,
        elitism: ELITISM
      }
    );

    if (USE_TRAINED_POP) {
      neat.population = population;
    }
  }

  startEvaluation() {
    players = [];
    highestScore = 0;

    for (var genome in neat.population) {
      genome = neat.population[genome];
      new Player(genome);
    }

    walker.reset();
  }

  endEvaluation() {
    console.log('Generation:', neat.generation, '- average score:', Math.round(neat.getAverage()));
    console.log('Fittest score:', Math.round(neat.getFittest().score));

    // Networks shouldn't get too big
    for (var genome in neat.population) {
      genome = neat.population[genome];
      genome.score -= genome.nodes.length * SCORE_RADIUS / 10;
    }

    // Sort the population by score
    neat.sort();

    // Init new pop
    var newPopulation = [];

    // Elitism
    for (var i = 0; i < neat.elitism; i++) {
      newPopulation.push(neat.population[i]);
    }

    // Breed the next individuals
    for (var i = 0; i < neat.popsize - neat.elitism; i++) {
      newPopulation.push(neat.getOffspring());
    }

    // Replace the old population with the new population
    neat.population = newPopulation;
    neat.mutate();

    neat.generation++;
    this.startEvaluation();
  }

  draw() {
    // clear();

    // Check if evaluation is done
    if (iteration == ITERATIONS) {
      this.endEvaluation();
      iteration = 0;
    }

    // Update and visualise players
    for (var i = players.length - 1; i >= 0; i--) {
      var player = players[i];

      // Some players are eaten during the iteration
      player.update();
    }

    walker.update();

    iteration++;
  }

  render() {
    let { error, input, targetoutput, output } = this.state
    // console.log('targetoutput', targetoutput)
    // console.log('output', output)

    config.series[0].data = targetoutput
    config.series[1].data = output

    return (
      <div className="App">
        <div className="App-header">
          <ReactHighcharts config={config} ref="chart"></ReactHighcharts>
        </div>
      </div>
    );
  }
}

function Walker() {
  this.x = START_X;
  this.y = START_Y;
}

Walker.prototype = {
  update: function (x, y) {
    this.x = x
    this.y = y
  },

  reset: function () {
    this.x = START_X;
    this.y = START_Y;
  },

};

function Player(genome) {
  this.x = START_X;
  this.y = START_Y;

  this.brain = genome;
  this.brain.score = 0;

  players.push(this);
}

Player.prototype = {
  /** Update the stats */
  update: function () {
    var input = this.detect();
    var output = this.brain.activate(input);

    this.x = x;
    this.y = output[0];

    this.score();
  },

  /** Calculate fitness of this players genome **/
  score: function () {
    var dist = distance(this.x, this.y, walker.x, walker.y);
    if (!isNaN(dist) && dist < SCORE_RADIUS) {
      this.brain.score += SCORE_RADIUS - dist;
    }

    // Replace highest score to visualise
    highestScore = this.brain.score > highestScore ? this.brain.score : highestScore;
  },

  /** Detect and normalize inputs */
  detect: function () {
    var dist = Math.sqrt(this.x, this.y, walker.x, walker.y) / Math.sqrt(WIDTH ** 2 + HEIGHT ** 2);
    var targetAngle = angleToPoint(this.x, this.y, walker.x, walker.y) / TWO_PI;
    var tvx = (walker.vx + MAX_SPEED) / MAX_SPEED;
    var tvy = (walker.vy + MAX_SPEED) / MAX_SPEED;

    // NaN checking
    targetAngle = isNaN(targetAngle) ? 0 : targetAngle;
    dist = isNaN(dist) ? 0 : dist;

    return [vx, vy, tvx, tvy, targetAngle, dist];
  },
};




export default App;
