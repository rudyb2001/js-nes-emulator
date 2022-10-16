//import { CPU } from './cpu.js'
const CPU = require('./cpu.js')

// Test 1: ADC, 69, basic addition works properly
let cpu = new CPU();

cpu.printRegisters();
cpu.loadProgram(["69", "01"]);
cpu.adc("69");
cpu.printRegisters();

let uint8 = new Uint8Array(1);
uint8[0] = 254;

for (let i = 0; i < 3; i++) {
    uint8[0] += 1;
    console.log(uint8[0]);
}

uint8[0] = 257;
console.log(uint8[0]);

uint8[0] |= 0b01000000;
console.log(uint8[0]);
console.log(0b01000001);
console.log(uint8[0] === 0b01000001);
