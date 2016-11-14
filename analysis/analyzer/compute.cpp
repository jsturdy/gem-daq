#include <iostream>

#include "efficiency.h"

/* */

int main(int argc, char *argv[]) {

    std::pair< double, double > res1 = computeEfficiencyLimits(0.5, 0.95);
    std::pair< double, double > res2 = computeEfficiencyLimits(0.2, 0.95);

    std::cout << "Min: " << res1.first << " - " << res1.second << std::endl;
    std::cout << "Min: " << res2.first << " - " << res2.second << std::endl;

    return 0;
}
