# js-nes-emulator
## Description
The goal of this project is to create an NES emulator website where people can load in ROM files and play them directly through their browser. This involves emulating an NES console CPU to read raw assembly bits as opcodes and translate them into JS instructions.

I am following most of [this website](https://bugzmanov.github.io/nes_ebook/chapter_3_4.html) for building the emulation part of the website.

## Plan
1. Create base website with file loader
2. Create a working JavaScript Opcode reader (official opcodes)
3. Create the bus and cartridge reader (unofficial opcodes)
4. Emulate the PPU display

## Resources
### NES guides
[Rust emulator guide](https://bugzmanov.github.io/nes_ebook/chapter_3_4.html)
[JavaScript Web Emulator](https://jsnes.org/)
[GitHub code](https://github.com/bfirsh/jsnes)
[Blog post overview](https://www.middle-engine.com/blog/posts/2020/06/22/programming-the-nes-the-nes-in-overview)
[Blog post MOS 6502 CPU](https://www.middle-engine.com/blog/posts/2020/06/23/programming-the-nes-the-6502-in-detail)
[MOS 650X Programming Manual](http://archive.6502.org/books/mcs6500_family_programming_manual.pdf)
[Cool YouTube channel about NES architecture](https://www.youtube.com/c/NesHacker)

### Web development
[The Odin Project](https://www.theodinproject.com/)

## Extra tidbits
While we don't need to know exactly how NES games need to be structured for this project, it might be an interesting aside to look at how NES games are structured and how to build them.

The original guide for this project is written entirely in Rust. It might be interesting to develop this project in Rust as well, purely for the ability to learn Rust, but this is a pretty complex project so I think that sticking to something easier like JS would allow us to add greater functionality while providing easier access to the project.

## Website
TODO - Create decent website with HTML/CSS
TODO - Create file uploading mechanism

## Opcode Reader
TODO - Create CPU object with registers and callable functions
TODO - Emulate all official opcodes

## Cartridge Reader
TODO - Create ROM parser
TODO - Emulate unofficial opcodes

## PPU Display
No idea
