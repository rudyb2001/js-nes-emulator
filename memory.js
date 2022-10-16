/*
 * This class is used by the CPU to access all other machine components
 * (RAM, PPU, ROM, IO, ...) via an address.
 * When the CPU supplies an address, it can be anywhere in the range
 * 0x0000 - 0xFFFF (inclusive), which covers all of those components.
 * (I.E. not all addresses refer to the same device)
 * (we want to abstract address reading so the CPU class can act like
 *  real NES hardware (E.G. in an instruction, we want to be able to use
 *  "read whatever is at address 0xABCD, regardless of what hardware that 
 *  address represents", instead of "read cartdridge[0xABCD - 0x8000]" or 
 *  "read memory[0x31]")).
 * This class can also be used to handle other hardware nuances, like mirroring
 * and mapping.
 */
class MemoryMap {
    constructor() {
        this.memory = new Uint8Array(0x0800);
        this.program; // Uint8Array: will be assigned when loadProgram is called
    }

    // returns the byte at the memory map's address addr. 
    readByte(addr) {
        if(typeof addr != 'number') throw `can't read non-number "${addr}" as address!`;

        if(0x0000 <= addr && addr < 0x2000) { // memory (RAM)
            return this.memory[addr % 0x0800]; // 0x0000-0x08000 are mirrored over this range
        } else if(0x2000 <= addr && addr < 0x4020) { // PPI/IO
            // TODO add support for io registers and mirroring
            throw "TODO: implement PPU/IO register access";
        } else if(0x4020 <= addr && addr < 0x8000) { // unsupported 
            throw `Address ${addr} is in unsupported CPU addressing range! 0x4020 - 0x7FFF`
        } else if (0x8000 <= addr && addr <= 0xFFFF) { // cartdrige ROM
            // TODO implement mapping? (mapper 0 should have the same behavior as "no mapping"? (mirror over whole range))
            if(this.program == null) throw `cannot read address ${addr} in ROM because no program is loaded!`
            return this.program[addr % this.program.length]; // mirror the ROM over this range
        }

        throw `address ${addr} is out of memory map's bounds!`;
    }

    readWord(addr) {
        if(typeof addr != 'number') throw `can't read non-number "${addr}" as address!`;

        let lowByte = this.readByte(addr); 
        let highByte = this.readByte(addr + 1);

        return (highByte << 8) | lowByte;
    }

    writeByte(addr, b) {
        if(typeof addr != 'number') throw `can't write at non-number "${addr}" as address!`;

        if(0x0000 <= addr && addr < 0x2000) { // memory (RAM)
            this.memory[addr % 0x0800] = b; // 0x0000-0x08000 are mirrored over this range
        } else if(0x2000 <= addr && addr < 0x4020) { // PPI/IO
            // TODO add support for io registers and mirroring
            throw "TODO: implement PPU/IO register modification";
        } else if(0x4020 <= addr && addr < 0x8000) { // unsupported 
            throw `Address ${addr} is in unsupported CPU addressing range! 0x4020 - 0x7FFF`
        } else if (0x8000 <= addr && addr <= 0xFFFF) { // cartdrige ROM
            // TODO add support for mappers (which allow "writing" to ROM)
            throw `Cannot write at ROM address ${addr}`;
        } else {
            throw `address ${addr} is out of memory map's bounds!`;
        }
    }

    writeWord(addr, w) {
        if(typeof addr != 'number') throw `can't write at non-number "${addr}" as address!`;

        let lowByte = w & 0b1111_1111;
        let highByte = w >> 8; 

        this.writeByte(addr, lowByte);
        this.writeByte(addr + 1, highByte);
    }

    // loads program, a Uint8Array, into the rom area of "memory"
    loadProgram(program) {
        if(!program instanceof Uint8Array) throw "Program must be a Uint8Array";
        this.program = program;
    }
}
