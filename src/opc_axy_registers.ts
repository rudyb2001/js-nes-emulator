/*
 * CPX - ComPare X register
 *
 * Compares the x register (performing an implied subtraction) with the supplied 
 * operand and sets the registers accordingly.
 */
function CPX(cpu: CPU, operand: number) {
    let difference = cpu.x[0] - operand;

    cpu.flag.c = (difference >= 0);
    cpu.flag.z = (difference == 0);
    cpu.flag.n = (difference < 0);
}
