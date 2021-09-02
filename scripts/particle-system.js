'use strict'


/* 
  Time Tracker: 3 hours

  Minimum Viable Functionality:
  - You can define particle lifetime
  - You can define particle flight direction
  - You can define particle flight speed
  - You can define particle size
  - You can randomise all parameters written above
  - You can define particle texture
  - Particle system is implemented into A-Frame as a component

  Questions:
  1) Each ParticleSystem class is for creating and adjusting one particle or bunch of particles?
  2) Which methods and variables are intended for incapsulation and which are not? How to incapsulate them?

  Answers:
  1) If we create an object for each particle, we have amount of objects equal to amount of particles in the scene.
     If we create an object for each particle system and define each particle as a property of this object or unite
     all of them in one array, we have only one object. I suppose that performance would be a way better if we use
     the second method.
      
     upd: I discused the matter with a more experienced developer and he said that there should be no big difference
     in performance and suggested to create two separate classes: Particle for settings and methods and ParticleSystem
     for creating and operating particle systems using Particle class. 
  2)

  Goals for the next week:
  - Implement at least 4 points from the MVF list
*/


/*
  let settings = {
    direction: [number, number, number], // final value is defined as a proproption of these three numbers.
    lifetime: number, // must be larger than zero. It is defined in ms.
    size: number, // must be larger than zero
    speed: number, // any number
    texture: string, // string must contain the url to the image considered to be a texture
  }

  let randomiseSettings = {
    minValue: number,
    maxValue: number,
  }

  Methods:
  - isDirectionArray(array) – checks if the argument is an array with numbers as three first values
  - randomise(string, object) – takes setting name from a string argument, specific settings for randomisation from an object
                                argument and creates random value depending on these two parameters.
  - 
*/
class Particle {

  constructor(settings) {
    /* 
      default values:
      direction: random,
      lifetime: 3000,
      size: 1,
      speed: 1,
      texture: 'https://hsto.org/getpro/moikrug/uploads/company/100/007/265/4/logo/medium_4a47a0db6e60853dedfcfdf08a5ca249.png'
    */
    this.direction = ( this.isDirectionArray(settings.direction) ) ?
                      settings.direction : this.randomiseSetting('direction');
    this.lifetime = (isNum(settings.lifetime) && settings.lifetime > 0) ?
                     settings.lifetime : 3000;
    this.size = (isNum(settings.size) && settings.size > 0) ?
                 settings.size : 1;
    this.speed = ( isNum(settings.speed) ) ?
                  settings.speed : 1;
    this.texture = ( isString(settings.texture) ) ? 
                    settings.texture : 'https://hsto.org/getpro/moikrug/uploads/company/100/007/265/4/logo/medium_4a47a0db6e60853dedfcfdf08a5ca249.png';
  }

  isDirectionArray(arr) {
    if( Array.isArray(arr) && arr.length >= 3 ) {
      for(let i = 0; i < 3; i++) {
        if(typeof arr[i] != 'number') {
          return false;
        }
      }
      return true;
    } else {
      return false;
    }
  }

  randomiseSetting(name, settings) {
    if(name == 'direction') return randomiseDirection();

    function randomiseDirection() {
      let valueX = Math.random();
      let valueY = Math.random();
      let valueZ = Math.random();
      let multiplier = 1 / Math.max(valueX, valueY, valueZ);

      return [valueX * multiplier,
              valueY * multiplier,
              valueZ * multiplier];
    }
  }

}

function isNum(variable) {
  return (typeof variable == 'number');
}
function isString(variable) {
  return (typeof variable == 'string');
}