#include <iostream>
#include <sstream>

#include "txt-reader.h"

TxtReader::TxtReader(std::string path) {
    file.open(path.c_str()); 
    if (file.is_open()) {
        unsigned int lineNumber(0);
        bool isTypeV2(false);
        std::string line;
        while (std::getline(file, line)) {
            std::istringstream iss(line);
            std::string tmp;
            unsigned int d;
            if (lineNumber == 0) isTypeV2 = (line.at(0) == 'T');
            if (isTypeV2) {
                if (lineNumber == 1) iss >> tmp >> optoHybrid;
                else if (lineNumber == 2) iss >> tmp >> vfat2;
                else if (lineNumber == 3) iss >> tmp >> min;
                else if (lineNumber == 4) iss >> tmp >> max;
                else if (lineNumber == 5) iss >> tmp >> step;
                else if (lineNumber == 6) iss >> tmp >> nEvents;
                else if (lineNumber >= 27) {
                    iss >> d;
                    dataPoints.push_back(std::pair< unsigned int, unsigned int > (d >> 24, d & 0xffffff));
                }
            }
            else {
                if (lineNumber == 0) iss >> tmp >> vfat2;
                else if (lineNumber == 1) iss >> tmp >> min;
                else if (lineNumber == 2) iss >> tmp >> max;
                else if (lineNumber == 3) iss >> tmp >> step;
                else if (lineNumber == 4) iss >> tmp >> nEvents;
                else if (lineNumber >= 5) {
                    iss >> d;
                    dataPoints.push_back(std::pair< unsigned int, unsigned int >(d >> 24, d & 0xffffff));
                }
            }
            ++lineNumber;
        }
    }
}

unsigned int TxtReader::getOptoHybrid() { return optoHybrid; }
unsigned int TxtReader::getVFAT2() { return vfat2; }
unsigned int TxtReader::getMin() { return min; }
unsigned int TxtReader::getMax() { return max; }
unsigned int TxtReader::getStep() { return step; }
unsigned int TxtReader::getNEvents() { return nEvents; }
std::vector< std::pair< unsigned int, unsigned int > > TxtReader::getData() { return dataPoints; }