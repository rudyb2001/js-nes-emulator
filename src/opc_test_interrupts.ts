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
