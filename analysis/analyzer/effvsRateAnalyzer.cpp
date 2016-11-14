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

struct GEMData {
    unsigned int nNoiseEvents[10];
    unsigned int nNoiseHits[10];
    unsigned int nEfficiencyEvents[10];
    unsigned int nEfficiencyHits[10];
    std::pair< double, double > minMaxEff[10];

    TEfficiency* hEfficiency;
    TGraphAsymmErrors* hComputedEfficiency;
    TEfficiency* hNoise;
};

/* */

void startThread(std::string path, unsigned int r, struct GEMData* gemData) {
    TxtReader* txtReader(new TxtReader(path));
    std::vector< std::pair< unsigned int, unsigned int > > data(txtReader->getData());

    gemData->nNoiseEvents[r] = 12 * txtReader->getNEvents();
    for (unsigned int i(0); i <= 6; ++i) gemData->nNoiseHits[r] += data.at(i).second;
    for (unsigned int i(15); i <= 19; ++i) gemData->nNoiseHits[r] += data.at(i).second;

    gemData->nEfficiencyEvents[r] = 2 * txtReader->getNEvents();
    for (unsigned int i(10); i <= 11; ++i) gemData->nEfficiencyHits[r] += data.at(i).second;

    double noise(gemData->nNoiseHits[r] / (12. * txtReader->getNEvents()));
    double efficiency(gemData->nEfficiencyHits[r] / (2. * txtReader->getNEvents()));
    gemData->minMaxEff[r] = computeEfficiencyLimits(noise, efficiency);

    delete txtReader;
}

void Run(TString GEM, char* directory, struct GEMData* gemData) {
    gemData->hEfficiency = new TEfficiency(TString("hEfficiency_" + GEM), TString("Efficiency " + GEM), 10, 0., 10.);
    gemData->hComputedEfficiency = new TGraphAsymmErrors();
    gemData->hNoise = new TEfficiency(TString("hNoise_" + GEM), TString("Noise " + GEM), 10, 0., 10.);

    std::thread threads[10];

    for (unsigned int i(0); i < 10; ++i) {
        std::string path(std::string(directory) + std::string("/") + std::string(GEM.Data()) + std::string("_") + std::to_string(i) + std::string(".txt"));
        threads[i] = std::thread(startThread, path, i, gemData);
    }
    for (unsigned int i(0); i < 10; ++i) threads[i].join();

    for (unsigned int i(0); i < 10; ++i) {
        gemData->hNoise->SetTotalEvents(i + 1, gemData->nNoiseEvents[i]);
        gemData->hNoise->SetPassedEvents(i + 1, gemData->nNoiseHits[i]);
        gemData->hEfficiency->SetTotalEvents(i + 1, gemData->nEfficiencyEvents[i]);
        gemData->hEfficiency->SetPassedEvents(i + 1, gemData->nEfficiencyHits[i]);
        gemData->hComputedEfficiency->SetPoint(i, i + 0.5, (gemData->minMaxEff[i].first + gemData->minMaxEff[i].second) / 2.);
        gemData->hComputedEfficiency->SetPointError(i, 0.5, 0.5, (gemData->minMaxEff[i].second - gemData->minMaxEff[i].first) / 2., (gemData->minMaxEff[i].second - gemData->minMaxEff[i].first) / 2.);
    }

    gemData->hEfficiency->Write();
    gemData->hComputedEfficiency->Write(TString("hComputedEfficiency_" + GEM));
    gemData->hNoise->Write();
}

/* */

int main(int argc, char *argv[]) {
    if (argc < 3) {
        std::cout << "./effvsRateAnalyzer <directory> <root file>" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[2], "recreate"));

    struct GEMData gemData_GEM0, gemData_GEM1;

    Run("GEM0", argv[1], (struct GEMData*) & gemData_GEM0);
    Run("GEM1", argv[1], (struct GEMData*) & gemData_GEM1);

    rootFile->Close();

    return 0;
}