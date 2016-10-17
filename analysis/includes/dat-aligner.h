#ifndef __DAT_ALIGNER_H__
#define __DAT_ALIGNER_H__

#include <utility>
#include <vector>

#include "dat-reader.h"
#include "gem-event.h"

class DatAligner {

public:
    DatAligner(const char*, const char*);
    ~DatAligner();

    bool isValid();

    std::pair< GEMEvent*, GEMEvent* > getSetupEvent();


private:
    void shiftGTX0();
    void shiftGTX1();

    bool checkDelta(unsigned int, unsigned int);

    DatReader* fileGTX0;
    DatReader* fileGTX1;

    std::vector< GEMEvent* > eventsGTX0;
    std::vector< GEMEvent* > eventsGTX1;

};

#endif 