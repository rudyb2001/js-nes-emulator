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

function testPushWord() {
    let c = new CPU();
    pushWord(c, 0xABCD);
    console.assert(c.s[0] == 0xFD);
    console.assert(c.memoryMap.readWord(0x01FE) == 0xABCD);

    pushWord(c, 0xCDEF);
    console.assert(c.s[0] == 0xFB);
    console.assert(c.memoryMap.readWord(0x01FC) == 0xCDEF);

    // stack overflow expected behavior
    c.s[0] = 0x00;

    pushWord(c, 0x9988);
    console.assert(c.s[0] == 0xFE);
    console.assert(c.memoryMap.readByte(0x0100) == 0x99);
    console.assert(c.memoryMap.readByte(0x01FF) == 0x88);
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

function testPullWord() {
    let c = new CPU();

    c.memoryMap.writeByte(0x01FF, 0x34);
    c.memoryMap.writeByte(0x01FE, 0x12);
    c.memoryMap.writeByte(0x01FD, 0xEF);
    c.memoryMap.writeByte(0x01FC, 0xCD);
    c.memoryMap.writeByte(0x01FB, 0xAB);

    c.s[0] = 0xF9;

    console.assert(pullWord(c) == 0xAB00);
    console.assert(c.s[0] == 0xFB);
    console.assert(pullWord(c) == 0xEFCD);
    console.assert(c.s[0] == 0xFD);
    console.assert(pullWord(c) == 0x3412);
    console.assert(c.s[0] == 0xFF);
}

function testU8IsPositive() {
    let testcases = Int8Array.from([100, 3, 50, 127, -128, -127, -1, -40, 0]);

    for(let i = 0; i < testcases.length; i++) {
        console.assert(u8IsPositive(testcases[i]) == testcases[i] >= 0);
    }
}

function testU8IsNegative() {
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
    testPushWord();
    testPullWord();
    testU8IsPositive();
    testU8IsNegative();
    testTestOverflow();
    testU8Add();
    testI8AsNumber();
    testStatusFlagsToByte();
    testLoadStatusFlagsFromByte();

    // Opcode function testers below
    testADC();
    testAND();
    testASL();
    testBCC();
    testBCS();
    testBEQ();
    testBIT();
    testBMI();
    testBNE();
    testBPL();
    testBRK();
    testBVC();
    testBVS();
    testCLC();
    // testCLD();
    // testCLI();
    // testCLV();
    testCMP();
    testCPX();
    testCPY();
    testDEC();
    testDEX();
    testDEY();
    testEOR();
    testINC();
    testINX();
    testINY();
    testJMP();
    testJSR();
    testLDA();
    testLDX();
    testLDY();
    testLSR();
    // testNOP();
    testORA();
    testPHA();
    // testPHP();
    // testPLA();
    // testPLP();
    testROL();
    testROR();
    //  testRTI();
    testRTS();
    testSBC();
    // testSEC();
    // testSED();
    // testSEI();
    // testSEA();
    testSTA();
    testSTX();
    testSTY();
    testTAX();
    testTAY();
    testTSX();
    testTXA();
    testTXS();
    testTYA();
}

runOpcodeTests();
