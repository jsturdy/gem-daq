#include "vfat2-event.h"

const unsigned int mapping[] = { 48, 67, 47, 64, 49, 68, 46, 65, 50, 69, 45, 66, 51, 70, 44, 63, 52, 71, 43, 62, 53, 72, 42, 61, 54, 73, 41, 60, 55, 74, 40, 59, 56, 75, 39, 58, 89, 76, 38, 57, 90, 77, 37, 88, 91, 78, 36, 87, 92, 79, 35, 86, 93, 80, 34, 85, 94, 81, 33, 84, 95, 82, 32, 83, 96, 110, 31, 109, 97, 111, 30, 108, 98, 112, 29, 107, 99, 113, 28, 106, 100, 114, 27, 105, 101, 115, 26, 104, 102, 116, 25, 103, 7, 117, 24, 6, 8, 118, 23, 5, 9, 119, 22, 4, 10, 120, 21, 3, 11, 121, 20, 2, 12, 122, 19, 1, 13, 123, 18, 126, 14, 124, 17, 0, 15, 125, 16, 127 };

VFAT2Event::VFAT2Event(uint16_t _bc, uint16_t _ec, uint16_t _chipID, uint64_t _lsbData, uint64_t _msbData, uint32_t _bx, uint16_t _crc) : bc(_bc), ec(_ec), chipID(_chipID), lsbData(_lsbData), msbData(_msbData), bx(_bx), crc(_crc), performedComputation(false), clusterMultiplicity(0) { }

uint16_t VFAT2Event::getBC() { return (bc & 0xfff); }

uint16_t VFAT2Event::getEC() { return ((ec >> 4) & 0xff); }

uint16_t VFAT2Event::getFlags() { return (ec & 0xf); }

uint16_t VFAT2Event::getChipID() { return (chipID & 0xfff); }

uint64_t VFAT2Event::getLSB() { return lsbData; }

uint64_t VFAT2Event::getMSB() { return msbData; }

uint32_t VFAT2Event::getBX() { return bx; }

uint16_t VFAT2Event::getCRC() { return crc; }

bool* VFAT2Event::getStripsArray() { 
    if (!performedComputation) performComputation();
    return strips; 
}

unsigned int VFAT2Event::getClusterMultiplicity() { 
    if (!performedComputation) performComputation();
    return clusterMultiplicity; 
}

std::vector< unsigned int > VFAT2Event::getClusterSizes() { 
    if (!performedComputation) performComputation();
    return clusterSizes; 
}

std::vector< double > VFAT2Event::getClusterPositions() {
    if (!performedComputation) performComputation();
    return clusterPositions; 
}

bool VFAT2Event::checkCRC() {
    uint16_t crcData[] = { 
        bc,
        ec, 
        chipID, 
        uint16_t((msbData >> 48) & 0xffff), 
        uint16_t((msbData >> 32) & 0xffff), 
        uint16_t((msbData >> 16) & 0xffff), 
        uint16_t(msbData & 0xffff), 
        uint16_t((lsbData >> 48) & 0xffff), 
        uint16_t((lsbData >> 32) & 0xffff), 
        uint16_t((lsbData >> 16) & 0xffff), 
        uint16_t(lsbData & 0xffff)
    };
    uint16_t crc2(0xffff);
    for (unsigned int j(0); j < 11; ++j) {
        for (unsigned int i(0); i < 16; ++i) {
            if ((crc2 & 0x1) == ((crcData[j] >> i) & 0x1)) crc2 >>= 1;
            else crc2 = (crc2 >> 1) ^ 0x8408;
        }            
    }
    return (crc == crc2);
}

void VFAT2Event::performComputation() {
    for (unsigned int i(0); i < 128; ++i) strips[i] = false;
    for (unsigned int i(0); i < 64; ++i) {
        if (((lsbData >> i) & 0x1) == 0x1) strips[mapping[i]] = true;
        if (((msbData >> i) & 0x1) == 0x1) strips[mapping[i + 64]] = true;
    }
    unsigned int cs(0);
    double cpos(0.);
    for (unsigned int i(0); i < 128; ++i) {
        if (strips[i]) {
            ++cs;
            cpos += i;
        }
        else if (cs) {
            clusterSizes.push_back(cs);
            clusterPositions.push_back(cpos / (double) cs);
            ++clusterMultiplicity;
            cs = 0;
            cpos = 0.;
        }
    }
    if (cs) {
        clusterSizes.push_back(cs);    
        clusterPositions.push_back(cpos / (double) cs);
        ++clusterMultiplicity;
    }
    performedComputation = true;    
}