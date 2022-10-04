mod bus;

use bus::Bus;

struct CPU<'a> {
    bus: Bus<'a>, // the bus is used as an abstraction of all interaction between the CPU and other components
              // thus the bus encapsulates all other components, like the PPU

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

impl<'a> CPU<'a> {
    fn get_instruction(&self, index: u16) -> u8 {
        self.bus.read_byte(index)
    }

    fn process_instruction(instruction: u8) {
        match instruction {
            _ => todo!()
        }
    }
}

