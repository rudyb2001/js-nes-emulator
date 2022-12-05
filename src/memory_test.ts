function testReadByte() {
    { // reading memory
        let m = new MemoryMap();
        m.memory[0] = 0xAA;
        m.memory[1] = 0xBB;
        m.memory[2] = 0xCC;

        console.assert(m.readByte(0) == 0xAA);
        console.assert(m.readByte(1) == 0xBB);
        console.assert(m.readByte(2) == 0xCC);

        // mirroring
        console.assert(m.readByte(0 + 0x0800) == 0xAA);
        console.assert(m.readByte(1 + 0x0800 * 2) == 0xBB);
        console.assert(m.readByte(2 + 0x0800 * 3) == 0xCC);
    }

    { // reading  PPU/IO
        //TODO implement support for PPU/IO registers and update this
    }

    { // unsupported range
        let m = new MemoryMap();
        try {
            m.readByte(0x2000);
            console.assert(false);
        } catch(e) {}

        try {
            m.readByte(0x7FFF);
            console.assert(false);
        } catch(e) {}
    }

    { // ROM
        let m = new MemoryMap();
        m.program = Uint8Array.from([1, 2, 3, 4]);

        console.assert(m.readByte(0x8000) == 1);
        console.assert(m.readByte(0x8001) == 2);
        console.assert(m.readByte(0x8002) == 3);
        console.assert(m.readByte(0x8003) == 4);

        // mirroring
        console.assert(m.readByte(0xFFFC) == 1);
        console.assert(m.readByte(0xFFFD) == 2);
        console.assert(m.readByte(0xFFFE) == 3);
        console.assert(m.readByte(0xFFFF) == 4);
    }
}

function testReadWord() {
    { // RAM
        let m = new MemoryMap();
        m.memory[0] = 0xCC;
        m.memory[1] = 0xDD;

        console.assert(m.readWord(0) == 0xDDCC);
        console.assert(m.readWord(1) == 0x00DD);

        // mirroring
        console.assert(m.readWord(0x07FF) == 0xCC00);
        console.assert(m.readWord(0x0800) == 0xDDCC);
    }

    { // reading  PPU/IO
        //TODO implement support for PPU/IO registers and update this
    }

    { // unsupported range
        let m = new MemoryMap();
        try {
            m.readWord(0x1FFF);
            console.assert(false);
        } catch(e) {}

        try {
            m.readWord(0x2000);
            console.assert(false);
        } catch(e) {}
    }

    { // ROM
        let m = new MemoryMap();
        m.program = Uint8Array.from([0xAA, 0xBB, 0x12, 0x34]);

        console.assert(m.readWord(0x8000) == 0xBBAA);
        console.assert(m.readWord(0x8001) == 0x12BB);

        // mirroring
        console.assert(m.readWord(0xFFFE) == 0x3412);

        // out-of-bounds
        try {
            m.readWord(0xFFFF);
            console.assert(false);
        } catch(e) {}
    }
}

function testWriteByte() {
    { // RAM
        let m = new MemoryMap();

        m.writeByte(0x0000, 0xAA);
        m.writeByte(0x0800 + 0x0555, 0xBB);
        m.writeByte(0x1FFF, 0xCC);

        for(let i = 0x000; i < 0x0800; i++) {
            if(i == 0x0000) {
                console.assert(m.memory[i] == 0xAA);
            } else if(i == 0x0555) {
                console.assert(m.memory[i] == 0xBB);
            } else if(i == 0x1FFF % 0x0800) {
                console.assert(m.memory[i] == 0xCC);
            } else { // ensure all other memory is not modified.
                console.assert(m.memory[i] == 0);
            }
        }
    }

    { // PPU/IO
        // TODO implement support for PPU/IO registers and update this
    }

    { // unsupported range
        let m = new MemoryMap();
        try {
            m.writeByte(0x2000, 0);
            console.assert(false);
        } catch(e) {}

        try {
            m.writeByte(0x7FFF, 0);
            console.assert(false);
        } catch(e) {}
    }

    { // ROM
        //  TODO add support for mappers?
        
        // for now, assume writing to ROM is illegal
        let m = new MemoryMap();
        try {
            m.writeByte(0x8000, 0);
            console.assert(false);
        } catch(e) {}
    }
}

function testWriteWord() {
    { // RAM
        let m = new MemoryMap();
        m.writeWord(0x0000, 0xABCD);
        console.assert(m.memory[0x0000] == 0xCD);
        console.assert(m.memory[0x0001] == 0xAB);

        // ensure that no other memory has been written
        for(let i = 0x0002; i < 0x0800; i++) {
            console.assert(m.memory[i] == 0x00);
        }
    }

    { // PPU/IO
        // TODO implement support for PPU/IO registers and update this
    }

    { // unsupported range
        let m = new MemoryMap();
        try {
            m.writeWord(0x2000, 0x0);
            console.assert(false);
        } catch(e) {}
    }

    { // ROM
        //  TODO add support for mappers?
        
        // for now, assume writing to ROM is illegal
        let m = new MemoryMap();
        try {
            m.writeWord(0x7FFF, 0x0);
            console.assert(false);
        } catch(e) {}
    }
}

function testLoadProgram() {
    { // valid program
        let program = new Uint8Array(1);
        let m = new MemoryMap();

        m.loadProgram(program);

        console.assert(m.program === program);
    }
}

function testGetOperandAddress() {
    { // imm 
        let c = new CPU();

        for(let i = 0x8000; i < 0x10000; i++) {
            c.pc[0] = i;
            console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.Immediate) == i);
        }
    }

    { // zero-page
        let c = new CPU();

        let prog = Uint8Array.from([0xFF, 0xEE, 0xDD, 0xCC, 0xBB, 0xAA]); // these are addresses
        c.memoryMap.loadProgram(prog);

        for(let i = 0; i < prog.length; i++) {
            c.pc[0] = 0x8000 + i;
            console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.ZeroPage) == prog[i]);
        }
    }

    { // zero-page x 
        let c = new CPU();

        let prog = Uint8Array.from([0x12, 0x34, 0x56, 0xFF, 0xEE, 0xDD, 0xCC, 0xBB, 0xAA]);
        c.memoryMap.loadProgram(prog);
        c.pc[0] = 0x8000;

        for(let i = 0; i < prog.length; i++) {
            c.pc[0] = 0x8000 + i;
            c.x[0] = i;

            let expected = new Uint8Array(1);
            expected[0] = prog[i] + i;

            console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.ZeroPageX) == expected[0]);
        }
    }

    { // zero-page y
        let c = new CPU();

        let prog = Uint8Array.from([0x12, 0x34, 0x56, 0xFF, 0xEE, 0xDD, 0xCC, 0xBB, 0xAA]);
        c.memoryMap.loadProgram(prog);
        c.pc[0] = 0x8000;

        for(let i = 0; i < prog.length; i++) {
            c.pc[0] = 0x8000 + i;
            c.y[0] = i;

            let expected = new Uint8Array(1);
            expected[0] = prog[i] + i;

            console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.ZeroPageY) == expected[0]);
        }
    }

    { // absolute
        let c = new CPU();

        let prog = Uint8Array.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        c.memoryMap.loadProgram(prog);

        c.pc[0] = 0x8000;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.Absolute) == 0x3412);
        c.pc[0]++;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.Absolute) == 0x5634);
        c.pc[0]++;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.Absolute) == 0x7856);
        c.pc[0] = 0x8000 + prog.length - 1; // last index of prog
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.Absolute) == 0x12EF);
    }

    { // absolute x
        let c = new CPU();

        let prog = Uint8Array.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        c.memoryMap.loadProgram(prog);

        c.pc[0] = 0x8000;
        c.x[0] = 0x12;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteX) == 0x3412 + c.x[0]);
        c.pc[0]++;
        c.x[0] = 0xB2;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteX) == 0x5634 + c.x[0]);
        c.pc[0]++;
        c.x[0] = 0xBF;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteX) == 0x7856 + c.x[0]);
        c.pc[0] = 0x8000 + prog.length - 1; // last index of prog
        c.x[0] = 0xEF;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteX) == 0x12EF + c.x[0]);
    }

    { // absolute y
        let c = new CPU();

        let prog = Uint8Array.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        c.memoryMap.loadProgram(prog);

        c.pc[0] = 0x8000;
        c.y[0] = 0x12;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteY) == 0x3412 + c.y[0]);
        c.pc[0]++;
        c.y[0] = 0xB2;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteY) == 0x5634 + c.y[0]);
        c.pc[0]++;
        c.y[0] = 0xBF;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteY) == 0x7856 + c.y[0]);
        c.pc[0] = 0x8000 + prog.length - 1; // last index of prog
        c.y[0] = 0xEF;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteY) == 0x12EF + c.y[0]);
    }

    { // indirect x
        let c = new CPU();

        // store some addresses in ram
        c.memoryMap.writeWord(0x0000, 0x1234);
        c.memoryMap.writeWord(0x0002, 0x5678);
        c.memoryMap.writeWord(0x00FE, 0x9ABC);

        // store pointers to those addresses in the program
        let prog = Uint8Array.from([0x00, 0x02, 0xFE, 0xFF]);
        c.memoryMap.loadProgram(prog);

        // test with x = 0
        c.x[0] = 0;
        c.pc[0] = 0x8000;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectX) == 0x1234);
        c.pc[0]++; 
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectX) == 0x5678);
        c.pc[0]++; 
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectX) == 0x9ABC);
        c.pc[0]++; 
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectX) == 0x349A);

        // try offsets of x
        c.pc[0] = 0x8000;
        c.x[0] = 0x02;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectX) == 0x5678);
        c.pc[0]++;
        c.x[0] = 0xFE;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectX) == 0x1234);
        c.pc[0]++;
        c.x[0] = 0x01;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectX) == 0x349A);
    }

    { // indirect y
        let c = new CPU();

        // store some addresses in ram
        c.memoryMap.writeWord(0x0000, 0x1234);
        c.memoryMap.writeWord(0x0002, 0x5678);
        c.memoryMap.writeWord(0x00FE, 0x9ABC);

        // store pointers to those addresses in the program
        let prog = Uint8Array.from([0x00, 0x02, 0xFE, 0xFF]);
        c.memoryMap.loadProgram(prog);

        // test with y = 0
        c.y[0] = 0;
        c.pc[0] = 0x8000;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectY) == 0x1234);
        c.pc[0]++; 
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectY) == 0x5678);
        c.pc[0]++; 
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectY) == 0x9ABC);
        c.pc[0]++; 
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectY) == 0x349A);

        // try offsets of y
        c.pc[0] = 0x8000;
        c.y[0] = 0x02;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectY) == 0x5678);
        c.pc[0]++;
        c.y[0] = 0xFE;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectY) == 0x1234);
        c.pc[0]++;
        c.y[0] = 0x01;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.IndirectY) == 0x349A);
    }

    { // immediate word
        let c = new CPU();

        for(let i = 0x8000; i < 0x10000; i++) {
            c.pc[0] = i;
            console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.ImmediateWord) == i);
        }
    }

    { // absolute word
        let c = new CPU();

        let prog = Uint8Array.from([0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF]);
        c.memoryMap.loadProgram(prog);

        c.pc[0] = 0x8000;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteWord) == 0x3412);
        c.pc[0]++;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteWord) == 0x5634);
        c.pc[0]++;
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteWord) == 0x7856);
        c.pc[0] = 0x8000 + prog.length - 1; // last index of prog
        console.assert(c.memoryMap.getOperandAddress(c, AddressingMode.AbsoluteWord) == 0x12EF);
    }

    { // no addressing
        let c = new CPU();
        try {
            c.memoryMap.getOperandAddress(c, AddressingMode.NoAddressing);
            console.assert(false);
        } catch(e) {}
    }
}

function testGetOperand() { 
    let c = new CPU();
    c.memoryMap.writeByte(0x0123, 0xFF);
    c.memoryMap.writeByte(0x0012, 0xEE);
    c.pc[0] = 0x8000;
    c.memoryMap.loadProgram(Uint8Array.from([0x12, 0x23, 0x01, 0xAB, 0x11, 0x22, 0x01, 0xCD]));

    console.assert(c.memoryMap.getOperand(c, AddressingMode.ZeroPage) == 0xEE);
    console.assert(c.memoryMap.getOperand(c, AddressingMode.Absolute) == 0xFF);
    console.assert(c.memoryMap.getOperand(c, AddressingMode.Immediate) == 0xAB);
    c.x[0] = 1;
    console.assert(c.memoryMap.getOperand(c, AddressingMode.ZeroPageX) == 0xEE);
    console.assert(c.memoryMap.getOperand(c, AddressingMode.AbsoluteX) == 0xFF);
    console.assert(c.memoryMap.getOperand(c, AddressingMode.Immediate) == 0xCD);
}

function runMemoryTests() {
    testReadByte();
    testReadWord();
    testWriteByte();
    testWriteWord();
    testLoadProgram();
    testGetOperandAddress();
    testGetOperand();
}

runMemoryTests();
