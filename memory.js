// Javascript doesn't have support for enums - this can be changed to
// an enum when we migrate to TS. TODO
// (the below is actually what a typescript enum would compile to)
const AddressingMode  = {
    Immediate: "Immediate",
    ZeroPage: "ZeroPage",
    ZeroPageX: "ZeroPageX",
    ZeroPageY: "ZeroPageY",
    Absolute: "Absolute",
    AbsoluteX: "AbsoluteX",
    AbsoluteY: "AbsoluteY",
    IndirectX: "IndirectX",
    IndirectY: "IndirectY",
    NoAddressing: "NoAddressing"
};

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
            return this.program[(addr - 0x8000) % this.program.length]; // mirror the ROM over this range
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

    /* 
     * returns a 16-bit address of the data referred to by the given &cpu and addrMode
     * https://www.nesdev.org/obelisk-6502-guide/addressing.html#IDX
     */
    getOperandAddress(cpu, addrMode) {
        switch(addrMode) {
            case AddressingMode.Immediate: // Immediate: value is in executable memory, program counter pointing to it
                {
                    return cpu.pc[0];
                }
            case AddressingMode.ZeroPage: // ZeroPage: memory access in 1st page of memory for speed 
                {
                    let addr = new Uint8Array(1);
                    addr[0] = this.readByte(cpu.pc[0]);
                    return addr[0];
                }
            case AddressingMode.ZeroPageX: // ZeroPage but add contents of register x (iteration purposes)
                {
                    let addr = new Uint8Array(1);
                    addr[0] = this.readByte(cpu.pc[0]) + cpu.x[0]; // automatically wraps
                    return addr[0];
                }
            case AddressingMode.ZeroPageY: // ZeroPageX but with register y
                {
                    let addr = new Uint8Array(1);
                    addr[0] += this.readByte(cpu.pc[0]) + cpu.y[0]; // automatically wraps
                    return addr[0];
                }
            case AddressingMode.Absolute: // Absolute: instruction param is a pointer to a memory address
                {
                    return this.readWord(cpu.pc[0]);
                }
            case AddressingMode.AbsoluteX: // Absolute mode but add contents of register x
                {
                    let addr = new Uint16Array(1);
                    addr[0] = this.readWord(cpu.pc[0]) + cpu.x[0]; 
                    return addr[0];
                }
            case AddressingMode.AbsoluteY: // Absolute mode but add contents of register y
                {
                    let addr = new Uint16Array(1);
                    addr[0] = this.readWord(cpu.pc[0]) + cpu.y[0]; 
                    return addr[0];
                }
            case AddressingMode.IndirectX: // IndirectX: 16-bit address is stored at *(pc + x) (with wrap-around of the zero-page)
                {
                    let addrPtr = new Uint8Array(2);
                    addrPtr[0] = this.readByte(cpu.pc[0]) + cpu.x[0]; // &(LSB of address)
                    addrPtr[1] = addrPtr[0] + 1;                   // &(MSB of address) (this wraps around the zero-page)
                    return (this.readByte(addrPtr[1]) << 8) | (this.readByte(addrPtr[0]));
                }
            case AddressingMode.IndirectY: // IndirectY: same idea as IndirectX
                {
                    let addrPtr = new Uint8Array(2);
                    addrPtr[0] = this.readByte(cpu.pc[0]) + cpu.y[0]; // &(LSB of address)
                    addrPtr[1] = addrPtr[0] + 1;                   // &(MSB of address) (this wraps around the zero-page)
                    return (this.readByte(addrPtr[1]) << 8) | (this.readByte(addrPtr[0]));
                }
            case AddressingMode.NoAddressing:
            default:
                throw `Cannot retrieve address from addressing mode: ${addrMode}`;
                break;
        }
    }

    /*
     * returns the operand specified by addrMode, updates the program counter
     * accordingly.
     * 
     * TODO this function might also handle some other behavior, such as extra clock cycle counting
     */
    getOperand(cpu, addrMode) {
        let addr = this.getOperandAddress(cpu, addrMode);

        switch(addrMode) {
            case AddressingMode.Immediate:
            case AddressingMode.ZeroPage:
            case AddressingMode.ZeroPageX:
            case AddressingMode.ZeroPageY:
            case AddressingMode.IndirectX:
            case AddressingMode.IndirectY:
            { // 8-bit addressing modes
                cpu.pc[0]++;
                return cpu.memoryMap.readByte(addr);
            }

            case AddressingMode.Absolute:
            case AddressingMode.AbsoluteX:
            case AddressingMode.AbsoluteY:
            { // 16-bit addressing modes
                cpu.pc[0] += 2;
                return cpu.memoryMap.readWord(addr);
            }
        }
    }
}
