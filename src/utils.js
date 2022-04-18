
function getRandomInclusive(min, max) {
    return (Math.random() * (max - min) + min);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}

let UpdateTime = {
    sRatio: 1000,
    msRatio: 1,
    mRatio: 60000
}
