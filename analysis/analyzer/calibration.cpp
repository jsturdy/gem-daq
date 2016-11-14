#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>

#include "dac-reader.h"

#include "TFile.h"
#include "TEfficiency.h"
#include "TGraphErrors.h"
#include "TH1D.h"
#include "TH2D.h"
#include "TF1.h"
#include "TRandom3.h"

#define ADC_V_CONV(X) (2. * (0.0029 * X - 0.0093))
#define ADC_I_CONV(X) (((X - 3.2986) / 679.53) / 2000.)
#define ADC_C_CONV(X) (2. * (-1.12796 + 0.0400236 * X + 1.00322e-05 * X * X))

/* */

int main(int argc, char *argv[]) {
    if (argc < 3) {
        std::cout << "./calibration <directory> <root file>" << std::endl;
        return -1;
    }

    TFile* rootFile(new TFile(argv[2], "recreate"));

    TEfficiency* gThreshold_Channel(new TEfficiency("gThreshold_Channel", "gThreshold_Channel", 250, 0., 250., 128, 0., 128.));
    TH2D* hThreshold_Channel_Passed(new TH2D("hThreshold_Channel_Passed", "hThreshold_Channel_Passed", 250, 0., 250., 128, 0., 128.));
    TH2D* hThreshold_Channel_Total(new TH2D("hThreshold_Channel_Total", "hThreshold_Channel_Total", 250, 0., 250., 128, 0., 128.));

    TEfficiency* gThreshold_SBits(new TEfficiency("gThreshold_SBits", "gThreshold_SBits", 250, 0., 250.));

    TEfficiency* gThreshold_TK(new TEfficiency("gThreshold_TK", "gThreshold_TK", 250, 0., 250.));

    TEfficiency* gSCurve_ThresholdVCal(new TEfficiency("gSCurve_ThresholdVCal", "gSCurve_ThresholdVCal", 250, 0., 250., 249, 0., 249.));
    TH2D* hSCurve_ThresholdVCal_Passed(new TH2D("hSCurve_ThresholdVCal_Passed", "hSCurve_ThresholdVCal_Passed", 250, 0., 250., 249, 0., 249.));
    TH2D* hSCurve_ThresholdVCal_Total(new TH2D("hSCurve_ThresholdVCal_Total", "hSCurve_ThresholdVCal_Total", 250, 0., 250., 249, 0., 249.));
    TEfficiency* gSCurve_T25(new TEfficiency("gSCurve_T25", "gSCurve_T25", 249, 0., 249.));
    TF1* fuSCurve_T25(new TF1("f1", "1 / (1 + exp([0] * (x - [1])))", 0., 240.));
    std::vector< TEfficiency* > gSCurves_ThresholdVCal;
    TGraphErrors* gSCurve_TurnOn(new TGraphErrors());

    TEfficiency* gSCurve_ChannelVCal_Trim0(new TEfficiency("gSCurve_ChannelVCal_Trim0", "gSCurve_ChannelVCal_Trim0", 128, 0., 128., 249, 0., 249.));
    TH2D* hSCurve_ChannelVCal_Trim0_Passed(new TH2D("hSCurve_ChannelVCal_Trim0_Passed", "hSCurve_ChannelVCal_Trim0_Passed", 128, 0., 128., 249, 0., 249.));
    TH2D* hSCurve_ChannelVCal_Trim0_Total(new TH2D("hSCurve_ChannelVCal_Trim0_Total", "hSCurve_ChannelVCal_Trim0_Total", 128, 0., 128., 249, 0., 249.));
    std::vector< TEfficiency* > gSCurves_ChannelVCal_Trim0;
    TH1D* hSCurve_ChannelVCal_Trim0_Disp(new TH1D("hSCurve_ChannelVCal_Trim0_Disp", "hSCurve_ChannelVCal_Trim0_Disp", 25., 35., 50.));
    TGraphErrors* gSCurve_ChannelVCal_Trim0_Sigma(new TGraphErrors());

    TEfficiency* gSCurve_ChannelVCal_Trim1(new TEfficiency("gSCurve_ChannelVCal_Trim1", "gSCurve_ChannelVCal_Trim1", 128, 0., 128., 249, 0., 249.));
    TH2D* hSCurve_ChannelVCal_Trim1_Passed(new TH2D("hSCurve_ChannelVCal_Trim1_Passed", "hSCurve_ChannelVCal_Trim1_Passed", 128, 0., 128., 249, 0., 249.));
    TH2D* hSCurve_ChannelVCal_Trim1_Total(new TH2D("hSCurve_ChannelVCal_Trim1_Total", "hSCurve_ChannelVCal_Trim1_Total", 128, 0., 128., 249, 0., 249.));
    std::vector< TEfficiency* > gSCurves_ChannelVCal_Trim1;
    TH1D* hSCurve_ChannelVCal_Trim1_Disp(new TH1D("hSCurve_ChannelVCal_Trim1_Disp", "hSCurve_ChannelVCal_Trim1_Disp", 20., 20., 30.));
    TGraphErrors* gSCurve_ChannelVCal_Trim1_Sigma(new TGraphErrors());

    TEfficiency* gSCurve_ChannelVCal_Trimed(new TEfficiency("gSCurve_ChannelVCal_Trimed", "gSCurve_ChannelVCal_Trimed", 128, 0., 128., 249, 0., 249.));
    TH2D* hSCurve_ChannelVCal_Trimed_Passed(new TH2D("hSCurve_ChannelVCal_Trimed_Passed", "hSCurve_ChannelVCal_Trimed_Passed", 128, 0., 128., 249, 0., 249.));
    TH2D* hSCurve_ChannelVCal_Trimed_Total(new TH2D("hSCurve_ChannelVCal_Trimed_Total", "hSCurve_ChannelVCal_Trimed_Total", 128, 0., 128., 249, 0., 249.));
    std::vector< TEfficiency* > gSCurves_ChannelVCal_Trimed;
    TH1D* hSCurve_ChannelVCal_Trimed_Disp(new TH1D("hSCurve_ChannelVCal_Trimed_Disp", "hSCurve_ChannelVCal_Trimed_Disp", 20., 30., 40.));
    TGraphErrors* gSCurve_ChannelVCal_Trimed_Sigma(new TGraphErrors());


    TGraphErrors* gIComp_ADC(new TGraphErrors());
    TF1* fuIComp(new TF1("f2", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gIComp_Current(new TGraphErrors());

    TGraphErrors* gIPreampFeed_ADC(new TGraphErrors());
    TF1* fuIPreampFeed(new TF1("f3", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gIPreampFeed_Current(new TGraphErrors());

    TGraphErrors* gIPreampIn_ADC(new TGraphErrors());
    TF1* fuIPreampIn(new TF1("f4", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gIPreampIn_Current(new TGraphErrors());

    TGraphErrors* gIPreampOut_ADC(new TGraphErrors());
    TF1* fuIPreampOut(new TF1("f5", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gIPreampOut_Current(new TGraphErrors());

    TGraphErrors* gIShaper_ADC(new TGraphErrors());
    TF1* fuIShaper(new TF1("f6", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gIShaper_Current(new TGraphErrors());

    TGraphErrors* gIShaperFeed_ADC(new TGraphErrors());
    TF1* fuIShaperFeed(new TF1("f7", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gIShaperFeed_Current(new TGraphErrors());

    TGraphErrors* gVCal_ADC(new TGraphErrors());
    TF1* fuVCal(new TF1("f8", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gVCal_Voltage(new TGraphErrors());

    TGraphErrors* gVCal_Bis_ADC(new TGraphErrors());
    TF1* fuVCal_Bis(new TF1("f8", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gVCal_Bis_Voltage(new TGraphErrors());

    TGraphErrors* gVBaseline_ADC(new TGraphErrors());
    TF1* fuVBaseline(new TF1("f8", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gVBaseline_Voltage(new TGraphErrors());

    TGraphErrors* gVThreshold1_ADC(new TGraphErrors());
    TF1* fuVThreshold1(new TF1("f9", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gVThreshold1_Voltage(new TGraphErrors());

    TGraphErrors* gVThreshold2_ADC(new TGraphErrors());
    TF1* fuVThreshold2(new TF1("f10", "[0]+[1]*x", 0., 255.));
    TGraphErrors* gVThreshold2_Voltage(new TGraphErrors());

    TGraphErrors* gCal_Charge(new TGraphErrors());
    TF1* fuCal_Charge(new TF1("f10", "[0]+[1]*x", 0., 255.));

    /*
     * Threshold scan by channel
    */

     std::string pathThresholdChannel(std::string(argv[1]) + std::string("/threshold-channel.txt"));
     std::ifstream fileThresholdChannel;

     fileThresholdChannel.open(pathThresholdChannel.c_str());
     if (fileThresholdChannel.is_open()) {
         std::string line;
         while (std::getline(fileThresholdChannel, line)) {
             std::istringstream iss(line);
             unsigned int channel;
             unsigned int threshold;
             double rate;
             iss >> channel >> threshold >> rate;
             hThreshold_Channel_Total->SetBinContent(threshold + 1, channel + 1, 1000.);
             hThreshold_Channel_Passed->SetBinContent(threshold + 1, channel + 1, rate * 1000.);
         }
     }

     gThreshold_Channel->SetTotalHistogram(*hThreshold_Channel_Total, "");
     gThreshold_Channel->SetPassedHistogram(*hThreshold_Channel_Passed, "");

     /*
      * Threshold scan with SBits
      */

     std::string pathThreshold_SBits(std::string(argv[1]) + std::string("/threshold-sbits.txt"));
     std::ifstream fileThreshold_SBits;

     fileThreshold_SBits.open(pathThreshold_SBits.c_str());
     if (fileThreshold_SBits.is_open()) {
         std::string line;
         while (std::getline(fileThreshold_SBits, line)) {
             std::istringstream iss(line);
             unsigned int threshold;
             double rate;
             iss >> threshold >> rate;
             gThreshold_SBits->SetTotalEvents(threshold + 1, 1000.);
             gThreshold_SBits->SetPassedEvents(threshold + 1, rate * 1000.);
         }
     }

    /*
     * Threshold scan with Tracking Data
     */

    // std::string pathThreshold_TK(std::string(argv[1]) + std::string("/threshold-tk.txt"));
    // std::ifstream fileThreshold_TK;
    //
    // fileThreshold_TK.open(pathThreshold_TK.c_str());
    // if (fileThreshold_TK.is_open()) {
    //     std::string line;
    //     while (std::getline(fileThreshold_TK, line)) {
    //         std::istringstream iss(line);
    //         unsigned int threshold;
    //         double rate;
    //         iss >> threshold >> rate;
    //         gThreshold_TK->SetTotalEvents(threshold + 1, 1000.);
    //         gThreshold_TK->SetPassedEvents(threshold + 1, rate * 1000.);
    //     }
    // }

    const double results[] = {100., 100., 99.9999, 97.2989, 49.6917, 10.9512, 2.2898, 0.5612, 0.1474, 0.0407, 0.0084, 0.004, 0.0008, 0.0008, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0};

    for (unsigned int i(0); i < 100; ++i) {
        if (i < 25) {
            gThreshold_TK->SetTotalEvents(i + 1, 10000.);
            gThreshold_TK->SetPassedEvents(i + 1, results[i] * 100.);
        }
        else {
            gThreshold_TK->SetTotalEvents(i + 1, 10000.);
            gThreshold_TK->SetPassedEvents(i + 1, 0.);
        }
    }

    /*
     * SCurve VCal vs Threshold and T25
     */

    std::string pathScurveThreshold(std::string(argv[1]) + std::string("/scurve_threshold_vcal.txt"));
    std::ifstream fileScurveThreshold;
    int lastThreshold = -1;

    fileScurveThreshold.open(pathScurveThreshold.c_str());
    if (fileScurveThreshold.is_open()) {
        unsigned int lineNumber(0);
        std::string line;
        while (std::getline(fileScurveThreshold, line)) {
            std::istringstream iss(line);
            unsigned int threshold;
            unsigned int vcal;
            double rate;
            if (lineNumber++ == 0) continue;
            iss >> threshold >> vcal >> rate;

            if (threshold != lastThreshold) {
                lastThreshold = threshold;
                gSCurves_ThresholdVCal.push_back(new TEfficiency("SCurveList", "SCurveList", 249, 0., 249.));
            }

            if (threshold == 25) {
                gSCurve_T25->SetTotalEvents(vcal + 1, 1000.);
                gSCurve_T25->SetPassedEvents(vcal + 1, rate * 1000.);
            }
            gSCurves_ThresholdVCal.at(threshold)->SetTotalEvents(vcal + 1, 1000.);
            gSCurves_ThresholdVCal.at(threshold)->SetPassedEvents(vcal + 1, rate * 1000.);

            hSCurve_ThresholdVCal_Total->SetBinContent(threshold + 1, vcal + 1, 1000.);
            hSCurve_ThresholdVCal_Passed->SetBinContent(threshold + 1, vcal + 1, rate * 1000.);
        }
    }

    gSCurve_ThresholdVCal->SetTotalHistogram(*hSCurve_ThresholdVCal_Total, "");
    gSCurve_ThresholdVCal->SetPassedHistogram(*hSCurve_ThresholdVCal_Passed, "");

    gSCurve_T25->Fit(fuSCurve_T25);

    /*
     * SCurve Turnon
     */

    unsigned int pointTurnOn(0);

    for (unsigned int i(1); i < gSCurves_ThresholdVCal.size(); ++i) {
        TF1* f1 = new TF1("f1", "1 / (1 + exp([0] * (x - [1])))", 0., 240.);
        f1->SetParameters(-1., 50.);
        gSCurves_ThresholdVCal.at(i)->Fit(f1);
        double x(f1->GetParameter(1));
        double dy(f1->GetParError(1));
        if (x < 0. || x > 255.) continue;
        if (x < i) continue;
        gSCurve_TurnOn->SetPoint(pointTurnOn, i, x);
        gSCurve_TurnOn->SetPointError(pointTurnOn, 0.5, dy);
        ++pointTurnOn;
        delete f1;
    }

    /*
     * SCurve VCal vs Channel at T25 TRIM0
     */

    std::string pathScurveChannel_Trim0(std::string(argv[1]) + std::string("/scurve_channel_vcal_trim0.txt"));
    std::ifstream fileScurveChannel_Trim0;
    int lastChannel_Trim0 = -1;

    fileScurveChannel_Trim0.open(pathScurveChannel_Trim0.c_str());
    if (fileScurveChannel_Trim0.is_open()) {
        unsigned int lineNumber(0);
        std::string line;
        while (std::getline(fileScurveChannel_Trim0, line)) {
            std::istringstream iss(line);
            unsigned int channel;
            unsigned int vcal;
            double rate;
            if (lineNumber++ == 0) continue;
            iss >> channel >> vcal >> rate;

            if (channel != lastChannel_Trim0) {
                lastChannel_Trim0 = channel;
                gSCurves_ChannelVCal_Trim0.push_back(new TEfficiency("SCurveList", "SCurveList", 249, 0., 249.));
            }

            gSCurves_ChannelVCal_Trim0.at(channel)->SetTotalEvents(vcal + 1, 1000.);
            gSCurves_ChannelVCal_Trim0.at(channel)->SetPassedEvents(vcal + 1, rate * 1000.);

            hSCurve_ChannelVCal_Trim0_Total->SetBinContent(channel, vcal + 1, 1000.);
            hSCurve_ChannelVCal_Trim0_Passed->SetBinContent(channel, vcal + 1, rate * 1000.);
        }
    }

    gSCurve_ChannelVCal_Trim0->SetTotalHistogram(*hSCurve_ChannelVCal_Trim0_Total, "");
    gSCurve_ChannelVCal_Trim0->SetPassedHistogram(*hSCurve_ChannelVCal_Trim0_Passed, "");

    /*
     * SCurve Disp TRIM0
     */

    for (unsigned int i(1); i < gSCurves_ChannelVCal_Trim0.size(); ++i) {
        TF1* f1 = new TF1("f1", "1 / (1 + exp([0] * (x - [1])))", 0., 240.);
        f1->SetParameters(-1., 20.);
        gSCurves_ChannelVCal_Trim0.at(i)->Fit(f1);
        double x(f1->GetParameter(1));
        double sig(f1->GetParameter(0));
        double dsig(f1->GetParError(0));
        if (x < 0. || x > 255.) continue;
        hSCurve_ChannelVCal_Trim0_Disp->Fill(x);
        double ele(((ADC_C_CONV(150.) - ADC_C_CONV((150. - sig))) * -6241.41805018));
        double dele(((ADC_C_CONV(150.) - ADC_C_CONV((150. - sig))) - (ADC_C_CONV(150.) - ADC_C_CONV((150. - sig - dsig)))) * -6241.41805018);
        gSCurve_ChannelVCal_Trim0_Sigma->SetPoint(i - 1, i - 1, ele);
        gSCurve_ChannelVCal_Trim0_Sigma->SetPointError(i - 1, 0.5, dele / 2.);
    }

    /*
     * SCurve VCal vs Channel at T25 TRIM1
     */

    std::string pathScurveChannel_Trim1(std::string(argv[1]) + std::string("/scurve_channel_vcal_trim1.txt"));
    std::ifstream fileScurveChannel_Trim1;
    int lastChannel_Trim1 = -1;

    fileScurveChannel_Trim1.open(pathScurveChannel_Trim1.c_str());
    if (fileScurveChannel_Trim1.is_open()) {
        unsigned int lineNumber(0);
        std::string line;
        while (std::getline(fileScurveChannel_Trim1, line)) {
            std::istringstream iss(line);
            unsigned int channel;
            unsigned int vcal;
            double rate;
            if (lineNumber++ == 0) continue;
            iss >> channel >> vcal >> rate;

            if (channel != lastChannel_Trim1) {
                lastChannel_Trim1 = channel;
                gSCurves_ChannelVCal_Trim1.push_back(new TEfficiency("SCurveList", "SCurveList", 249, 0., 249.));
            }

            gSCurves_ChannelVCal_Trim1.at(channel)->SetTotalEvents(vcal + 1, 1000.);
            gSCurves_ChannelVCal_Trim1.at(channel)->SetPassedEvents(vcal + 1, rate * 1000.);

            hSCurve_ChannelVCal_Trim1_Total->SetBinContent(channel, vcal + 1, 1000.);
            hSCurve_ChannelVCal_Trim1_Passed->SetBinContent(channel, vcal + 1, rate * 1000.);
        }
    }

    gSCurve_ChannelVCal_Trim1->SetTotalHistogram(*hSCurve_ChannelVCal_Trim1_Total, "");
    gSCurve_ChannelVCal_Trim1->SetPassedHistogram(*hSCurve_ChannelVCal_Trim1_Passed, "");

    /*
     * SCurve Disp TRIM1
     */

    for (unsigned int i(1); i < gSCurves_ChannelVCal_Trim1.size(); ++i) {
        TF1* f1 = new TF1("f1", "1 / (1 + exp([0] * (x - [1])))", 0., 240.);
        f1->SetParameters(-1., 20.);
        gSCurves_ChannelVCal_Trim1.at(i)->Fit(f1);
        double x(f1->GetParameter(1));
        double sig(f1->GetParameter(0));
        double dsig(f1->GetParError(0));
        if (x < 0. || x > 255.) continue;
        hSCurve_ChannelVCal_Trim1_Disp->Fill(x);
        double ele(((ADC_C_CONV(150.) - ADC_C_CONV((150. - sig))) * -6241.41805018));
        double dele(((ADC_C_CONV(150.) - ADC_C_CONV((150. - sig))) - (ADC_C_CONV(150.) - ADC_C_CONV((150. - sig - dsig)))) * -6241.41805018);
        gSCurve_ChannelVCal_Trim1_Sigma->SetPoint(i - 1, i - 1, ele);
        gSCurve_ChannelVCal_Trim1_Sigma->SetPointError(i - 1, 0.5, dele / 2.);
        delete f1;
    }

    /*
     * SCurve VCal vs Channel at T25 TRIMED
     */

    std::string pathScurveChannel_Trimed(std::string(argv[1]) + std::string("/scurve_channel_vcal_trimed.txt"));
    std::ifstream fileScurveChannel_Trimed;
    int lastChannel_Trimed = -1;

    fileScurveChannel_Trimed.open(pathScurveChannel_Trimed.c_str());
    if (fileScurveChannel_Trimed.is_open()) {
        unsigned int lineNumber(0);
        std::string line;
        while (std::getline(fileScurveChannel_Trimed, line)) {
            std::istringstream iss(line);
            unsigned int channel;
            unsigned int vcal;
            double rate;
            if (lineNumber++ == 0) continue;
            iss >> channel >> vcal >> rate;

            if (channel != lastChannel_Trimed) {
                lastChannel_Trimed = channel;
                gSCurves_ChannelVCal_Trimed.push_back(new TEfficiency("SCurveList", "SCurveList", 249, 0., 249.));
            }

            gSCurves_ChannelVCal_Trimed.at(channel)->SetTotalEvents(vcal + 1, 1000.);
            gSCurves_ChannelVCal_Trimed.at(channel)->SetPassedEvents(vcal + 1, rate * 1000.);

            hSCurve_ChannelVCal_Trimed_Total->SetBinContent(channel, vcal + 1, 1000.);
            hSCurve_ChannelVCal_Trimed_Passed->SetBinContent(channel, vcal + 1, rate * 1000.);
        }
    }

    gSCurve_ChannelVCal_Trimed->SetTotalHistogram(*hSCurve_ChannelVCal_Trimed_Total, "");
    gSCurve_ChannelVCal_Trimed->SetPassedHistogram(*hSCurve_ChannelVCal_Trimed_Passed, "");

    /*
     * SCurve Disp TRIMED
     */

    for (unsigned int i(1); i < gSCurves_ChannelVCal_Trimed.size(); ++i) {
        TF1* f1 = new TF1("f1", "1 / (1 + exp([0] * (x - [1])))", 0., 240.);
        f1->SetParameters(-1., 20.);
        gSCurves_ChannelVCal_Trimed.at(i)->Fit(f1);
        double x(f1->GetParameter(1));
        double sig(f1->GetParameter(0));
        double dsig(f1->GetParError(0));
        if (x < 0. || x > 255.) continue;
        hSCurve_ChannelVCal_Trimed_Disp->Fill(x);
        double ele(((ADC_C_CONV(150.) - ADC_C_CONV((150. - sig))) * -6241.41805018));
        double dele(((ADC_C_CONV(150.) - ADC_C_CONV((150. - sig))) - (ADC_C_CONV(150.) - ADC_C_CONV((150. - sig - dsig)))) * -6241.41805018);
        gSCurve_ChannelVCal_Trimed_Sigma->SetPoint(i - 1, i - 1, ele);
        gSCurve_ChannelVCal_Trimed_Sigma->SetPointError(i - 1, 0.5, dele / 2.);
        delete f1;
    }

    /*
     * IComp
     */

    std::string pathIComp(std::string(argv[1]) + std::string("/dac_icomp.txt"));
    DacReader* dacIComp(new DacReader(pathIComp));
    std::vector< std::pair< unsigned int, double > > dataIComp(dacIComp->getData());
    std::vector< std::pair< unsigned int, double > > errorIComp(dacIComp->getError());
    unsigned int pointIComp(0);

    for (unsigned int i(1); i < dataIComp.size(); ++i) {
        if (errorIComp.at(i).second > 1) continue;

        gIComp_ADC->SetPoint(pointIComp, dataIComp.at(i).first, dataIComp.at(i).second);
        gIComp_ADC->SetPointError(pointIComp, 0.5, errorIComp.at(i).second);

        gIComp_Current->SetPoint(pointIComp, dataIComp.at(i).first, ADC_I_CONV(dataIComp.at(i).second));
        gIComp_Current->SetPointError(pointIComp, 0.5, ADC_I_CONV(errorIComp.at(i).second));

        ++pointIComp;
    }

    fuIComp->SetParameters(0., 1.E-3);
    gIComp_Current->Fit(fuIComp);

    delete dacIComp;

    /*
     * IPreampFeed
     */

    std::string pathIPreampFeed(std::string(argv[1]) + std::string("/dac_ipreampfeed.txt"));
    DacReader* dacIPreampFeed(new DacReader(pathIPreampFeed));
    std::vector< std::pair< unsigned int, double > > dataIPreampFeed(dacIPreampFeed->getData());
    std::vector< std::pair< unsigned int, double > > errorIPreampFeed(dacIPreampFeed->getError());
    unsigned int pointIPreampFeed(0);

    for (unsigned int i(1); i < dataIPreampFeed.size(); ++i) {
        if (errorIPreampFeed.at(i).second > 1) continue;

        gIPreampFeed_ADC->SetPoint(pointIPreampFeed, dataIPreampFeed.at(i).first, dataIPreampFeed.at(i).second);
        gIPreampFeed_ADC->SetPointError(pointIPreampFeed, 0.5, errorIPreampFeed.at(i).second);

        gIPreampFeed_Current->SetPoint(pointIPreampFeed, dataIPreampFeed.at(i).first, ADC_I_CONV(dataIPreampFeed.at(i).second));
        gIPreampFeed_Current->SetPointError(pointIPreampFeed, 0.5, ADC_I_CONV(errorIPreampFeed.at(i).second));

        ++pointIPreampFeed;
    }

    fuIPreampFeed->SetParameters(0., 1.E-3);
    gIPreampFeed_Current->Fit(fuIPreampFeed);

    delete dacIPreampFeed;

    /*
     * IPreampIn
     */

    std::string pathIPreampIn(std::string(argv[1]) + std::string("/dac_ipreampin.txt"));
    DacReader* dacIPreampIn(new DacReader(pathIPreampIn));
    std::vector< std::pair< unsigned int, double > > dataIPreampIn(dacIPreampIn->getData());
    std::vector< std::pair< unsigned int, double > > errorIPreampIn(dacIPreampIn->getError());
    unsigned int pointIPreampIn(0);

    for (unsigned int i(1); i < dataIPreampIn.size(); ++i) {
        if (errorIPreampIn.at(i).second > 1) continue;

        gIPreampIn_ADC->SetPoint(pointIPreampIn, dataIPreampIn.at(i).first, dataIPreampIn.at(i).second);
        gIPreampIn_ADC->SetPointError(pointIPreampIn, 0.5, errorIPreampIn.at(i).second);

        gIPreampIn_Current->SetPoint(pointIPreampIn, dataIPreampIn.at(i).first, ADC_I_CONV(dataIPreampIn.at(i).second));
        gIPreampIn_Current->SetPointError(pointIPreampIn, 0.5, ADC_I_CONV(errorIPreampIn.at(i).second));

        ++pointIPreampIn;
    }

    fuIPreampIn->SetParameters(0., 1.E-3);
    gIPreampIn_Current->Fit(fuIPreampIn);

    delete dacIPreampIn;

    /*
     * IPreampOut
     */

    std::string pathIPreampOut(std::string(argv[1]) + std::string("/dac_ipreampout.txt"));
    DacReader* dacIPreampOut(new DacReader(pathIPreampOut));
    std::vector< std::pair< unsigned int, double > > dataIPreampOut(dacIPreampOut->getData());
    std::vector< std::pair< unsigned int, double > > errorIPreampOut(dacIPreampOut->getError());
    unsigned int pointIPreampOut(0);

    for (unsigned int i(1); i < dataIPreampOut.size(); ++i) {
        if (errorIPreampOut.at(i).second > 1) continue;

        gIPreampOut_ADC->SetPoint(pointIPreampOut, dataIPreampOut.at(i).first, dataIPreampOut.at(i).second);
        gIPreampOut_ADC->SetPointError(pointIPreampOut, 0.5, errorIPreampOut.at(i).second);

        gIPreampOut_Current->SetPoint(pointIPreampOut, dataIPreampOut.at(i).first, ADC_I_CONV(dataIPreampOut.at(i).second));
        gIPreampOut_Current->SetPointError(pointIPreampOut, 0.5, ADC_I_CONV(errorIPreampOut.at(i).second));

        ++pointIPreampOut;
    }

    fuIPreampOut->SetParameters(0., 1.E-4);
    gIPreampOut_Current->Fit(fuIPreampOut);

    delete dacIPreampOut;

    /*
     * IShaper
     */

    std::string pathIShaper(std::string(argv[1]) + std::string("/dac_ishaper.txt"));
    DacReader* dacIShaper(new DacReader(pathIShaper));
    std::vector< std::pair< unsigned int, double > > dataIShaper(dacIShaper->getData());
    std::vector< std::pair< unsigned int, double > > errorIShaper(dacIShaper->getError());
    unsigned int pointIShaper(0);

    for (unsigned int i(1); i < dataIShaper.size(); ++i) {
        if (errorIShaper.at(i).second > 1) continue;

        gIShaper_ADC->SetPoint(pointIShaper, dataIShaper.at(i).first, dataIShaper.at(i).second);
        gIShaper_ADC->SetPointError(pointIShaper, 0.5, errorIShaper.at(i).second);

        gIShaper_Current->SetPoint(pointIShaper, dataIShaper.at(i).first, ADC_I_CONV(dataIShaper.at(i).second));
        gIShaper_Current->SetPointError(pointIShaper, 0.5, ADC_I_CONV(errorIShaper.at(i).second));

        ++pointIShaper;
    }

    fuIShaper->SetParameters(0., 1.E-3);
    gIShaper_Current->Fit(fuIShaper);

    delete dacIShaper;

    /*
     * IShaperFeed
     */

    std::string pathIShaperFeed(std::string(argv[1]) + std::string("/dac_ishaperfeed.txt"));
    DacReader* dacIShaperFeed(new DacReader(pathIShaperFeed));
    std::vector< std::pair< unsigned int, double > > dataIShaperFeed(dacIShaperFeed->getData());
    std::vector< std::pair< unsigned int, double > > errorIShaperFeed(dacIShaperFeed->getError());
    unsigned int pointIShaperFeed(0);

    for (unsigned int i(1); i < dataIShaperFeed.size(); ++i) {
        if (errorIShaperFeed.at(i).second > 1) continue;

        gIShaperFeed_ADC->SetPoint(pointIShaperFeed, dataIShaperFeed.at(i).first, dataIShaperFeed.at(i).second);
        gIShaperFeed_ADC->SetPointError(pointIShaperFeed, 0.5, errorIShaperFeed.at(i).second);

        gIShaperFeed_Current->SetPoint(pointIShaperFeed, dataIShaperFeed.at(i).first, ADC_I_CONV(dataIShaperFeed.at(i).second));
        gIShaperFeed_Current->SetPointError(pointIShaperFeed, 0.5, ADC_I_CONV(errorIShaperFeed.at(i).second));

        ++pointIShaperFeed;
    }

    fuIShaperFeed->SetParameters(0., 4.E-4);
    gIShaperFeed_Current->Fit(fuIShaperFeed);

    delete dacIShaperFeed;

    /*
     * VCal
     */

    std::string pathVCal(std::string(argv[1]) + std::string("/dac_vcal.txt"));
    DacReader* dacVCal(new DacReader(pathVCal));
    std::vector< std::pair< unsigned int, double > > dataVCal(dacVCal->getData());
    std::vector< std::pair< unsigned int, double > > errorVCal(dacVCal->getError());
    unsigned int pointVCal(0);

    for (unsigned int i(1); i < dataVCal.size(); ++i) {
        if (errorVCal.at(i).second > 1) continue;

        gVCal_ADC->SetPoint(pointVCal, dataVCal.at(i).first, dataVCal.at(i).second);
        gVCal_ADC->SetPointError(pointVCal, 0.5, errorVCal.at(i).second);

        gVCal_Voltage->SetPoint(pointVCal, dataVCal.at(i).first, ADC_V_CONV(dataVCal.at(i).second));
        gVCal_Voltage->SetPointError(pointVCal, 0.5, ADC_V_CONV(errorVCal.at(i).second));

        ++pointVCal;
    }

    fuVCal->SetParameters(140., -1.);
    gVCal_Voltage->Fit(fuVCal);

    delete dacVCal;

    /*
     * VCal_Bis
     */

    std::string pathVCal_Bis(std::string(argv[1]) + std::string("/dac_vcal_bis.txt"));
    DacReader* dacVCal_Bis(new DacReader(pathVCal_Bis));
    std::vector< std::pair< unsigned int, double > > dataVCal_Bis(dacVCal_Bis->getData());
    std::vector< std::pair< unsigned int, double > > errorVCal_Bis(dacVCal_Bis->getError());
    unsigned int pointVCal_Bis(0);

    for (unsigned int i(1); i < dataVCal_Bis.size(); ++i) {
        if (errorVCal_Bis.at(i).second > 1) continue;

        gVCal_Bis_ADC->SetPoint(pointVCal_Bis, dataVCal_Bis.at(i).first, dataVCal_Bis.at(i).second);
        gVCal_Bis_ADC->SetPointError(pointVCal_Bis, 0.5, errorVCal_Bis.at(i).second);

        gVCal_Bis_Voltage->SetPoint(pointVCal_Bis, dataVCal_Bis.at(i).first, ADC_V_CONV(dataVCal_Bis.at(i).second));
        gVCal_Bis_Voltage->SetPointError(pointVCal_Bis, 0.5, ADC_V_CONV(errorVCal_Bis.at(i).second));

        gCal_Charge->SetPoint(pointVCal_Bis, dataVCal_Bis.at(i).first, ADC_C_CONV((265.88 - dataVCal_Bis.at(i).second)));
        gCal_Charge->SetPointError(pointVCal_Bis, 0.5, ADC_C_CONV((errorVCal_Bis.at(i).second)));

        ++pointVCal_Bis;
    }

    fuVCal_Bis->SetParameters(0.78, -1.);
    gVCal_Bis_Voltage->Fit(fuVCal_Bis);

    fuCal_Charge->SetParameters(0., 1.E-15);
    gCal_Charge->Fit(fuCal_Charge);

    delete dacVCal_Bis;

    /*
     * VBaseline
     */

    std::string pathVBaseline(std::string(argv[1]) + std::string("/dac_vbaseline.txt"));
    DacReader* dacVBaseline(new DacReader(pathVBaseline));
    std::vector< std::pair< unsigned int, double > > dataVBaseline(dacVBaseline->getData());
    std::vector< std::pair< unsigned int, double > > errorVBaseline(dacVBaseline->getError());
    unsigned int pointVBaseline(0);

    for (unsigned int i(1); i < dataVBaseline.size(); ++i) {
        if (errorVBaseline.at(i).second > 1) continue;

        gVBaseline_ADC->SetPoint(pointVBaseline, dataVBaseline.at(i).first, dataVBaseline.at(i).second);
        gVBaseline_ADC->SetPointError(pointVBaseline, 0.5, errorVBaseline.at(i).second);

        gVBaseline_Voltage->SetPoint(pointVBaseline, dataVBaseline.at(i).first, ADC_V_CONV(dataVBaseline.at(i).second));
        gVBaseline_Voltage->SetPointError(pointVBaseline, 0.5, ADC_V_CONV(errorVBaseline.at(i).second));

        ++pointVBaseline;
    }

    fuVBaseline->SetParameters(0.77, -0.01);
    gVBaseline_Voltage->Fit(fuVBaseline);

    delete dacVBaseline;

    /*
     * VThreshold1
     */

    std::string pathVThreshold1(std::string(argv[1]) + std::string("/dac_vthreshold1.txt"));
    DacReader* dacVThreshold1(new DacReader(pathVThreshold1));
    std::vector< std::pair< unsigned int, double > > dataVThreshold1(dacVThreshold1->getData());
    std::vector< std::pair< unsigned int, double > > errorVThreshold1(dacVThreshold1->getError());
    unsigned int pointVThreshold1(0);

    for (unsigned int i(1); i < dataVThreshold1.size(); ++i) {
        if (errorVThreshold1.at(i).second > 1) continue;

        gVThreshold1_ADC->SetPoint(pointVThreshold1, dataVThreshold1.at(i).first, dataVThreshold1.at(i).second);
        gVThreshold1_ADC->SetPointError(pointVThreshold1, 0.5, errorVThreshold1.at(i).second);

        gVThreshold1_Voltage->SetPoint(pointVThreshold1, dataVThreshold1.at(i).first, ADC_V_CONV(dataVThreshold1.at(i).second));
        gVThreshold1_Voltage->SetPointError(pointVThreshold1, 0.5, ADC_V_CONV(errorVThreshold1.at(i).second));

        ++pointVThreshold1;
    }

    fuVThreshold1->SetParameters(4., -1.E-2);
    gVThreshold1_Voltage->Fit(fuVThreshold1);

    delete dacVThreshold1;

    /*
     * VThreshold2
     */

    std::string pathVThreshold2(std::string(argv[1]) + std::string("/dac_vthreshold2.txt"));
    DacReader* dacVThreshold2(new DacReader(pathVThreshold2));
    std::vector< std::pair< unsigned int, double > > dataVThreshold2(dacVThreshold2->getData());
    std::vector< std::pair< unsigned int, double > > errorVThreshold2(dacVThreshold2->getError());
    unsigned int pointVThreshold2(0);

    for (unsigned int i(1); i < dataVThreshold2.size(); ++i) {
        if (errorVThreshold2.at(i).second > 1) continue;

        gVThreshold2_ADC->SetPoint(pointVThreshold2, dataVThreshold2.at(i).first, dataVThreshold2.at(i).second);
        gVThreshold2_ADC->SetPointError(pointVThreshold2, 0.5, errorVThreshold2.at(i).second);

        gVThreshold2_Voltage->SetPoint(pointVThreshold2, dataVThreshold2.at(i).first, ADC_V_CONV(dataVThreshold2.at(i).second));
        gVThreshold2_Voltage->SetPointError(pointVThreshold2, 0.5, ADC_V_CONV(errorVThreshold2.at(i).second));

        ++pointVThreshold2;
    }

    fuVThreshold2->SetParameters(4., -1.E-2);
    gVThreshold2_Voltage->Fit(fuVThreshold2);

    delete dacVThreshold2;

    /* */

    gThreshold_Channel->Write();
    gThreshold_SBits->Write();
    gThreshold_TK->Write();
    gSCurve_ThresholdVCal->Write();
    gSCurve_T25->Write();
    fuSCurve_T25->Write("fuSCurve_T25");
    gSCurve_TurnOn->Write("gSCurve_TurnOn");
    gSCurve_ChannelVCal_Trim0->Write();
    hSCurve_ChannelVCal_Trim0_Disp->Write();
    gSCurve_ChannelVCal_Trim0_Sigma->Write("gSCurve_ChannelVCal_Trim0_Sigma");
    gSCurve_ChannelVCal_Trim1->Write();
    hSCurve_ChannelVCal_Trim1_Disp->Write();
    gSCurve_ChannelVCal_Trim1_Sigma->Write("gSCurve_ChannelVCal_Trim1_Sigma");
    gSCurve_ChannelVCal_Trimed->Write();
    hSCurve_ChannelVCal_Trimed_Disp->Write();
    gSCurve_ChannelVCal_Trimed_Sigma->Write("gSCurve_ChannelVCal_Trimed_Sigma");
    gIComp_ADC->Write("gIComp_ADC");
    fuIComp->Write("fuIComp");
    gIComp_Current->Write("gIComp_Current");
    gIPreampFeed_ADC->Write("gIPreampFeed_ADC");
    fuIPreampFeed->Write("fuIPreampFeed");
    gIPreampFeed_Current->Write("gIPreampFeed_Current");
    gIPreampIn_ADC->Write("gIPreampIn_ADC");
    fuIPreampIn->Write("fuIPreampIn");
    gIPreampIn_Current->Write("gIPreampIn_Current");
    gIPreampOut_ADC->Write("gIPreampOut_ADC");
    fuIPreampOut->Write("fuIPreampOut");
    gIPreampOut_Current->Write("gIPreampOut_Current");
    gIShaper_ADC->Write("gIShaper_ADC");
    fuIShaper->Write("fuIShaper");
    gIShaper_Current->Write("gIShaper_Current");
    gIShaperFeed_ADC->Write("gIShaperFeed_ADC");
    fuIShaperFeed->Write("fuIShaperFeed");
    gIShaperFeed_Current->Write("gIShaperFeed_Current");
    gVCal_ADC->Write("gVCal_ADC");
    fuVCal->Write("fuVCal");
    gVCal_Voltage->Write("gVCal_Voltage");
    gVCal_Bis_ADC->Write("gVCal_Bis_ADC");
    fuVCal_Bis->Write("fuVCal_Bis");
    gVCal_Bis_Voltage->Write("gVCal_Bis_Voltage");
    gVBaseline_ADC->Write("gVBaseline_ADC");
    fuVBaseline->Write("fuVBaseline");
    gVBaseline_Voltage->Write("gVBaseline_Voltage");
    gVThreshold1_ADC->Write("gVThreshold1_ADC");
    fuVThreshold1->Write("fuVThreshold1");
    gVThreshold1_Voltage->Write("gVThreshold1_Voltage");
    gVThreshold2_ADC->Write("gVThreshold2_ADC");
    fuVThreshold2->Write("fuVThreshold2");
    gVThreshold2_Voltage->Write("gVThreshold2_Voltage");
    gCal_Charge->Write("gCal_Charge");
    fuCal_Charge->Write("fuCal_Charge");

    rootFile->Close();

    return 0;
}
