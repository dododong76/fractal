"use strict";

window.addEventListener("load",function() {

  let canv, ctx;    // canvas and context
  let maxx, maxy;   // canvas dimensions
  let c;
  let hue;

// for animation
  let events;

// shortcuts for Math.
  const mrandom = Math.random;
  const mfloor = Math.floor;
  const mround = Math.round;
  const mceil = Math.ceil;
  const mabs = Math.abs;
  const mmin = Math.min;
  const mmax = Math.max;

  const mPI = Math.PI;
  const mPIS2 = Math.PI / 2;
  const mPIS3 = Math.PI / 3;
  const m2PI = Math.PI * 2;
  const m2PIS3 = Math.PI * 2 / 3;
  const msin = Math.sin;
  const mcos = Math.cos;
  const matan2 = Math.atan2;

  const mhypot = Math.hypot;
  const msqrt = Math.sqrt;

  const rac3   = msqrt(3);
  const rac3s2 = rac3 / 2;

//------------------------------------------------------------------------

function alea (mini, maxi) {
// random number in given range

  if (typeof(maxi) == 'undefined') return mini * mrandom(); // range 0..mini

  return mini + mrandom() * (maxi - mini); // range mini..maxi
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function intAlea (mini, maxi) {
// random integer in given range (mini..maxi - 1 or 0..mini - 1)
//
  if (typeof(maxi) == 'undefined') return mfloor(mini * mrandom()); // range 0..mini - 1
  return mini + mfloor(mrandom() * (maxi - mini)); // range mini .. maxi - 1
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function Noise1DOneShot (period, min = 0, max = 1, random) {
/* returns a 1D single-shot noise generator.
   the (optional) random function must return a value between 0 and 1
  the returned function has no parameter, and will return a new number every tiime it is called.
  If the random function provides reproductible values (and is not used elsewhere), this
  one will return reproductible values too.
  period should be > 1. The bigger period is, the smoother output noise is
*/
  random = random || Math.random;
  let currx = random(); // start with random offset
  let y0 = min + (max - min) * random(); // 'previous' value
  let y1 = min + (max - min) * random(); // 'next' value
  let dx = 1 / period;

  return function() {
    currx += dx;
    if (currx > 1) {
      currx -= 1;
      y0 = y1;
      y1 = min + (max - min) * random();
    }
    let z = (3 - 2 * currx) * currx * currx;
    return z * y1 + (1 - z) * y0;
  }
} // Noise1DOneShot

//------------------------------------------------------------------------

function Circle(R, level) {

  this.level = level;
  this.R = R;

  if (level & 1)
    this.hue0 = false;
  else {
    this.fdLum = Noise1DOneShot(intAlea(300,500), 20, 80);
  }
  this.children = [];
  if (level <= 3) {
    this.th0 = alea(m2PI);
    this.fdth = Noise1DOneShot(intAlea(300,600), -1 / R, 1 / R);
    this.n = intAlea(((level == 0) ? 3 : 2), 7);
    this.r = R / (1 + 1 / msin(mPI / this.n));
    this.dr = R - this.r;
    for (let k = 0; k < this.n; ++k) {
      this.children.push(new Circle(this.r, level + 1));
    } // for k
  } // if (this.level <= 4)

} // Circle

Circle.prototype.draw = function(xc, yc) {
  ctx.beginPath();
  if (this.hue0 === false)
    ctx.fillStyle = '#000';
  else {
    ctx.fillStyle = `hsl(${hue},100%,${this.fdLum()}%)`;
  }
  ctx.arc(xc, yc, this.R, 0, m2PI);
  ctx.fill();
  if (this.children.length > 0) {
    this.th0 = (this.th0 + this.fdth()) % m2PI;
    for (let k = 0; k < this.n; ++k) {
      let ang = this.th0 + k * m2PI / this.n;
      this.children[k].draw(xc + this.dr * mcos(ang), yc + this.dr * msin(ang));
    } // let k

  } // if this.children.length > 0

} // Circle.prototype.draw

//------------------------------------------------------------------------

let animate;

{ // scope for animate

let animState = 0;

animate = function(tStamp) {

  let event;
  let tinit;

  event = events.pop();
  if (event && event.event == 'reset') animState = 0;
  if (event && event.event == 'click') animState = 0;
  window.requestAnimationFrame(animate)

  switch (animState) {

    case 0 :
      if (startOver()) {
        ++animState;
      }
      break;

    case 1 :
      c.draw(maxx / 2, maxy / 2);
      break;

    case 2:
      break;

  } // switch

} // animate
} // scope for animate

//------------------------------------------------------------------------
//------------------------------------------------------------------------

function startOver() {

// canvas dimensions

  maxx = window.innerWidth;
  maxy = window.innerHeight;

  canv.width = maxx;
  canv.height = maxy;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,maxx,maxy);

  hue = intAlea(360);
  c = new Circle (mmin( maxx - 10, maxy -10) / 2, 0);

  return true;

} // startOver

//------------------------------------------------------------------------

function mouseClick (event) {

  events.push({event:'click'});;

} // mouseClick

//------------------------------------------------------------------------
//------------------------------------------------------------------------
// beginning of execution

  {
    canv = document.createElement('canvas');
    canv.style.position="absolute";
    document.body.appendChild(canv);
    ctx = canv.getContext('2d');
    canv.setAttribute ('title','click me');
  } // création CANVAS
  canv.addEventListener('click',mouseClick);
  events = [{event:'reset'}];
  requestAnimationFrame (animate);

}); // window load listener
