// Import the required package
import { requireFromString, importFromString } from 'import-from-string';

// CJS code as a string
const cjsCode = `
const fs = require('fs');
exports.handleData = (data) => {
    fs.appendFileSync('src/importFromString/output.txt', data);
  };
  `;
  
  // ESM code as a string
  const esmCode = `
import fs from 'fs';
export function handleData(data) {
    fs.appendFileSync('src/importFromString/output.txt', data);
}
`;

// Function to execute CJS code
const executeCJS = () => {
  const cjs = (0, requireFromString)(cjsCode);
  let time = new Date().toISOString();
  let line = '\n' + time + ': index.mjs: Hello from ESM executing CJS string code!';
  cjs.handleData(line); // Call the handleData function
};

// Function to execute ESM code
const executeESM = async () => {
  const esm = await (0, importFromString)(esmCode);
  let time = new Date().toISOString();
  let line = '\n' + time + ': index.mjs: Hello from ESM executing ESM string code!';
  esm.handleData(line); // Call the handleData function
};

// Execute CJS and ESM
executeCJS();
executeESM().catch(error => console.error(error)); // Catch any errors from ESM execution