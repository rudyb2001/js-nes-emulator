#[cfg(test)]
mod memory_testers;

pub struct MemoryMap {
    map: [u8; 0xFFFF],
}

impl MemoryMap {
    pub fn new() -> Self {
        MemoryMap { map: [0; 0xFFFF] }
    }

    // returns the byte at the given memory address
    pub fn read_byte(&self, addr: u16) -> u8 {
        self.map[addr as usize]
    }

    // returns the 16-bit word at the given memory address
    pub fn read_word(&self, addr: u16) -> u16 {
        // convert the byte at addr from little endian
        let low_byte = self.read_byte(addr) as u16;
        let high_byte = self.read_byte(addr + 1) as u16;

        (high_byte << 8) | low_byte
    }

    // writes the given byte at the given address
    pub fn write_byte(&mut self, addr: u16, byte: u8) {
        self.map[addr as usize] = byte;
    }

    // writes the given 16-bit word at the given address
    pub fn write_word(&mut self, addr: u16, word: u16) {
        let low_byte = word as u8;
        let high_byte = (word >> 8) as u8;

        self.write_byte(addr, low_byte);
        self.write_byte(addr + 1, high_byte);
    }

    // loads program into the program area of memory
    pub fn load_program(&mut self, program: Vec<u8>) {
        self.map[0x8000 .. (0x8000 + program.len())].copy_from_slice(&program[..]);
    }
}
