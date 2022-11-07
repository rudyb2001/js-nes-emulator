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
        0x69 : new Opcode(Opcode.ADC, 2, 2, false, false, AddressingMode.Immediate),
        0x65 : new Opcode(Opcode.ADC, 2, 3, false, false, AddressingMode.ZeroPage),
        0x75 : new Opcode(Opcode.ADC, 2, 4, false, false, AddressingMode.ZeroPageX),
        0x6D : new Opcode(Opcode.ADC, 3, 4, false, false, AddressingMode.Absolute),
        0x7D : new Opcode(Opcode.ADC, 3, 4, true, false, AddressingMode.AbsoluteX),
        0x79 : new Opcode(Opcode.ADC, 3, 4, true, false, AddressingMode.AbsoluteY),
        0x61 : new Opcode(Opcode.ADC, 2, 6, false, false, AddressingMode.IndirectX),
        0x71 : new Opcode(Opcode.ADC, 2, 5, true, false, AddressingMode.IndirectY),

        0x0A : new Opcode(Opcode.ASL, 1, 2, false, true, AddressingMode.Accumulator),
        0x06 : new Opcode(Opcode.ASL, 2, 5, false, true, AddressingMode.ZeroPage),
        0x16 : new Opcode(Opcode.ASL, 2, 6, false, true, AddressingMode.ZeroPageX),
        0x0E : new Opcode(Opcode.ASL, 3, 6, false, true, AddressingMode.Absolute),
        0x1E : new Opcode(Opcode.ASL, 3, 7, false, true, AddressingMode.AbsoluteX),

        0x90 : new Opcode(Opcode.BCC, 2, 2, true, false, AddressingMode.Immediate), // TODO cycles are more complicated for some instructions

        0x18 : new Opcode(Opcode.CLC, 1, 2, false, false, AddressingMode.NoAddressing),

        0x48 : new Opcode(Opcode.PHA, 1, 3, false, false, AddressingMode.NoAddressing),
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

    /*
     * ADC - ADd with Carry
     *
     * Stores (operand + carry flag + accumulator) into the accumulator.
     */
    static ADC(cpu: CPU, operand: number) {
        let result = 0; // number
        let a1 = cpu.a[0]; // need to remember a's initial value when checking for overflow
        result += operand;
        result += cpu.a[0];
        result += (cpu.flag.c ? 1 : 0);

        // place result in the accumulator
        cpu.a[0] = result;

        // udpate flags
        // to check for overflow, we consider overflow in (smaller + carry), then (smaller + carry + larger)
        let smaller = Math.min(operand, a1);
        let larger = Math.max(operand, a1);
        cpu.flag.v = smaller == 0b0111_1111 && cpu.flag.c || // (smaller + carry) overflows ?
                     testOverflow(smaller + (cpu.flag.c ? 1 : 0), larger, cpu.a[0]); // overflow with entire addition
        cpu.flag.c = (result & 0b1_0000_0000) != 0;
        cpu.flag.z = u8Add(result, 0) == 0; // result as u8 == 0
        cpu.flag.n = (result & 0b1000_0000) != 0;
    }

    /*
     * ASL - Arithmetic Shift Left
     *
     * Shifts the operand one bit to the left, setting the new 0-bit to 0.
     */
    static ASL(cpu: CPU, operand: number): number {
        let result = u8Add(0, operand << 1);

        // update flags
        cpu.flag.c = (operand & 0b1000_0000) != 0; // value of shifted-out bit
        cpu.flag.z = result == 0;
        cpu.flag.n = (result & 0b1000_0000) != 0; // value of sign bit of result

        return result;
    }

    /*
     * BCC - Branch if Carry is Clear
     *
     * adds the given i8 (signed) offset to the pc if the carry flag is false
     */
    static BCC(cpu: CPU, operand: number) {
        if(cpu.flag.c) return; // don't branch if carry is set

        cpu.pc[0] -= 2; // move pc back to the beginning of this instruction so offset is correct

        cpu.pc[0] += i8AsNumber(operand);
    }

    /*
     * CLC - Clear Carry Flag
     *
     * Sets the carry flag to false.
     */
    static CLC(cpu: CPU) {
        cpu.flag.c = false;
    }

    /*
     * PHA - PusH Accumulator
     *
     * Pushes the accumulator to the stack.
     */
    static PHA(cpu: CPU) {
        cpu.memoryMap.writeByte(0x0100 + cpu.s[0]--, cpu.a[0]);
    }
}

/*
 *  ~ ~ ~ ~ ~ ~ OPCODE HELPERS ~ ~ ~ ~ ~ ~
 *  the following functions are general-use helpers for opcodes.
 */

/*
 * returns true if n's sign-bit (bit 7) is clear
 */
function u8IsPositive(n: number) {
    return (n & 0b1000_0000) == 0;
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
