#include <iostream>
#include <utility>

#include "dat-aligner.h"
#include "gem-event.h"
#include "vfat2-event.h"

#include "TFile.h"
#include "TString.h"
#include "TH1D.h"
#include "TEfficiency.h"
#include "TMath.h"

#define DELTA_CLUSTERS 5.

/* */

struct GEMData {
    TH1D* hClusterMultiplicity_NoCut;
    TH1D* hClusterMultiplicity_ClusterSize;
    TH1D* hClusterMultiplicity_Dual;
    TH1D* hClusterMultiplicity_ClusterSizeDual;

    TH1D* hClusterSize_NoCut;
    TH1D* hClusterSize_ClusterMultiplicity;
    TH1D* hClusterSize_Dual;
    TH1D* hClusterSize_ClusterMultiplicityDual;

    TH1D* hBeamProfile_NoCut;
    TH1D* hBeamProfile_ClusterMultiplicity;
    TH1D* hBeamProfile_ClusterSize;
    TH1D* hBeamProfile_Dual;
    TH1D* hBeamProfile_ClusterMultiplicitySize;
    TH1D* hBeamProfile_All;

    TEfficiency* hEfficiency;

    TH1D* hDeltaClusterPosition;
    TH1D* hDeltaClusterSize;
};

/* */

void Init(TString GEM, struct GEMData* gemData) {
    gemData->hClusterMultiplicity_NoCut = new TH1D(TString("hClusterMultiplicity_NoCut_" + GEM), TString("Cluster Multiplicity " + GEM + " - no cut"), 64, 0., 64.);
    gemData->hClusterMultiplicity_ClusterSize = new TH1D(TString("hClusterMultiplicity_ClusterSize_" + GEM), TString("Cluster Multiplicity " + GEM + " - cut on cluster size"), 64, 0., 64.);
    gemData->hClusterMultiplicity_Dual = new TH1D(TString("hClusterMultiplicity_Dual_" + GEM), TString("Cluster Multiplicity " + GEM + " - cut on the super-chamber"), 64, 0., 64.);
    gemData->hClusterMultiplicity_ClusterSizeDual = new TH1D(TString("hClusterMultiplicity_ClusterSizeDual_" + GEM), TString("Cluster Multiplicity " + GEM + " - cut on cluster size and super-chamber"), 64, 0., 64.);

    gemData->hClusterSize_NoCut = new TH1D(TString("hClusterSize_NoCut_" + GEM), TString("Cluster Size " + GEM + " - no cut"), 128, 0., 128.);
    gemData->hClusterSize_ClusterMultiplicity = new TH1D(TString("hClusterSize_ClusterMultiplicity_" + GEM), TString("Cluster Size " + GEM + " - cut on cluster multiplicity"), 128, 0., 128.);
    gemData->hClusterSize_Dual = new TH1D(TString("hClusterSize_Dual_" + GEM), TString("Cluster Size " + GEM + " - cut on the super-chamber"), 128, 0., 128.);
    gemData->hClusterSize_ClusterMultiplicityDual = new TH1D(TString("hClusterSize_ClusterMultiplicityDual_" + GEM), TString("Cluster Size " + GEM + " - cut on cluster multiplicity and super-chamber"), 128, 0., 128.);

    gemData->hBeamProfile_NoCut = new TH1D(TString("hBeamProfile_NoCut_" + GEM), TString("Beam profile " + GEM + " - no cut"), 128, 0., 128.);
    gemData->hBeamProfile_ClusterMultiplicity = new TH1D(TString("hBeamProfile_ClusterMultiplicity_" + GEM), TString("Beam profile " + GEM + " - cut on the cluster multiplicity"), 128, 0., 128.);
    gemData->hBeamProfile_ClusterSize = new TH1D(TString("hBeamProfile_ClusterSize_" + GEM), TString("Beam profile " + GEM + " - cut on the cluster size"), 128, 0., 128.);
    gemData->hBeamProfile_Dual = new TH1D(TString("hBeamProfile_Dual_" + GEM), TString("Beam profile " + GEM + " - cut on the super-chamber"), 128, 0., 128.);
    gemData->hBeamProfile_ClusterMultiplicitySize = new TH1D(TString("hBeamProfile_ClusterMultiplicitySize_" + GEM), TString("Beam profile " + GEM + " - cut on the cluster multiplicity and size"), 128, 0., 128.);
    gemData->hBeamProfile_All = new TH1D(TString("hBeamProfile_All_" + GEM), TString("Beam profile " + GEM + " - cut on the cluster multiplicity and size, and on the super-chamber"), 128, 0., 128.);

    gemData->hEfficiency = new TEfficiency(TString("hEfficiency_" + GEM), TString("Efficiency " + GEM), 1, 0, 1);

    gemData->hDeltaClusterPosition = new TH1D(TString("hDeltaClusterPosition_" + GEM), "Delta cluster position between GEMs", 20, -10., 10.);
    gemData->hDeltaClusterSize = new TH1D(TString("hDeltaClusterSize_" + GEM), "Delta cluster size between GEMs", 20, -10., 10.); 
}

/* */

void Run(VFAT2Event* thisVFAT2, VFAT2Event* otherVFAT2, struct GEMData* gemData, bool isPion) {
    bool* strips_this(thisVFAT2->getStripsArray());
    unsigned int clusterMultiplicity(thisVFAT2->getClusterMultiplicity());
    std::vector< unsigned int > clusterSizes_this(thisVFAT2->getClusterSizes());
    std::vector< double > clusterPositions_this(thisVFAT2->getClusterPositions());

    bool* strips_other(otherVFAT2->getStripsArray());
    unsigned int clusterMultiplicity_other(otherVFAT2->getClusterMultiplicity());
    std::vector< unsigned int > clusterSizes_other(otherVFAT2->getClusterSizes());
    std::vector< double > clusterPositions_other(otherVFAT2->getClusterPositions());

    unsigned int clusterMultiplicity_ClusterSize(0);
    unsigned int clusterMultiplicity_Dual(0);
    unsigned int clusterMultiplicity_ClusterSizeDual(0);

    double minLimit(isPion ? 40. : 30.);
    double maxLimit(isPion ? 80. : 110.);

    for (unsigned int i(0); i < clusterSizes_this.size(); ++i) {
        unsigned int clusterStart(clusterPositions_this.at(i) - (clusterSizes_this.at(i) - 1.) / 2.);
        unsigned int clusterEnd(clusterPositions_this.at(i) + (clusterSizes_this.at(i) - 1.) / 2.);
        // No cut
        gemData->hClusterSize_NoCut->Fill(clusterSizes_this.at(i));
        for (unsigned int j(clusterStart); j <= clusterEnd; ++j) gemData->hBeamProfile_NoCut->Fill(j);
        // Multiplicity
        if (clusterMultiplicity == 1) {
            gemData->hClusterSize_ClusterMultiplicity->Fill(clusterSizes_this.at(i));
            for (unsigned int j(clusterStart); j <= clusterEnd; ++j) gemData->hBeamProfile_ClusterMultiplicity->Fill(j);
            // + Size
            if (clusterSizes_this.at(i) == 2) for (unsigned int j(clusterStart); j <= clusterEnd; ++j) gemData->hBeamProfile_ClusterMultiplicitySize->Fill(j);
        }
        // Cluster size
        if (clusterSizes_this.at(i) == 2) { 
            ++clusterMultiplicity_ClusterSize;
            for (unsigned int j(clusterStart); j <= clusterEnd; ++j) gemData->hBeamProfile_ClusterSize->Fill(j);
        }
        // Dual
        bool foundMatch(false);
        for (unsigned int j(0); j < clusterPositions_other.size(); ++j) {
            if (TMath::Abs(clusterPositions_this.at(i) - clusterPositions_other.at(j)) < DELTA_CLUSTERS) {
                ++clusterMultiplicity_Dual;
                gemData->hClusterSize_Dual->Fill(clusterSizes_this.at(i));
                for (unsigned int k(clusterStart); k <= clusterEnd; ++k) gemData->hBeamProfile_Dual->Fill(k);
                gemData->hDeltaClusterPosition->Fill((double) clusterPositions_this.at(i) - (double) clusterPositions_other.at(j));
                gemData->hDeltaClusterSize->Fill(clusterSizes_this.at(i) - clusterSizes_other.at(j));
                // + Size
                if (clusterSizes_this.at(i) == 2) ++clusterMultiplicity_ClusterSizeDual;
                // + Multiplicity
                if (clusterMultiplicity == 1) {
                    gemData->hClusterSize_ClusterMultiplicityDual->Fill(clusterSizes_this.at(i));
                    // + Size
                    if (clusterSizes_this.at(i) == 2) for (unsigned int k(clusterStart); k <= clusterEnd; ++k) gemData->hBeamProfile_All->Fill(k);
                }
                foundMatch = true;
                break;
            }
        }
        if (clusterMultiplicity == 1 && clusterSizes_this.at(i) == 2 && clusterPositions_this.at(i) > minLimit && clusterPositions_this.at(i) < maxLimit) {
            if (foundMatch) gemData->hEfficiency->Fill(true, 0.);
            else gemData->hEfficiency->Fill(false, 0.);
        }
    }
        
    gemData->hClusterMultiplicity_NoCut->Fill(clusterMultiplicity);
    gemData->hClusterMultiplicity_ClusterSize->Fill(clusterMultiplicity_ClusterSize);
    gemData->hClusterMultiplicity_Dual->Fill(clusterMultiplicity_Dual);
    gemData->hClusterMultiplicity_ClusterSizeDual->Fill(clusterMultiplicity_ClusterSizeDual);
}

/* */

void Close(struct GEMData* gemData) {
    gemData->hClusterMultiplicity_NoCut->Write();
    gemData->hClusterMultiplicity_ClusterSize->Write();
    gemData->hClusterMultiplicity_Dual->Write();
    gemData->hClusterMultiplicity_ClusterSizeDual->Write();
    gemData->hClusterSize_NoCut->Write();
    gemData->hClusterSize_ClusterMultiplicity->Write();
    gemData->hClusterSize_Dual->Write();
    gemData->hClusterSize_ClusterMultiplicityDual->Write();
    gemData->hBeamProfile_NoCut->Write();
    gemData->hBeamProfile_ClusterMultiplicity->Write();
    gemData->hBeamProfile_ClusterSize->Write();
    gemData->hBeamProfile_Dual->Write();
    gemData->hBeamProfile_ClusterMultiplicitySize->Write();
    gemData->hBeamProfile_All->Write();
    gemData->hEfficiency->Write();
    gemData->hDeltaClusterPosition->Write();
    gemData->hDeltaClusterSize->Write();    
}

/* */

int main(int argc, char *argv[]) {

    if (argc < 4) {
        std::cout << "./doubleGEMAnalyzer <dat file GTX0> <data file GTX1> <root file> [particle type]" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[3], "recreate"));

    struct GEMData gemData_GEM0, gemData_GEM1;

    bool isPion(argc == 5 ? (argv[4][0] == '1' ? true : false) : false);

    Init("GEM0", (struct GEMData*) & gemData_GEM0);
    Init("GEM1", (struct GEMData*) & gemData_GEM1);

    /* */

    DatAligner* dat(new DatAligner(argv[1], argv[2]));

    while (dat->isValid()) {

        /* Check validity */

        std::pair< GEMEvent*, GEMEvent* > setupEvent(dat->getSetupEvent());
        GEMEvent* gemEvent0(setupEvent.first);
        if (gemEvent0 == nullptr) continue;
        VFAT2Event* vfat2Event0;
        if ((vfat2Event0 = gemEvent0->getVFAT2EventByChipID(0xAAF)) == nullptr) {
            if ((vfat2Event0 = gemEvent0->getVFAT2EventByChipID(0xEAF)) == nullptr) continue;
        }
        GEMEvent* gemEvent1(setupEvent.second);
        if (gemEvent1 == nullptr) continue;
        VFAT2Event* vfat2Event1;
        if ((vfat2Event1 = gemEvent1->getVFAT2EventByChipID(0xAAF)) == nullptr) {
            if ((vfat2Event1 = gemEvent1->getVFAT2EventByChipID(0xEAF)) == nullptr) continue;
        }

        Run(vfat2Event0, vfat2Event1, (struct GEMData*) & gemData_GEM0, isPion);
        Run(vfat2Event1, vfat2Event0, (struct GEMData*) & gemData_GEM1, isPion);
    }

    Close((struct GEMData*) & gemData_GEM0);
    Close((struct GEMData*) & gemData_GEM1);

    rootFile->Close();

    return 0;
}
