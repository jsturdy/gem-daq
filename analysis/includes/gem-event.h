#ifndef __GEM_EVENT_H__
#define __GEM_EVENT_H__

#include <vector>

#include "vfat2-event.h"

class GEMEvent {

public:
    ~GEMEvent();

    void addVFAT2Event(VFAT2Event*);

    unsigned int getEventSize();

    unsigned int getEventBC();
    unsigned int getEventEC();
    unsigned int getEventBX();

    std::vector< VFAT2Event* > getVFAT2Events();
    VFAT2Event* getVFAT2Event(unsigned int);
    VFAT2Event* getVFAT2EventByChipID(uint16_t);

private:
    std::vector< VFAT2Event* > events;

};

#endif

