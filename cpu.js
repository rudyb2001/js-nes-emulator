class CPU {
    constructor() {
        this.memoryMap = new MemoryMap();

        this.pc = new Uint16Array(1);
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

    printRegisters() {
        console.log(`Program Counter: ${this.pc[0]}`);
        console.log(`Accumulator: ${this.a}`);
        console.log(`X Register: ${this.x}`);
        console.log(`Y Register: ${this.y}`);
        console.log(`Flags: ${JSON.stringify(this.flag, null, 4)}`);
        //console.log(JSON.stringify(this.flag));
    }

    // Add with carry
    // TODO - Finish instruction for all addressing modes
    adc(opcode) {
        console.log(`ADC Opcode = ${opcode}`);
        if (opcode === "69") {  // Immediate
            this.pc[0] += 1; // skip over instruction
            let imm = memoryMap.readByte(this.pc[0]);
            this.pc[0] += 1; // done reading imm arg
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
//module.exports = CPU;
