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

    { // Erroneous Opcode TODO remove this when unsupported opcodes are added
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

function testPush() {
    let c = new CPU();
    push(c, 0xAB);
    console.assert(c.s[0] == 0xFE);
    console.assert(c.memoryMap.readByte(0x01FF) == 0xAB);

    push(c, 0xCD);
    console.assert(c.s[0] == 0xFD);
    console.assert(c.memoryMap.readByte(0x01FE) == 0xCD);

    // stack overflow expected behavior
    c.s[0] = 0x00;

    push(c, 0x99);
    console.assert(c.s[0] == 0xFF);
    console.assert(c.memoryMap.readByte(0x0100) == 0x99);
}

function testPull() {
    let c = new CPU();

    c.memoryMap.writeByte(0x01FF, 0x34);
    c.memoryMap.writeByte(0x01FE, 0x12);
    c.memoryMap.writeByte(0x01FD, 0xEF);
    c.memoryMap.writeByte(0x01FC, 0xCD);
    c.memoryMap.writeByte(0x01FB, 0xAB);

    c.s[0] = 0xF9;

    console.assert(pull(c) == 0x00);
    console.assert(pull(c) == 0xAB);
    console.assert(pull(c) == 0xCD);
    console.assert(pull(c) == 0xEF);
    console.assert(pull(c) == 0x12);
    console.assert(pull(c) == 0x34);
    console.assert(c.s[0] == 0xFF);
}

function testU8IsPositive() {
    let testcases = Int8Array.from([100, 3, 50, 127, -128, -127, -1, -40, 0]);

    for(let i = 0; i < testcases.length; i++) {
        console.assert(u8IsPositive(testcases[i]) == testcases[i] >= 0);
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

function testI8AsNumber() {
    console.assert(i8AsNumber(0b1111_1111) == -1);
    console.assert(i8AsNumber(0b1111_1001) == -7);
    console.assert(i8AsNumber(0x88) == -120);
    console.assert(i8AsNumber(0b0111_1111) == 127);
    console.assert(i8AsNumber(0b1000_0000) == -128);
    console.assert(i8AsNumber(0b0000_1010) == 10);
}

function testStatusFlagsToByte() {
    let cpu = new CPU();
    cpu.flag = {
        c:     true,
        z:     false,
        i:     true,
        d:     false,
        bLow:  true,
        bHigh: false,
        v:     true,
        n:     false,
    }
    console.assert(statusFlagsToByte(cpu) == 0b0101_0101);

    cpu.flag = {
        c:     false,
        z:     true,
        i:     false,
        d:     true,
        bLow:  false,
        bHigh: true,
        v:     false,
        n:     true,
    }
    console.assert(statusFlagsToByte(cpu) == 0b1010_1010);
}

function testLoadStatusFlagsFromByte() {
    let cpu = new CPU();
    loadStatusFlagsFromByte(cpu, 0b0101_0101);
    console.assert(cpu.flag.n     == false);
    console.assert(cpu.flag.v     == true);
    console.assert(cpu.flag.bHigh == false);
    console.assert(cpu.flag.bLow  == true);
    console.assert(cpu.flag.d     == false);
    console.assert(cpu.flag.i     == true);
    console.assert(cpu.flag.z     == false);
    console.assert(cpu.flag.c     == true);

    loadStatusFlagsFromByte(cpu, 0b1010_1010);
    console.assert(cpu.flag.n     == true);
    console.assert(cpu.flag.v     == false);
    console.assert(cpu.flag.bHigh == true);
    console.assert(cpu.flag.bLow  == false);
    console.assert(cpu.flag.d     == true);
    console.assert(cpu.flag.i     == false);
    console.assert(cpu.flag.z     == true);
    console.assert(cpu.flag.c     == false);
}

function runOpcodeTests() {
    testExecuteCurrent();
    testPush();
    testPull();
    testU8IsPositive();
    testTestOverflow();
    testU8Add();
    testI8AsNumber();
    testStatusFlagsToByte();
    testLoadStatusFlagsFromByte();

    // Opcode function testers below
    testADC();
    // testAND(); // TODO implement AND
    testASL();
    testBCC();
    testBIT();
    testBRK();
    testCLC();
    testPHA();
}

function testADC() {
    { // IMM
        let cpuBefore = CPU.newCPUwith(0x8000, 0xFF, 0x00, 0x00, 0x00, 0b0000_0001);
        let cpuAfter = CPU.newCPUwith(0x8002, 0x00, 0x00, 0x00, 0x00, 0b0000_0011);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x69, 0x00]), cpuAfter);
    }

    { // ZeroPage
        let cpuBefore = CPU.newCPUwith(0x8000, 0x44, 0x00, 0x00, 0x00, 0b0000_0001);
        let cpuAfter = CPU.newCPUwith(0x8002, 0xC4, 0x00, 0x00, 0x00, 0b1100_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x65, 0xAA]), cpuAfter, 0xAA, 0x7F);
    }

    { // ZeroPageX
        let cpuBefore = CPU.newCPUwith(0x8000, 0x40, 0x01, 0x00, 0x00, 0b0000_0000);
        let cpuAfter = CPU.newCPUwith(0x8002, 0x80, 0x01, 0x00, 0x00, 0b1100_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x75, 0xA9]), cpuAfter, 0xAA, 0x40);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0x02, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter = CPU.newCPUwith(0x8003, 0x04, 0x00, 0x00, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x6D, 0x01, 0x00]), cpuAfter, 0x0001, 0x02);
    }

    { // AbsoluteX
        let cpuBefore = CPU.newCPUwith(0x8000, 0xC0, 0x03, 0x00, 0x00, 0b0000_0000);
        let cpuAfter = CPU.newCPUwith(0x8003, 0x00, 0x03, 0x00, 0x00, 0b0000_0011);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x7D, 0xAB, 0x05]), cpuAfter, 0x05AE, 0x40);
    }

    { // AbsoluteY
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x01, 0x00, 0b0000_0001);
        let cpuAfter = CPU.newCPUwith(0x8003, 0x10, 0x00, 0x01, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x79, 0x00, 0x00]), cpuAfter, 0x01, 0x0F);
    }

    { // IndirectX
        let cpuBefore = CPU.newCPUwith(0x8000, 0x55, 0x05, 0x00, 0x00, 0b0000_0000);
        let cpuAfter = CPU.newCPUwith(0x8002, 0xFF, 0x05, 0x00, 0x00, 0b1000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x61, 0x05]), cpuAfter, 0x0A, 0xFF, 0x0B, 0x0F, 0x0FFF, 0xAA);
    }

    { // IndirectY
        let cpuBefore = CPU.newCPUwith(0x8000, 0x54, 0x00, 0x05, 0x00, 0b0000_0001);
        let cpuAfter = CPU.newCPUwith(0x8002, 0x2F, 0x00, 0x05, 0x00, 0b0000_0001);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x71, 0x05]), cpuAfter, 0x0A, 0xFF, 0x0B, 0x0F, 0x0FFF, 0xDA);
    }
}

function testAND() {
    let op1 = [0b0000_1111, 0b0101_1010, 0b1100_1100, 0b1001_0110, 0b0101_1011];
    let op2 = [0b1010_0100, 0b1001_1010, 0b0100_0100, 0b0101_0101, 0b1111_1111];
    let and = [0b0000_0100, 0b0001_1010, 0b0100_0100, 0b0001_0100, 0b0101_1011];

    for(let i = 0; i < op1.length; i++) {
        let cpuBefore = CPU.newCPUwith(0x8000, op1[i], 0xAB, 0xCD, 0xEF, 0b1111_1111);
        let  cpuAfter = CPU.newCPUwith(0x8002, and[i], 0xAB, 0xCD, 0xEF, 0b0111_1101);
        //                                    zero and negative flag clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x29, op2[i]]), cpuAfter);
    }

    
    {
        let cpuBefore = CPU.newCPUwith(0x8000, 0b0011, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0b0000, 0xAB, 0xCD, 0xEF, 0b0000_0010);
        //                                                          zero flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x29, 0b1100]), cpuAfter);
    }

    {
        let cpuBefore = CPU.newCPUwith(0x8000, 0b1000_0000, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0b1000_0000, 0xAB, 0xCD, 0xEF, 0b1000_0000);
        //                                                    negative flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x29, 0b1100]), cpuAfter);
    }
}

function testASL() {
    { // "Accumulator Addressing"
        let cpuBefore = CPU.newCPUwith(0x8000, 0b1001_1111, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0b0011_1110, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        //                                                               carry flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x0A]), cpuAfter);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1100);
        //                  negative flag set, zero and carry flag clear ^      ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x0E, 0x05, 0x03]), cpuAfter, 0x0305, 0b0110_0110);
        console.assert(cpuBefore.memoryMap.readByte(0x0305) == 0b1100_1100, cpuAfter.memoryMap.readByte(0x0305));
    }

    { // Zero page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x12, 0xAB, 0xCD, 0xEF, 0b1000_0001);
        //                                   negative and carry flag set ^       ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x06, 0x05]), cpuAfter, 0x05, 0b1100_0000);
        console.assert(cpuBefore.memoryMap.readByte(0x05) == 0b1000_0000);
    }
}

function testBCC() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x90, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x807F, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let program = new Uint8Array(0x767);
        program[0x765] = 0x90;
        program[0x766] = 0xFF;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x8764, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (carry is set)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x90, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testBIT() {
    { // zero page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x01, 0xCD, 0xEF, 0x12, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x01, 0xCD, 0xEF, 0x12, 0b1100_0000);
        //            bits 6 and 7 taken from FF, zero flag still clear  ^^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x24, 0xAB]), cpuAfter, 0xAB, 0xFF);
    }

    { // absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0xCD, 0xEF, 0x12, 0b1011_1101);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0xAA, 0xCD, 0xEF, 0x12, 0b0111_1111);
        //          bits 7 and 6 match 0b0101_0101 (0x55), zero flag set ^^     ^
        //                           & 0b1010_1010 (0xAA)
        //                           = 0b0000_0000 (0x00)
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x2C, 0x23, 0x01]), cpuAfter, 0x0123, 0x55);
    }
}

function testBRK() {
    {
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0xCD, 0xEF, 0xFF, 0b0000_0000);
        let program = new Uint8Array(0x8000);
        program[0x0000] = 0x00;
        program[0x7FFE] = 0x34; // interrupt vector byte 1 (@ memoryMap 0xFFFE)
        program[0x7FFF] = 0x12; // interrupt vector byte 2 (@ memoryMap 0xFFFF)
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter = CPU.newCPUwith(0x1234, 0xAB, 0xCD, 0xEF, 0xFC, 0b0011_0000);
        //                                             b flag set to 0b11 ^^

        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter); // ensures that IRQ interrupt vector (0x1234) was loaded to pc
                                         // and that the b flag was set, that that 3 bytes were pushed to the stack
        // check that the pc was pushed to the stack
        console.assert(cpuBefore.memoryMap.readByte(0x1FF) == 0x02);        // low byte of PC
        console.assert(cpuBefore.memoryMap.readByte(0x1FE) == 0x80);        // high byte of PC
        console.assert(cpuBefore.memoryMap.readByte(0x1FD) == 0b0011_0000); // status byte
        //                                     b flag set to 0b11 ^^
    }

    {
        let cpuBefore = CPU.newCPUwith(0x9000, 0xAB, 0xCD, 0xEF, 0xFF, 0b1111_1111);
        let program = new Uint8Array(0x8000);
        program[0x1000] = 0x00;
        program[0x7FFE] = 0xCD; // interrupt vector byte 1 (@ memoryMap 0xFFFE)
        program[0x7FFF] = 0xAB; // interrupt vector byte 2 (@ memoryMap 0xFFFF)
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter = CPU.newCPUwith(0xABCD, 0xAB, 0xCD, 0xEF, 0xFC, 0b1111_1111);
        //                                             b flag set to 0b11 ^^

        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter); // ensures that IRQ interrupt vector (0xABCD) was loaded to pc
                                         // and that the b flag was set, that that 3 bytes were pushed to the stack
        // check that the pc was pushed to the stack
        console.assert(cpuBefore.memoryMap.readByte(0x1FF) == 0x02);        // low byte of PC
        console.assert(cpuBefore.memoryMap.readByte(0x1FE) == 0x90);        // high byte of PC
        console.assert(cpuBefore.memoryMap.readByte(0x1FD) == 0b1111_1111); // status byte
        //                                     b flag set to 0b11 ^^
    }
}

function testCLC() {
    let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0xCD, 0xEF, 0x12, 0b1111_1111);
    let cpuAfter =  CPU.newCPUwith(0x8001, 0xAB, 0xCD, 0xEF, 0x12, 0b1111_1110);
    //                                                      carry flag clear ^
    exeCpuTestcase(cpuBefore, Uint8Array.from([0x18]), cpuAfter);
}

function testPHA() {
    {
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0xCD, 0xEF, 0xFF, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0xAB, 0xCD, 0xEF, 0xFE, 0b1111_1111);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x48]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x1FF) == 0xAB);
    }

    {
        let cpuBefore = CPU.newCPUwith(0x8000, 0xFF, 0xCD, 0xEF, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0xFF, 0xCD, 0xEF, 0xFF, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x48]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x100) == 0xFF);
    }
}

runOpcodeTests();
