class CPU {
    memoryMap: MemoryMap;
    pc: Uint8Array;
    a: Uint8Array;
    x: Uint8Array;
    y: Uint8Array;
    s: Uint8Array;
    flag: { c: boolean; z: boolean; i: boolean; d: boolean; b: boolean; v: boolean; n: boolean; };

    constructor() {
        this.memoryMap = new MemoryMap();
        this.pc = new Uint16Array(1);
        this.a = new Uint8Array(1);
        this.x = new Uint8Array(1);
        this.y = new Uint8Array(1);
        this.s = new Uint8Array(1); // stack pointer (stack is at 0x100 - 0x1FF, it grows downwards in memory, I.E. 0x1FF is bottom)
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
    static newCPUwith(pc: number, a: number, x: number, y: number, s: number, flags: number): CPU {
        let c = new CPU();

        c.pc[0] = pc;
        c.a[0] = a;
        c.x[0] = x;
        c.y[0] = y;
        c.s[0] = s;
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
        console.assert(this.pc[0] == other.pc[0],   new Error(`CPU pc register has '${toHex(this.pc[0])}', not expected '${toHex(other.pc[0])}'`).stack);
        console.assert(this.a[0] == other.a[0],     new Error(`CPU a register has '${toHex(this.a[0])}', not expected '${toHex(other.a[0])}'`).stack);
        console.assert(this.x[0] == other.x[0],     new Error(`CPU x register has '${toHex(this.x[0])}', not expected '${toHex(other.x[0])}'`).stack);
        console.assert(this.y[0] == other.y[0],     new Error(`CPU y register has '${toHex(this.y[0])}', not expected '${toHex(other.y[0])}'`).stack);
        console.assert(this.s[0] == other.s[0],     new Error(`CPU s register has '${toHex(this.s[0])}', not expected '${toHex(other.s[0])}'`).stack);
        console.assert(this.flag.c == other.flag.c, new Error(`CPU flags.c register is ${this.flag.c}, not expected ${other.flag.c}`).stack);
        console.assert(this.flag.z == other.flag.z, new Error(`CPU flags.z register is ${this.flag.z}, not expected ${other.flag.z}`).stack);
        console.assert(this.flag.i == other.flag.i, new Error(`CPU flags.i register is ${this.flag.i}, not expected ${other.flag.i}`).stack);
        console.assert(this.flag.d == other.flag.d, new Error(`CPU flags.d register is ${this.flag.d}, not expected ${other.flag.d}`).stack);
        console.assert(this.flag.v == other.flag.v, new Error(`CPU flags.v register is ${this.flag.v}, not expected ${other.flag.v}`).stack);
        console.assert(this.flag.b == other.flag.b, new Error(`CPU flags.b register is ${this.flag.b}, not expected ${other.flag.b}`).stack);
        console.assert(this.flag.n == other.flag.n, new Error(`CPU flags.n register is ${this.flag.n}, not expected ${other.flag.n}`).stack);
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

