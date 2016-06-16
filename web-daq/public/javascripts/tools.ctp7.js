function vfat2_reg(oh, vfat2, reg) {
    return 0x64000000 +  ((0x400000 + ((oh & 0xf) << 16) + ((vfat2 & 0xff) << 8) + (reg & 0xff)) << 2);
}


function oh_ei2c_reg(oh, reg) {
    return 0x64000000 +  ((0x401000 + ((oh & 0xf) << 16) + (reg & 0xfff)) << 2);
}

function oh_scan_reg(oh, reg) {
    return 0x64000000 +  ((0x402000 + ((oh & 0xf) << 16) + (reg & 0xff)) << 2);
}

function oh_t1_reg(oh, reg) {
    return 0x64000000 +  ((0x403000 + ((oh & 0xf) << 16) + (reg & 0xff)) << 2);
}

function oh_counter_reg(oh, reg) {
    return 0x64000000 +  ((0x40A000 + ((oh & 0xf) << 16) + (reg & 0xff)) << 2);
}

function oh_system_reg(oh, reg) {
    return 0x64000000 +  ((0x40B000 + ((oh & 0xf) << 16) + (reg & 0xff)) << 2);
}

function oh_stat_reg(oh, reg) {
    return 0x64000000 +  ((0x40C000 + ((oh & 0xf) << 16) + (reg & 0xff)) << 2);
}

function oh_adc_reg(oh, reg) {
    return 0x64000000 +  ((0x408000 + ((oh & 0xf) << 16) + (reg & 0xff)) << 2);
}

function tkdata_reg(oh, reg) {
    return 0x64000000 +  ((0x500000 + ((oh & 0xf) << 16) + (reg & 0xf)) << 2);
}

function glib_counter_reg(reg) {
    return 0x64000000 +  ((0x600000 + (reg & 0xff)) << 2);
}


function popcount(n) {
    n >>>= 0;
    for (var popcnt = 0; n; n &= n - 1) ++popcnt;
    return popcnt;
}
