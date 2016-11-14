#include <iostream>
#include <vector>
#include <utility>

#include "txt-reader.h"
#include "efficiency.h"

#include "TFile.h"
#include "TString.h"
#include "TEfficiency.h"
#include "TMath.h"

/* */

const unsigned int HVs[] = { 700, 710, 720, 730, 740, 750, 760, 770, 780, 790, 800 };

/* */

struct GEMData {
    std::vector< TEfficiency* > hNoise;
};

/* */

void Run(TString GEM, char* directory, struct GEMData* gemData) {
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_700_" + GEM), TString("Threshold scan 700uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_710_" + GEM), TString("Threshold scan 710uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_720_" + GEM), TString("Threshold scan 720uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_730_" + GEM), TString("Threshold scan 730uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_740_" + GEM), TString("Threshold scan 740uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_750_" + GEM), TString("Threshold scan 750uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_760_" + GEM), TString("Threshold scan 760uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_770_" + GEM), TString("Threshold scan 770uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_780_" + GEM), TString("Threshold scan 780uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_790_" + GEM), TString("Threshold scan 790uA " + GEM), 255, 0., 255.));
    gemData->hNoise.push_back(new TEfficiency(TString("hNoise_800_" + GEM), TString("Threshold scan 800uA " + GEM), 255, 0., 255.));

    for (unsigned int HV(0); HV < 11; ++HV) {
        std::string path(std::string(directory) + std::string("/") + std::string(GEM.Data()) + std::string("_") + std::to_string(HVs[HV]) + std::string("uA.txt"));
        TxtReader* txtReader(new TxtReader(path));
        std::vector< std::pair< unsigned int, unsigned int > > data(txtReader->getData());

        for (unsigned int i(0); i < data.size(); ++i) {
            gemData->hNoise.at(HV)->SetTotalEvents(i + 1, txtReader->getNEvents());
            gemData->hNoise.at(HV)->SetPassedEvents(i + 1, data.at(i).second);
        }
        
        gemData->hNoise.at(HV)->Write();

        delete txtReader;
    }
}

/* */

int main(int argc, char *argv[]) {
    if (argc < 3) {
        std::cout << "./thresholdvsHVAnalyzer <directory> <root file>" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[2], "recreate"));

    struct GEMData gemData_GEM0, gemData_GEM1;

    Run("GEM0", argv[1], (struct GEMData*) & gemData_GEM0);
    Run("GEM1", argv[1], (struct GEMData*) & gemData_GEM1);

    rootFile->Close();

    return 0;
}