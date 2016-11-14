#include <iostream>
#include <algorithm>
#include <ctime>
#include <cstdlib>

#include "efficiency.h"

#include "TMath.h"

#define EFF_STEPS       0.005
#define EFF_PRECISION   10000.
#define EFF_EVENTS      500.
#define EFF_DELTA       0.005

std::pair< double, double > computeEfficiencyLimits(double noise, double efficiency) {
    std::srand(unsigned(std::time(0)));

    std::vector< bool > noiseArray;
    for (unsigned int i(0); i < EFF_PRECISION; ++i) noiseArray.push_back(EFF_PRECISION * noise > i);

    double cMin(0.);
    double cMax(0.);

    for (unsigned int event(0); event < EFF_EVENTS; ++event) {
        double min(1.);
        double max(0.);

        for (double eff(0.); eff <= 1.; eff += EFF_STEPS) {
            std::vector< bool > efficiencyArray;
            for (unsigned int i(0); i < EFF_PRECISION; ++i) efficiencyArray.push_back(EFF_PRECISION * eff > i);  
            std::random_shuffle(efficiencyArray.begin(), efficiencyArray.end());    
            // std::random_shuffle(noiseArray.begin(), noiseArray.end());    
            unsigned int nHits(0);
            for (unsigned int i(0); i < EFF_PRECISION; ++i) if (noiseArray.at(i) || efficiencyArray.at(i)) ++nHits;
            double cEff(nHits / EFF_PRECISION);
        
            if (TMath::Abs(cEff - efficiency) <= EFF_DELTA) {
                if (eff < min) min = eff;
                if (eff > max) max = eff;
            }
        }      
        cMin += min / EFF_EVENTS;
        cMax += max / EFF_EVENTS;
    }
    
    return std::pair< double, double >(cMin, cMax);
}
