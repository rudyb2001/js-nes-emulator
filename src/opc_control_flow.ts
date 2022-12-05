/*
 * BCC - Branch if Carry is Clear
 *
 * adds the given i8 (signed) offset to the pc if the carry flag is clear
 *
 * (note: since the pc is incremented twice during the instruction, the
 * effective shift is in the range from -126 to 129 [the 2-byte instruction
 * offset is NOT accounted for {this is different from the JMP instruction.}])
 */
function BCC(cpu: CPU, operand: number) {
    if(cpu.flag.c) return; // don't branch if carry is set

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * BCS - Branch if Carry is Set
 *
 * adds the given i8 (signed) offset to the pc if the carry flag is set
 */
function BCS(cpu: CPU, operand: number) {
    if(!cpu.flag.c) return; // don't branch if carry is clear

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * BEQ - Branch if EQual
 *
 * adds the given i8 (signed) offset to the pc if the zero flag is set
 */
function BEQ(cpu: CPU, operand: number) {
    if(!cpu.flag.z) return; // don't branch if zero is clear

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * BMI - Branch if MInus
 *
 * adds the given i8 (signed) offset to the pc if the negative flag is set
 */
function BMI(cpu: CPU, operand: number) {
    if(!cpu.flag.n) return; // don't branch if negative is clear

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * BNE - Branch if Not Equal
 *
 * adds the given i8 (signed) offset to the pc if the zero flag is clear
 */
function BNE(cpu: CPU, operand: number) {
    if(cpu.flag.z) return; // don't branch if zero is set

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * BPL - Branch if Positive
 *
 * adds the given i8 (signed) offset to the pc if the negative flag is clear
 */
function BPL(cpu: CPU, operand: number) {
    if(cpu.flag.n) return; // don't branch if negative is set

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * BVC - Branch if oVerflow Clear
 *
 * adds the given i8 (signed) offset to the pc if the overflow flag is clear
 */
function BVC(cpu: CPU, operand: number) {
    if(cpu.flag.v) return; // don't branch if overflow is set

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * BVS - Branch if oVerflow Set
 *
 * adds the given i8 (signed) offset to the pc if the overflow flag is set
 */
function BVS(cpu: CPU, operand: number) {
    if(!cpu.flag.v) return; // don't branch if overflow is clear

    cpu.pc[0] += i8AsNumber(operand);
}

/*
 * JMP - JuMP
 *
 * Sets the program counter to the given address.
 *
 * (note: unlike the conditional branches, the pc increment after an instruction
 * has no impact on JMP (i.e. jumping to address $ABCD causes the cpu to execute
 * the instruction directly at $ABCD, not at ($ABCD + 2)). This happens implicitly
 * because in the JMP instruction, the pc is assigned instead of shifted.
 */
function JMP(cpu: CPU, operand: number) {
    cpu.pc[0] = operand;
}

/*
 * JSR - Jump to SubRoutine
 * 
 * Pushes the program counter (minus one) to the stack, and sets the program
 * counter given address.
 */
function JSR(cpu: CPU, operand: number) {
    pushWord(cpu, cpu.pc[0] - 1);
    cpu.pc[0] = operand;
}

/*
 * RTS - ReTurn from Subroutine
 *
 * Pops into the program counter, incrementing it by one.
 */
function RTS(cpu: CPU) {
    cpu.pc[0] = pullWord(cpu) + 1;
}
