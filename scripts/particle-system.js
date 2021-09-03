'use strict'

const _ParticleSystem = {
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
  },
  randomiseDirection() {
    let valueX = (Math.random() - 0.5) * 2;
    let valueY = (Math.random() - 0.5) * 2;
    let valueZ = (Math.random() - 0.5) * 2;

    const multiplier = 
        1 / Math.max(Math.abs(valueX), Math.abs(valueY), Math.abs(valueZ));

    return [valueX * multiplier,
            valueY * multiplier,
            valueZ * multiplier];
  }
};

_ParticleSystem.defaultValues = {
  direction: [1, 1, 1],
  lifetime: 3000,
  size: 1,
  speed: 1,
  texture: 'https://hsto.org/getpro/moikrug/uploads/company/100/007/265/4/logo/medium_4a47a0db6e60853dedfcfdf08a5ca249.png'
}

AFRAME.registerComponent('particle', {
  // all properties are available through this['data']['propertyName']
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
    this.data.container = this.el;
    let p = new Particle(this.data);
    p.startMoving();
  }
});

/* 
 *  Time Tracker: 6 hours
 *
 *  Minimum Viable Functionality:
 *  + You can define particle lifetime
 *  + Particle deletes after defined amount of ms passed
 * 
 *  + You can define particle flight direction
 *  + Particle can fly in the defined direction
 * 
 *  + You can define particle flight speed
 *  + Particle flies defined amount of units per second
 * 
 *  + You can define particle size
 *  + Particles size is equal to the defined value multiplied by particle's initial
 *    size
 * 
 *  - You can randomise all parameters written above
 *      - How will it work?
 * 
 *  + You can define particle texture
 *  + Particle system is implemented into A-Frame as a component
 *
 *  Questions:
 *  1) Each ParticleSystem class is for creating and adjusting one particle or bunch
 *     of particles?
 *  2) Which methods and variables are intended for incapsulation and which are not?
 *     How to incapsulate them?
 *
 *  Answers:
 *  1) If we create an object for each particle, we have amount of objects equal to
 *     amount of particles in the scene. If we create an object for each particle
 *     system and define each particle as a property of this object or unite all of
 *     them in one array, we have only one object. I suppose that performance would
 *     be a way better if we use the second method.
 *     
 *     upd: I discussed the matter with a more experienced developer and he said that
 *     there should be no big difference in performance and suggested to create two
 *     separate classes: Particle for settings and methods and ParticleSystem for
 *     creating and operating particle systems using Particle class. 
 *  2)
 *
 *  Goals for the next week:
 *  + Implement at least 4 points from the MVF list
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

}

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