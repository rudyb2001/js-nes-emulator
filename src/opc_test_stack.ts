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
