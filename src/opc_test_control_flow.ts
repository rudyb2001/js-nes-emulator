function testBCC() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x90, 0x7D]));
        let cpuAfter =  CPU.newCPUwith(0x807F, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let program = new Uint8Array(0x767);
        program[0x765] = 0x90;
        program[0x766] = 0xFD;
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

function testBCS() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0xB0, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x8081, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        let program = new Uint8Array(0x767);
        program[0x765] = 0xB0;
        program[0x766] = 0x80;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x86E7, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (carry is clear)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0xB0, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testBEQ() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0010);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0xF0, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x8081, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0010);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        let program = new Uint8Array(0x767);
        program[0x765] = 0xF0;
        program[0x766] = 0x80;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x86E7, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (zero is clear)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0xF0, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testBMI() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b1000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x30, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x8081, 0x12, 0xAB, 0xCD, 0xEF, 0b1000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        let program = new Uint8Array(0x767);
        program[0x765] = 0x30;
        program[0x766] = 0x80;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x86E7, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (negative is clear)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x30, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testBNE() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0xD0, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x8081, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1101);
        let program = new Uint8Array(0x767);
        program[0x765] = 0xD0;
        program[0x766] = 0x80;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x86E7, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1101);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (zero is set)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0010);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0xD0, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0010);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testBPL() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x10, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x8081, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b0111_1111);
        let program = new Uint8Array(0x767);
        program[0x765] = 0x10;
        program[0x766] = 0x80;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x86E7, 0x12, 0xAB, 0xCD, 0xEF, 0b0111_1111);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (negative is set)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b1000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x10, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b1000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testBVC() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x50, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x8081, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b1011_1111);
        let program = new Uint8Array(0x767);
        program[0x765] = 0x50;
        program[0x766] = 0x80;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x86E7, 0x12, 0xAB, 0xCD, 0xEF, 0b1011_1111);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (overflow is set)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b0100_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x50, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b0100_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testBVS() {
    {  // positive offset
        let cpuBefore = CPU.newCPUwith(0x8000, 0x12, 0xAB, 0xCD, 0xEF, 0b0100_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x70, 0x7F]));
        let cpuAfter =  CPU.newCPUwith(0x8081, 0x12, 0xAB, 0xCD, 0xEF, 0b0100_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative offset
        let cpuBefore = CPU.newCPUwith(0x8765, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        let program = new Uint8Array(0x767);
        program[0x765] = 0x70;
        program[0x766] = 0x80;
        cpuBefore.memoryMap.loadProgram(program);
        let cpuAfter =  CPU.newCPUwith(0x86E7, 0x12, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    {  // negative condition (overflow is clear)
        let cpuBefore = CPU.newCPUwith(0x9000, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        cpuBefore.memoryMap.loadProgram(Uint8Array.from([0x70, 0xAF]));
        let cpuAfter =  CPU.newCPUwith(0x9002, 0x12, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testJMP() {
    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x9000, 0xA1, 0xB2, 0xC3, 0xD4, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x9234, 0xA1, 0xB2, 0xC3, 0xD4, 0b0000_0000);
        let program = new Uint8Array(0x2000);
        program[0x1000] = 0x4C;
        program[0x1001] = 0x34;
        program[0x1002] = 0x92;

        cpuBefore.memoryMap.loadProgram(program);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }

    { // Indirect
        let cpuBefore = CPU.newCPUwith(0x9000, 0xA1, 0xB2, 0xC3, 0xD4, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0xCDEF, 0xA1, 0xB2, 0xC3, 0xD4, 0b1111_1111);
        let program = new Uint8Array(0x2000);
        program[0x1000] = 0x6C;
        program[0x1001] = 0x00;
        program[0x1002] = 0x95;

        program[0x1500] = 0xEF;
        program[0x1501] = 0xCD;

        cpuBefore.memoryMap.loadProgram(program);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter);
    }
}

function testJSR() {
    { // "Absolute"
        let cpuBefore = CPU.newCPUwith(0xA000, 0xA1, 0xB2, 0xC3, 0xFF, 0b0000_0000);
        let cpuAfter1 =  CPU.newCPUwith(0x8102, 0xA1, 0xB2, 0xC3, 0xFD, 0b0000_0000);
        let cpuAfter2 =  CPU.newCPUwith(0x9234, 0xA1, 0xB2, 0xC3, 0xFB, 0b0000_0000);
        let program = new Uint8Array(0x3000);
        program[0x2000] = 0x20; // (0xA000) JSR $8102
        program[0x2001] = 0x02;
        program[0x2002] = 0x81;

        program[0x0102] = 0x20; // (0x8102) JSR $9234
        program[0x0103] = 0x34;
        program[0x0104] = 0x92;

        cpuBefore.memoryMap.loadProgram(program);
        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter1);
        console.assert(cpuBefore.memoryMap.readWord(0x1FE) == 0xA002); // 0xA003 - 1 = 0xA002

        Opcode.executeCurrent(cpuBefore);
        cpuBefore.assertEqual(cpuAfter2);
        console.assert(cpuBefore.memoryMap.readWord(0x1FE) == 0xA002); // 0xA003 - 1 = 0xA002
        console.assert(cpuBefore.memoryMap.readWord(0x1FC) == 0x8104); // 0x8105 - 1 = 0x8104
    }
}

function testRTS() {
    let cpuBefore =  CPU.newCPUwith(0x9234, 0xA1, 0xB2, 0xC3, 0xFB, 0b0000_0000);
    let cpuAfter1 =  CPU.newCPUwith(0x8105, 0xA1, 0xB2, 0xC3, 0xFD, 0b0000_0000);
    let cpuAfter2 =  CPU.newCPUwith(0xA003, 0xA1, 0xB2, 0xC3, 0xFF, 0b0000_0000);
    let program = new Uint8Array(0x3000);

    cpuBefore.memoryMap.writeWord(0x1FE, 0xA002);
    cpuBefore.memoryMap.writeWord(0x1FC, 0x8104);

    program[0x1234] = 0x60; // (0x9234) RTS
    program[0x0105] = 0x60; // (0x8105) RTS

    cpuBefore.memoryMap.loadProgram(program);
    Opcode.executeCurrent(cpuBefore);
    cpuBefore.assertEqual(cpuAfter1);
    Opcode.executeCurrent(cpuBefore);
    cpuBefore.assertEqual(cpuAfter2);
}
