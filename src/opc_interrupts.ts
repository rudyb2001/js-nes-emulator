/*
 * BRK - BReaK (force interrupt)
 *
 * The program counter and status register are pushed to the stack,
 * and the IRQ interrupt vector (at 0xFFFE/F) is loaded into the PC,
 * and the break flag is set to 0b11.
 */
function BRK(cpu: CPU) {
    cpu.pc[0]++; // the BRK instruction causes the pc to jump over the following byte
                 // https://www.nesdev.org/the%20'B'%20flag%20&%20BRK%20instruction.txt
                 // TODO verify that this is the correct functionality

    let pcLowByte = cpu.pc[0] & 0x00FF;
    let pcHighByte = (cpu.pc[0] & 0xFF00) >> 8;

    // cpu.flag |= 0b0011_0000
    cpu.flag.bLow = true;
    cpu.flag.bHigh = true;

    push(cpu, pcLowByte);
    push(cpu, pcHighByte);
    push(cpu, statusFlagsToByte(cpu));

    cpu.pc[0] = cpu.memoryMap.readWord(0xFFFE);
}
