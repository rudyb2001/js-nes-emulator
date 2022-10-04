#[cfg(test)]
mod bus_testers;

use crate::rom::ROM;

pub struct Bus<'a> {
    ram: [u8; 0x0800],
    prg_rom: &'a Vec<u8>, // either 0x4000 or 0x8000 in size (1 or 2 pages)
}

impl<'a> Bus<'a> {
    pub fn new(rom : &'a ROM) -> Self {
        Bus { 
            ram: [0; 0x0800],
            prg_rom: &rom.prg_rom,
        }
    }

    // returns the byte at the given memory address
    pub fn read_byte(&self, addr: u16) -> u8 {
        match addr {
            0..=0x1FFF => self.ram[(addr % 0x0800) as usize], // RAM
            0x2000..=0x401F => todo!("add support for PPU IO registers"), 
            0x4020..=0x7FFF => panic!("Cannot access Expansion ROM / Save RAM"),
            0x8000..=0xFFFF => self.prg_rom[addr as usize % self.prg_rom.len()], // modulo for mirroring
        }
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
        match addr {
            0..=0x1FFF => self.ram[(addr % 0x0800) as usize] = byte, // RAM
            0x2000..=0x401F => todo!("add support for PPU IO registers"),
            0x4020..=0xFFFF => panic!("Cannot write past address 0x401F!"),
        }
    }

    // writes the given 16-bit word at the given address
    pub fn write_word(&mut self, addr: u16, word: u16) {
        let low_byte = word as u8;
        let high_byte = (word >> 8) as u8;

        self.write_byte(addr, low_byte);
        self.write_byte(addr + 1, high_byte);
    }
}
