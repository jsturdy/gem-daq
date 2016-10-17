// #include <iostream>

#include "dat-aligner.h"

DatAligner::DatAligner(const char* pathGTX0, const char* pathGTX1) {
    fileGTX0 = new DatReader(pathGTX0);
    fileGTX1 = new DatReader(pathGTX1);
    for (unsigned int i(0); i < 6; ++i) eventsGTX0.push_back(fileGTX0->getGEMEvent());
    for (unsigned int i(0); i < 6; ++i) eventsGTX1.push_back(fileGTX1->getGEMEvent());
};

DatAligner::~DatAligner() {
    for (unsigned int i(0); i < eventsGTX0.size(); ++i) delete eventsGTX0.at(i);
    for (unsigned int i(0); i < eventsGTX1.size(); ++i) delete eventsGTX1.at(i);
    eventsGTX0.empty();
    eventsGTX1.empty();
};

bool DatAligner::isValid() { return (fileGTX0->isValid() && fileGTX1->isValid()); };

std::pair< GEMEvent*, GEMEvent* > DatAligner::getSetupEvent() {
    GEMEvent* foundGTX0;
    GEMEvent* foundGTX1;

    unsigned int deltaBC0[5];
    unsigned int deltaBC1[5];

    for (unsigned int i(0); i < 5; ++i) {
        unsigned int a(eventsGTX0.at(i)->getEventBC());
        unsigned int b(eventsGTX0.at(i + 1)->getEventBC());
        if (a <= b) deltaBC0[i] = b - a;
        else deltaBC0[i] = 3563 - b + a;
    }

    for (unsigned int i(0); i < 5; ++i) {
        unsigned int a(eventsGTX1.at(i)->getEventBC());
        unsigned int b(eventsGTX1.at(i + 1)->getEventBC());
        if (a <= b) deltaBC1[i] = b - a;
        else deltaBC1[i] = 3563 - b + a;
    }

    // Both streams are well aligned
    if (checkDelta(deltaBC0[2], deltaBC1[2])) { 
        foundGTX0 = eventsGTX0.at(2);
        foundGTX1 = eventsGTX1.at(2);
        shiftGTX0();
        shiftGTX1();
        // std::cout << "Aligned" << std::endl;
    }
    // 0 is in advance by 1
    else if (checkDelta(deltaBC0[2], deltaBC1[1])) { 
        foundGTX0 = eventsGTX0.at(2);
        foundGTX1 = eventsGTX1.at(1);
        shiftGTX0();
        // std::cout << "0 is in advance by 1" << std::endl;
    }
    // 0 is in advance by 2
    else if (checkDelta(deltaBC0[2], deltaBC1[0])) { 
        foundGTX0 = eventsGTX0.at(2);
        foundGTX1 = eventsGTX1.at(0);
        shiftGTX0();
        shiftGTX0();
        // std::cout << "0 is in advance by 2" << std::endl;
    }
    // 1 is in advance by 1
    else if (checkDelta(deltaBC0[2], deltaBC1[3])) { 
        foundGTX0 = eventsGTX0.at(2);
        foundGTX1 = eventsGTX1.at(3);
        shiftGTX0();
        shiftGTX1();
        shiftGTX1();
        // std::cout << "1 is in advance by 1" << std::endl;
    }
    // 1 is in advance by 2 
    else if (checkDelta(deltaBC0[2], deltaBC1[4])) { 
        foundGTX0 = eventsGTX0.at(2);
        foundGTX1 = eventsGTX1.at(4);
        shiftGTX0();
        shiftGTX1();
        shiftGTX1();
        shiftGTX1();
        // std::cout << "1 is in advance by 2" << std::endl;
    }
    else {
        foundGTX0 = foundGTX1 = NULL;
        shiftGTX0();
        shiftGTX1();
        // std::cout << "CRITICAL ERROR" << std::endl;
    }
    return std::pair< GEMEvent*, GEMEvent* >(foundGTX0, foundGTX1);
};

void DatAligner::shiftGTX0() { 
    delete eventsGTX0.at(0);
    eventsGTX0.erase(eventsGTX0.begin());
    eventsGTX0.push_back(fileGTX0->getGEMEvent());
};

void DatAligner::shiftGTX1() { 
    delete eventsGTX1.at(0);
    eventsGTX1.erase(eventsGTX1.begin());
    eventsGTX1.push_back(fileGTX1->getGEMEvent());
};

bool DatAligner::checkDelta(unsigned int a, unsigned int b) {
    return (b - a == 0);
}
