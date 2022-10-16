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
            m.writeByte(0x8000);
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
            m.writeWord(0x2000);
            console.assert(false);
        } catch(e) {}
    }

    { // ROM
        //  TODO add support for mappers?
        
        // for now, assume writing to ROM is illegal
        let m = new MemoryMap();
        try {
            m.writeWord(0x7FFF);
            console.assert(false);
        } catch(e) {}
    }
}

function testLoadProgram() {
    { // valid program
        let program = new Uint8Array();
        let m = new MemoryMap();

        m.loadProgram(program);

        console.assert(m.program === program);
    }

    { // invalid program
        let invalidProgram1 = [3, 4, 5]; // not a Uint8Array
        let invalidProgram2 = {}; // not a Uint8Array
        let invalidProgram3 = "abc"; // not a Uint8Array
        try {
            m.loadProgram(invalidProgram1);
            console.assert(false);
        } catch(e) {}

        try {
            m.loadProgram(invalidProgram2);
            console.assert(false);
        } catch(e) {}

        try {
            m.loadProgram(invalidProgram3);
            console.assert(false);
        } catch(e) {}
    }
}

function runMemoryTests() {
    testReadByte();
    testReadWord();
    testWriteByte();
    testWriteWord();
    testLoadProgram();
}

runMemoryTests();
