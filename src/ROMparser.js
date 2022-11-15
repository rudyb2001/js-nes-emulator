function parseROM(array) {
    //const array = this.array;
    // Check if file is ROM file
    //const neschars = array.slice(0, 4);
    if (array[0] !== 0x4E || array[1] !== 0x45 || array[2] !== 0x53 || array[3] !== 0x1A) {
        console.error(`File is not ROM file, ${array.slice(0, 4)} is not ${[0x4E, 0x45, 0x53, 0x1A]}`);
        return;
    }

    let num16kbPrgRomBanks = array[4];
    let num8kbChrRomBanks = array[5];
    let controlByte1 = array[6];
    let controlByte2 = array[7];

    let mirroring;

    if (controlByte1 & 1) {
        mirroring = 'VERTICAL';
    } else {
        mirroring = 'HORIZONTAL';
    }

    let batteryBackedRam = !!(controlByte1 & (1<<1));

    let trainer = !!(controlByte1 & (1<<2));

    if (controlByte1 & (1<<3)) {
        mirroring = 'FOUR_SCREEN';
    }

    let mapperType = controlByte1 >> 4;
    mapperType += controlByte2 & 0xF0;

    let iNesVersion;

    if ((controlByte2 & 0x0F) == 0) {
        iNesVersion = 1;
    } else {
        iNesVersion = 2;
    }

    //this.prgRamSize8kbUnits = array[8]   // array[8]
    let prgRamSize8kbUnits = array[8];

    console.log(`Number of 16 kb PRG ROM banks: ${num16kbPrgRomBanks}`);
    console.log(`Number of 8 kb CHR ROM banks: ${num8kbChrRomBanks}`);
    console.log(`Mirroring type: ${mirroring}`);
    console.log(`Contains battery backed RAM: ${batteryBackedRam}`);
    console.log(`512 bytes of trainer: ${trainer}`);
    console.log(`Mapper type: ${mapperType}`);
    console.log(`iNES version: ${iNesVersion}`);
    console.log(`PRG ROM Size: ${prgRamSize8kbUnits}`);

    // Now get PRG ROM slice
    let PRGROMstart = 0x10;
    if (trainer) {
        PRGROMstart += 0x200;
    }
    let PRGROMsize = num16kbPrgRomBanks * 16 * Math.pow(2, 10);
    let CHRROMstart = PRGROMstart + PRGROMsize;
    let CHRROMsize = num8kbChrRomBanks * 8 * Math.pow(2, 10);

    console.log(`PRG ROM start ${PRGROMstart} of size ${PRGROMsize}`);
    console.log(`CHR ROM start ${CHRROMstart} of size ${CHRROMsize}`);

    return {num16kbPrgRomBanks, num8kbChrRomBanks, mirroring, batteryBackedRam,
        trainer, mapperType, iNesVersion, prgRamSize8kbUnits,
        PRGROMstart, PRGROMsize, CHRROMstart, CHRROMsize}
}

export { parseROM };