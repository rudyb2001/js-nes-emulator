#[cfg(test)]
mod tests {
    #[test]
    fn test() {
        let memory = MemoryMap {
            map = [0; 0xFFFF];
        }
        let cpu = CPU::new(memory);
        cpu.memory.write_byte(0x0000, 8);
        let addr = cpu.get_operand_address(AddressingMode::Immediate);
        assert!(addr == 0x0000);
    }
}