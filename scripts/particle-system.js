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

_ParticleSystem.particlesPerSecond = 5; // Max value is 250

AFRAME.registerComponent('particle-system', {
  schema: {
    limit: {type: 'number', default: _ParticleSystem.defaultValues.amount},
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
    let PS = new ParticleSystem(this.data);
    PS.start();
  }
});


/* 
 *  Time Tracker: 16 hours
 *
 *  Minimum Viable Functionality (MVF) parameters for ParticleSystem:
 *      + particle amount
 *      + lifetime of each particle*
 *      + particle size in conventional units*
 *      + particle flight speed in conventional units*
 *      + direction of particle flight*
 *  *The parameter is the same for each particle in the particle system
 * 
 *  - You can randomise all MVF particle parameters
 *      - How should it work?
 *          - you can define 'randomise' property and give it randomisation
 *            range and randomised property name as values.
 *          - direction property is random by default
 * 
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

class ParticleSystem {
  constructor(settings) {
    this.settings = settings;
    this.settings.ParticleSystem = this;
    this.container = settings.container;
    this.limit = settings.limit;
    this.amount = 0;
    this.isWorking = false;
    this.cooldown = 1000 / _ParticleSystem.particlesPerSecond;
    this.spawnTime = 0;
    this.animationID = undefined; // It is defined in start(), working() and resume()
  }

  start() {
    this.isWorking = true;
    this.animationID = requestAnimationFrame( () => {
      this.working();
    });
  }

  working() {
    if(this.amount < this.limit && new Date - this.spawnTime >= this.cooldown) {
      let p = new Particle(this.settings);
      p.startMoving();
      this.spawnTime = new Date;
      this.amount++;
    }
    if(this.isWorking) {
      this.animationID = requestAnimationFrame( () => {
        this.working();
      });
    }
  }

  pause() {
    this.isWorking = false;
  }

  resume() {
    this.isWorking = true;
    this.animationID = requestAnimationFrame( () => {
      this.working();
    });
  }

  reset(){
    cancelAnimationFrame(this.animationID);
    this.isWorking = false;
    this.amount = 0;
    this.spawnTime = 0;

    while(this.container.firstChild) {
      this.container.firstChild.remove();
    }
  }

}

class Particle {
  constructor(settings) {
    this.ParticleSystem = settings.ParticleSystem;
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
    if(this.ParticleSystem.isWorking) {
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

      this.lifeDuration = new Date - this.startTime;

      if(new Date - this.startTime >= this.lifetime) {
        this.stopMoving();
      }
    } else {
      this.startTime = new Date - this.lifeDuration;
    }
    
    if(this.isMoving == true) {
      this.animationID = requestAnimationFrame( () => { this.particleMoving() } );
    }
  }

  stopMoving() {
    this.isMoving = false;
    cancelAnimationFrame(this.animationID);
    this.HTMLElement.remove();
    this.ParticleSystem.amount--;
  }
}

function isNum(variable) {
  return (typeof variable == 'number');
}

function isString(variable) {
  return (typeof variable == 'string');
}