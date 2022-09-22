class cpu {
    constructor() {
        this.accumulator = 0;
        this.x = 0;
        this.y = 0;
        this.flags = {
            c: 0,
            z: 0,
            i: 0,
            d: 0,
            b: 0,
            v: 0,
            n: 0
        }
    }
}