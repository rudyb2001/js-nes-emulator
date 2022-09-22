class cpu {
    constructor() {
        this.program = [];
        this.memory = [];   // May make this it's own class

        this.pc = 0;
        this.accumulator = 0;
        this.x = 0;
        this.y = 0;
        this.flag = {
            c: false,
            z: false,
            i: false,
            d: false,
            b: false,
            v: false,
            n: false
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

    getInstruction(i) {
        if (this.program.length == 0) {
            return null;
        }
        if (i >= this.program.length) {
            return null;
        }
        return this.program[i];
    }

    // Check if number is beyond bounds of 8-bit integer range
    isOverflow(num) {
        return (num > 127 || num < -128);
    }

    // Returns least significant 8 bits from number
    shrink8bit(num) {
        // Shift last byte up 3 bytes, removing all information past that
        // Shift back down, only last bytes remaining (sign extended)
        return num << 24 >> 24;
    }

    // Add with carry
    // TODO - Finish instruction for all addressing modes
    adc(opcode) {
        if (opcode === "69") {  // Immediate
            //Get imm value
            this.pc += 1;
            let imm = getInstruction(this.pc);

            // Add imm + carry to accumulator
            this.a += imm + this.flag.c;
            this.flag.c = this.isOverflow(this.a);   // Cast boolean to int
            this.flag.z = this.a === 0;
            this.a = this.shrink8bit(this.a);
        }
    }
}