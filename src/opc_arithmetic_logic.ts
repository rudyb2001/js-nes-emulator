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
