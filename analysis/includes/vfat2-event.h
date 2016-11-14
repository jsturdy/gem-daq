#ifndef __VFAT2_EVENT_H__
#define __VFAT2_EVENT_H__

#include <vector>
#include <cstdint>

class VFAT2Event {

public:
    VFAT2Event(uint16_t, uint16_t, uint16_t, uint64_t, uint64_t, uint32_t, uint16_t);

    uint16_t getBC();
    uint16_t getEC();
    uint16_t getFlags();
    uint16_t getChipID();
    uint64_t getLSB();
    uint64_t getMSB();
    uint32_t getBX();
    uint16_t getCRC();

    bool* getStripsArray();
    unsigned int getClusterMultiplicity();
    std::vector< unsigned int > getClusterSizes();
    std::vector< double > getClusterPositions();

    bool checkCRC();

private:
    void performComputation();

    uint16_t bc;
    uint16_t ec;
    uint16_t chipID;
    uint64_t lsbData;
    uint64_t msbData;
    uint32_t bx;
    uint16_t crc;

    bool performedComputation;
    bool strips[128];
    unsigned int clusterMultiplicity;
    std::vector< unsigned int > clusterSizes;
    std::vector< double > clusterPositions;

};  

#endif