/* 6-11-2018 by Luuk Fröling
*  Yes I will regret starting this, no I will not stop.
*  Dare to be stupid.
*/

//GLOBAL VARIABLES
let ai;
let speak, listen;

function preload(){

}

function setup(){
  ai = new neuralNetwork([27, 10, 3]);
  createCanvas(500,500);
  //initSpeech();
  //speak.speak("hello");
  if (!('webkitSpeechRecognition' in window)) {
  console.log("u fucked");
  background(0);
} else {
  var recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  background(100);
  recognition.onstart = function() { background(200); }
  recognition.onresult = function(event) { console.log("result", event.results[0][0].transcript); text(event.results[0][0].transcript,10,10);}
  recognition.onerror = function(event) { text(event.error,10,10);}
  recognition.onend = function() { console.log("ended"); }
  recognition.start();

}
}

function draw(){
  ai.train(toData("cats"), [1,0,0]);
  ai.train(toData("dogs"), [0,1,0]);
  ai.train(toData("joke"), [0,0,1]);

}

//Returned speech data
function result(){
background(100);
console.log(listen.resultString);
let data = toData(listen.resultString);
processOutput(ai.run(data));
ai.output.show();

}

//All the functions Marvin has
let options = [
  function() {
    //CATFACTS!
    getJSON("https://cat-fact.herokuapp.com/facts", function(obj){
      speak.speak(obj.all[Math.round(random(obj.all.length))].text);
    });
  },
  function() {
    getJSON("https://dog-api.kinduff.com/api/facts", function(obj){
      speak.speak(obj.facts);
    });
  },
  function() {
    getJSON("http://webknox.com/api/jokes/random?maxLength=60&apiKey=bfebfdjejelktgifszrxqobymtewult", function(obj){
      speak.speak(obj.joke);
    });
  }
];

//A getaround because of an error. Fuck javascript...
function getJSON(url, onResult){
  const proxyurl = "https://cors-anywhere.herokuapp.com/";
  fetch(proxyurl + url) // https://cors-anywhere.herokuapp.com/https://example.com
  .then(response => response.text())
  .then(contents => onResult(JSON.parse(contents)))
  .catch(() => console.log("Can’t access " + url + " response. Blocked by browser?"))
}

//Convert a string into a usable set of data.
function toData(p){
  let t = p.split('');

    //Convert input data to usable data.
    let abc = 'abcdefghijklmnopqrstuvwxyz '.split('');
    let data = new Array(t.length);
    data.fill(new Array(t.length));
    for(let i = 0; i < data.length; i++){
      data[i] = new Array(abc.length);
      data[i].fill(0);
    }

    //Change the data
    for(let i = 0; i < t.length; i++){
      for(let j = 0; j < abc.length; j++){
        if(t[i] === abc[j]){
          data[i][j] = 1;
          break;
        }
      }
    }
  return data;
}

/* The neural network library returns on run(input) the output as an array.
*  Catch it and give it as a parameter.
*/

function processOutput(output){
  let result = output.indexOf(Math.max.apply(window, output));
  options[result]();
}

function initSpeech(){
  //Get the speech ready
  speak = new p5.Speech();
  speak.setVoice(5);
  speak.setRate(0.8);
  speak.setLang('en-US');

  //Google this is ur one opertunity to listen to what we are saying.
  listen = new p5.SpeechRec('en-US');
  listen.onResult = result;
  listen.onStart = function() { background(0,0,155); }
  listen.onEnd = function() { listen.start(true, false); }
  listen.start(true, false);
}
