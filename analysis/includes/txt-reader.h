#ifndef __TXT_READER_H__
#define __TXT_READER_H__

#include <string>
#include <fstream>
#include <vector>
#include <utility>

class TxtReader {

public:
    TxtReader(std::string);
    unsigned int getOptoHybrid();
    unsigned int getVFAT2();
    unsigned int getMin();
    unsigned int getMax();
    unsigned int getStep();
    unsigned int getNEvents();
    std::vector< std::pair< unsigned int, unsigned int > > getData();

private:
    std::ifstream file;
    unsigned int optoHybrid; 
    unsigned int vfat2; 
    unsigned int min; 
    unsigned int max; 
    unsigned int step; 
    unsigned int nEvents; 
    std::vector< std::pair< unsigned int, unsigned int > > dataPoints;

};

#endif