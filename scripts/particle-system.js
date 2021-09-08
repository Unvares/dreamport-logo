'use strict'

const _ParticleSystem = {};

_ParticleSystem.isDirectionArray = function(arr) {
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

_ParticleSystem.adjustDirectionArray = function(arr) {
  const multiplier =
      1 / Math.max( Math.abs(arr[0]), Math.abs(arr[1]), Math.abs(arr[2]) );

  return [
    arr[0] * multiplier,
    arr[1] * multiplier,
    arr[2] * multiplier,
  ]
}

_ParticleSystem.randomiseDirection = function() {
  const directions = [
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  ];

  return adjustDirectionArray(directions); 
}

_ParticleSystem.defaultValues = {
  amount: 1000,
  direction: [1, 1, 1],
  lifetime: 3000,
  size: 1,
  speed: 1,
  texture: 'https://hsto.org/getpro/moikrug/uploads/company/100/007/265/4/logo/medium_4a47a0db6e60853dedfcfdf08a5ca249.png'
}

AFRAME.registerComponent('particle', {
  schema: {
    direction: {type: 'array', default: _ParticleSystem.defaultValues.direction},
    lifetime: {type: 'number', default: _ParticleSystem.defaultValues.lifetime},
    size: {type: 'number', default: _ParticleSystem.defaultValues.size},
    speed: {type: 'number', default: _ParticleSystem.defaultValues.speed},
    texture: {type: 'string', default: _ParticleSystem.defaultValues.texture}
  },
  init() {
    for(let i = 0; i < this.data.direction.length; i++) {
      this.data.direction[i] = +this.data.direction[i];
    }
    this.data.direction = _ParticleSystem.adjustDirectionArray(this.data.direction);
    this.data.container = this.el;
    let p = new Particle(this.data);
    p.startMoving();
  }
});


/* 
 *  Time Tracker: 6 hours
 *
 *  Minimum Viable Functionality for ParticleSystem:
 *  - You can create particle systems with the ability to define these settings:
 *       - particle amount
 *       - lifetime of each particle*
 *       - particle texture*
 *       - particle size in conventional units*
 *       - particle flight speed in conventional units*
 *       - direction of particle flight*
 *       - start and reset particle system
 *       - pause and resume particle system
 *     *The parameter is the same for each particle in the particle system
 * 
 *  - You can randomise all MVF particle parameters
 *      - How will it work?
 * 
 *  - How a particle system works?
 *    - It creates a particle via Particle class and adds one unit to the value
 *      that stores the total amount of particles in the system. When the variable
 *      amount is equal or exceeds the defined limit, the system stops spawning new
 *      particles. When the elder particles delete, they decrease the variable
 *      value so new particles could be spawned.
 *    - There should be a limit for amount of particles spawned per one unit of time
 *      within the totally empty system. It is needed to avoid performance problems
 *      and a poor visual attractiveness. 
 *    - A lifetime, a texture, a size, a flight speed and a direction variables
 *      are passed to the Particle class and the defined values are the same for
 *      each particle in the system. It is inconvenient but it is the basis for
 *      individual adjusting function, which will be implemented in the future.
 *      I work according to AGILE :)
 *    - When we start particle system, ParticleSystem class starts spawning particles
 *      according to the defined settings and restrictions.
 *    - When we pause particle system, isMoving value of each particle is changed 
 *      to false. The timer of each particle writes the amount of ms passed in
 *      a separate function.
 *    - When we resume particle system, isMoving value of each particle is changed
 *      to true. The timer is defined as a difference of particle lifetime and
 *      amount of seconds passed.
 *    - When we stop particle system, all existing particles are deleted and all
 *      the ParticleSystem variables are set to the default values.
 * 
 *  Goals for the next week:
 *  - Implement at least 6 points from the MVF list
 */


/*
 *  let settings = {
 *    container: HTMLElement,
 *    direction: [number, number, number], // final value is defined as a proproption
 *                                         // of these three numbers.
 *    lifetime: number, // must be larger than zero. It is defined in ms.
 *    size: number, // must be larger than zero
 *    speed: number, // any number
 *    texture: string, // string must contain the url to the image considered to be 
 *                     // a texture
 *  }
 *  
 */



class Particle {
  constructor(settings) {
    this.container = settings.container;
    this.HTMLElement = undefined; // It is defined in createParticle function

    this.direction = 
        ( _ParticleSystem.isDirectionArray(settings.direction) ) ?
        settings.direction : _ParticleSystem.defaultValues.direction;

    this.lifetime =
        ( isNum(settings.lifetime) && settings.lifetime > 0 ) ?
        settings.lifetime : _ParticleSystem.defaultValues.lifetime;

    this.size =
        ( isNum(settings.size) && settings.size > 0 ) ?
        settings.size : _ParticleSystem.defaultValues.size;

    this.speed =
        ( isNum(settings.speed) ) ?
        settings.speed : _ParticleSystem.defaultValues.speed;

    this.texture =
        ( isString(settings.texture) ) ? 
        settings.texture : _ParticleSystem.defaultValues.texture;
    
    this.isMoving = false;

    this.createParticle();
  }

  createParticle() {
    if(!this.HTMLElement) {
    const particle = document.createElement('a-image');
  
    particle.setAttribute('position', '0 0 0');
    particle.setAttribute('scale', `${this.size} ${this.size} ${this.size}`);
    particle.setAttribute('src', this.texture);
  
    this.HTMLElement = particle;
    this.container.append(particle);
    }
  }

  startMoving() {
    this.isMoving = true;
    this.startTime = new Date;
    requestAnimationFrame( () => { this.particleMoving() } );
  }

  particleMoving() {
    const particlePosition = this.HTMLElement.getAttribute('position');

    particlePosition.x += this.direction[0] * this.speed / 60;
    particlePosition.y += this.direction[1] * this.speed / 60;
    particlePosition.z += this.direction[2] * this.speed / 60;

    /*  requestAnimationFrame()  is called every frame (approximately 60 times per
     *  second), so we need to divide this.speed by 60 to make the particle move
     *  defined amount of units in one second
     */

    this.HTMLElement.setAttribute(
        'position', `${particlePosition.x} ${particlePosition.y} ${particlePosition.z}`);

    if(new Date - this.startTime >= this.lifetime) {
      this.stopMoving();
    }

    if(this.isMoving == true) {
      this.animationID = requestAnimationFrame( () => { this.particleMoving() } );
    }
  }

  stopMoving() {
    this.isMoving = false;
    cancelAnimationFrame(this.animationID);
    this.HTMLElement.remove();
  }
}

function isNum(variable) {
  return (typeof variable == 'number');
}

function isString(variable) {
  return (typeof variable == 'string');
}