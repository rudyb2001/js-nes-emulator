/*
 * BCC - Branch if Carry is Clear
 *
 * adds the given i8 (signed) offset to the pc if the carry flag is false
 */
function BCC(cpu: CPU, operand: number) {
    if(cpu.flag.c) return; // don't branch if carry is set

    cpu.pc[0] -= 2; // move pc back to the beginning of this instruction so offset is correct

    cpu.pc[0] += i8AsNumber(operand);
}
