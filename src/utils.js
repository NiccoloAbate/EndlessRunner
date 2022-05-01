
function getRandomInclusive(min, max) {
    return (Math.random() * (max - min) + min);
}

// from javascript documentation
function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is inclusive and the minimum is inclusive
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

function lerp(min, max, pos) {
  return ((max - min) * pos) + min;
}

// based on answer in forum:
// https://stackoverflow.com/questions/43566019/how-to-choose-a-weighted-random-array-element-in-javascript
function randomChoiceWeighted(items, weights) {
  let i;

  for (i = 0; i < weights.length; i++)
      weights[i] += weights[i - 1] || 0;
  
  let random = Math.random() * weights[weights.length - 1];
  
  for (i = 0; i < weights.length; i++)
    if (weights[i] > random)
      break;
  
  return items[i];
}

function average(arr) {
  if (arr.length == 0) {
    return 0;
  }
  
  let sum = 0;
  arr.forEach(x => sum += x);
  return sum / arr.length;
}

function isEven(i) {
  let div = i / 2;
  return (div == Math.floor(div));
}
function isOdd(i) {
  let div = i / 2;
  return !(div == Math.floor(div));
}

let UpdateTime = {
    sRatio: 1000,
    msRatio: 1,
    mRatio: 60000
}

