class CPU {
    memoryMap: MemoryMap;
    pc: Uint8Array;
    a: Uint8Array;
    x: Uint8Array;
    y: Uint8Array;
    flag: { c: boolean; z: boolean; i: boolean; d: boolean; b: boolean; v: boolean; n: boolean; };

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
    }

    /*
     * This "constructor" can be used for short-hand register assignment in testing.
     * Flags is a bit-field for simplicity. https://www.nesdev.org/wiki/Status_flags
     */
    static newCPUwith(pc: number, a: number, x: number, y: number, flags: number): CPU {
        let c = new CPU();

        c.pc[0] = pc;
        c.a[0] = a;
        c.x[0] = x;
        c.y[0] = y;
        c.flag = {
            c: (flags & 0b0000_0001) != 0,
            z: (flags & 0b0000_0010) != 0,
            i: (flags & 0b0000_0100) != 0,
            d: (flags & 0b0000_1000) != 0,
            b: (flags & 0b0001_0000) != 0,
            v: (flags & 0b0010_0000) != 0,
            n: (flags & 0b0100_0000) != 0
        }

        return c;
    }

    /*
     * Throws a runtime error if other's registers do not match this instance's
     * registers. The MemoryMap and program array are not checked.
     */
    assertEqual(other: CPU) {
        console.assert(this.pc[0] == other.pc[0], `CPU pc register has '${this.pc[0]}', not expected '${other.pc[0]}'`);
        console.assert(this.a[0] == other.a[0], `CPU pc register has '${this.a[0]}', not expected '${other.a[0]}'`);
        console.assert(this.x[0] == other.x[0], `CPU pc register has '${this.x[0]}', not expected '${other.x[0]}'`);
        console.assert(this.y[0] == other.y[0], `CPU pc register has '${this.y[0]}', not expected '${other.y[0]}'`);
        console.assert(this.flag.c == other.flag.c, `CPU flags.c register is ${this.flag.c}, not expected ${other.flag.c}`);
        console.assert(this.flag.z == other.flag.z, `CPU flags.c register is ${this.flag.z}, not expected ${other.flag.z}`);
        console.assert(this.flag.i == other.flag.i, `CPU flags.c register is ${this.flag.i}, not expected ${other.flag.i}`);
        console.assert(this.flag.d == other.flag.d, `CPU flags.c register is ${this.flag.d}, not expected ${other.flag.d}`);
        console.assert(this.flag.v == other.flag.v, `CPU flags.c register is ${this.flag.v}, not expected ${other.flag.v}`);
        console.assert(this.flag.b == other.flag.b, `CPU flags.c register is ${this.flag.b}, not expected ${other.flag.b}`);
        console.assert(this.flag.n == other.flag.n, `CPU flags.c register is ${this.flag.n}, not expected ${other.flag.n}`);
    }

    printRegisters(): void {
        console.log(`CPU STATE:`);
        console.log(`   Program Counter: ${this.pc[0]}`);
        console.log(`   Accumulator: ${this.a}`);
        console.log(`   X Register: ${this.x}`);
        console.log(`   Y Register: ${this.y}`);
        console.log(`   Flags: ${JSON.stringify(this.flag, null, 4)}`);
    }
}

