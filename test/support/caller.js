import Path from '../../lib/path.js';

export function callerTest() {
  return Path.callerFile();
}

export function callerTestTwo() {
  return callerTest();
}

export function callerTestThree() {
  return Path.currentFile();
}
