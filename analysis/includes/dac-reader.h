#ifndef __DAC_READER_H__
#define __DAC_READER_H__

#include <string>
#include <fstream>
#include <vector>
#include <utility>

class DacReader {

public:
    DacReader(std::string);
    std::vector< std::pair< unsigned int, double > > getData();
    std::vector< std::pair< unsigned int, double > > getError();

private:
    std::ifstream file;
    std::vector< std::pair< unsigned int, double > > dataPoints;
    std::vector< std::pair< unsigned int, double > > errorPoints;

};

#endif