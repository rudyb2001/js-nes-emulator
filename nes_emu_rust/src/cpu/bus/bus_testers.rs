use super::Bus;

#[test]
fn test_read_byte() {
    let mut prg_rom = vec![0; 0x4000];
    prg_rom[0x9876 - 0x8000] = 0xCC;
    prg_rom[0xABCD - 0x8000] = 0xDD;

    let mut b = Bus {
        ram: [0; 0x0800],
        prg_rom: &prg_rom,
    };

    b.ram[0x0000] = 0xAA;
    b.ram[0x07FF] = 0xBB;

    // reading RAM
    assert_eq!(b.read_byte(0x0000), 0xAA);
    assert_eq!(b.read_byte(0x07FF), 0xBB);

    // RAM mirroring
    assert_eq!(b.read_byte(0x07FF + 0x800), 0xBB);
    assert_eq!(b.read_byte(0x0000 + 0x800 * 2), 0xAA);

    // reading prg_rom
    assert_eq!(b.read_byte(0x9876), 0xCC);
    assert_eq!(b.read_byte(0xABCD), 0xDD);

    // prg_rom mirroring
    assert_eq!(b.read_byte(0x9876 + 0x4000), 0xCC);
    assert_eq!(b.read_byte(0xABCD + 0x4000), 0xDD);

    // PPU IO Registers
    todo!("Test reading from PPU / IO Registers");
}

#[test]
#[should_panic]
fn test_read_byte_from_unsupported_address() {
    let prg_rom = vec![0; 0x4000];

    let mut b = Bus {
        ram: [0; 0x0800],
        prg_rom: &prg_rom,
    };

    b.read_byte(0x2000);
}

#[test]
fn test_read_word() {
    let mut prg_rom = vec![0; 0x4000];
    prg_rom[0x0000] = 0x34;
    prg_rom[0x0001] = 0x12;
    prg_rom[0x0002] = 0x56;

    let mut b = Bus {
        ram: [0; 0x0800],
        prg_rom: &prg_rom,
    };

    // reading words from RAM
    b.ram[0x0000] = 0xCD;
    b.ram[0x0001] = 0xAB;
    b.ram[0x0002] = 0xEF;

    assert_eq!(b.read_word(0), 0xABCD);
    assert_eq!(b.read_word(1), 0xEFAB);
    assert_eq!(b.read_word(2), 0x00EF);
    assert_eq!(b.read_word(0x07FF), 0xCD00); // cross-mirror-boundary behavior

    // reading words from ROM
    assert_eq!(b.read_word(0 + 0x8000), 0x1234);
    assert_eq!(b.read_word(1 + 0x8000), 0x5612);
    assert_eq!(b.read_word(2 + 0x8000), 0x0056);
    assert_eq!(b.read_word(0x3FFF + 0x8000), 0x3400); // cross-mirror-boundary behavior

    todo!("Test reading from PPU / IO Registers");
}

#[test]
fn test_write_byte() {
    let mut prg_rom = Vec::new();

    let mut b = Bus {
        ram: [0; 0x0800],
        prg_rom: &prg_rom,
    };

    // writing to RAM
    b.write_byte(0x0123, 0xFE);
    assert_eq!(b.ram[0x0123], 0xFE);
    b.write_byte(0x0801, 0xA1);
    assert_eq!(b.ram[0x0001], 0xA1);

    // verify that no other memory has been changed
    for i in 0..0x0800 {
        if i != 0x0123 && i != 0x0001 {
            assert_eq!(b.ram[i], 0);
        }
    }

    todo!("Test writing to PPU / IO Registers");
}

#[test]
#[should_panic]
fn test_write_byte_to_unsupported_address() {
    let prg_rom = Vec::new();

    let mut b = Bus {
        ram: [0; 0x0800],
        prg_rom: &prg_rom,
    };

    b.write_byte(0x4020, 0xFF);
}

#[test]
#[should_panic]
fn test_write_byte_to_rom() {
    let prg_rom = Vec::new();

    let mut b = Bus {
        ram: [0; 0x0800],
        prg_rom: &prg_rom,
    };

    b.write_byte(0xFFFF, 0xFF);
}

#[test]
fn test_write_word() {
    let prg_rom = Vec::new();

    let mut b = Bus {
        ram: [0; 0x0800],
        prg_rom: &prg_rom,
    };

    // writing to RAM
    b.write_word(0x04DD, 0x1234); // regular
    assert_eq!(b.ram[0x04DD], 0x34);
    assert_eq!(b.ram[0x04DE], 0x12);

    b.write_word(0x07FF, 0xABCD); // mirroring
    assert_eq!(b.ram[0], 0xAB);
    assert_eq!(b.ram[0x07FF], 0xCD);

    // verify that no other memory has been changed
    for i in 0..0x0800 {
        match i {
            0x04DD..=0x04DE => (),
            0 => (),
            0x07FF => (),
            _ => assert_eq!(b.ram[i], 0x00),
        }
    }

    todo!("Test writing to PPU / IO Registers");
}
