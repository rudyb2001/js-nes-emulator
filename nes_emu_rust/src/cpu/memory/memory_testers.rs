use super::MemoryMap;

#[test]
fn test_read_byte() {
    let mut mm = MemoryMap::new();
    mm.map[0x0000] = 0xAA;
    mm.map[0xABAB] = 0xBB;
    mm.map[0xFFFE] = 0xCC;

    assert!(mm.read_byte(0x0000) == 0xAA);
    assert!(mm.read_byte(0xABAB) == 0xBB);
    assert!(mm.read_byte(0xFFFE) == 0xCC);
}

#[test]
fn test_read_word() {
    let mut mm = MemoryMap::new();
    mm.map[0x0000] = 0xCD;
    mm.map[0x0001] = 0xAB;
    mm.map[0x0002] = 0xEF;

    assert!(mm.read_word(0) == 0xABCD);
    assert!(mm.read_word(1) == 0xEFAB);
    assert!(mm.read_word(2) == 0x00EF);
}

#[test]
fn test_write_byte() {
    let mut mm = MemoryMap::new();
    mm.write_byte(0xDDDD, 0xFE);

    assert!(mm.map[0xDDDD] == 0xFE);

    // verify that no other memory has been changed
    for i in 0..0xFFFF {
        if i != 0xDDDD {
            assert!(mm.map[i] == 0);
        }
    }
}

#[test]
fn test_write_word() {
    let mut mm = MemoryMap::new();
    mm.write_word(0xCCCC, 0xABCD);

    assert!(mm.map[0xCCCC] == 0xCD && mm.map[0xCCCD] == 0xAB);

    // verify that that no other memory has been changed
    for i in 0..0xFFFF {
        if i < 0xCCCC || i > 0xCCCD {
            assert!(mm.map[i] == 0);
        }
    }
}

#[test]
fn test_load_program() {
    let program = vec![0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF];
    let mut mm = MemoryMap::new();
    mm.load_program(program.clone());

    for i in 0..0xFFFF {
        if i >= 0x8000 && i < 0x8000 + program.len() { // should be program data
            assert!(mm.map[i] == program[i - 0x8000]);
        } else { // should be 0x00
            assert!(mm.map[i] == 0);
        }
    }
}

#[test]
#[should_panic]
fn test_load_program_too_large() {
    let program = vec![0xA1; 0xFFFF - 0x8000 + 1];
    let mut mm = MemoryMap::new();
    mm.load_program(program);
}
