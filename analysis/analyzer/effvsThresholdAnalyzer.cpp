#include <iostream>
#include <vector>
#include <utility>
#include <thread>

#include "txt-reader.h"
#include "efficiency.h"

#include "TFile.h"
#include "TString.h"
#include "TGraphAsymmErrors.h"
#include "TEfficiency.h"
#include "TMath.h"

/* */

const unsigned int thresholds[] = { 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60 };

/* */

struct GEMData {
    unsigned int nNoiseEvents[13];
    unsigned int nNoiseHits[13];
    unsigned int nEfficiencyEvents[13];
    unsigned int nEfficiencyHits[13];
    std::pair< double, double > minMaxEff[13];

    TEfficiency* hEfficiency;
    TGraphAsymmErrors* hComputedEfficiency;
    TEfficiency* hNoise;
};

/* */

void startThread(std::string path, unsigned int threshold, struct GEMData* gemData) {
    TxtReader* txtReader(new TxtReader(path));
    std::vector< std::pair< unsigned int, unsigned int > > data(txtReader->getData());

    gemData->nNoiseEvents[threshold] = 12 * txtReader->getNEvents();
    for (unsigned int i(0); i <= 6; ++i) gemData->nNoiseHits[threshold] += data.at(i).second;
    for (unsigned int i(15); i <= 19; ++i) gemData->nNoiseHits[threshold] += data.at(i).second;

    gemData->nEfficiencyEvents[threshold] = 2 * txtReader->getNEvents();
    for (unsigned int i(10); i <= 11; ++i) gemData->nEfficiencyHits[threshold] += data.at(i).second;

    double noise(gemData->nNoiseHits[threshold] / (12. * txtReader->getNEvents()));
    double efficiency(gemData->nEfficiencyHits[threshold] / (2. * txtReader->getNEvents()));
    gemData->minMaxEff[threshold] = computeEfficiencyLimits(noise, efficiency);

    delete txtReader;
}

void Run(TString GEM, char* directory, struct GEMData* gemData) {
    gemData->hEfficiency = new TEfficiency(TString("hEfficiency_" + GEM), TString("Efficiency " + GEM), 13, 0, 65);
    gemData->hComputedEfficiency = new TGraphAsymmErrors();
    gemData->hNoise = new TEfficiency(TString("hNoise_" + GEM), TString("Noise " + GEM), 13, 0, 65);

    std::thread threads[13];

    for (unsigned int threshold(0); threshold < 13; ++threshold) {
        std::string path(std::string(directory) + std::string("/") + std::string(GEM.Data()) + std::string("_") + std::to_string(thresholds[threshold]) + std::string(".txt"));
        threads[threshold] = std::thread(startThread, path, threshold, gemData);
    }
    for (unsigned int threshold(0); threshold < 13; ++threshold) threads[threshold].join();

    for (unsigned int threshold(0); threshold < 13; ++threshold) {
        gemData->hNoise->SetTotalEvents(threshold + 1, gemData->nNoiseEvents[threshold]);
        gemData->hNoise->SetPassedEvents(threshold + 1, gemData->nNoiseHits[threshold]);
        gemData->hEfficiency->SetTotalEvents(threshold + 1, gemData->nEfficiencyEvents[threshold]);
        gemData->hEfficiency->SetPassedEvents(threshold + 1, gemData->nEfficiencyHits[threshold]);
        gemData->hComputedEfficiency->SetPoint(threshold, thresholds[threshold] + 2.5, (gemData->minMaxEff[threshold].first + gemData->minMaxEff[threshold].second) / 2.);
        gemData->hComputedEfficiency->SetPointError(threshold, 2.5, 2.5, (gemData->minMaxEff[threshold].second - gemData->minMaxEff[threshold].first) / 2., (gemData->minMaxEff[threshold].second - gemData->minMaxEff[threshold].first) / 2.);
    }

    gemData->hEfficiency->Write();
    gemData->hComputedEfficiency->Write(TString("hComputedEfficiency_" + GEM));
    gemData->hNoise->Write();
}

/* */

int main(int argc, char *argv[]) {
    if (argc < 3) {
        std::cout << "./effvsThresholdAnalyzer <directory> <root file>" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[2], "recreate"));

    struct GEMData gemData_GEM0, gemData_GEM1;

    Run("GEM0", argv[1], (struct GEMData*) & gemData_GEM0);
    Run("GEM1", argv[1], (struct GEMData*) & gemData_GEM1);

    rootFile->Close();

    return 0;
}