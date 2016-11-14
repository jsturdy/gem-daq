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

const unsigned int HVs[] = { 700, 710, 720, 730, 740, 750, 760, 770, 780, 790, 800, 810 };

/* */

struct GEMData {
    unsigned int nNoiseEvents[12];
    unsigned int nNoiseHits[12];
    unsigned int nEfficiencyEvents[12];
    unsigned int nEfficiencyHits[12];
    std::pair< double, double > minMaxEff[12];

    TEfficiency* hEfficiency;
    TGraphAsymmErrors* hComputedEfficiency;
    TEfficiency* hNoise;
};

/* */

void startThread(std::string path, unsigned int HV, struct GEMData* gemData) {
    TxtReader* txtReader(new TxtReader(path));
    std::vector< std::pair< unsigned int, unsigned int > > data(txtReader->getData());

    gemData->nNoiseEvents[HV] = 12 * txtReader->getNEvents();
    for (unsigned int i(0); i <= 6; ++i) gemData->nNoiseHits[HV] += data.at(i).second;
    for (unsigned int i(15); i <= 19; ++i) gemData->nNoiseHits[HV] += data.at(i).second;

    gemData->nEfficiencyEvents[HV] = 2 * txtReader->getNEvents();
    for (unsigned int i(10); i <= 11; ++i) gemData->nEfficiencyHits[HV] += data.at(i).second;

    double noise(gemData->nNoiseHits[HV] / (12. * txtReader->getNEvents()));
    double efficiency(gemData->nEfficiencyHits[HV] / (2. * txtReader->getNEvents()));
    gemData->minMaxEff[HV] = computeEfficiencyLimits(noise, efficiency);

    delete txtReader;
}

void Run(TString GEM, char* directory, struct GEMData* gemData) {
    gemData->hEfficiency = new TEfficiency(TString("hEfficiency_" + GEM), TString("Efficiency " + GEM), 12, 700, 820);
    gemData->hComputedEfficiency = new TGraphAsymmErrors();
    gemData->hNoise = new TEfficiency(TString("hNoise_" + GEM), TString("Noise " + GEM), 12, 700, 820);

    std::thread threads[12];

    for (unsigned int HV(0); HV < 12; ++HV) {
        std::string path(std::string(directory) + std::string("/") + std::string(GEM.Data()) + std::string("_") + std::to_string(HVs[HV]) + std::string(".txt"));
        threads[HV] = std::thread(startThread, path, HV, gemData);
    }
    for (unsigned int HV(0); HV < 12; ++HV) threads[HV].join();

    for (unsigned int HV(0); HV < 12; ++HV) {
        gemData->hNoise->SetTotalEvents(HV + 1, gemData->nNoiseEvents[HV]);
        gemData->hNoise->SetPassedEvents(HV + 1, gemData->nNoiseHits[HV]);
        gemData->hEfficiency->SetTotalEvents(HV + 1, gemData->nEfficiencyEvents[HV]);
        gemData->hEfficiency->SetPassedEvents(HV + 1, gemData->nEfficiencyHits[HV]);
        gemData->hComputedEfficiency->SetPoint(HV, HVs[HV] + 5., (gemData->minMaxEff[HV].first + gemData->minMaxEff[HV].second) / 2.);
        gemData->hComputedEfficiency->SetPointError(HV, 5., 5., (gemData->minMaxEff[HV].second - gemData->minMaxEff[HV].first) / 2., (gemData->minMaxEff[HV].second - gemData->minMaxEff[HV].first) / 2.);
    }

    gemData->hEfficiency->Write();
    gemData->hComputedEfficiency->Write(TString("hComputedEfficiency_" + GEM));
    gemData->hNoise->Write();
}

/* */

int main(int argc, char *argv[]) {
    if (argc < 3) {
        std::cout << "./effvsHVAnalyzer <directory> <root file>" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[2], "recreate"));

    struct GEMData gemData_GEM0, gemData_GEM1;

    Run("GEM0", argv[1], (struct GEMData*) & gemData_GEM0);
    Run("GEM1", argv[1], (struct GEMData*) & gemData_GEM1);

    rootFile->Close();

    return 0;
}