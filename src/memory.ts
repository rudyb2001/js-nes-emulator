// enum type to specify an addressing mode
enum AddressingMode {  
    Immediate,
    ZeroPage,
    ZeroPageX,
    ZeroPageY,
    Absolute,
    AbsoluteX,
    AbsoluteY,
    IndirectX,
    IndirectY,
    NoAddressing,
    Accumulator // some operands have the accumulator as an "addressing mode" along with other possible operands -
                // this is different than NoAddressing so Opcode.executeCurrent knows what operands
                // to supply to the function pointer
}

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
    memory: Uint8Array;
    program: Uint8Array;
    ppu: PPU;

    constructor(size?: number) {
        this.memory = new Uint8Array(size || 0x800);
        this.ppu = new PPU();
    }

    // returns the byte at the memory map's address addr. 
    readByte(addr: number): number {
        if(0x0000 <= addr && addr < 0x2000) { // memory (RAM)
            return this.memory[addr % 0x0800]; // 0x0000-0x08000 are mirrored over this range
        } else if(0x2000 <= addr && addr < 0x4020) { // PPI/IO
            let val = this.accessMemoryMappedRegister(addr, 0, true);
            if (val === null)
                throw "ERROR: access memory mapped registers returned null";
            return val;
        } else if(0x4020 <= addr && addr < 0x8000) { // unsupported 
            throw `Address ${addr} is in unsupported CPU addressing range! 0x4020 - 0x7FFF`
        } else if (0x8000 <= addr && addr <= 0xFFFF) { // cartdrige ROM
            // TODO implement mapping? (mapper 0 should have the same behavior as "no mapping"? (mirror over whole range))
            if(this.program == null) throw `cannot read address ${addr} in ROM because no program is loaded!`
            return this.program[(addr - 0x8000) % this.program.length]; // mirror the ROM over this range
        }

        throw `address ${addr} is out of memory map's bounds!`;
    }

    readWord(addr: number): number {
        let lowByte = this.readByte(addr); 
        let highByte = this.readByte(addr + 1);

        return (highByte << 8) | lowByte;
    }

    writeByte(addr: number, b: number): void {
        if(0x0000 <= addr && addr < 0x2000) { // memory (RAM)
            this.memory[addr % 0x0800] = b; // 0x0000-0x08000 are mirrored over this range
        } else if(0x2000 <= addr && addr < 0x4020) { // PPI/IO
            let status = this.accessMemoryMappedRegister(addr, b, false);
        } else if(0x4020 <= addr && addr < 0x8000) { // unsupported 
            throw `Address ${addr} is in unsupported CPU addressing range! 0x4020 - 0x7FFF`
        } else if (0x8000 <= addr && addr <= 0xFFFF) { // cartdrige ROM
            // TODO add support for mappers (which allow "writing" to ROM)
            throw `Cannot write at ROM address ${addr}`;
        } else {
            throw `address ${addr} is out of memory map's bounds!`;
        }
    }

    writeWord(addr: number, w: number): void {
        let lowByte = w & 0b1111_1111;
        let highByte = w >> 8; 

        this.writeByte(addr, lowByte);
        this.writeByte(addr + 1, highByte);
    }

    accessMemoryMappedRegister(addr: number, byte: number, read: boolean): number {
        // Check write-only registers
        if (read && (addr === 0x2000 || addr == 0x2001 || addr == 0x2005)) {
            throw `ERROR in MemoryMap, accessMemoryMappedRegister: reading from write-only register ${addr}`;
        }

        // PPU Memory Map Data (0x2007) and Address (0x2006) registers
        if (addr == 0x2006) {
            if (read) { throw "ERROR in MemoryMap, undefined read operation to 0x2006" }
            // pass in address to PPU?
            this.ppu.putAddressByte(byte);
            return null;
        }

        if (addr == 0x2007) {
            if (read)  {
                return this.ppu.getData();
            } else {
                this.ppu.setData(byte);
                return null;
            }
        }

        // Read-only status register
        if (addr == 0x2002) {
            if (!read) throw "ERROR in MemoryMap, write operation to read-only register 0x2002";

            return this.ppu.getStatus();
        }

        throw "TODO: undefined behavior for memory mapped registers";

        return null;
    }

    // loads program, a Uint8Array, into the rom area of "memory"
    loadProgram(program: Uint8Array): void {
        this.program = program;
    }

    /* 
     * returns a 16-bit address of the data referred to by the given &cpu and addrMode
     * https://www.nesdev.org/obelisk-6502-guide/addressing.html#IDX
     */
    getOperandAddress(cpu: CPU, addrMode: AddressingMode): number {
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
            case AddressingMode.Accumulator:
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
    getOperand(cpu: CPU, addrMode: AddressingMode): number {
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
            default:
                throw `Cannot retrieve operand from addressing mode: ${addrMode}`;
                break;
        }
    }
}
