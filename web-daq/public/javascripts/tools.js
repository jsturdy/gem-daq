function vfat2_reg(oh, vfat2, reg) { return 0x40000000 + ((oh & 0xf) << 20) + ((vfat2 & 0xff) << 8) + (reg & 0xff); }


function oh_ei2c_reg(oh, reg) { return 0x41000000 + ((oh & 0xf) << 20) + (reg & 0xfff); }

function oh_scan_reg(oh, reg) { return 0x42000000 + ((oh & 0xf) << 20) + (reg & 0xff); }

function oh_t1_reg(oh, reg) { return 0x43000000 + ((oh & 0xf) << 20) + (reg & 0xff); }

function oh_counter_reg(oh, reg) { return 0x4A000000 + ((oh & 0xf) << 20) + (reg & 0xff); }

function oh_system_reg(oh, reg) { return 0x4B000000 + ((oh & 0xf) << 20) + (reg & 0xff); }

function oh_stat_reg(oh, reg) { return 0x4C000000 + ((oh & 0xf) << 20) + (reg & 0xff); }

function oh_adc_reg(oh, reg) { return 0x48000000 + ((oh & 0xf) << 20) + (reg & 0xff); }

function oh_ultra_reg(oh, reg) { return 0x4D000000 + ((oh & 0xf) << 20) + (reg & 0xff); }

function tkdata_reg(oh, reg) { return 0x50000000 + ((oh & 0xf) << 20) + (reg & 0xf); }

function glib_counter_reg(reg) { return 0x60000000 + (reg & 0xff); }


function popcount(n) {
    n >>>= 0;
    for (var popcnt = 0; n; n &= n - 1) ++popcnt;
    return popcnt;
}
