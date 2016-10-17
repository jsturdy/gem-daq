#include <iostream>

#include "dat-reader.h"
#include "gem-event.h"
#include "vfat2-event.h"

#include "TFile.h"
#include "TH1D.h"

int main(int argc, char *argv[]) {

    if (argc < 3) {
        std::cout << "./singleGEMAnalyzer <dat file> <root file>" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[2], "recreate"));

    /* Histograms */

    TH1D* hClusterMultiplicity_NoCut(new TH1D("hClusterMultiplicity_NoCut", "Cluster Multiplicity - no cut", 64, 0., 64.));
    TH1D* hClusterMultiplicity_ClusterSize(new TH1D("hClusterMultiplicity_ClusterSize", "Cluster Multiplicity - cut on cluster size", 64, 0., 64.));
    TH1D* hClusterMultiplicity_ClusterSizeDual(new TH1D("hClusterMultiplicity_ClusterSizeDual", "Cluster Multiplicity - cut on cluster size and super-chamber", 64, 0., 64.));

    TH1D* hClusterSize_NoCut(new TH1D("hClusterSize_NoCut", "Cluster Size - no cut", 128, 0., 128.));
    TH1D* hClusterSize_ClusterMultiplicity(new TH1D("hClusterSize_ClusterMultiplicity", "Cluster Size - cut on cluster multiplicity", 128, 0., 128.));
    TH1D* hClusterSize_ClusterMultiplicityDual(new TH1D("hClusterSize_ClusterMultiplicityDual", "Cluster Size - cut on cluster multiplicity and super-chamber", 128, 0., 128.));

    TH1D* hBeamProfile_NoCut(new TH1D("hBeamProfile_NoCut", "Beam profile - no cut", 128, 0., 128.));
    TH1D* hBeamProfile_ClusterMultiplicity(new TH1D("hBeamProfile_ClusterMultiplicity", "Beam profile - cut on the cluster multiplicity", 128, 0., 128.));
    TH1D* hBeamProfile_ClusterSize(new TH1D("hBeamProfile_ClusterSize", "Beam profile - cut on the cluster size", 128, 0., 128.));
    TH1D* hBeamProfile_ClusterMultiplicitySize(new TH1D("hBeamProfile_ClusterMultiplicitySize", "Beam profile - cut on the cluster multiplicity and size", 128, 0., 128.));

    /* */

    DatReader* dat(new DatReader(argv[1]));

    while (dat->isValid()) {
        GEMEvent* gemEvent(dat->getGEMEvent());
        if (gemEvent == nullptr) continue;
        VFAT2Event* vfat2Event;
        if ((vfat2Event = gemEvent->getVFAT2EventByChipID(0xAAF)) == nullptr) {
            if ((vfat2Event = gemEvent->getVFAT2EventByChipID(0xEAF)) == nullptr) {
                delete gemEvent;
                continue;
            }
        }

        /* Analyze */



        /* Get data */

        bool* strips(vfat2Event->getStripsArray());
        unsigned int clusterMultiplicity(vfat2Event->getClusterMultiplicity());
        std::vector< unsigned int > clusterSizes(vfat2Event->getClusterSizes());
        std::vector< double > clusterPositions(vfat2Event->getClusterPositions());

        /* GEM 0 */

        unsigned int clusterMultiplicity_ClusterSize(0);
        unsigned int clusterMultiplicity_Dual(0);
        unsigned int clusterMultiplicity_ClusterSizeDual(0);

        for (unsigned int i(0); i < clusterSizes.size(); ++i) {
            unsigned int clusterStart(clusterPositions.at(i) - (clusterSizes.at(i) - 1.) / 2.);
            unsigned int clusterEnd(clusterPositions.at(i) + (clusterSizes.at(i) - 1.) / 2.);
            // No cut
            hClusterSize_NoCut->Fill(clusterSizes.at(i));
            if (clusterSizes.at(i) > 1) ++clusterMultiplicity_ClusterSize;
            for (unsigned int j(clusterStart); j <= clusterEnd; ++j) hBeamProfile_NoCut->Fill(j);
            // Multiplicity
            if (clusterMultiplicity == 1) {
                hClusterSize_ClusterMultiplicity->Fill(clusterSizes.at(i));
                for (unsigned int j(clusterStart); j <= clusterEnd; ++j) hBeamProfile_ClusterMultiplicity->Fill(j);
                // + Size
                if (clusterSizes.at(i) > 1) for (unsigned int j(clusterStart); j <= clusterEnd; ++j) hBeamProfile_ClusterMultiplicitySize->Fill(j);
            }
            // Cluster size
            if (clusterSizes.at(i) > 1) for (unsigned int j(clusterStart); j <= clusterEnd; ++j) hBeamProfile_ClusterSize->Fill(j);
        }
            
        hClusterMultiplicity_NoCut->Fill(clusterMultiplicity);
        hClusterMultiplicity_ClusterSize->Fill(clusterMultiplicity_ClusterSize);
        hClusterMultiplicity_ClusterSizeDual->Fill(clusterMultiplicity_ClusterSizeDual);

        /* */

        delete gemEvent;

    }

    hClusterMultiplicity_NoCut->Write();
    hClusterMultiplicity_ClusterSize->Write();
    hClusterMultiplicity_ClusterSizeDual->Write();
    hClusterSize_NoCut->Write();
    hClusterSize_ClusterMultiplicity->Write();
    hClusterSize_ClusterMultiplicityDual->Write();
    hBeamProfile_NoCut->Write();
    hBeamProfile_ClusterMultiplicity->Write();
    hBeamProfile_ClusterSize->Write();
    hBeamProfile_ClusterMultiplicitySize->Write();


    rootFile->Close();

    return 0;
}
