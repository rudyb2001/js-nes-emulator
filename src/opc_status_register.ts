/*
 * CLC - Clear Carry Flag
 *
 * Sets the carry flag to false.
 */
function CLC(cpu: CPU) {
    cpu.flag.c = false;
}
