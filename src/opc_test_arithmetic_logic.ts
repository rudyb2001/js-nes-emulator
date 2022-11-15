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
