/*
 * ADC - ADd with Carry
 *
 * Stores (operand + carry flag + accumulator) into the accumulator.
 */
function ADC(cpu: CPU, operand: number) {
    let result = 0; // number
    let a1 = cpu.a[0]; // need to remember a's initial value when checking for overflow
    result += operand;
    result += cpu.a[0];
    result += (cpu.flag.c ? 1 : 0);

    // udpate flags

    // to calculate overflow, check if {
    // a.) accumulator's sign matches the operand's sign
    // b.) the resultant sign mismatches those signs
    // }
    // the carry flag impacts the result, but isn't directly factored into the signs of the operands.

    let aSign = (cpu.a[0] & 0b1000_0000) == 0;
    let oSign = (operand & 0b1000_0000) == 0;
    let rSign = (result & 0b1000_0000) == 0;
    cpu.flag.v = (aSign == oSign) && (rSign != aSign);

    cpu.flag.c = (result & 0b1_0000_0000) != 0;
    cpu.flag.z = u8Add(result, 0) == 0; // result as u8 == 0
    cpu.flag.n = (result & 0b1000_0000) != 0;

    // place result in the accumulator
    cpu.a[0] = result;
}

/*
 * AND - bitwise AND (&)
 * 
 * Performes a bitwise and on the contents of the accumulator with the operand.
 * The result is stored in the accumulator.
 */
function AND(cpu: CPU, operand: number) {
    cpu.a[0] &= operand;

    cpu.flag.z = cpu.a[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.a[0]);
}

/*
 * ASL - Arithmetic Shift Left
 *
 * Shifts the operand one bit to the left, setting the new 0-bit to 0.
 */
function ASL(cpu: CPU, operand: number): number {
    let result = u8Add(0, operand << 1);

    // update flags
    cpu.flag.c = (operand & 0b1000_0000) != 0; // value of shifted-out bit
    cpu.flag.z = result == 0;
    cpu.flag.n = (result & 0b1000_0000) != 0; // value of sign bit of result

    return result;
}

/*
 * BIT - BIt Test
 *
 * Performs an implicit bitwise of (operand & accumulator), and
 * sets the zero flag if its result is zero (other than the zero flag, this
 * bitwise and has no effect on the CPU nor memory). Bits 6 and 7 of the operand
 * are copied to the overflow and negative flag, respectively.
 */
function BIT(cpu: CPU, operand: number) {
    let implicitAndResult = operand & cpu.a[0]; 

    cpu.flag.z = (implicitAndResult == 0);
    cpu.flag.n = (operand & 0b1000_0000) != 0;
    cpu.flag.v = (operand & 0b0100_0000) != 0;
}

/*
 * CMP - CoMPare (accumulator)
 *
 * performs an implicit subtraction of (accumulator - operand),
 * setting the zero, negative, flags accordingly, such that
 *
 * zero flag set     => accumulator == operand
 * carry flag set    => sign bit carried out, and accumulator >= operand
 * negative flag set => sign bit not carried out, accumulator < operand
 *
 * (these three are implicit in the subtraction)
 */
function CMP(cpu: CPU, operand: number) {
    operand = u8Add(-operand, 0); // operand = -operand as u8
    let result = cpu.a[0] + operand;

    cpu.flag.z = (result & 0b1111_1111) == 0;
    cpu.flag.c = (result & 0b1_0000_0000) != 0;
    cpu.flag.n = (result & 0b1000_0000) != 0;
}

/*
 * DEC - DECrement memory
 * 
 * Decrements the operand, storing the result at the same address.
 */
function DEC(cpu: CPU, operand: number): number {
    let result = u8Add(operand, -1);

    cpu.flag.z = result == 0;
    cpu.flag.n = u8IsNegative(result);

    return result;
}

/*
 * EOR - bitwise Exclusive OR (^)
 * 
 * Performes a bitwise xor on the contents of the accumulator with the operand.
 * The result is stored in the accumulator.
 */
function EOR(cpu: CPU, operand: number) {
    cpu.a[0] ^= operand;

    cpu.flag.z = cpu.a[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.a[0]);
}

/*
 * LSR - Logical Shift Right
 *
 * Performs a logical bitwise right-shift (filling newly created bits with 0)
 * on the operand, storing the result in the same place. The carry flag is
 * set to the shifted-out bit.
 */
function LSR(cpu: CPU, operand: number): number {
    let result = operand >> 1;

    cpu.flag.c = (operand & 1) != 0;
    cpu.flag.z = result == 0;
    cpu.flag.n = false; // bit 7 always becomes 0 with logical right shift

    return result;
}

/*
 * ORA - bitwise OR (|) on Accumulator
 * 
 * Performes a bitwise or on the contents of the accumulator with the operand.
 * The result is stored in the accumulator.
 */
function ORA(cpu: CPU, operand: number) {
    cpu.a[0] |= operand;

    cpu.flag.z = cpu.a[0] == 0;
    cpu.flag.n = u8IsNegative(cpu.a[0]);
}

/*
 * ROL - ROtate (with carry) Left
 *
 * Performs a bitwise left-rotate on the operand and the carry flag:
 * it is shifted one bit to the left; the new 0 bit is the old carry
 * flag and old 7 bit becomes the carry flag. The result is stored
 * in the same place it was read from.
 *
 * E.G. ROL (operand = 0xAA (0b1010_1010), carry = 1)
 *
 * Before ROL:
 *  value: 1  10101010
 *  label: C  76543210
 *   carry ^  ^
 *    operand | (bit numbers labeled)
 *
 * After ROL:
 *  value: 1  01010101
 *  label: 7  6543210C
 */
function ROL(cpu: CPU, operand: number): number {
    operand <<= 1;
    operand |= (cpu.flag.c ? 1 : 0); // set bit 0 to old carry flag
    cpu.flag.c = (operand & 0b1_0000_0000) != 0; // set carry to shifted-out bit

    cpu.flag.z = u8Add(operand, 0) == 0; // result is 0
    cpu.flag.n = u8IsNegative(operand);

    return u8Add(operand, 0); // return operand as u8
}

/*
 * ROR - ROtate (with carry) Right
 *
 * Performs a bitwise right-rotate on the operand and the carry flag:
 * it is shifted one bit to the right; the new 7 bit is the old carry
 * flag and old 0 bit becomes the carry flag. The result is stored
 * in the same place it was read from.
 */
function ROR(cpu: CPU, operand: number): number {
    let shiftedOutBit = operand & 1;
    operand >>= 1;
    operand |= (cpu.flag.c ? 0b1000_0000 : 0); // set bit 0 to old carry flag
    cpu.flag.c = shiftedOutBit != 0; // set carry to shifted-out bit

    cpu.flag.z = u8Add(operand, 0) == 0; // result is 0
    cpu.flag.n = u8IsNegative(operand);

    return u8Add(operand, 0); // return operand as u8
}

/*
 * SBC SuBtract with Carry (borrow)
 *
 * Stores (accumulator - operand - !carry-flag) into the accumulator.
 */
function SBC(cpu: CPU, operand: number) {
    // -> accumulator - operand - !carry
    // => accumulator - operand - (1 - carry)
    // => accumulator - operand - 1 + carry
    // => accumulator + (-(operand + 1)) + carry
    // => adc(-operand - 1)
    ADC(cpu, u8Add(-operand, -1));
}
