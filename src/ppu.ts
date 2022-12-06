/*
 * This class is used by the CPU to access all other machine components
 * (RAM, PPU, ROM, IO, ...) via an address.
 * When the CPU supplies an address, it can be anywhere in the range
 * 0x0000 - 0xFFFF (inclusive), which covers all of those components.
 * (I.E. not all addresses refer to the same device)
 * (we want to abstract address reading so the CPU class can act like
 *  real NES hardware (E.G. in an instruction, we want to be able to use
 *  "read whatever is at address 0xABCD, regardless of what hardware that 
 *  address represents", instead of "read cartdridge[0xABCD - 0x8000]" or 
 *  "read memory[0x31]")).
 * This class can also be used to handle other hardware nuances, like mirroring
 * and mapping.
 */
class PPU {
	memoryMap: MemoryMap;
	program: Uint8Array;

	memAddress: number;
	addrBytesReceived: number;
	status: number;

	constructor() {
		this.memoryMap = new MemoryMap(0xFFFF);
		this.status = 0;
	}

	// putAddressByte
	putAddressByte(byte: number): void {
		if (this.addrBytesReceived == 0 || this.addrBytesReceived == 2) {
			this.addrBytesReceived = 1;
			this.memAddress = byte;
		} else {
			this.addrBytesReceived = 2;
			this.memAddress = this.memAddress * 256 + byte;
		}
	}

	// getData
	getData(): number {
		if (this.addrBytesReceived != 2) {
			throw "ERROR in PPU: trying to get data without having 2 address bytes"
		}
		
		return this.memoryMap.readByte(this.memAddress);
	}

	setData(byte: number): void {
		if (this.addrBytesReceived != 2) {
			throw "ERROR in PPU: trying to write data without having 2 address bytes"
		}

		this.memoryMap.writeByte(this.memAddress, byte);
	}

	getStatus(): number {
		return this.status;
	}

}
