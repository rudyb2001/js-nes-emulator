struct CPU {

    //TODO: DETERMINE WHETHER MEMORY SLOTS HAVE 8 OR 16 BITS
    program: Vec<u8>, 
    memory: Vec<u8>,

    pc: u16,
    accumulator: u8,
    x: u8,
    y: u8,
    stack_ptr: u8,

    c: bool,
    z: bool,
    i: bool,
    d: bool,
    v: bool,
    n: bool,
    
    // B flag https://www.nesdev.org/wiki/Status_flags#The_B_flag
    b_1: bool, 
    b_2: bool
}

impl CPU {
    fn get_instruction(&self, index: usize) -> Option<u8> {
        match self.program.get(index) {
            Some(a) => Some(*a),
            None => None
        }
    }

    fn process_instruction(instruction: Vec<u8>) {
        match instruction {
            _ => todo!()
        }
    }
}

