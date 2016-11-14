#include "gem-event.h"

GEMEvent::~GEMEvent() { 
    for (unsigned int i(0); i < events.size(); ++i) delete events.at(i); 
    events.empty();
};

void GEMEvent::addVFAT2Event(VFAT2Event* e) { events.push_back(e); }

unsigned int GEMEvent::getEventSize() { return events.size(); };

unsigned int GEMEvent::getEventBC() {
    if (events.size() > 0) return events.at(0)->getBC();
    else return 0;
};

unsigned int GEMEvent::getEventEC() {
    if (events.size() > 0) return events.at(0)->getEC();
    else return 0;
};

unsigned int GEMEvent::getEventBX() {
    if (events.size() > 0) return events.at(0)->getBX();
    else return 0;
};

std::vector< VFAT2Event* > GEMEvent::getVFAT2Events() { return events; }

VFAT2Event* GEMEvent::getVFAT2Event(unsigned int i) { 
    if (i < events.size()) return events.at(i); 
    else return nullptr;
};

VFAT2Event* GEMEvent::getVFAT2EventByChipID(uint16_t chipid) { 
    for (unsigned int i(0); i < events.size(); ++i) if (events.at(i)->getChipID() == chipid) return events.at(i);
    return nullptr;
};