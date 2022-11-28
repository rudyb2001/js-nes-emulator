class Opcode {
    fn: ((cpu: CPU, operand: number) => void) | ((cpu: CPU) => void) | ((cpu: CPU, operand: number) => number);
    bytes: number;
    cycles: number;
    plusOneIfPageCrossed: boolean;
    addressingMode: AddressingMode;
    isWriteInstruction: boolean; /* Let's call an instruction a "read instruction" if it only
                                  * accesses its operand, performs computation, then modifies CPU 
                                  * registers, and a "write instruction" an instruction that can
                                  * have additional interraction with the operand, namely writing 
                                  * E.G. ASL, which reads a byte from memory, shifts it one bit to 
                                  * the left, then writes it back to memory. If isWriteInstruction
                                  * is false, we assume that the operand is read and unmodified, 
                                  * so the function pointer has no return value. If 
                                  * isWriteInstruction is true, instead of manually writing to 
                                  * memory (complicating the function, adding to boilerplate,
                                  * requiring special-case handling, etc.) it can simply return the
                                  * resultant value, which will be written to memory by the caller
                                  * (Opcode.executeCurrent). Thus the opcode's function can 
                                  * generically handle all cases, and focus only on computation and
                                  * updating CPU registers (and returning a result, if it is a 
                                  * write instruction). Opcode.executeCurrent abstracts all of the
                                  * interraction between the MemoryMap and the instructions.
                                  */

    constructor(fn, bytes, cycles, plusOneIfPageCrossed, isWriteInstruction, addressingMode) {
        this.fn = fn;
        this.bytes = bytes; // TODO this might be unnessary - bytes should be implicit by opcode (right?)
        this.cycles = cycles;
        this.plusOneIfPageCrossed = plusOneIfPageCrossed; // TODO this might be unnecessary - not sure how we're going to handle this.
        this.isWriteInstruction = isWriteInstruction;
        this.addressingMode = addressingMode;
    }

    static table = {
        0x69 : new Opcode(ADC, 2, 2, false, false, AddressingMode.Immediate),
        0x65 : new Opcode(ADC, 2, 3, false, false, AddressingMode.ZeroPage),
        0x75 : new Opcode(ADC, 2, 4, false, false, AddressingMode.ZeroPageX),
        0x6D : new Opcode(ADC, 3, 4, false, false, AddressingMode.Absolute),
        0x7D : new Opcode(ADC, 3, 4, true, false, AddressingMode.AbsoluteX),
        0x79 : new Opcode(ADC, 3, 4, true, false, AddressingMode.AbsoluteY),
        0x61 : new Opcode(ADC, 2, 6, false, false, AddressingMode.IndirectX),
        0x71 : new Opcode(ADC, 2, 5, true, false, AddressingMode.IndirectY),

        0x29 : new Opcode(AND, 2, 2, false, false, AddressingMode.Immediate),
        0x25 : new Opcode(AND, 2, 3, false, false, AddressingMode.ZeroPage),
        0x35 : new Opcode(AND, 2, 4, false, false, AddressingMode.ZeroPageX),
        0x2D : new Opcode(AND, 3, 4, false, false, AddressingMode.Absolute),
        0x3D : new Opcode(AND, 3, 4, true, false, AddressingMode.AbsoluteX),
        0x39 : new Opcode(AND, 3, 4, true, false, AddressingMode.AbsoluteY),
        0x21 : new Opcode(AND, 2, 6, false, false, AddressingMode.IndirectX),
        0x31 : new Opcode(AND, 2, 5, true, false, AddressingMode.IndirectY),

        0x0A : new Opcode(ASL, 1, 2, false, true, AddressingMode.Accumulator),
        0x06 : new Opcode(ASL, 2, 5, false, true, AddressingMode.ZeroPage),
        0x16 : new Opcode(ASL, 2, 6, false, true, AddressingMode.ZeroPageX),
        0x0E : new Opcode(ASL, 3, 6, false, true, AddressingMode.Absolute),
        0x1E : new Opcode(ASL, 3, 7, false, true, AddressingMode.AbsoluteX),

        0x90 : new Opcode(BCC, 2, 2, true, false, AddressingMode.Immediate), // TODO cycles are more complicated for some instructions

        0x24 : new Opcode(BIT, 2, 3, false, false, AddressingMode.ZeroPage),
        0x2C : new Opcode(BIT, 3, 4, false, false, AddressingMode.Absolute),

        0x00 : new Opcode(BRK, 1, 7, false, false, AddressingMode.NoAddressing),

        0x18 : new Opcode(CLC, 1, 2, false, false, AddressingMode.NoAddressing),

        0xC9 : new Opcode(CMP, 2, 2, false, false, AddressingMode.Immediate),
        0xC5 : new Opcode(CMP, 2, 3, false, false, AddressingMode.ZeroPage),
        0xD5 : new Opcode(CMP, 2, 4, false, false, AddressingMode.ZeroPageX),
        0xCD : new Opcode(CMP, 3, 4, false, false, AddressingMode.Absolute),
        0xDD : new Opcode(CMP, 3, 4, true, false, AddressingMode.AbsoluteX),
        0xD9 : new Opcode(CMP, 3, 4, true, false, AddressingMode.AbsoluteY),
        0xC1 : new Opcode(CMP, 2, 6, false, false, AddressingMode.IndirectX),
        0xD1 : new Opcode(CMP, 2, 5, true, false, AddressingMode.IndirectY),

        0xE0 : new Opcode(CPX, 2, 2, false, false, AddressingMode.Immediate),
        0xE4 : new Opcode(CPX, 2, 3, false, false, AddressingMode.ZeroPage),
        0xEC : new Opcode(CPX, 3, 4, false, false, AddressingMode.Absolute),

        0xC6 : new Opcode(DEC, 2, 5, false, true, AddressingMode.ZeroPage),
        0xD6 : new Opcode(DEC, 2, 6, false, true, AddressingMode.ZeroPageX),
        0xCE : new Opcode(DEC, 3, 6, false, true, AddressingMode.Absolute),
        0xDE : new Opcode(DEC, 3, 7, false, true, AddressingMode.AbsoluteX),

        0x49 : new Opcode(EOR, 2, 2, false, false, AddressingMode.Immediate),
        0x45 : new Opcode(EOR, 2, 3, false, false, AddressingMode.ZeroPage),
        0x55 : new Opcode(EOR, 2, 4, false, false, AddressingMode.ZeroPageX),
        0x4D : new Opcode(EOR, 3, 4, false, false, AddressingMode.Absolute),
        0x5D : new Opcode(EOR, 3, 4, true, false, AddressingMode.AbsoluteX),
        0x59 : new Opcode(EOR, 3, 4, true, false, AddressingMode.AbsoluteY),
        0x41 : new Opcode(EOR, 2, 6, false, false, AddressingMode.IndirectX),
        0x51 : new Opcode(EOR, 2, 5, true, false, AddressingMode.IndirectY),

        0x4A : new Opcode(LSR, 1, 2, false, true, AddressingMode.Accumulator),
        0x46 : new Opcode(LSR, 2, 5, false, true, AddressingMode.ZeroPage),
        0x56 : new Opcode(LSR, 2, 6, false, true, AddressingMode.ZeroPageX),
        0x4E : new Opcode(LSR, 3, 6, false, true, AddressingMode.Absolute),
        0x5E : new Opcode(LSR, 3, 7, false, true, AddressingMode.AbsoluteX),

        0x09 : new Opcode(ORA, 2, 2, false, false, AddressingMode.Immediate),
        0x05 : new Opcode(ORA, 2, 3, false, false, AddressingMode.ZeroPage),
        0x15 : new Opcode(ORA, 2, 4, false, false, AddressingMode.ZeroPageX),
        0x0D : new Opcode(ORA, 3, 4, false, false, AddressingMode.Absolute),
        0x1D : new Opcode(ORA, 3, 4, true, false, AddressingMode.AbsoluteX),
        0x19 : new Opcode(ORA, 3, 4, true, false, AddressingMode.AbsoluteY),
        0x01 : new Opcode(ORA, 2, 6, false, false, AddressingMode.IndirectX),
        0x11 : new Opcode(ORA, 2, 5, true, false, AddressingMode.IndirectY),

        0x48 : new Opcode(PHA, 1, 3, false, false, AddressingMode.NoAddressing),

        0x2A : new Opcode(ROL, 1, 2, false, true, AddressingMode.Accumulator),
        0x26 : new Opcode(ROL, 2, 5, false, true, AddressingMode.ZeroPage),
        0x36 : new Opcode(ROL, 2, 6, false, true, AddressingMode.ZeroPageX),
        0x2E : new Opcode(ROL, 3, 6, false, true, AddressingMode.Absolute),
        0x3E : new Opcode(ROL, 3, 7, false, true, AddressingMode.AbsoluteX),

        0x6A : new Opcode(ROR, 1, 2, false, true, AddressingMode.Accumulator),
        0x66 : new Opcode(ROR, 2, 5, false, true, AddressingMode.ZeroPage),
        0x76 : new Opcode(ROR, 2, 6, false, true, AddressingMode.ZeroPageX),
        0x6E : new Opcode(ROR, 3, 6, false, true, AddressingMode.Absolute),
        0x7E : new Opcode(ROR, 3, 7, false, true, AddressingMode.AbsoluteX),

        0xE9 : new Opcode(SBC, 2, 2, false, false, AddressingMode.Immediate),
        0xE5 : new Opcode(SBC, 2, 3, false, false, AddressingMode.ZeroPage),
        0xF5 : new Opcode(SBC, 2, 4, false, false, AddressingMode.ZeroPageX),
        0xED : new Opcode(SBC, 3, 4, false, false, AddressingMode.Absolute),
        0xFD : new Opcode(SBC, 3, 4, true, false, AddressingMode.AbsoluteX),
        0xF9 : new Opcode(SBC, 3, 4, true, false, AddressingMode.AbsoluteY),
        0xE1 : new Opcode(SBC, 2, 6, false, false, AddressingMode.IndirectX),
        0xF1 : new Opcode(SBC, 2, 5, true, false, AddressingMode.IndirectY),
    }

    /*
     * Executes the opcode currently pointed to by cpu's program counter.
     * The program counter will be accordingly adjusted.
     *
     * This function is responsible for calling all subroutines that handle:
     * 1.) incrementing the program counter (partially through through calls to MemoryMap.getOperand) (except some branch instructions)
     * 2.) reading memory                   (through MemoryMap) (except some stack instructions)
     * 3.) writing memory                   (through MemoryMap) (except some stack instructions)
     *
     * Opcode functions solely handle generic computation and its effect on CPU status.
     */
    static executeCurrent(cpu: CPU): void {
        let o = cpu.memoryMap.readByte(cpu.pc[0]++); // read opcode byte
        let opc = Opcode.table[o];
        if(!opc) throw `No such opcode! : ${o}`;

        if(opc.isWriteInstruction) {
            // all write instructions have a single-operand (two-parameter), single-return-value function
            if(opc.addressingMode == AddressingMode.Accumulator) { // this AddressingMode is only used with write instructions
                cpu.a[0] = opc.fn(cpu, cpu.a[0]); // call the function with accumulator as an operand, store the result into the accumulator
            } else {
                let addr = cpu.memoryMap.getOperandAddress(cpu, opc.addressingMode);
                let operand = cpu.memoryMap.getOperand(cpu, opc.addressingMode); // this call updates the pc
                let result = opc.fn(cpu, operand); // get resultant value from opcode's function
                cpu.memoryMap.writeByte(addr, result); // write that value to the correct place, all write instructions return bytes.
            }
        } else {
            if(opc.addressingMode == AddressingMode.NoAddressing) {
                opc.fn(cpu); // NoAddressing opcodes should have single-parameter functions
            } else {
                let operand = cpu.memoryMap.getOperand(cpu, opc.addressingMode); // this call updates the pc
                opc.fn(cpu, operand); // all other read instructions have a single operand parameter, no-return value function
            }
        }
    }
}

/*
 *  ~ ~ ~ ~ ~ ~ OPCODE HELPERS ~ ~ ~ ~ ~ ~
 *  the following functions are general-use helpers for opcodes.
 */

/*
 * pushes a the given byte onto the given CPU's stack, decrementing the
 * s register
 */
function push(cpu: CPU, b : number) {
    cpu.memoryMap.writeByte(0x0100 + cpu.s[0]--, b);
}

/*
 * pulls (pops) a byte from the CPU's stack, (incrementing the s register) and 
 * returns it
 */
function pull(cpu: CPU): number {
    return cpu.memoryMap.readByte(0x0100 + ++cpu.s[0]);
}

/*
 * returns true if n's sign-bit (bit 7) is clear
 */
function u8IsPositive(n: number) {
    return (n & 0b1000_0000) == 0;
}

/*
 * returns true if n's sign-bit (bit 7) is set
 */
function u8IsNegative(n: number) {
    return (n & 0b1000_0000) != 0;
}

/*
 * given three (**8-bit signed**) arguments: two number operands and one number result,
 * true will be returned if overflow occured
 * (if op1 and op2 have matching signs, and res's sign does not match, overflow has occurred.)
 * (if op1 and op2 have conflicting signs, overflow could not have occurred.)
 */
function testOverflow(op1: number, op2: number, res: number): boolean {
    let signsMatch = u8IsPositive(op1) == u8IsPositive(op2);
    if(!signsMatch) return false; // can't overflow if signs are mismatched

    return u8IsPositive(res) != u8IsPositive(op1); // overflow has occurred if result's sign mismatches the other two
}

/*
 * adds two numbers, (a, and b), and returns their result casted into an unsigned 8-bit integer
 */
function u8Add(a: number, b: number): number {
    let sum = new Uint8Array(1);
    sum[0] = a + b;
    return sum[0];
}

/*
 * converts a signed 8-bit integer into a signed number
 */
function i8AsNumber(i8: number): number {
    if((i8 & 0b1000_0000) == 0) return i8; // i8 is positive

    i8 ^= 0b1111_1111; // flip all bits
    i8 += 1; // add one

    return -i8; // return -(positive representation)
}

/*
 * returns an number whose 8 least-significant-bits represent the
 * status flags of cpu, in the order: NVBB_DIZC
 */
function statusFlagsToByte(cpu: CPU): number {
    let byte = 0;

    if(cpu.flag.n)     byte |= 0b1000_0000;
    if(cpu.flag.v)     byte |= 0b0100_0000;
    if(cpu.flag.bHigh) byte |= 0b0010_0000;
    if(cpu.flag.bLow)  byte |= 0b0001_0000;
    if(cpu.flag.d)     byte |= 0b0000_1000;
    if(cpu.flag.i)     byte |= 0b0000_0100;
    if(cpu.flag.z)     byte |= 0b0000_0010;
    if(cpu.flag.c)     byte |= 0b0000_0001;

    return byte;
}

/*
 * sets the given cpu's status flags based on the flags bit-field argument,
 * which represents the status flags in the following order: NVBB_DIZC
 */
function loadStatusFlagsFromByte(cpu: CPU, flags: number) {
    cpu.flag = {
        c:     (flags & 0b0000_0001) != 0,
        z:     (flags & 0b0000_0010) != 0,
        i:     (flags & 0b0000_0100) != 0,
        d:     (flags & 0b0000_1000) != 0,
        bLow:  (flags & 0b0001_0000) != 0,
        bHigh: (flags & 0b0010_0000) != 0,
        v:     (flags & 0b0100_0000) != 0,
        n:     (flags & 0b1000_0000) != 0
    }
}
