#ifndef __DAT_READER_H__
#define __DAT_READER_H__

#include <fstream>

#include "gem-event.h"

class DatReader {

public:
    DatReader(const char*);

    bool isValid();

    GEMEvent* getGEMEvent();

private:
    std::ifstream file;

};


#endif