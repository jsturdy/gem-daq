#include <cstdint>

#include "dat-reader.h"

DatReader::DatReader(const char* path) { file.open(path, std::ios::in | std::ios::binary); }

bool DatReader::isValid() { return !(file.eof() || !file.good()); };

GEMEvent* DatReader::getGEMEvent() {
    uint64_t gemHeader1;
    uint64_t gemHeader2; 
    uint64_t gemHeader3;
    uint64_t gebHeader;
    uint64_t gebRunHeader;
    uint64_t gebTrailer;
    uint64_t gemTrailer1;
    uint64_t gemTrailer2;

    uint16_t vfat2BC;
    uint16_t vfat2EC;
    uint16_t vfat2ChipID;
    uint64_t vfat2LSBData;
    uint64_t vfat2MSBData;
    uint32_t vfat2BX;
    uint16_t vfat2CRC;

    GEMEvent* gemEvent(new GEMEvent());

    file >> std::hex >> gemHeader1;
    file >> std::hex >> gemHeader2;
    file >> std::hex >> gemHeader3;
    file >> std::hex >> gebHeader;        
    file >> std::hex >> gebRunHeader;

    for (unsigned int i(0); i < (0xfffffff & gebHeader); ++i) {
        file >> std::hex >> vfat2BC;
        file >> std::hex >> vfat2EC;
        file >> std::hex >> vfat2ChipID;
        file >> std::hex >> vfat2LSBData;
        file >> std::hex >> vfat2MSBData;
        file >> std::hex >> vfat2BX;
        file >> std::hex >> vfat2CRC;

        gemEvent->addVFAT2Event(new VFAT2Event(vfat2BC, vfat2EC, vfat2ChipID, vfat2LSBData, vfat2MSBData, vfat2BX, vfat2CRC));
    }

    file >> std::hex >> gebTrailer;
    file >> std::hex >> gemTrailer1;
    file >> std::hex >> gemTrailer2;

    return gemEvent;
}