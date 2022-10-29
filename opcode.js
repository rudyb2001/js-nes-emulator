class Opcode {
    constructor(fn, bytes, cycles, plusOneIfPageCrossed, addressingMode) {
        this.fn = fn; // function pointer
        this.bytes = bytes; // number TODO this might be unnessary - bytes should be implicit by opcode (right?)
        this.cycles = cycles; // number
        this.plusOneIfPageCrossed = plusOneIfPageCrossed; // bool TODO this might be unnecessary - not sure how we're going to handle this.
        this.addressingMode = addressingMode; // AddressingMode
    }

    static table = {
        0x69 : new Opcode(Opcode.ADC, 2, 2, false, AddressingMode.Immediate),
        0x65 : new Opcode(Opcode.ADC, 2, 3, false, AddressingMode.ZeroPage),
        0x75 : new Opcode(Opcode.ADC, 2, 4, false, AddressingMode.ZeroPageX),
        0x6D : new Opcode(Opcode.ADC, 3, 4, false, AddressingMode.Absolute),
        0x7D : new Opcode(Opcode.ADC, 3, 4, true, AddressingMode.AbsoluteX),
        0x79 : new Opcode(Opcode.ADC, 3, 4, true, AddressingMode.AbsoluteY),
        0x61 : new Opcode(Opcode.ADC, 2, 6, false, AddressingMode.IndirectX),
        0x71 : new Opcode(Opcode.ADC, 2, 5, true, AddressingMode.IndirectY),
    }

    /*
     * Executes the opcode currently pointed to by cpu's program counter.
     * The program counter will be accordingly adjusted.
     */
    static executeCurrent(cpu) {
        let n = cpu.memoryMap.readByte(cpu.pc[0]++);
        let opc = Opcode.table[n];
        if(!opc) throw `No such opcode! : ${n}`;

        if(opc.addressingMode == AddressingMode.NoAddressing) {
            opc.fn(cpu); // NoAddressing opcodes should have single-parameter functions
        } else {
            let operand = cpu.memoryMap.getOperand(cpu, opc.addressingMode); // this call updates the pc
            opc.fn(cpu, operand); // all other opcodes have a single operand parameter
        }
    }

    /*
     * ADC - Add with carry
     *
     * stores (operand + carry flag + accumulator) into the accumulator.
     */
    static ADC(cpu, operand) {
        let result = 0; // number
        result += operand;
        result += cpu.a[0];
        result += cpu.flag.c;

        // place result in the accumulator
        cpu.a[0] = result;

        // udpate flags
        // to check for overflow, we consider overflow in (smaller + carry), then (smaller + carry + larger)
        let smaller = Math.min(operand, cpu.a);
        let larger = Math.max(operand, cpu.a);
        cpu.flag.v = smaller == 0b0111_1111 && cpu.flag.c || // (smaller + carry) overflows ?
                     testOverflow(smaller + cpu.flag.c, larger, u8Add(smaller + cpu.flag.c, larger)); // overflow with entire addition
        cpu.flag.c = (result & 0b1_0000_0000) != 0;
        cpu.flag.z = result == 0;
        cpu.flag.n = (result & 0b1000_0000) != 0;

    }
}

/*
 *  ~ ~ ~ ~ ~ ~ OPCODE HELPERS ~ ~ ~ ~ ~ ~
 *  the following functions are general-use helpers for opcodes.
 */

/*
 * given three arguments: two number operands and one number result,
 * true will be returned if overflow occured
 * (if op1 and op2 have matching signs, and res's sign does not match, overflow has occurred.)
 * (if op1 and op2 have conflicting signs, overflow could not have occurred.)
 */
function testOverflow(op1, op2, res) {
    let larger = Math.max(op1, op2);
    let smaller = Math.min(op1, op2);

    let signsMatch = smaller >= 0 || larger <= 0; // smaller is pos => both are pos; larger is neg => both are neg
    if(!signsMatch) return false; // can't overflow if signs are mismatched

    if(smaller >= 0) return res >= 0;
    else return res <= 0;
}

/*
 * adds two numbers, (a, and b), and returns their result casted into an unsigned 8-bit integer
 */
function u8Add(a, b) {
    let sum = new Uint8Array(1);
    sum[0] = a + b;
    return sum[0];
}

