mod memory;

use memory::MemoryMap;

#[derive(Debug)]
#[allow(non_camel_case_types)]
pub enum AddressingMode {
    Immediate,
    ZeroPage,
    ZeroPageX,
    ZeroPageY,
    Absolute,
    AbsoluteX,
    AbsoluteY,
    IndirectX,
    IndirectY,
    NoneAddressing,
}

struct CPU {
    memory: MemoryMap,

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
    fn new(memory: MemoryMap) -> CPU {
        CPU {
            memory,
            pc: 0,
            accumulator: 0,
            x: 0,
            y: 0,
            stack_ptr: 0,
            c: false,
            z: true,
            i: false,
            d: false,
            v: false,
            n: false,
            b_1: false,
            b_2: false,
        }
    }
    fn get_instruction(&self, index: u16) -> u8 {
        self.memory.read_byte(index)
    }

    fn process_instruction(instruction: u8) {
        match instruction {
            _ => todo!()
        }
    }

    // Return the address of the instruction operand
    fn get_operand_address(&self, mode: &AddressingMode) -> u16 {
        match mode {
            // Immediate: value is in executable memory, program counter pointing to it
            AddressingMode::Immediate => self.pc,

            // ZeroPage: memory access in 1st page of memory for speed
            AddressingMode::ZeroPage => self.memory.read_byte(self.pc) as u16,

            // Absolute: instruction param is a pointer to a memory address
            AddressingMode::Absolute => self.memory.read_word(self.pc),

            // ZeroPage but add contents of register x (iteration purposes)
            AddressingMode::ZeroPageX => {
                let pos = self.memory.read_byte(self.pc);
                let addr = pos.wrapping_add(self.x);
                addr as u16
            }

            // ZeroPageX but with register y
            AddressingMode::ZeroPageY => {
                let pos = self.memory.read_byte(self.pc);
                let addr = pos.wrapping_add(self.y);
                addr as u16
            }

            // Absolute mode but att contents of register x
            AddressingMode::AbsoluteX => {
                let base = self.memory.read_word(self.pc);
                let addr = base.wrapping_add(self.x as u16);
                addr as u16
            }

            // AbsoluteX but with register x
            AddressingMode::AbsoluteY => {
                let base = self.memory.read_word(self.pc);
                let addr = base.wrapping_add(self.y as u16);
                addr as u16
            }

            // IndirectX: One more pointer than absolute (uses register x)
            AddressingMode::IndirectX => {
                let base = self.memory.read_byte(self.pc);
                let ptr = base.wrapping_add(self.x);
                self.memory.read_word(ptr as u16)
            }

            // IndirectY: Indirect except with register y
            AddressingMode::IndirectY => {
                let base = self.memory.read_byte(self.pc);
                let ptr = base.wrapping_add(self.x);
                self.memory.read_word(ptr as u16)
            }

            AddressingMode::NoneAddressing => {
                panic!("mode {:?} is not supported", mode);
            }
        }
    }

    fn lda(&mut self, mode: &AddressingMode) {
        let addr = self.get_operand_address(mode);
        let value = self.memory.read_byte(addr);

        self.accumulator = value;
        self.n = (value as i8) < 0;
        self.z = value == 0;
    }
}

