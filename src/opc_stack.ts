/*
 * PHA - PusH Accumulator
 *
 * Pushes the accumulator to the stack.
 */
function PHA(cpu: CPU) {
    cpu.memoryMap.writeByte(0x0100 + cpu.s[0]--, cpu.a[0]);
}
