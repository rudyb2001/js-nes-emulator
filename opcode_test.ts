// returns a number as a hexidecimal string (used in CPU assertions)
function toHex(n: number): string {
    return n.toString(16);
}

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

function testExecuteCurrent() {
    { // possible scenario with ADC
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

        { // ensure that ADC is being correctly called and pc is being correctly incremented, correct addressing mode used...
            Opcode.executeCurrent(c) // ADC 0xFF   (IMM)
            // a + 0xFF + 0b0 => a = 255, c = 0
            console.assert(c.a[0] == 0xFF && c.flag.c == false);
            console.assert(c.pc[0] == 0x8002);
            Opcode.executeCurrent(c) // ADC [0x01] (Zero Page)
            // a + 0x01 + 0b0 => a = 0, c = 1
            console.assert(c.a[0] == 0 && c.flag.c == true);
            console.assert(c.pc[0] == 0x8004);
            Opcode.executeCurrent(c) // ADC [0x0410] (Absolute)
            // a + 0x0F + 0b1 => a = 0x10, c = 0
            console.assert(c.a[0] == 0x10 && c.flag.c == false);
            console.assert(c.pc[0] == 0x8007);
            Opcode.executeCurrent(c) // ADC [[0xB0] + x] (indirect x)
            // a + 0x04 + 0x0 => a = 0x14, c = 0
            console.assert(c.a[0] == 0x14 && c.flag.c == false);
            console.assert(c.pc[0] == 0x8009);
        }
    }

    { // NoAddressing Opcode
        let c = new CPU();
        c.flag.c = true;
        let program = Uint8Array.from([
                                        0x18 // CLC: clear carry
                                      ]);

        c.memoryMap.loadProgram(program);
        c.pc[0] = 0x8000; // TODO PC should be automatically initialized somwehere

        Opcode.executeCurrent(c);

        console.assert(c.pc[0] == 0x8001);
        console.assert(!c.flag.c);
    }

    { // Erroneous Opcode
        let c = new CPU();
        let program = Uint8Array.from([
                                        0xFF // unsupported opcode 
                                      ]);

        c.memoryMap.loadProgram(program);
        c.pc[0] = 0x8000; // TODO PC should be automatically initialized somwehere

        try {
            Opcode.executeCurrent(c);
            console.assert(false, "Unsupported opcode 0xFF was successfully executed");
        } catch(e) {}
    }
}

function testTestOverflow() {
    console.assert(testOverflow(0x40, 0x20, u8Add(0x40, 0x20)) == false);
    console.assert(testOverflow(0x40, 0x40, u8Add(0x40, 0x40)) == true);
    console.assert(testOverflow(0x15, 0x7F, u8Add(0x15, 0x7F)) == true);
    console.assert(testOverflow(0xFF, 0xFF, u8Add(0xFF, 0xFF)) == false);
}

function testU8Add() {
    console.assert(u8Add(0xAB, 0xFF) == 0xAA);
    console.assert(u8Add(0xCD, 0x00) == 0xCD);
    console.assert(u8Add(0x23, 0x12) == 0x35);
    console.assert(u8Add(0x55, 0xFE) == 0x53);
}

function runOpcodeTests() {
    testExecuteCurrent();
    testTestOverflow();
    testU8Add();

    // Opcode function testers below
    testADC();
    testCLC();
}

function testADC() {
    { // IMM
        let cpuBefore = CPU.newCPUwith(0x8000, 0xFF, 0x00, 0x00, 0b000_0001);
        let cpuAfter = CPU.newCPUwith(0x8002, 0x00, 0x00, 0x00, 0b000_0011);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x69, 0x00]), cpuAfter);
    }

    { // ZeroPage
        let cpuBefore = CPU.newCPUwith(0x8000, 0x44, 0x00, 0x00, 0b000_0001);
        let cpuAfter = CPU.newCPUwith(0x8002, 0xC4, 0x00, 0x00, 0b110_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x65, 0xAA]), cpuAfter, 0xAA, 0x7F);
    }

    { // ZeroPageX
        let cpuBefore = CPU.newCPUwith(0x8000, 0x40, 0x01, 0x00, 0b000_0000);
        let cpuAfter = CPU.newCPUwith(0x8002, 0x80, 0x01, 0x00, 0b110_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x75, 0xA9]), cpuAfter, 0xAA, 0x40);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0x02, 0x00, 0x00, 0b000_0000);
        let cpuAfter = CPU.newCPUwith(0x8003, 0x04, 0x00, 0x00, 0b000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x6D, 0x01, 0x00]), cpuAfter, 0x0001, 0x02);
    }

    { // AbsoluteX
        let cpuBefore = CPU.newCPUwith(0x8000, 0xC0, 0x03, 0x00, 0b000_0000);
        let cpuAfter = CPU.newCPUwith(0x8003, 0x00, 0x03, 0x00, 0b000_0011);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x7D, 0xAB, 0x05]), cpuAfter, 0x05AE, 0x40);
    }

    { // AbsoluteY
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x01, 0b000_0001);
        let cpuAfter = CPU.newCPUwith(0x8003, 0x10, 0x00, 0x01, 0b000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x79, 0x00, 0x00]), cpuAfter, 0x01, 0x0F);
    }

    { // IndirectX
        let cpuBefore = CPU.newCPUwith(0x8000, 0x55, 0x05, 0x00, 0b000_0000);
        let cpuAfter = CPU.newCPUwith(0x8002, 0xFF, 0x05, 0x00, 0b100_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x61, 0x05]), cpuAfter, 0x0A, 0xFF, 0x0B, 0x0F, 0x0FFF, 0xAA);
    }

    { // IndirectY
        let cpuBefore = CPU.newCPUwith(0x8000, 0x54, 0x00, 0x05, 0b000_0001);
        let cpuAfter = CPU.newCPUwith(0x8002, 0x2F, 0x00, 0x05, 0b000_0001);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x71, 0x05]), cpuAfter, 0x0A, 0xFF, 0x0B, 0x0F, 0x0FFF, 0xDA);
    }
}

function testCLC() {
    let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0xCD, 0xEF, 0b101_0101);
    let cpuAfter =  CPU.newCPUwith(0x8001, 0xAB, 0xCD, 0xEF, 0b101_0100);
    //                                  (only carry bit should change ^)
    exeCpuTestcase(cpuBefore, Uint8Array.from([0x18]), cpuAfter);
}

runOpcodeTests();
