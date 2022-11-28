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
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x29, 0b1100_0100]), cpuAfter);
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

function testCMP() {
    { // IMM, equal
        let cpuBefore = CPU.newCPUwith(0x8000, 0x54, 0xFF, 0xFF, 0xFF, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x54, 0xFF, 0xFF, 0xFF, 0b0000_0011);
        //                                                   zero and carry set ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xC9, 0x54]), cpuAfter);
    }

    { // ZeroPageX, greater
        let cpuBefore = CPU.newCPUwith(0x8000, 0xFF, 0x0F, 0xFF, 0xFF, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0xFF, 0x0F, 0xFF, 0xFF, 0b0111_1101);
        //                            negative and zero clear, carry set ^      ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xD5, 0xE0]), cpuAfter, 0xEF, 0xFE);
    }

    { // IndirectY, less
        let cpuBefore = CPU.newCPUwith(0x8000, 0xFF, 0xFF, 0xEA, 0xFF, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0xFF, 0xFF, 0xEA, 0xFF, 0b1111_1100);
        //                       negative flag set, zero and carry clear ^      ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xD1, 0x11]), cpuAfter, 0xFB, 0x01);
    }
}

function testDEC() {
    { // ZeroPage
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0xCD, 0xEF, 0xFF, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0xAB, 0xCD, 0xEF, 0xFF, 0b0000_0010);
        //                                                        zero flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xC6, 0xAA]), cpuAfter, 0xAA, 0x01);
        console.assert(cpuBefore.memoryMap.readByte(0xAA) == 0x00);
    }

    { // Absolute, overflow
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0xCD, 0xEF, 0xFF, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0xAB, 0xCD, 0xEF, 0xFF, 0b1000_0000);
        //                                             negative flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xCE, 0xBB, 0x0B]), cpuAfter, 0x0BBB, 0x00);
        console.assert(cpuBefore.memoryMap.readByte(0x0BBB) == 0xFF);
    }

    { // AbsoluteX 
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0x05, 0xEF, 0xFF, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0xAB, 0x05, 0xEF, 0xFF, 0b1111_1101);
        //                            negative flag set, zero flag clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xDE, 0xA5, 0x0A]), cpuAfter, 0x0AAA, 0xD3);
        console.assert(cpuBefore.memoryMap.readByte(0x0AAA) == 0xD2);
    }
}

function testEOR() {
    let op1 = [0b0000_1111, 0b0101_1010, 0b1100_1100, 0b1001_0110, 0b0101_1011];
    let op2 = [0b1010_0100, 0b1001_1010, 0b0100_0100, 0b0101_0101, 0b1111_1111];
    let xor = [0b1010_1011, 0b1100_0000, 0b1000_1000, 0b1100_0011, 0b1010_0100];

    for(let i = 0; i < op1.length; i++) { // IMM
        let cpuBefore = CPU.newCPUwith(0x8000, op1[i], 0xAB, 0xCD, 0xEF, 0b0000_1111);
        let  cpuAfter = CPU.newCPUwith(0x8002, xor[i], 0xAB, 0xCD, 0xEF, 0b1000_1101);
        //                                   negative flag set, zero clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x49, op2[i]]), cpuAfter);
    }
    
    { // Zero Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0x00, 0xAB, 0xCD, 0xEF, 0b0000_0010);
        //                                                        zero flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x45, 0x33]), cpuAfter, 0x33, 0xAA);
    }

    { // Indirect Y
        let cpuBefore = CPU.newCPUwith(0x8000, 0b1010_0101, 0xAB, 0x11, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0b1111_1111, 0xAB, 0x11, 0xEF, 0b1000_0000);
        //                                                    negative flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x51, 0x22]), cpuAfter, 0x33, 0xCD, 0x34, 0x0B, 0x0BCD, 0b0101_1010);
    }
}

function testLSR() {
    { // Accumulator
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0xAB, 0xCD, 0xEF, 0b1111_1111);
        let  cpuAfter = CPU.newCPUwith(0x8001, 0x55, 0xAB, 0xCD, 0xEF, 0b0111_1100);
        //                          negative, zero and carry flags clear ^      ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x4A]), cpuAfter);
    }

    { // Zero Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x11, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0x11, 0xAB, 0xCD, 0xEF, 0b0000_0011);
        //                  negative flag clear, zero and carry flag set ^      ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x46, 0x85]), cpuAfter, 0x85, 0x01);
    }
}

function testORA() {
    let op1 = [0b0000_1111, 0b0101_1010, 0b1100_1100, 0b1001_0110, 0b0101_1011];
    let op2 = [0b1010_0100, 0b1001_1010, 0b0100_0100, 0b0101_0101, 0b1111_1111];
    let  or = [0b1010_1111, 0b1101_1010, 0b1100_1100, 0b1101_0111, 0b1111_1111];

    for(let i = 0; i < op1.length; i++) { // IMM
        let cpuBefore = CPU.newCPUwith(0x8000, op1[i], 0xAB, 0xCD, 0xEF, 0b0000_1111);
        let  cpuAfter = CPU.newCPUwith(0x8002,  or[i], 0xAB, 0xCD, 0xEF, 0b1000_1101);
        //                                   negative flag set, zero clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x09, op2[i]]), cpuAfter);
    }
    
    { // Zero Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0xAB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0x00, 0xAB, 0xCD, 0xEF, 0b0000_0010);
        //                                                        zero flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x05, 0x33]), cpuAfter, 0x33, 0x00);
    }

    { // Indirect Y
        let cpuBefore = CPU.newCPUwith(0x8000, 0b1110_0101, 0xAB, 0x11, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0b1111_1111, 0xAB, 0x11, 0xEF, 0b1000_0000);
        //                                                    negative flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x11, 0x22]), cpuAfter, 0x33, 0xCD, 0x34, 0x0B, 0x0BCD, 0b0101_1010);
    }
}

function testROL() {
    { // Accumulator
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        let  cpuAfter = CPU.newCPUwith(0x8001, 0x55, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        //                                                        carry flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x2A]), cpuAfter);
    }

    { // Zero Page X
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0x32, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0xAA, 0x32, 0xCD, 0xEF, 0b1000_0001);
        //                                   negative and carry flag set ^       ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x36, 0xFE]), cpuAfter, 0x30, 0xCF);
        console.assert(cpuBefore.memoryMap.readByte(0x30) == 0x9E);
    }

    { // Absolute X
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0x43, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8003, 0xAA, 0x43, 0xCD, 0xEF, 0b0000_0011);
        //                                             zero and carry flags set ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x3E, 0x12, 0x03]), cpuAfter, 0x0355, 0x80);
        console.assert(cpuBefore.memoryMap.readByte(0x0355) == 0x00);
    }
}

function testROR() {
    { // Accumulator
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0xAB, 0xCD, 0xEF, 0b0000_0001);
        let  cpuAfter = CPU.newCPUwith(0x8001, 0xD5, 0xAB, 0xCD, 0xEF, 0b1000_0000);
        //                           negative flag set, carry flag clear ^       ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x6A]), cpuAfter);
    }

    { // Zero Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0xBB, 0xCD, 0xEF, 0b0111_1111);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0xAA, 0xBB, 0xCD, 0xEF, 0b1111_1101);
        //                           negative set, zero clear, carry set ^      ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x66, 0x30]), cpuAfter, 0x30, 0xCF);
        console.assert(cpuBefore.memoryMap.readByte(0x30) == 0xE7);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0xBB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8003, 0xAA, 0xBB, 0xCD, 0xEF, 0b0000_0011);
        //                                             zero and carry flags set ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x6E, 0x55, 0x03]), cpuAfter, 0x0355, 0x01);
        console.assert(cpuBefore.memoryMap.readByte(0x0355) == 0x00);
    }
}

function testSBC() {
    { // Immediate
        let cpuBefore = CPU.newCPUwith(0x8000, 0xD5, 0xBB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0x67, 0xBB, 0xCD, 0xEF, 0b0100_0001);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xE9, 0x6D]), cpuAfter);
    }

    { // Immediate
        let cpuBefore = CPU.newCPUwith(0x8000, 0x55, 0xBB, 0xCD, 0xEF, 0b0000_0000);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0xD7, 0xBB, 0xCD, 0xEF, 0b1000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xE9, 0x7D]), cpuAfter);
    }

    { // Zero-Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0xC6, 0xBB, 0xCD, 0xEF, 0b0000_0001);
        let  cpuAfter = CPU.newCPUwith(0x8002, 0x00, 0xBB, 0xCD, 0xEF, 0b0000_0011);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xE5, 0x6D]), cpuAfter, 0x6D, 0xC6);
    }
}
