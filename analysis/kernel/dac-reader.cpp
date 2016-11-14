#include <iostream>
#include <sstream>

#include "dac-reader.h"

DacReader::DacReader(std::string path) {
    file.open(path.c_str()); 
    if (file.is_open()) {
        unsigned int lineNumber(0);
        bool isTypeV2(false);
        std::string line;
        while (std::getline(file, line)) {
            std::istringstream iss(line);
            unsigned int i;
            double x, dx;
            if (lineNumber++ < 26) continue;
            iss >> i >> x >> dx;
            dataPoints.push_back(std::pair< unsigned int, double >(i, x));
            errorPoints.push_back(std::pair< unsigned int, double >(i, dx));
        }
    }
}

std::vector< std::pair< unsigned int, double > > DacReader::getData() { return dataPoints; }

std::vector< std::pair< unsigned int, double > > DacReader::getError() { return errorPoints; }