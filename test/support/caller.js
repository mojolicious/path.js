import Path from '../../src/path.ts';

export function callerTest() {
  return Path.callerFile();
}

export function callerTestTwo() {
  return callerTest();
}

export function callerTestThree() {
  return Path.currentFile();
}
