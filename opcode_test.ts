/*
 * executes a given set of instructions (prog) on an instance of CPU (state),
 * and compares it to an expected instance of CPU (expected). Additional
 * arguments can be passed to populate the initial state's memory map,
 * in the format: addr1, byte1, addr2, byte2, addr3, byte3, ...
 */
function exeCpuTestcase(state: CPU, prog: Uint8Array, expected: CPU, ...mem: number[]): void {
    // load program
    state.memoryMap.loadProgram(prog);

    // populate memory
    let addr;
    for(let i = 0; i < mem.length; i++) {
        if(i % 2 == 0) addr = mem[i];
        else state.memoryMap.writeByte(addr, mem[i]);
    }

    // execute instructions
    state.pc[0] = 0x8000;
    while(state.pc[0] < 0x8000 + prog.length) {
        Opcode.executeCurrent(state);
    }

    // verify that state matches expected
    state.assertEqual(expected);
}

function testExeCpuTestcase() {
    // TODO
}

function testExecuteCurrent() {
    // TODO
}

function testTestOverflow() {
    // TODO
}

function testU8Add() {
    // TODO
}

function runOpcodeTests() {
    testExeCpuTestcase();
    testExecuteCurrent();
    testTestOverflow();
    testU8Add();

    // Opcode function testers below

    testADC();
}

function testADC() {
    // TODO
}

{ // possible scenario for adc
    let c = new CPU();
    let program = Uint8Array.from([
                                    0x69, 0xFF,      // ADC 0xFF         (IMM)
                                    0x65, 0x0A,      // ADC [0x01]       (Zero Page)
                                    0x6D, 0x10, 0x04,// ADC [0x0410]     (Absolute)
                                    0x61, 0xB0,      // ADC [[0xB0] + x] (indirect x)
                                  ]);

    c.memoryMap.writeByte(0x0A, 0x01);
    c.memoryMap.writeByte(0x0410, 0x0F);
    c.memoryMap.writeByte(0xB0, 0x00);
    c.memoryMap.writeByte(0x00, 0x04);

    c.memoryMap.loadProgram(program);
    c.pc[0] = 0x8000; // TODO PC should be automatically initialized somwehere

    { // execute some instructions
        c.printRegisters();
        Opcode.executeCurrent(c) // ADC 0xFF   (IMM)
        // a + 0xFF + 0b0 => a = 255, c = 0
        c.printRegisters();
        Opcode.executeCurrent(c) // ADC [0x01] (Zero Page)
        // a + 0x01 + 0b0 => a = 0, c = 1
        c.printRegisters();
        Opcode.executeCurrent(c) // ADC [0x0410] (Absolute)
        // a + 0x0F + 0b1 => a = 0x10, c = 0
        c.printRegisters();
        Opcode.executeCurrent(c) // ADC [[0xB0] + x] (indirect x)
        // a + 0x04 + 0x0 => a = 0x14, c = 0
        c.printRegisters();
    }
}
