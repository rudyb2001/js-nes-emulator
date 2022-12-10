function testCPX() {
    { // IMM
        {
            // greater to
            let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x55, 0x00, 0x00, 0b0000_0000);
            let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x55, 0x00, 0x00, 0b0000_0001);
            //                                                            carry set  ^
            exeCpuTestcase(cpuBefore, Uint8Array.from([0xE0, 0x54]), cpuAfter);
        }

        {
            // equal
            let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x76, 0x00, 0x00, 0b0000_0000);
            let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x76, 0x00, 0x00, 0b0000_0011);
            //                                                  zero and carry set  ^^
            exeCpuTestcase(cpuBefore, Uint8Array.from([0xE0, 0x76]), cpuAfter);
        }

        {
            // less than
            let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x74, 0x00, 0x00, 0b0000_0000);
            let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x74, 0x00, 0x00, 0b1000_0000);
            //                                                 negative set  ^
            exeCpuTestcase(cpuBefore, Uint8Array.from([0xE0, 0x76]), cpuAfter);
        }
    }

    { // Absolute
        // equal
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0xFC, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0x00, 0xFC, 0x00, 0x00, 0b0000_0011);
        //                                                  zero and carry set  ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xEC, 0x12, 0x05]), cpuAfter, 0x0512, 0xFC);
    }
}

function testCPY() {
    { // IMM
        {
            // greater to
            let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x55, 0x00, 0b0000_0000);
            let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x00, 0x55, 0x00, 0b0000_0001);
            //                                                            carry set  ^
            exeCpuTestcase(cpuBefore, Uint8Array.from([0xC0, 0x54]), cpuAfter);
        }

        {
            // equal
            let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x76, 0x00, 0b0000_0000);
            let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x00, 0x76, 0x00, 0b0000_0011);
            //                                                  zero and carry set  ^^
            exeCpuTestcase(cpuBefore, Uint8Array.from([0xC0, 0x76]), cpuAfter);
        }

        {
            // less than
            let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x74, 0x00, 0b0000_0000);
            let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x00, 0x74, 0x00, 0b1000_0000);
            //                                                 negative set  ^
            exeCpuTestcase(cpuBefore, Uint8Array.from([0xC0, 0x76]), cpuAfter);
        }
    }

    { // Absolute
        // equal
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0xFC, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0x00, 0x00, 0xFC, 0x00, 0b0000_0011);
        //                                                  zero and carry set  ^^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xCC, 0x12, 0x05]), cpuAfter, 0x0512, 0xFC);
    }
}

function testDEX() {
    { // n = z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x77, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x76, 0x00, 0x00, 0b0111_1101);
        //                                 negative and zero flags clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xCA]), cpuAfter);
    }

    { // n = true, z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x99, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x98, 0x00, 0x00, 0b1111_1101);
        //                                                      zero flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xCA]), cpuAfter);
    }

    { // z = true, n = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x01, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x00, 0x00, 0b0111_1111);
        //                                           negative flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xCA]), cpuAfter);
    }
}

function testDEY() {
    { // n = z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x77, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x76, 0x00, 0b0111_1101);
        //                                 negative and zero flags clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x88]), cpuAfter);
    }

    { // n = true, z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x99, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x98, 0x00, 0b1111_1101);
        //                                                      zero flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x88]), cpuAfter);
    }

    { // z = true, n = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x01, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x00, 0x00, 0b0111_1111);
        //                                           negative flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x88]), cpuAfter);
    }
}

function testINC() {
    { // ZeroPageX
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x02, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x02, 0x00, 0x00, 0b1000_0000);
        //                                             negative flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xF6, 0x44]), cpuAfter, 0x46, 0x99);
        console.assert(cpuBefore.memoryMap.readByte(0x46) == 0x9A);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0x00, 0x00, 0x00, 0x00, 0b0000_0010);
        //                                                        zero flag set ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xEE, 0x12, 0x06]), cpuAfter, 0x0612, 0xFF);
        console.assert(cpuBefore.memoryMap.readByte(0x0612) == 0x00);
    }
}

function testINX() {
    { // n = z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x76, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x77, 0x00, 0x00, 0b0111_1101);
        //                                 negative and zero flags clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xE8]), cpuAfter);
    }

    { // n = true, z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x98, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x99, 0x00, 0x00, 0b1111_1101);
        //                                                      zero flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xE8]), cpuAfter);
    }

    { // z = true, n = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0xFF, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x00, 0x00, 0b0111_1111);
        //                                           negative flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xE8]), cpuAfter);
    }
}

function testINY() {
    { // n = z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x76, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x77, 0x00, 0b0111_1101);
        //                                 negative and zero flags clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xC8]), cpuAfter);
    }

    { // n = true, z = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x98, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x99, 0x00, 0b1111_1101);
        //                                                      zero flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xC8]), cpuAfter);
    }

    { // z = true, n = false
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0xFF, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8001, 0x00, 0x00, 0x00, 0x00, 0b0111_1111);
        //                                           negative flag clear ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xC8]), cpuAfter);
    }
}

function testLDA() {
    { // Immediate
        let cpuBefore = CPU.newCPUwith(0x8000, 0xFF, 0x00, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x00, 0x00, 0x00, 0b0111_1111);
        //                                      negative clear, zero set ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xA9, 0x00]), cpuAfter);
    }

    { // Indirect X
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x12, 0x00, 0x00, 0b1111_1111);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0xEE, 0x12, 0x00, 0x00, 0b1111_1101);
        //                                      negative set, zero clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xA1, 0x40]), cpuAfter, 0x52, 0x70, 0x70, 0xEE);
    }
}

function testLDX() {
    { // Immediate
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0xCD, 0x00, 0x00, 0b1000_0000);
        //                                      negative set, zero clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xA2, 0xCD]), cpuAfter);
    }

    { // Zero-page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x33, 0x00, 0x00, 0b0000_0000);
        //                                    negative clear, zero clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xA6, 0x43]), cpuAfter, 0x43, 0x33);
    }
}

function testLDY() {
    { // Immediate
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x00, 0xCD, 0x00, 0b1000_0000);
        //                                      negative set, zero clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xA0, 0xCD]), cpuAfter);
    }
    
    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0x00, 0x00, 0x33, 0x00, 0b0000_0000);
        //                                    negative clear, zero clear ^      ^
        exeCpuTestcase(cpuBefore, Uint8Array.from([0xAC, 0x43, 0x07]), cpuAfter, 0x743, 0x33);
    }
}

function testSTA() {
    { // Zero Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x99, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x99, 0x00, 0x00, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x85, 0x65]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x65) == 0x99);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0xAA, 0x00, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0xAA, 0x00, 0x00, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x8D, 0x65, 0x02]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x0265) == 0xAA);
    }
}

function testSTX() {
    { // Zero Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x99, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x99, 0x00, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x86, 0x65]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x65) == 0x99);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0xAA, 0x00, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0x00, 0xAA, 0x00, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x8E, 0x65, 0x02]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x0265) == 0xAA);
    }
}

function testSTY() {
    { // Zero Page
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0x99, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8002, 0x00, 0x00, 0x99, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x84, 0x65]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x65) == 0x99);
    }

    { // Absolute
        let cpuBefore = CPU.newCPUwith(0x8000, 0x00, 0x00, 0xAA, 0x00, 0b0000_0000);
        let cpuAfter =  CPU.newCPUwith(0x8003, 0x00, 0x00, 0xAA, 0x00, 0b0000_0000);
        exeCpuTestcase(cpuBefore, Uint8Array.from([0x8C, 0x65, 0x02]), cpuAfter);
        console.assert(cpuBefore.memoryMap.readByte(0x0265) == 0xAA);
    }
}

function testTAX() {
    let before = [
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x00, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x00, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0xEE, 0xCC, 0xBB, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0x11, 0xEE, 0x22, 0b0000_0000),
    ];

    let  after = [
        CPU.newCPUwith(0x8001, 0x12, 0x12, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x00, 0x00, 0x56, 0x78, 0b0000_0010),
        CPU.newCPUwith(0x8001, 0x12, 0x12, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x12, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x12, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0xFF, 0xFF, 0xCC, 0xBB, 0b1000_0000),
        CPU.newCPUwith(0x8001, 0xFF, 0xFF, 0xEE, 0x22, 0b1000_0000),
    ]

    for(let i = 0; i < before.length; i++) {
        exeCpuTestcase(before[i], Uint8Array.from([0xAA]), after[i]);
    }
}

function testTAY() {
    let before = [
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x00, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x00, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0xEE, 0xCC, 0xBB, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0x11, 0xEE, 0x22, 0b0000_0000),
    ];

    let  after = [
        CPU.newCPUwith(0x8001, 0x12, 0x34, 0x12, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x00, 0x34, 0x00, 0x78, 0b0000_0010),
        CPU.newCPUwith(0x8001, 0x12, 0x00, 0x12, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x34, 0x12, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x34, 0x12, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0xFF, 0xEE, 0xFF, 0xBB, 0b1000_0000),
        CPU.newCPUwith(0x8001, 0xFF, 0x11, 0xFF, 0x22, 0b1000_0000),
    ]

    for(let i = 0; i < before.length; i++) {
        exeCpuTestcase(before[i], Uint8Array.from([0xA8]), after[i]);
    }
}

function testTSX() {
    let before = [
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x00, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x00, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0xEE, 0xCC, 0xBB, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0x11, 0xEE, 0x22, 0b0000_0000),
    ];

    let  after = [
        CPU.newCPUwith(0x8001, 0x12, 0x78, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x00, 0x78, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x78, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x78, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x00, 0x56, 0x00, 0b0000_0010),
        CPU.newCPUwith(0x8001, 0xFF, 0xBB, 0xCC, 0xBB, 0b1000_0000),
        CPU.newCPUwith(0x8001, 0xFF, 0x22, 0xEE, 0x22, 0b0000_0000),
    ]

    for(let i = 0; i < before.length; i++) {
        exeCpuTestcase(before[i], Uint8Array.from([0xBA]), after[i]);
    }
}

function testTXA() {
    let before = [
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x00, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x00, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0xEE, 0xCC, 0xBB, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0x11, 0xEE, 0x22, 0b0000_0000),
    ];

    let  after = [
        CPU.newCPUwith(0x8001, 0x34, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x34, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x00, 0x00, 0x56, 0x78, 0b0000_0010),
        CPU.newCPUwith(0x8001, 0x34, 0x34, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x34, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0xEE, 0xEE, 0xCC, 0xBB, 0b1000_0000),
        CPU.newCPUwith(0x8001, 0x11, 0x11, 0xEE, 0x22, 0b0000_0000),
    ]

    for(let i = 0; i < before.length; i++) {
        exeCpuTestcase(before[i], Uint8Array.from([0x8A]), after[i]);
    }
}

function testTXS() {
    let before = [
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x00, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x00, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0xEE, 0xCC, 0xBB, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0x11, 0xEE, 0x22, 0b0000_0000),
    ];

    let  after = [
        CPU.newCPUwith(0x8001, 0x12, 0x34, 0x56, 0x34, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x00, 0x34, 0x56, 0x34, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x00, 0x56, 0x00, 0b0000_0010),
        CPU.newCPUwith(0x8001, 0x12, 0x34, 0x00, 0x34, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x12, 0x34, 0x56, 0x34, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0xFF, 0xEE, 0xCC, 0xEE, 0b1000_0000),
        CPU.newCPUwith(0x8001, 0xFF, 0x11, 0xEE, 0x11, 0b0000_0000),
    ]

    for(let i = 0; i < before.length; i++) {
        exeCpuTestcase(before[i], Uint8Array.from([0x9A]), after[i]);
    }
}

function testTYA() {
    let before = [
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x00, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x00, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x00, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0x12, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0xEE, 0xCC, 0xBB, 0b0000_0000),
        CPU.newCPUwith(0x8000, 0xFF, 0x11, 0xEE, 0x22, 0b0000_0000),
    ];

    let  after = [
        CPU.newCPUwith(0x8001, 0x56, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x56, 0x34, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x56, 0x00, 0x56, 0x78, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0x00, 0x34, 0x00, 0x78, 0b0000_0010),
        CPU.newCPUwith(0x8001, 0x56, 0x34, 0x56, 0x00, 0b0000_0000),
        CPU.newCPUwith(0x8001, 0xCC, 0xEE, 0xCC, 0xBB, 0b1000_0000),
        CPU.newCPUwith(0x8001, 0xEE, 0x11, 0xEE, 0x22, 0b1000_0000),
    ]

    for(let i = 0; i < before.length; i++) {
        exeCpuTestcase(before[i], Uint8Array.from([0x98]), after[i]);
    }
}
