#include <iostream>
#include <vector>
#include <utility>

#include "txt-reader.h"
#include "efficiency.h"

#include "TFile.h"
#include "TString.h"
#include "TGraphAsymmErrors.h"
#include "TEfficiency.h"
#include "TMath.h"

/* */

int main(int argc, char *argv[]) {
    if (argc < 3) {
        std::cout << "./latency <source file GEM0> <source file GEM1> <root file>" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[3], "recreate"));

    TEfficiency* hEfficiency0(new TEfficiency(TString("hEfficiency_GEM0"), TString("Efficiency GEM0"), 20, 0, 20));
    TEfficiency* hEfficiency1(new TEfficiency(TString("hEfficiency_GEM1"), TString("Efficiency GEM1"), 20, 0, 20));
    TxtReader* txtReader0(new TxtReader(argv[1]));
    TxtReader* txtReader1(new TxtReader(argv[2]));

    std::vector< std::pair< unsigned int, unsigned int > > data0(txtReader0->getData());
    std::vector< std::pair< unsigned int, unsigned int > > data1(txtReader1->getData());

    for (unsigned int i(0); i < 20; ++i) {
      hEfficiency0->SetTotalEvents(i + 1, txtReader0->getNEvents());
      hEfficiency0->SetPassedEvents(i + 1, data0.at(i).second);

      hEfficiency1->SetTotalEvents(i + 1, txtReader1->getNEvents());
      hEfficiency1->SetPassedEvents(i + 1, data1.at(i).second);

    }

    hEfficiency0->Write();
    hEfficiency1->Write();

    rootFile->Close();

    return 0;
}
