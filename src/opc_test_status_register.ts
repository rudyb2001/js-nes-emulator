function testCLC() {
    let cpuBefore = CPU.newCPUwith(0x8000, 0xAB, 0xCD, 0xEF, 0x12, 0b1111_1111);
    let cpuAfter =  CPU.newCPUwith(0x8001, 0xAB, 0xCD, 0xEF, 0x12, 0b1111_1110);
    //                                                      carry flag clear ^
    exeCpuTestcase(cpuBefore, Uint8Array.from([0x18]), cpuAfter);
}
