/*
 * CPX - ComPare X register
 *
 * Compares the x register (performing an implied subtraction) with the supplied 
 * operand (unsigned) and sets the registers accordingly.
 */
function CPX(cpu: CPU, operand: number) {
    let difference = cpu.x[0] - operand;

    cpu.flag.c = (difference >= 0);
    cpu.flag.z = (difference == 0);
    cpu.flag.n = (difference < 0);
}

/*
 * CPY - ComPare Y register
 *
 * Compares the y register (performing an implied subtraction) with the supplied 
 * operand (unsigned) and sets the registers accordingly.
 */
function CPY(cpu: CPU, operand: number) {
    let difference = cpu.y[0] - operand;

    cpu.flag.c = (difference >= 0);
    cpu.flag.z = (difference == 0);
    cpu.flag.n = (difference < 0);
}

/*
 * DEX - DEcrement X register
 *
 * Decrements the x register, setting the zero and negative flags accordingly.
 * (unsigned decrement)
 */
function DEX(cpu: CPU) {
    cpu.x[0]--;

    cpu.flag.z = cpu.x[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.x[0]);
}

/*
 * DEY - DEcrement Y register
 *
 * Decrements the y register, setting the zero and negative flags accordingly.
 * (unsigned decrement)
 */
function DEY(cpu: CPU) {
    cpu.y[0]--;

    cpu.flag.z = cpu.y[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.y[0]);
}

/*
 * INC - INCrement memory
 *
 * Increments the data at the given memory address, updating the negative
 * and zero flags accordingly.
 */
function INC(cpu: CPU, operand: number): number {
    operand = u8Add(operand, 1);

    cpu.flag.z = operand == 0;
    cpu.flag.n = u8IsNegative(operand);

    return operand;
}

/*
 * INX - INcrement X register
 *
 * Increments the x register, setting the zero and negative flags accordingly.
 */
function INX(cpu: CPU) {
    cpu.x[0]++;

    cpu.flag.z = cpu.x[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.x[0]);
}

/*
 * INY - INcrement Y register
 *
 * Increments the y register, setting the zero and negative flags accordingly.
 */
function INY(cpu: CPU) {
    cpu.y[0]++;

    cpu.flag.z = cpu.y[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.y[0]);
}

/*
 * LDA - Load Accumulator
 *
 * accumulator := operand,
 * zero and negative flags updated accordingly.
 */
function LDA(cpu: CPU, operand: number) {
    cpu.a[0] = operand;

    cpu.flag.z = cpu.a[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.a[0]);
}

/*
 * LDX - Load X
 *
 * cpu.x := operand,
 * zero and negative flags updated accordingly.
 */
function LDX(cpu: CPU, operand: number) {
    cpu.x[0] = operand;

    cpu.flag.z = cpu.x[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.x[0]);
}

/*
 * LDY - Load Y
 *
 * cpu.y := operand,
 * zero and negative flags updated accordingly.
 */
function LDY(cpu: CPU, operand: number) {
    cpu.y[0] = operand;

    cpu.flag.z = cpu.y[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.y[0]);
}

/*
 * STA - STore Accumulator
 *
 * Stores the accumulator in the operand's address.
 * (returns the accumulator)
 */
function STA(cpu: CPU) {
    return cpu.a[0];
}

/*
 * STX - STore X
 *
 * Stores the x register in the operand's address.
 * (returns the x register)
 */
function STX(cpu: CPU) {
    return cpu.x[0];
}

/*
 * STY - STore Y
 *
 * Stores the y register in the operand's address.
 * (returns the y register)
 */
function STY(cpu: CPU) {
    return cpu.y[0];
}

/*
 * TAX - Transfer Accumulator to X
 *
 * x := accumulator
 *
 * Zero and negative flags are updated accordingly.
 */
function TAX(cpu: CPU) {
    cpu.x[0] = cpu.a[0];

    cpu.flag.z = cpu.x[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.x[0]);
}

/*
 * TAY - Transfer Accumulator to Y
 *
 * y := accumulator
 *
 * Zero and negative flags are updated accordingly.
 */
function TAY(cpu: CPU) {
    cpu.y[0] = cpu.a[0];

    cpu.flag.z = cpu.y[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.y[0]);
}

/*
 * TSX - Transfer Stack pointer to to X
 *
 * x := stack register
 *
 * Zero and negative flags are updated accordingly.
 */
function TSX(cpu: CPU) {
    cpu.x[0] = cpu.s[0];

    cpu.flag.z = cpu.x[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.x[0]);
}

/*
 * TXA - Transfer X to Accumulator
 *
 * accumulator := x
 *
 * Zero and negative flags are updated accordingly.
 */
function TXA(cpu: CPU) {
    cpu.a[0] = cpu.x[0];

    cpu.flag.z = cpu.a[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.a[0]);
}

/*
 * TXS - Transfer X to Stack register
 *
 * stack register := x
 *
 * Zero and negative flags are updated accordingly.
 */
function TXS(cpu: CPU) {
    cpu.s[0] = cpu.x[0];

    cpu.flag.z = cpu.s[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.s[0]);
}

/*
 * TYA - Transfer Y to Accumulator
 *
 * accumulator := y
 *
 * Zero and negative flags are updated accordingly.
 */
function TYA(cpu: CPU) {
    cpu.a[0] = cpu.y[0];

    cpu.flag.z = cpu.y[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.y[0]);
}
