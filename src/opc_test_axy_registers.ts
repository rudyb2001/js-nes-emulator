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
