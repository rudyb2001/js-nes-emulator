//import { CPU } from './cpu.js'
const CPU = require('./cpu.js')

let cpu = new CPU();
cpu.loadProgram(["69", "01"]);
cpu.adc("69");
cpu.printRegisters();