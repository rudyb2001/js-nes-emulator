class CPU {
    constructor() {
        this.program = [];
        this.memory = [];   // May make this it's own class

        this.pc = 0;
        this.a = new Uint8Array(1);
        this.x = new Uint8Array(1);
        this.y = new Uint8Array(1);
        this.flag = {
            c: false,
            z: false,
            i: false,
            d: false,
            b: false,
            v: false,
            n: false,
        }
        this.opcodes = {
            // ADC - Add with carry
            "69": this.adc,     // Immediate
            "65": this.adc,     // Zero Page
            "75": this.adc,     // Zero Page x
            "6d": this.adc,     // Absolute
            "7d": this.adc,     // Absolute x
            "79": this.adc,     // Absolute y
            "61": this.adc,     // Indirect x
            "71": this.adc,     // Indirect y
        }
    }

    loadProgram(program) {
        this.program = program;
    }

    getInstruction(i) {
        if (this.program.length == 0) {
            return null;
        }
        if (i >= this.program.length) {
            return null;
        }
        return this.program[i];
    }

    printRegisters() {
        console.log(`Program Counter: ${this.pc}`);
        console.log(`Accumulator: ${this.a}`);
        console.log(`X Register: ${this.x}`);
        console.log(`Y Register: ${this.y}`);
        console.log(`Flags: ${JSON.stringify(this.flag, null, 4)}`);
        //console.log(JSON.stringify(this.flag));
    }

    // Check if number is beyond bounds of 8-bit integer range
    isOverflow(num) {
        return (num > 127 || num < -128);
    }

    // Returns least significant 8 bits from number
    shrink8bit(num) {
        // Shift last byte up 3 bytes, removing all information past that
        // Shift back down, only last bytes remaining (sign extended)
        return (num << 24) >> 24;
    }

    // Add with carry
    // TODO - Finish instruction for all addressing modes
    adc(opcode) {
        console.log(`ADC Opcode = ${opcode}`);
        if (opcode === "69") {  // Immediate
            //Get imm value
            this.pc += 1;
            let imm = parseInt(this.getInstruction(this.pc));
            console.log(`Imm = ${imm}`);

            // Add imm + carry to accumulator
            console.log(`Acc = ${this.a[0]}`);
            console.log(`c = ${+this.flag.c}`);
            console.log(`Sum = ${imm + +this.flag.c}`);
            this.a[0] += imm + +this.flag.c;           // Cast boolean to int
            this.flag.z = this.a[0] === 0;

            console.log(`Acc = ${this.a[0]}`);
        }
    }
}

//export default class { cpu };
module.exports = CPU;