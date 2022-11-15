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
