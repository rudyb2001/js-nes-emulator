pub struct ROM {
    pub prg_rom: Vec<u8>,
    pub chr_rom: Vec<u8>,
    pub mapper: u8,
    pub mirroring_type: MirroringType,
}

pub enum MirroringType {
    VERTICAL,
    HORIZONTAL,
    FOUR_SCREEN,
}

impl ROM {
    pub fn new(raw_cartridge: Vec<u8>) -> Self {
        todo!("Implement ROM parsing");
    }
}
