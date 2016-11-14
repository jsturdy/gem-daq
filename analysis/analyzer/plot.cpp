// Canvas
// Axis
// Legend
// Data
// Style
// Draw

#include <iostream>

#include "TROOT.h"
#include "TFile.h"
#include "TString.h"
#include "TEfficiency.h"
#include "TGraphAsymmErrors.h"
#include "TGraphErrors.h"
#include "TCanvas.h"
#include "TLegend.h"
#include "TAxis.h"
#include "TH2D.h"
#include "TText.h"
#include "TColor.h"
#include "TGaxis.h"
#include "TF1.h"
#include "TStyle.h"

#define ADC_V_CONV(X) (2. * (0.0029 * X - 0.0093))
#define ADC_I_CONV(X) (((X - 3.2986) / 679.53) / 2000.)
// #define ADC_C_CONV(X) (2. * (-1.12796 + 0.0400236 * X + 1.00322e-05 * X * X))
#define ADC_C_CONV(X) ((1.514 - (1.529 - 0.00084494 * X)) * 100.)

#define EMPTY_2D_WHEN_NULL  1

const unsigned int COLOR_1 = TColor::GetColor("#1f77b4");
const unsigned int COLOR_2 = TColor::GetColor("#ff7f0e");
const unsigned int COLOR_3 = TColor::GetColor("#2ca02c");
const unsigned int COLOR_4 = TColor::GetColor("#d62728");
const unsigned int COLOR_5 = TColor::GetColor("#9467bd");
const unsigned int COLOR_6 = TColor::GetColor("#8c564b");
const unsigned int COLOR_7 = TColor::GetColor("#e377c2");
const unsigned int COLOR_8 = TColor::GetColor("#7f7f7f");
const unsigned int COLOR_9 = TColor::GetColor("#bcbd22");
const unsigned int COLOR_10 = TColor::GetColor("#17becf");

/* */

TH2D* dummyHisto;

TFile* fEffvsHV;
TFile* fEffvsThreshold;
TFile* fEffvsRate;
TFile* fThresholdvsHv;

TFile* fEffvsThreshold_tk137_mu25;
TFile* fEffvsThreshold_tk204_mu30;
TFile* fEffvsThreshold_tk205_mu40;
TFile* fEffvsThreshold_tk206_mu50;

TFile* fEffvsThreshold_tk172_pi25;
TFile* fEffvsThreshold_tk207_pi30;
TFile* fEffvsThreshold_tk87_pi50;

TFile* fEffvsRate_tk152;
TFile* fEffvsRate_tk154;
TFile* fEffvsRate_tk155;
TFile* fEffvsRate_tk157;
TFile* fEffvsRate_tk159;
TFile* fEffvsRate_tk160;
TFile* fEffvsRate_tk166;
TFile* fEffvsRate_tk167;
TFile* fEffvsRate_tk171;
TFile* fEffvsRate_tk172;

TFile* fCalibration;

TFile* fLatency;

TFile* fOutputFile;

const double rates[] = { 19.52430556, 27.143125, 41.66177083, 55.55138889, 74.33555556, 93.81671875, 101.8861979, 108.5777604, 115.0398958 };
const double rates_tk[] = { 19.64, 27.63, 40.96, 76.50, 86.16, 107.60, 113.35, 109.21, 111.51, 107.64 };

/* */

void Run(TString GEM) {

    TString GEMName = (GEM == "GEM0" ? TString("GE1/1_VI_L_CERN_0001") : TString("GE1/1_VI_L_CERN_0002"));

    /*
     * Get plots
     */

    TEfficiency* hEfficiency_HV = (TEfficiency*) fEffvsHV->Get(TString("hEfficiency_" + GEM));
    TGraphAsymmErrors* hComputedEfficiency_HV = (TGraphAsymmErrors*) fEffvsHV->Get(TString("hComputedEfficiency_" + GEM));
    TEfficiency* hNoise_HV = (TEfficiency*) fEffvsHV->Get(TString("hNoise_" + GEM));

    TEfficiency* hEfficiency_Threshold = (TEfficiency*) fEffvsThreshold->Get(TString("hEfficiency_" + GEM));
    TGraphAsymmErrors* hComputedEfficiency_Threshold = (TGraphAsymmErrors*) fEffvsThreshold->Get(TString("hComputedEfficiency_" + GEM));
    TEfficiency* hNoise_Threshold = (TEfficiency*) fEffvsThreshold->Get(TString("hNoise_" + GEM));

    TEfficiency* hEfficiency_Rate = (TEfficiency*) fEffvsRate->Get(TString("hEfficiency_" + GEM));
    TGraphAsymmErrors* hComputedEfficiency_Rate = (TGraphAsymmErrors*) fEffvsRate->Get(TString("hComputedEfficiency_" + GEM));
    TEfficiency* hNoise_Rate = (TEfficiency*) fEffvsRate->Get(TString("hNoise_" + GEM));

    TEfficiency* hNoise_700 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_700_" + GEM));
    TEfficiency* hNoise_710 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_710_" + GEM));
    TEfficiency* hNoise_720 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_720_" + GEM));
    TEfficiency* hNoise_730 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_730_" + GEM));
    TEfficiency* hNoise_740 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_740_" + GEM));
    TEfficiency* hNoise_750 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_750_" + GEM));
    TEfficiency* hNoise_760 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_760_" + GEM));
    TEfficiency* hNoise_770 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_770_" + GEM));
    TEfficiency* hNoise_780 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_780_" + GEM));
    TEfficiency* hNoise_790 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_790_" + GEM));
    TEfficiency* hNoise_800 = (TEfficiency*) fThresholdvsHv->Get(TString("hNoise_800_" + GEM));

    TEfficiency* hEfficiency_Threshold_mu25 = (TEfficiency*) fEffvsThreshold_tk137_mu25->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Threshold_mu30 = (TEfficiency*) fEffvsThreshold_tk204_mu30->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Threshold_mu40 = (TEfficiency*) fEffvsThreshold_tk205_mu40->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Threshold_mu50 = (TEfficiency*) fEffvsThreshold_tk206_mu50->Get(TString("hEfficiency_" + GEM));

    TH1D* hClusterSize_Dual_Threshold_mu25 = (TH1D*) fEffvsThreshold_tk137_mu25->Get(TString("hClusterSize_ClusterMultiplicityDual_" + GEM));
    TH1D* hClusterSize_Dual_Threshold_mu30 = (TH1D*) fEffvsThreshold_tk204_mu30->Get(TString("hClusterSize_ClusterMultiplicityDual_" + GEM));
    TH1D* hClusterSize_Dual_Threshold_mu40 = (TH1D*) fEffvsThreshold_tk205_mu40->Get(TString("hClusterSize_ClusterMultiplicityDual_" + GEM));
    TH1D* hClusterSize_Dual_Threshold_mu50 = (TH1D*) fEffvsThreshold_tk206_mu50->Get(TString("hClusterSize_ClusterMultiplicityDual_" + GEM));

    TH1D* hClusterMultiplicity_NoCut_Threshold_mu25 = (TH1D*) fEffvsThreshold_tk137_mu25->Get(TString("hClusterMultiplicity_NoCut_" + GEM));
    TH1D* hClusterMultiplicity_NoCut_Threshold_mu30 = (TH1D*) fEffvsThreshold_tk204_mu30->Get(TString("hClusterMultiplicity_NoCut_" + GEM));
    TH1D* hClusterMultiplicity_NoCut_Threshold_mu40 = (TH1D*) fEffvsThreshold_tk205_mu40->Get(TString("hClusterMultiplicity_NoCut_" + GEM));
    TH1D* hClusterMultiplicity_NoCut_Threshold_mu50 = (TH1D*) fEffvsThreshold_tk206_mu50->Get(TString("hClusterMultiplicity_NoCut_" + GEM));

    TH1D* hClusterSize_Dual_Threshold_pi25 = (TH1D*) fEffvsThreshold_tk172_pi25->Get(TString("hClusterSize_ClusterMultiplicityDual_" + GEM));
    TH1D* hClusterSize_Dual_Threshold_pi30 = (TH1D*) fEffvsThreshold_tk207_pi30->Get(TString("hClusterSize_ClusterMultiplicityDual_" + GEM));
    TH1D* hClusterSize_Dual_Threshold_pi50 = (TH1D*) fEffvsThreshold_tk87_pi50->Get(TString("hClusterSize_ClusterMultiplicityDual_" + GEM));

    TH1D* hClusterMultiplicity_NoCut_Threshold_pi25 = (TH1D*) fEffvsThreshold_tk172_pi25->Get(TString("hClusterMultiplicity_NoCut_" + GEM));
    TH1D* hClusterMultiplicity_NoCut_Threshold_pi30 = (TH1D*) fEffvsThreshold_tk207_pi30->Get(TString("hClusterMultiplicity_NoCut_" + GEM));
    TH1D* hClusterMultiplicity_NoCut_Threshold_pi50 = (TH1D*) fEffvsThreshold_tk87_pi50->Get(TString("hClusterMultiplicity_NoCut_" + GEM));

    TH1D* hBeamProfile_mu =(TH1D*) fEffvsThreshold_tk137_mu25->Get(TString("hBeamProfile_All_" + GEM));
    TH1D* hBeamProfile_pi =(TH1D*) fEffvsThreshold_tk172_pi25->Get(TString("hBeamProfile_All_" + GEM));

    TEfficiency* hEfficiency_Rate_tk152 = (TEfficiency*) fEffvsRate_tk152->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk154 = (TEfficiency*) fEffvsRate_tk154->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk155 = (TEfficiency*) fEffvsRate_tk155->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk157 = (TEfficiency*) fEffvsRate_tk157->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk159 = (TEfficiency*) fEffvsRate_tk159->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk160 = (TEfficiency*) fEffvsRate_tk160->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk166 = (TEfficiency*) fEffvsRate_tk166->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk167 = (TEfficiency*) fEffvsRate_tk167->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk171 = (TEfficiency*) fEffvsRate_tk171->Get(TString("hEfficiency_" + GEM));
    TEfficiency* hEfficiency_Rate_tk172 = (TEfficiency*) fEffvsRate_tk172->Get(TString("hEfficiency_" + GEM));

    TEfficiency* gLatency = (TEfficiency*) fLatency->Get(TString("hEfficiency_" + GEM));

    /*
     * Efficiency vs HV
     */

    // Canvas and graphs
    TCanvas* cEfficiency_HV(new TCanvas(TString("cEfficiency_HV_" + GEM), TString("cEfficiency_HV" + GEM), 800, 600));
    TGraphAsymmErrors* gEfficiency_HV = hEfficiency_HV->CreateGraph();
    TGraphAsymmErrors* gNoise_HV = hNoise_HV->CreateGraph();

    cEfficiency_HV->cd();
    cEfficiency_HV->SetGrid();

    // Axis
    dummyHisto = new TH2D("h1", ";High voltage divider current [#muA];Hits to events ratio", 10, 695., 815., 10, 0., 1.);
    dummyHisto->Draw();

    // Legend
    TLegend* lEfficiency_HV(new TLegend(695., 0.7, 750., 1., "", ""));
    lEfficiency_HV->SetTextSize(0.035);
    lEfficiency_HV->AddEntry(gEfficiency_HV, "Measured efficiency", "fep");
    lEfficiency_HV->AddEntry(hComputedEfficiency_HV, "Computed efficiency", "fep");
    lEfficiency_HV->AddEntry(gNoise_HV, "Measured noise", "fep");

    // Data
    for (unsigned int i(0); i < gEfficiency_HV->GetN(); i++) {
        double x, y;

        gEfficiency_HV->GetPoint(i, x, y);
        gEfficiency_HV->SetPoint(i, x - 5., y);
        gEfficiency_HV->SetPointEXlow(i, 1.5);
        gEfficiency_HV->SetPointEXhigh(i, 1.5);

        hComputedEfficiency_HV->GetPoint(i, x, y);
        hComputedEfficiency_HV->SetPoint(i, x - 5., y);
        hComputedEfficiency_HV->SetPointEXlow(i, 1.5);
        hComputedEfficiency_HV->SetPointEXhigh(i, 1.5);

        gNoise_HV->GetPoint(i, x, y);
        gNoise_HV->SetPoint(i, x - 5., y);
        gNoise_HV->SetPointEXlow(i, 1.5);
        gNoise_HV->SetPointEXhigh(i, 1.5);
    }

    // Style
    gEfficiency_HV->SetMarkerStyle(22);
    gEfficiency_HV->SetMarkerColor(COLOR_1);
    gEfficiency_HV->SetMarkerSize(1.4);
    gEfficiency_HV->SetFillStyle(3003);
    gEfficiency_HV->SetFillColor(COLOR_1);

    hComputedEfficiency_HV->SetMarkerStyle(23);
    hComputedEfficiency_HV->SetMarkerColor(COLOR_2);
    hComputedEfficiency_HV->SetMarkerSize(1.6);
    hComputedEfficiency_HV->SetFillStyle(3003);
    hComputedEfficiency_HV->SetFillColor(COLOR_2);

    gNoise_HV->SetMarkerStyle(20);
    gNoise_HV->SetMarkerColor(COLOR_3);
    gNoise_HV->SetMarkerSize(1.2);
    gNoise_HV->SetFillStyle(3003);
    gNoise_HV->SetFillColor(COLOR_3);

    // Draw
    gEfficiency_HV->Draw("2 same");
    gEfficiency_HV->Draw("p same");
    hComputedEfficiency_HV->Draw("2 same");
    hComputedEfficiency_HV->Draw("p same");
    gNoise_HV->Draw("2 same");
    gNoise_HV->Draw("p same");
    lEfficiency_HV->Draw();
    cEfficiency_HV->Write();

    /*
     * Efficiency vs Threshold
     */

    // Canvas and graphs
    TCanvas* cEfficiency_Threshold(new TCanvas(TString("cEfficiency_Threshold_" + GEM), TString("cEfficiency_Threshold" + GEM), 800, 600));
    TGraphAsymmErrors* gEfficiency_Threshold = hEfficiency_Threshold->CreateGraph();
    TGraphAsymmErrors* gNoise_Threshold = hNoise_Threshold->CreateGraph();
    TGraphAsymmErrors* gEfficiency_Threshold_Tk(new TGraphAsymmErrors());

    cEfficiency_Threshold->cd();
    cEfficiency_Threshold->SetGrid();

    // Axis
    dummyHisto = new TH2D("h2", TString(";VFAT2 Threshold [VFAT2 units];Hits to events ratio"), 10, -2.5, 62.5, 10, 0., 1.);
    dummyHisto->Draw();

    // Legend
    TLegend* lEfficiency_Threshold(new TLegend(15., 0.4, 45., 0.8, "", ""));
    lEfficiency_Threshold->SetTextSize(0.035);
    lEfficiency_Threshold->AddEntry(gEfficiency_Threshold, "Measured efficiency", "fep");
    lEfficiency_Threshold->AddEntry(hComputedEfficiency_Threshold, "Computed efficiency", "fep");
    lEfficiency_Threshold->AddEntry(gEfficiency_Threshold_Tk, "Tracking data efficiency", "fep");
    lEfficiency_Threshold->AddEntry(gNoise_Threshold, "Measured noise", "fep");

    // Data
    for (unsigned int i(0); i < gEfficiency_Threshold->GetN(); i++) {
        double x, y;

        gEfficiency_Threshold->GetPoint(i, x, y);
        gEfficiency_Threshold->SetPoint(i, x - 2.5, y);
        gEfficiency_Threshold->SetPointEXlow(i, 1.);
        gEfficiency_Threshold->SetPointEXhigh(i, 1.);

        hComputedEfficiency_Threshold->GetPoint(i, x, y);
        hComputedEfficiency_Threshold->SetPoint(i, x - 2.5, y);
        hComputedEfficiency_Threshold->SetPointEXlow(i, 1.);
        hComputedEfficiency_Threshold->SetPointEXhigh(i, 1.);

        gNoise_Threshold->GetPoint(i, x, y);
        gNoise_Threshold->SetPoint(i, x - 2.5, y);
        gNoise_Threshold->SetPointEXlow(i, 1.);
        gNoise_Threshold->SetPointEXhigh(i, 1.);
    }

    gEfficiency_Threshold_Tk->SetPoint(0, 25., hEfficiency_Threshold_mu25->GetEfficiency(1));
    gEfficiency_Threshold_Tk->SetPointError(0, 1., 1., hEfficiency_Threshold_mu25->GetEfficiencyErrorLow(1), hEfficiency_Threshold_mu25->GetEfficiencyErrorUp(1));

    gEfficiency_Threshold_Tk->SetPoint(1, 30., hEfficiency_Threshold_mu30->GetEfficiency(1));
    gEfficiency_Threshold_Tk->SetPointError(1, 1., 1., hEfficiency_Threshold_mu30->GetEfficiencyErrorLow(1), hEfficiency_Threshold_mu30->GetEfficiencyErrorUp(1));

    gEfficiency_Threshold_Tk->SetPoint(2, 40., hEfficiency_Threshold_mu40->GetEfficiency(1));
    gEfficiency_Threshold_Tk->SetPointError(2, 1., 1., hEfficiency_Threshold_mu40->GetEfficiencyErrorLow(1), hEfficiency_Threshold_mu40->GetEfficiencyErrorUp(1));

    gEfficiency_Threshold_Tk->SetPoint(3, 50., hEfficiency_Threshold_mu50->GetEfficiency(1));
    gEfficiency_Threshold_Tk->SetPointError(3, 1., 1., hEfficiency_Threshold_mu50->GetEfficiencyErrorLow(1), hEfficiency_Threshold_mu50->GetEfficiencyErrorUp(1));

    // Style
    gEfficiency_Threshold->SetMarkerStyle(22);
    gEfficiency_Threshold->SetMarkerColor(COLOR_1);
    gEfficiency_Threshold->SetMarkerSize(1.4);
    gEfficiency_Threshold->SetFillStyle(3003);
    gEfficiency_Threshold->SetFillColor(COLOR_1);

    hComputedEfficiency_Threshold->SetMarkerStyle(23);
    hComputedEfficiency_Threshold->SetMarkerColor(COLOR_2);
    hComputedEfficiency_Threshold->SetMarkerSize(1.6);
    hComputedEfficiency_Threshold->SetFillStyle(3003);
    hComputedEfficiency_Threshold->SetFillColor(COLOR_2);

    gNoise_Threshold->SetMarkerStyle(20);
    gNoise_Threshold->SetMarkerColor(COLOR_3);
    gNoise_Threshold->SetMarkerSize(1.2);
    gNoise_Threshold->SetFillStyle(3003);
    gNoise_Threshold->SetFillColor(COLOR_3);

    gEfficiency_Threshold_Tk->SetMarkerStyle(21);
    gEfficiency_Threshold_Tk->SetMarkerColor(COLOR_5);
    gEfficiency_Threshold_Tk->SetMarkerSize(1.2);
    gEfficiency_Threshold_Tk->SetFillStyle(3003);
    gEfficiency_Threshold_Tk->SetFillColor(COLOR_5);

    // Draw
    gEfficiency_Threshold->Draw("2 same");
    gEfficiency_Threshold->Draw("p same");
    hComputedEfficiency_Threshold->Draw("2 same");
    hComputedEfficiency_Threshold->Draw("p same");
    gEfficiency_Threshold_Tk->Draw("2 same");
    gEfficiency_Threshold_Tk->Draw("p same");
    gNoise_Threshold->Draw("2 same");
    gNoise_Threshold->Draw("p same");
    lEfficiency_Threshold->Draw();
    cEfficiency_Threshold->Write();

    /*
     * Efficiency vs Rate
     */

    // Canvas and graphs
    TCanvas* cEfficiency_Rate(new TCanvas(TString("cEfficiency_Rate_" + GEM), TString("cEfficiency_Rate" + GEM), 800, 600));
    TGraphAsymmErrors* gEfficiency_Rate = hEfficiency_Rate->CreateGraph();
    TGraphAsymmErrors* gNoise_Rate = hNoise_Rate->CreateGraph();
    TGraphAsymmErrors* gEfficiency_Rate_Tk(new TGraphAsymmErrors());

    cEfficiency_Rate->cd();
    cEfficiency_Rate->SetGrid();

    // Axis
    dummyHisto = new TH2D("h3", TString(";Trigger rate [kHz];Hits to events ratio"), 10, 10., 120., 10, 0.94, 1.);
    dummyHisto->Draw();

    // Legend
    TLegend* lEfficiency_Rate(new TLegend(10., 0.985, 60., 1., "", ""));
    lEfficiency_Rate->SetTextSize(0.035);
    lEfficiency_Rate->AddEntry(gEfficiency_Rate, "Measured efficiency", "fep");
    lEfficiency_Rate->AddEntry(hComputedEfficiency_Rate, "Computed efficiency", "fep");
    lEfficiency_Rate->AddEntry(gEfficiency_Rate_Tk, "Tracking data efficiency", "fep");
    // lEfficiency_Rate->AddEntry(gNoise_Rate, "Measured noise", "fep");

    // Data
    for (unsigned int i(0); i < gEfficiency_Rate->GetN(); i++) {
        double x, y;

        gEfficiency_Rate->GetPoint(i, x, y);
        gEfficiency_Rate->SetPoint(i, rates[i], y);
        gEfficiency_Rate->SetPointEXlow(i, 2.5);
        gEfficiency_Rate->SetPointEXhigh(i, 2.5);

        hComputedEfficiency_Rate->GetPoint(i, x, y);
        hComputedEfficiency_Rate->SetPoint(i, rates[i], y);
        hComputedEfficiency_Rate->SetPointEXlow(i, 2.5);
        hComputedEfficiency_Rate->SetPointEXhigh(i, 2.5);

        gNoise_Rate->GetPoint(i, x, y);
        gNoise_Rate->SetPoint(i, rates[i], y);
        gNoise_Rate->SetPointEXlow(i, 2.5);
        gNoise_Rate->SetPointEXhigh(i, 2.5);
    }

    gEfficiency_Rate_Tk->SetPoint(0, rates_tk[0], hEfficiency_Rate_tk152->GetEfficiency(1));
    gEfficiency_Rate_Tk->SetPointError(0, 2.5, 2.5, hEfficiency_Rate_tk152->GetEfficiencyErrorLow(1), hEfficiency_Rate_tk152->GetEfficiencyErrorUp(1));

    gEfficiency_Rate_Tk->SetPoint(1, rates_tk[2], hEfficiency_Rate_tk155->GetEfficiency(1));
    gEfficiency_Rate_Tk->SetPointError(1, 2.5, 2.5, hEfficiency_Rate_tk155->GetEfficiencyErrorLow(1), hEfficiency_Rate_tk155->GetEfficiencyErrorUp(1));

    gEfficiency_Rate_Tk->SetPoint(2, rates_tk[3], hEfficiency_Rate_tk157->GetEfficiency(1));
    gEfficiency_Rate_Tk->SetPointError(2, 2.5, 2.5, hEfficiency_Rate_tk157->GetEfficiencyErrorLow(1), hEfficiency_Rate_tk157->GetEfficiencyErrorUp(1));

    gEfficiency_Rate_Tk->SetPoint(3, rates_tk[5], hEfficiency_Rate_tk160->GetEfficiency(1));
    gEfficiency_Rate_Tk->SetPointError(3, 2.5, 2.5, hEfficiency_Rate_tk160->GetEfficiencyErrorLow(1), hEfficiency_Rate_tk160->GetEfficiencyErrorUp(1));

    gEfficiency_Rate_Tk->SetPoint(4, rates_tk[6], hEfficiency_Rate_tk166->GetEfficiency(1));
    gEfficiency_Rate_Tk->SetPointError(4, 2.5, 2.5, hEfficiency_Rate_tk166->GetEfficiencyErrorLow(1), hEfficiency_Rate_tk166->GetEfficiencyErrorUp(1));

    // Style
    gEfficiency_Rate->SetMarkerStyle(22);
    gEfficiency_Rate->SetMarkerColor(COLOR_1);
    gEfficiency_Rate->SetMarkerSize(1.4);
    gEfficiency_Rate->SetFillStyle(3003);
    gEfficiency_Rate->SetFillColor(COLOR_1);

    hComputedEfficiency_Rate->SetMarkerStyle(23);
    hComputedEfficiency_Rate->SetMarkerColor(COLOR_2);
    hComputedEfficiency_Rate->SetMarkerSize(1.6);
    hComputedEfficiency_Rate->SetFillStyle(3003);
    hComputedEfficiency_Rate->SetFillColor(COLOR_2);

    gNoise_Rate->SetMarkerStyle(20);
    gNoise_Rate->SetMarkerColor(COLOR_3);
    gNoise_Rate->SetMarkerSize(1.2);
    gNoise_Rate->SetFillStyle(3003);
    gNoise_Rate->SetFillColor(COLOR_3);

    gEfficiency_Rate_Tk->SetMarkerStyle(21);
    gEfficiency_Rate_Tk->SetMarkerColor(COLOR_5);
    gEfficiency_Rate_Tk->SetMarkerSize(1.2);
    gEfficiency_Rate_Tk->SetFillStyle(3003);
    gEfficiency_Rate_Tk->SetFillColor(COLOR_5);

    // Draw
    gEfficiency_Rate->Draw("2 same");
    gEfficiency_Rate->Draw("p same");
    hComputedEfficiency_Rate->Draw("2 same");
    hComputedEfficiency_Rate->Draw("p same");
    gEfficiency_Rate_Tk->Draw("2 same");
    gEfficiency_Rate_Tk->Draw("p same");
    gNoise_Rate->Draw("2 same");
    gNoise_Rate->Draw("p same");
    lEfficiency_Rate->Draw();
    cEfficiency_Rate->Write();

    /*
     * Cluster size vs Threshold
     */

    // Canvas and graphs
    TCanvas* cClusterSize_Threshold(new TCanvas(TString("cClusterSize_Threshold_" + GEM), TString("cClusterSize_Threshold_" + GEM), 800, 600));
    TGraphAsymmErrors* gClusterSize_Threshold_mu(new TGraphAsymmErrors());
    TGraphAsymmErrors* gClusterSize_Threshold_pi(new TGraphAsymmErrors());

    cClusterSize_Threshold->cd();
    cClusterSize_Threshold->SetGrid();

    // Axis
    dummyHisto = new TH2D("h4", TString(";Threshold [VFAT2 units]; Cluster size [# channels]"), 10, 20., 55., 10, 1., 1.8);
    dummyHisto->Draw();

    // Legend
    TLegend* lClusterSize_Threshold(new TLegend(40., 1.6, 55., 1.8, "", ""));
    lClusterSize_Threshold->SetTextSize(0.035);
    lClusterSize_Threshold->AddEntry(gClusterSize_Threshold_mu, "Muons", "fep");
    lClusterSize_Threshold->AddEntry(gClusterSize_Threshold_pi, "Pions", "fep");

    // Data
    gClusterSize_Threshold_mu->SetPoint(0, 25., hClusterSize_Dual_Threshold_mu25->GetMean(1));
    gClusterSize_Threshold_mu->SetPointError(0, 1., 1., hClusterSize_Dual_Threshold_mu25->GetRMS(1) / 20., hClusterSize_Dual_Threshold_mu25->GetRMS(1) / 20.);

    gClusterSize_Threshold_mu->SetPoint(1, 30., hClusterSize_Dual_Threshold_mu30->GetMean(1));
    gClusterSize_Threshold_mu->SetPointError(1, 1., 1., hClusterSize_Dual_Threshold_mu30->GetRMS(1) / 20., hClusterSize_Dual_Threshold_mu30->GetRMS(1) / 20.);

    gClusterSize_Threshold_mu->SetPoint(2, 40., hClusterSize_Dual_Threshold_mu40->GetMean(1));
    gClusterSize_Threshold_mu->SetPointError(2, 1., 1., hClusterSize_Dual_Threshold_mu40->GetRMS(1) / 20., hClusterSize_Dual_Threshold_mu40->GetRMS(1) / 20.);

    gClusterSize_Threshold_mu->SetPoint(3, 50., hClusterSize_Dual_Threshold_mu50->GetMean(1));
    gClusterSize_Threshold_mu->SetPointError(3, 1., 1., hClusterSize_Dual_Threshold_mu50->GetRMS(1) / 20., hClusterSize_Dual_Threshold_mu50->GetRMS(1) / 20.);


    gClusterSize_Threshold_pi->SetPoint(0, 25., hClusterSize_Dual_Threshold_pi25->GetMean(1));
    gClusterSize_Threshold_pi->SetPointError(0, 1., 1., hClusterSize_Dual_Threshold_pi25->GetRMS(1) / 20., hClusterSize_Dual_Threshold_pi25->GetRMS(1) / 20.);

    gClusterSize_Threshold_pi->SetPoint(1, 30., hClusterSize_Dual_Threshold_pi30->GetMean(1));
    gClusterSize_Threshold_pi->SetPointError(1, 1., 1., hClusterSize_Dual_Threshold_pi30->GetRMS(1) / 20., hClusterSize_Dual_Threshold_pi30->GetRMS(1) / 20.);

    gClusterSize_Threshold_pi->SetPoint(2, 50., hClusterSize_Dual_Threshold_pi50->GetMean(1));
    gClusterSize_Threshold_pi->SetPointError(2, 1., 1., hClusterSize_Dual_Threshold_pi50->GetRMS(1) / 20., hClusterSize_Dual_Threshold_pi50->GetRMS(1) / 20.);

    // Style
    gClusterSize_Threshold_mu->SetMarkerStyle(22);
    gClusterSize_Threshold_mu->SetMarkerColor(COLOR_9);
    gClusterSize_Threshold_mu->SetMarkerSize(1.4);
    gClusterSize_Threshold_mu->SetFillStyle(3003);
    gClusterSize_Threshold_mu->SetFillColor(COLOR_9);

    gClusterSize_Threshold_pi->SetMarkerStyle(23);
    gClusterSize_Threshold_pi->SetMarkerColor(COLOR_10);
    gClusterSize_Threshold_pi->SetMarkerSize(1.6);
    gClusterSize_Threshold_pi->SetFillStyle(3003);
    gClusterSize_Threshold_pi->SetFillColor(COLOR_10);

    // Draw
    gClusterSize_Threshold_mu->Draw("2 same");
    gClusterSize_Threshold_mu->Draw("p same");
    gClusterSize_Threshold_pi->Draw("2 same");
    gClusterSize_Threshold_pi->Draw("p same");
    lClusterSize_Threshold->Draw();
    cClusterSize_Threshold->Write();

    /*
     * Cluster multiplicity vs Threshold
     */

    // Canvas and graphs
    TCanvas* cClusterMultiplicity_Threshold(new TCanvas(TString("cClusterMultiplicity_Threshold_" + GEM), TString("cClusterMultiplicity_Threshold_" + GEM), 800, 600));
    TGraphAsymmErrors* gClusterMultiplicity_Threshold_mu(new TGraphAsymmErrors());
    TGraphAsymmErrors* gClusterMultiplicity_Threshold_pi(new TGraphAsymmErrors());

    cClusterMultiplicity_Threshold->cd();
    cClusterMultiplicity_Threshold->SetGrid();

    // Axis
    dummyHisto = new TH2D("h5", TString(";Threshold [VFAT2 units]; Cluster multiplicity"), 10, 20., 55., 8, 0.5, 2.5);
    dummyHisto->GetYaxis()->SetNdivisions(16);
    dummyHisto->Draw();

    // Legend
    TLegend* lClusterMultiplicity_Threshold(new TLegend(40., 2., 55., 2.5, "", ""));
    lClusterMultiplicity_Threshold->SetTextSize(0.035);
    lClusterMultiplicity_Threshold->AddEntry(gClusterMultiplicity_Threshold_mu, "Muons", "fep");
    lClusterMultiplicity_Threshold->AddEntry(gClusterMultiplicity_Threshold_pi, "Pions", "fep");

    // Data
    gClusterMultiplicity_Threshold_mu->SetPoint(0, 25., hClusterMultiplicity_NoCut_Threshold_mu25->GetMean(1));
    gClusterMultiplicity_Threshold_mu->SetPointError(0, 1., 1., hClusterMultiplicity_NoCut_Threshold_mu25->GetRMS(1) / 20., hClusterMultiplicity_NoCut_Threshold_mu25->GetRMS(1) / 20.);

    gClusterMultiplicity_Threshold_mu->SetPoint(1, 30., hClusterMultiplicity_NoCut_Threshold_mu30->GetMean(1));
    gClusterMultiplicity_Threshold_mu->SetPointError(1, 1., 1., hClusterMultiplicity_NoCut_Threshold_mu30->GetRMS(1) / 20., hClusterMultiplicity_NoCut_Threshold_mu30->GetRMS(1) / 20.);

    gClusterMultiplicity_Threshold_mu->SetPoint(2, 40., hClusterMultiplicity_NoCut_Threshold_mu40->GetMean(1));
    gClusterMultiplicity_Threshold_mu->SetPointError(2, 1., 1., hClusterMultiplicity_NoCut_Threshold_mu40->GetRMS(1) / 20., hClusterMultiplicity_NoCut_Threshold_mu40->GetRMS(1) / 20.);

    gClusterMultiplicity_Threshold_mu->SetPoint(3, 50., hClusterMultiplicity_NoCut_Threshold_mu50->GetMean(1));
    gClusterMultiplicity_Threshold_mu->SetPointError(3, 1., 1., hClusterMultiplicity_NoCut_Threshold_mu50->GetRMS(1) / 20., hClusterMultiplicity_NoCut_Threshold_mu50->GetRMS(1) / 20.);


    gClusterMultiplicity_Threshold_pi->SetPoint(0, 25., hClusterMultiplicity_NoCut_Threshold_pi25->GetMean(1));
    gClusterMultiplicity_Threshold_pi->SetPointError(0, 1., 1., hClusterMultiplicity_NoCut_Threshold_pi25->GetRMS(1) / 20., hClusterMultiplicity_NoCut_Threshold_pi25->GetRMS(1) / 20.);

    gClusterMultiplicity_Threshold_pi->SetPoint(1, 30., hClusterMultiplicity_NoCut_Threshold_pi30->GetMean(1));
    gClusterMultiplicity_Threshold_pi->SetPointError(1, 1., 1., hClusterMultiplicity_NoCut_Threshold_pi30->GetRMS(1) / 20., hClusterMultiplicity_NoCut_Threshold_pi30->GetRMS(1) / 20.);

    gClusterMultiplicity_Threshold_pi->SetPoint(2, 50., hClusterMultiplicity_NoCut_Threshold_pi50->GetMean(1));
    gClusterMultiplicity_Threshold_pi->SetPointError(2, 1., 1., hClusterMultiplicity_NoCut_Threshold_pi50->GetRMS(1) / 20., hClusterMultiplicity_NoCut_Threshold_pi50->GetRMS(1) / 20.);

    // Style
    gClusterMultiplicity_Threshold_mu->SetMarkerStyle(22);
    gClusterMultiplicity_Threshold_mu->SetMarkerColor(COLOR_9);
    gClusterMultiplicity_Threshold_mu->SetMarkerSize(1.4);
    gClusterMultiplicity_Threshold_mu->SetFillStyle(3003);
    gClusterMultiplicity_Threshold_mu->SetFillColor(COLOR_9);

    gClusterMultiplicity_Threshold_pi->SetMarkerStyle(23);
    gClusterMultiplicity_Threshold_pi->SetMarkerColor(COLOR_10);
    gClusterMultiplicity_Threshold_pi->SetMarkerSize(1.6);
    gClusterMultiplicity_Threshold_pi->SetFillStyle(3003);
    gClusterMultiplicity_Threshold_pi->SetFillColor(COLOR_10);

    // Draw
    gClusterMultiplicity_Threshold_mu->Draw("2 same");
    gClusterMultiplicity_Threshold_mu->Draw("p same");
    gClusterMultiplicity_Threshold_pi->Draw("2 same");
    gClusterMultiplicity_Threshold_pi->Draw("p same");
    lClusterMultiplicity_Threshold->Draw();
    cClusterMultiplicity_Threshold->Write();

    /*
     * Beam profile
     */

    // Canvas and graphs
    TCanvas* cBeamProfile(new TCanvas(TString("cBeamProfile_" + GEM), TString("cBeamProfile_" + GEM), 800, 600));

    cBeamProfile->cd();
    cBeamProfile->SetGrid();

    // Axis
    dummyHisto = new TH2D("h6", TString(";Channel;"), 128, 0., 128., 10, 0., 0.05);
    dummyHisto->GetYaxis()->SetLabelSize(0);
    dummyHisto->Draw();

    // Legend
    TLegend* lBeamProfile(new TLegend(0., 0.04, 40., 0.05, "", ""));
    lBeamProfile->SetTextSize(0.035);
    lBeamProfile->AddEntry(hBeamProfile_mu, "Muons", "f");
    lBeamProfile->AddEntry(hBeamProfile_pi, "Pions", "f");

    // Data
    hBeamProfile_mu->Scale(1. / hBeamProfile_mu->Integral());
    hBeamProfile_pi->Scale(1. / hBeamProfile_pi->Integral());

    // Style
    hBeamProfile_mu->SetLineColor(COLOR_9);
    hBeamProfile_mu->SetFillColor(COLOR_9);
    hBeamProfile_mu->SetFillStyle(3003);

    hBeamProfile_pi->SetLineColor(COLOR_10);
    hBeamProfile_pi->SetFillColor(COLOR_10);
    hBeamProfile_pi->SetFillStyle(3003);

    // Draw
    hBeamProfile_mu->Draw("same");
    hBeamProfile_pi->Draw("same");
    lBeamProfile->Draw();
    cBeamProfile->Write();

    /*
     * Threshold vs HV
     */

    TGraphAsymmErrors* gNoise_700 = hNoise_700->CreateGraph();
    TGraphAsymmErrors* gNoise_710 = hNoise_710->CreateGraph();
    TGraphAsymmErrors* gNoise_720 = hNoise_720->CreateGraph();
    TGraphAsymmErrors* gNoise_730 = hNoise_730->CreateGraph();
    TGraphAsymmErrors* gNoise_740 = hNoise_740->CreateGraph();
    TGraphAsymmErrors* gNoise_750 = hNoise_750->CreateGraph();
    TGraphAsymmErrors* gNoise_760 = hNoise_760->CreateGraph();
    TGraphAsymmErrors* gNoise_770 = hNoise_770->CreateGraph();
    TGraphAsymmErrors* gNoise_780 = hNoise_780->CreateGraph();
    TGraphAsymmErrors* gNoise_790 = hNoise_790->CreateGraph();
    TGraphAsymmErrors* gNoise_800 = hNoise_800->CreateGraph();

    /*
     * Threshold scan
     */

    // Canvas and graphs
    TCanvas* cThresholdScan(new TCanvas(TString("cThresholdScan_" + GEM), TString("cThresholdScan_" + GEM), 800, 600));

    cThresholdScan->cd();
    cThresholdScan->SetGrid();

    // Axis
    dummyHisto = new TH2D("h7", TString(";Threshold [VFAT2 units];Noise to events ratio"), 50., -0.5, 49.5, 10, 0., 1.);
    dummyHisto->Draw();

    // Data
    for (unsigned int i(0); i < gNoise_800->GetN(); i++) {
        double x, y;

        gNoise_800->GetPoint(i, x, y);
        gNoise_800->SetPoint(i, x - 0.5, y);
        gNoise_800->SetPointEXlow(i, 0.5);
        gNoise_800->SetPointEXhigh(i, 0.5);
    }

    // Style
    gNoise_800->SetMarkerStyle(22);
    gNoise_800->SetMarkerColor(COLOR_1);
    gNoise_800->SetMarkerSize(1.4);
    gNoise_800->SetFillStyle(3003);
    gNoise_800->SetFillColor(COLOR_1);

    // Draw
    gNoise_800->Draw("p same");
    cThresholdScan->Write();

    /*
     * Latency
     */

    // Canvas and graphs
    TCanvas* cLatency(new TCanvas(TString("cLatency_" + GEM), TString("cLatency_" + GEM), 800, 600));
    TGraphAsymmErrors* hLatency = gLatency->CreateGraph();

    cLatency->cd();
    cLatency->SetGrid();

    // Axis
    dummyHisto = new TH2D("h13", ";Latency [VFAT2 units];Hits to events ratio", 20., -0.5, 19.5, 10., 0., 1.);
    dummyHisto->Draw();

    // Data
    for (unsigned int i(0); i < hLatency->GetN(); i++) {
        double x, y;

        hLatency->GetPoint(i, x, y);
        hLatency->SetPoint(i, x - 0.5, y);
        hLatency->SetPointEXlow(i, 0.5);
        hLatency->SetPointEXhigh(i, 0.5);
    }

    // Style
    hLatency->SetMarkerStyle(22);
    hLatency->SetMarkerColor(COLOR_1);
    hLatency->SetMarkerSize(1.4);
    hLatency->SetFillStyle(3003);
    hLatency->SetFillColor(COLOR_1);

    // Draw
    hLatency->Draw("p same");
    cLatency->Write();

}

void GlobalRun() {

    /*
     * Get plots
     */

    TEfficiency* gThreshold_Channel = (TEfficiency*) fCalibration->Get("gThreshold_Channel");
    TEfficiency* gThreshold_SBits = (TEfficiency*) fCalibration->Get("gThreshold_SBits");
    TEfficiency* gThreshold_TK = (TEfficiency*) fCalibration->Get("gThreshold_TK");

    TEfficiency* gSCurve_ThresholdVCal = (TEfficiency*) fCalibration->Get("gSCurve_ThresholdVCal");
    TEfficiency* gSCurve_T25 = (TEfficiency*) fCalibration->Get("gSCurve_T25");
    TF1* fuSCurve_T25 = (TF1*) fCalibration->Get("fuSCurve_T25");
    TGraphErrors* gSCurve_TurnOn = (TGraphErrors*) fCalibration->Get("gSCurve_TurnOn");

    TEfficiency* gSCurve_ChannelVCal_Trim0 = (TEfficiency*) fCalibration->Get("gSCurve_ChannelVCal_Trim0");
    TH1D* hSCurve_ChannelVCal_Trim0_Disp = (TH1D*) fCalibration->Get("hSCurve_ChannelVCal_Trim0_Disp");
    TGraphErrors* gSCurve_ChannelVCal_Trim0_Sigma = (TGraphErrors*) fCalibration->Get("gSCurve_ChannelVCal_Trim0_Sigma");

    TEfficiency* gSCurve_ChannelVCal_Trim1 = (TEfficiency*) fCalibration->Get("gSCurve_ChannelVCal_Trim1");
    TH1D* hSCurve_ChannelVCal_Trim1_Disp = (TH1D*) fCalibration->Get("hSCurve_ChannelVCal_Trim1_Disp");
    TGraphErrors* gSCurve_ChannelVCal_Trim1_Sigma = (TGraphErrors*) fCalibration->Get("gSCurve_ChannelVCal_Trim1_Sigma");

    TEfficiency* gSCurve_ChannelVCal_Trimed = (TEfficiency*) fCalibration->Get("gSCurve_ChannelVCal_Trimed");
    TH1D* hSCurve_ChannelVCal_Trimed_Disp = (TH1D*) fCalibration->Get("hSCurve_ChannelVCal_Trimed_Disp");
    TGraphErrors* gSCurve_ChannelVCal_Trimed_Sigma = (TGraphErrors*) fCalibration->Get("gSCurve_ChannelVCal_Trimed_Sigma");

    TGraphErrors* gIComp_ADC = (TGraphErrors*) fCalibration->Get("gIComp_ADC");
    TF1* fuIComp = (TF1*) fCalibration->Get("fuIComp");
    TGraphErrors* gIComp_Current = (TGraphErrors*) fCalibration->Get("gIComp_Current");

    TGraphErrors* gIPreampFeed_ADC = (TGraphErrors*) fCalibration->Get("gIPreampFeed_ADC");
    TF1* fuIPreampFeed = (TF1*) fCalibration->Get("fuIPreampFeed");
    TGraphErrors* gIPreampFeed_Current = (TGraphErrors*) fCalibration->Get("gIPreampFeed_Current");

    TGraphErrors* gIPreampIn_ADC = (TGraphErrors*) fCalibration->Get("gIPreampIn_ADC");
    TF1* fuIPreampIn = (TF1*) fCalibration->Get("fuIPreampIn");
    TGraphErrors* gIPreampIn_Current = (TGraphErrors*) fCalibration->Get("gIPreampIn_Current");

    TGraphErrors* gIPreampOut_ADC = (TGraphErrors*) fCalibration->Get("gIPreampOut_ADC");
    TF1* fuIPreampOut = (TF1*) fCalibration->Get("fuIPreampOut");
    TGraphErrors* gIPreampOut_Current = (TGraphErrors*) fCalibration->Get("gIPreampOut_Current");

    TGraphErrors* gIShaper_ADC = (TGraphErrors*) fCalibration->Get("gIShaper_ADC");
    TF1* fuIShaper = (TF1*) fCalibration->Get("fuIShaper");
    TGraphErrors* gIShaper_Current = (TGraphErrors*) fCalibration->Get("gIShaper_Current");

    TGraphErrors* gIShaperFeed_ADC = (TGraphErrors*) fCalibration->Get("gIShaperFeed_ADC");
    TF1* fuIShaperFeed = (TF1*) fCalibration->Get("fuIShaperFeed");
    TGraphErrors* gIShaperFeed_Current = (TGraphErrors*) fCalibration->Get("gIShaperFeed_Current");

    TGraphErrors* gVCal_ADC = (TGraphErrors*) fCalibration->Get("gVCal_ADC");
    TF1* fuVCal = (TF1*) fCalibration->Get("fuVCal");
    TGraphErrors* gVCal_Voltage = (TGraphErrors*) fCalibration->Get("gVCal_Voltage");

    TGraphErrors* gVCal_Bis_ADC = (TGraphErrors*) fCalibration->Get("gVCal_Bis_ADC");
    TF1* fuVCal_Bis = (TF1*) fCalibration->Get("fuVCal_Bis");
    TGraphErrors* gVCal_Bis_Voltage = (TGraphErrors*) fCalibration->Get("gVCal_Bis_Voltage");

    TGraphErrors* gVBaseline_ADC = (TGraphErrors*) fCalibration->Get("gVBaseline_ADC");
    TF1* fuVBaseline = (TF1*) fCalibration->Get("fuVBaseline");
    TGraphErrors* gVBaseline_Voltage = (TGraphErrors*) fCalibration->Get("gVBaseline_Voltage");

    TGraphErrors* gVThreshold1_ADC = (TGraphErrors*) fCalibration->Get("gVThreshold1_ADC");
    TF1* fuVThreshold1 = (TF1*) fCalibration->Get("fuVThreshold1");
    TGraphErrors* gVThreshold1_Voltage = (TGraphErrors*) fCalibration->Get("gVThreshold1_Voltage");

    TGraphErrors* gVThreshold2_ADC = (TGraphErrors*) fCalibration->Get("gVThreshold2_ADC");
    TF1* fuVThreshold2 = (TF1*) fCalibration->Get("fuVThreshold2");
    TGraphErrors* gVThreshold2_Voltage = (TGraphErrors*) fCalibration->Get("gVThreshold2_Voltage");

    TGraphErrors* gCal_Charge = (TGraphErrors*) fCalibration->Get("gCal_Charge");
    TF1* fuCal_Charge = (TF1*) fCalibration->Get("fuCal_Charge");

    /*
     * Threshold by channel
     */

     // Canvas and graphs
     TCanvas* cThreshold_Channel(new TCanvas("cThreshold_Channel", "cThreshold_Channel", 800, 600));
     TH2D* hThreshold_Channel = (TH2D*) gThreshold_Channel->CreateHistogram();

     cThreshold_Channel->cd();
     cThreshold_Channel->SetGrid();

     // Axis
     dummyHisto = new TH2D("h20", ";Threshold [VFAT2 units];Channel;Count [%]", 60., 0., 60., 128, 0., 128.);
     dummyHisto->Draw();

     // Data
#if EMPTY_2D_WHEN_NULL
     for (unsigned int i(0); i < hThreshold_Channel->GetNbinsX(); ++i) {
        for (unsigned int j(0); j < hThreshold_Channel->GetNbinsY(); ++j) {
          if (hThreshold_Channel->GetBinContent(i + 1, j + 1) == 0) hThreshold_Channel->SetBinContent(i + 1, j + 1, 0.00001);
        }
     }
#endif

    hThreshold_Channel->SetMaximum(1.);
    hThreshold_Channel->SetMinimum(0.);
    hThreshold_Channel->Scale(1./0.8);

     // Draw
     hThreshold_Channel->Draw("col z same");
     cThreshold_Channel->Write();

     /*
      * Threshold using SBits and TK
      */

      // Canvas and graphs
      TCanvas* cThreshold_SBitsTK(new TCanvas("cThreshold_SBitsTK", "cThreshold_SBitsTK", 800, 600));
      TGraphAsymmErrors* hThreshold_SBits = gThreshold_SBits->CreateGraph();
      TGraphAsymmErrors* hThreshold_TK = gThreshold_TK->CreateGraph();

      cThreshold_SBitsTK->cd();
      cThreshold_SBitsTK->SetGrid();

      // Axis
      dummyHisto = new TH2D("h21", ";Threshold [VFAT2 units];Noise [%]", 50., -0.5, 49.5, 10, 0., 1.);
      dummyHisto->Draw();

      // Legend
      TLegend* lThreshold_SBitsTK(new TLegend(30., 0.9, 50., 1., "", ""));
      lThreshold_SBitsTK->SetNColumns(2);
      lThreshold_SBitsTK->SetTextSize(0.035);
      lThreshold_SBitsTK->AddEntry(hThreshold_SBits, "Trigger data", "p");
      lThreshold_SBitsTK->AddEntry(hThreshold_TK, "Tracking data", "p");

      // Data
      for (unsigned int i(0); i < hThreshold_TK->GetN(); i++) {
          hThreshold_SBits->SetPointEXlow(i, 0.5);
          hThreshold_SBits->SetPointEXhigh(i, 0.5);
          hThreshold_TK->SetPointEXlow(i, 0.5);
          hThreshold_TK->SetPointEXhigh(i, 0.5);
      }

      // Data
      for (unsigned int i(0); i < hThreshold_TK->GetN(); i++) {
          double x, y;
          hThreshold_TK->GetPoint(i, x, y);
          hThreshold_TK->SetPoint(i, x - 0.5, y);
          hThreshold_TK->SetPointEXlow(i, 0.5);
          hThreshold_TK->SetPointEXhigh(i, 0.5);
      }

      // hThreshold_TK->SetPoint(0, 0.5, 1.);

      // Style
      hThreshold_SBits->SetMarkerStyle(20);
      hThreshold_SBits->SetMarkerColor(COLOR_1);
      hThreshold_SBits->SetMarkerSize(1.);

      hThreshold_TK->SetMarkerStyle(21);
      hThreshold_TK->SetMarkerColor(COLOR_2);
      hThreshold_TK->SetMarkerSize(1.);

      // Draw
      // hThreshold_SBits->Draw("p same");
      hThreshold_TK->Draw("p same");
      // lThreshold_SBitsTK->Draw();
      cThreshold_SBitsTK->Write();

    /*
     * SCurve Threshold VCal
     */

    // Canvas and graphs
    TCanvas* cSCurve_ThresholdVCal(new TCanvas("cSCurve_ThresholdVCal", "cSCurve_ThresholdVCal", 800, 600));
    TH2D* hSCurve_ThresholdVCal = (TH2D*) gSCurve_ThresholdVCal->CreateHistogram();

    cSCurve_ThresholdVCal->cd();
    cSCurve_ThresholdVCal->SetGrid();

    // Axis
    dummyHisto = new TH2D("h8", ";Threshold [VFAT2 units];Calibration pulse height [VFAT2 units]", 200., 0., 200., 250, 0., 250.);
    dummyHisto->Draw();

    TGaxis* aSCurve_ThresholdVCal(new TGaxis(200., 0., 200., 250., ADC_C_CONV(0.), ADC_C_CONV(250.), 510, "+LS"));
    aSCurve_ThresholdVCal->SetTickLength(0.015);
    aSCurve_ThresholdVCal->SetNdivisions(11);
    aSCurve_ThresholdVCal->SetLabelFont(42);
    aSCurve_ThresholdVCal->SetLabelSize(0.04);
    aSCurve_ThresholdVCal->SetLabelOffset(0.01);
    aSCurve_ThresholdVCal->SetTitle("Charge [fC]");
    aSCurve_ThresholdVCal->SetTitleSize(0.045);
    aSCurve_ThresholdVCal->SetTitleFont(42);
    aSCurve_ThresholdVCal->Draw();

    // Data
#if EMPTY_2D_WHEN_NULL
    for (unsigned int i(0); i < hSCurve_ThresholdVCal->GetNbinsX(); ++i) {
       for (unsigned int j(0); j < hSCurve_ThresholdVCal->GetNbinsY(); ++j) {
         if (hSCurve_ThresholdVCal->GetBinContent(i + 1, j + 1) == 0) hSCurve_ThresholdVCal->SetBinContent(i + 1, j + 1, 0.00001);
       }
    }
#endif

    // Draw
    hSCurve_ThresholdVCal->Draw("col same");
    cSCurve_ThresholdVCal->Write();

    /*
     * SCurve T25
     */

    // Canvas and graphs
    TCanvas* cSCurve_T25(new TCanvas("cSCurve_T25", "cSCurve_T25", 800, 600));
    TGraphAsymmErrors* gSCurve_T25_2 = gSCurve_T25->CreateGraph();

    cSCurve_T25->cd();
    cSCurve_T25->SetGrid();

    // Axis
    dummyHisto = new TH2D("h9", ";Calibration pulse height [VFAT2 units];Hits to events ratio", 100., 0., 100., 10, 0., 1.);
    dummyHisto->Draw();

    // Data
    for (unsigned int i(0); i < gSCurve_T25_2->GetN(); i++) {
        gSCurve_T25_2->SetPointEXlow(i, 0.5);
        gSCurve_T25_2->SetPointEXhigh(i, 0.5);
    }

    // Draw
    gSCurve_T25_2->Draw("p same");
    fuSCurve_T25->Draw("same");
    cSCurve_T25->Write();

    /*
     * SCurve Turn-on
     */

    // Canvas and graphs
    TCanvas* cSCurve_TurnOn(new TCanvas("cSCurve_TurnOn", "cSCurve_TurnOn", 800, 600));

    cSCurve_TurnOn->cd();
    cSCurve_TurnOn->SetGrid();

    // Axis
    dummyHisto = new TH2D("h10", ";Threshold [VFAT2 units];Calibration pulse turn-on [VFAT2 units]", 140., 20., 160., 250, 0., 250.);
    dummyHisto->Draw();

    TGaxis* aSCurve_TurnOn(new TGaxis(160., 0., 160., 250., ADC_C_CONV(0.), ADC_C_CONV(250.), 510, "+LS"));
    aSCurve_TurnOn->SetTickLength(0.015);
    aSCurve_TurnOn->SetNdivisions(11);
    aSCurve_TurnOn->SetLabelFont(42);
    aSCurve_TurnOn->SetLabelSize(0.04);
    aSCurve_TurnOn->SetLabelOffset(0.01);
    aSCurve_TurnOn->SetTitle("Charge [fC]");
    aSCurve_TurnOn->SetTitleSize(0.045);
    aSCurve_TurnOn->SetTitleFont(42);
    aSCurve_TurnOn->Draw();

    // Style
    gSCurve_TurnOn->SetMarkerStyle(20);
    gSCurve_TurnOn->SetMarkerColor(COLOR_1);
    gSCurve_TurnOn->SetMarkerSize(1.2);
    gSCurve_TurnOn->SetFillStyle(3003);
    gSCurve_TurnOn->SetFillColor(COLOR_1);

    // Draw
    gSCurve_TurnOn->Draw("2 same");
    gSCurve_TurnOn->Draw("p same");
    cSCurve_TurnOn->Write();

    /*
     * SCurve Channel VCal TRIM0
     */

    // Canvas and graphs
    TCanvas* cSCurve_ChannelVCal_Trim0(new TCanvas("cSCurve_ChannelVCal_Trim0", "cSCurve_ChannelVCal_Trim0", 800, 600));
    TH2D* hSCurve_ChannelVCal_Trim0 = (TH2D*) gSCurve_ChannelVCal_Trim0->CreateHistogram();

    cSCurve_ChannelVCal_Trim0->cd();
    cSCurve_ChannelVCal_Trim0->SetGrid();

    // Axis
    dummyHisto = new TH2D("h8", ";Channel;Calibration pulse height [VFAT2 units]", 127., 0., 127., 40, 30., 60.);
    dummyHisto->Draw();

    TGaxis* aSCurve_ChannelVCal_Trim0(new TGaxis(127., 30., 127., 60., ADC_C_CONV(30.), ADC_C_CONV(60.), 510, "+LS"));
    aSCurve_ChannelVCal_Trim0->SetTickLength(0.015);
    aSCurve_ChannelVCal_Trim0->SetNdivisions(11);
    aSCurve_ChannelVCal_Trim0->SetLabelFont(42);
    aSCurve_ChannelVCal_Trim0->SetLabelSize(0.04);
    aSCurve_ChannelVCal_Trim0->SetLabelOffset(0.01);
    aSCurve_ChannelVCal_Trim0->SetTitle("Charge [fC]");
    aSCurve_ChannelVCal_Trim0->SetTitleSize(0.045);
    aSCurve_ChannelVCal_Trim0->SetTitleFont(42);
    aSCurve_ChannelVCal_Trim0->Draw();

    // Data
#if EMPTY_2D_WHEN_NULL
    for (unsigned int i(0); i < hSCurve_ChannelVCal_Trim0->GetNbinsX(); ++i) {
       for (unsigned int j(0); j < hSCurve_ChannelVCal_Trim0->GetNbinsY(); ++j) {
         if (hSCurve_ChannelVCal_Trim0->GetBinContent(i + 1, j + 1) == 0) hSCurve_ChannelVCal_Trim0->SetBinContent(i + 1, j + 1, 0.00001);
       }
    }
#endif

    // Draw
    hSCurve_ChannelVCal_Trim0->Draw("col same");
    cSCurve_ChannelVCal_Trim0->Write();

    /*
     * SCurve Channel VCal TRIM1
     */

    // Canvas and graphs
    TCanvas* cSCurve_ChannelVCal_Trim1(new TCanvas("cSCurve_ChannelVCal_Trim1", "cSCurve_ChannelVCal_Trim1", 800, 600));
    TH2D* hSCurve_ChannelVCal_Trim1 = (TH2D*) gSCurve_ChannelVCal_Trim1->CreateHistogram();

    cSCurve_ChannelVCal_Trim1->cd();
    cSCurve_ChannelVCal_Trim1->SetGrid();

    // Axis
    dummyHisto = new TH2D("h8", ";Channel;Calibration pulse height [VFAT2 units]", 127., 0., 127., 40, 10., 40.);
    dummyHisto->Draw();

    TGaxis* aSCurve_ChannelVCal_Trim1(new TGaxis(127., 10., 127., 40., ADC_C_CONV(10.), ADC_C_CONV(40.), 510, "+LS"));
    aSCurve_ChannelVCal_Trim1->SetTickLength(0.015);
    aSCurve_ChannelVCal_Trim1->SetNdivisions(11);
    aSCurve_ChannelVCal_Trim1->SetLabelFont(42);
    aSCurve_ChannelVCal_Trim1->SetLabelSize(0.04);
    aSCurve_ChannelVCal_Trim1->SetLabelOffset(0.01);
    aSCurve_ChannelVCal_Trim1->SetTitle("Charge [fC]");
    aSCurve_ChannelVCal_Trim1->SetTitleSize(0.045);
    aSCurve_ChannelVCal_Trim1->SetTitleFont(42);
    aSCurve_ChannelVCal_Trim1->Draw();

    // Data
#if EMPTY_2D_WHEN_NULL
    for (unsigned int i(0); i < hSCurve_ChannelVCal_Trim1->GetNbinsX(); ++i) {
       for (unsigned int j(0); j < hSCurve_ChannelVCal_Trim1->GetNbinsY(); ++j) {
         if (hSCurve_ChannelVCal_Trim1->GetBinContent(i + 1, j + 1) == 0) hSCurve_ChannelVCal_Trim1->SetBinContent(i + 1, j + 1, 0.00001);
       }
    }
#endif

    // Draw
    hSCurve_ChannelVCal_Trim1->Draw("col same");
    cSCurve_ChannelVCal_Trim1->Write();

    /*
     * SCurve Channel VCal TRIMED
     */

    // Canvas and graphs
    TCanvas* cSCurve_ChannelVCal_Trimed(new TCanvas("cSCurve_ChannelVCal_Trimed", "cSCurve_ChannelVCal_Trimed", 800, 600));
    TH2D* hSCurve_ChannelVCal_Trimed = (TH2D*) gSCurve_ChannelVCal_Trimed->CreateHistogram();

    cSCurve_ChannelVCal_Trimed->cd();
    cSCurve_ChannelVCal_Trimed->SetGrid();

    // Axis
    dummyHisto = new TH2D("h8", ";Channel;Calibration pulse height [VFAT2 units]", 127., 0., 127., 40, 20., 50.);
    dummyHisto->Draw();

    TGaxis* aSCurve_ChannelVCal_Trimed(new TGaxis(127., 20., 127., 50., ADC_C_CONV(20.), ADC_C_CONV(50.), 510, "+LS"));
    aSCurve_ChannelVCal_Trimed->SetTickLength(0.015);
    aSCurve_ChannelVCal_Trimed->SetNdivisions(11);
    aSCurve_ChannelVCal_Trimed->SetLabelFont(42);
    aSCurve_ChannelVCal_Trimed->SetLabelSize(0.04);
    aSCurve_ChannelVCal_Trimed->SetLabelOffset(0.01);
    aSCurve_ChannelVCal_Trimed->SetTitle("Charge [fC]");
    aSCurve_ChannelVCal_Trimed->SetTitleSize(0.045);
    aSCurve_ChannelVCal_Trimed->SetTitleFont(42);
    aSCurve_ChannelVCal_Trimed->Draw();

    // Data
#if EMPTY_2D_WHEN_NULL
    for (unsigned int i(0); i < hSCurve_ChannelVCal_Trimed->GetNbinsX(); ++i) {
       for (unsigned int j(0); j < hSCurve_ChannelVCal_Trimed->GetNbinsY(); ++j) {
         if (hSCurve_ChannelVCal_Trimed->GetBinContent(i + 1, j + 1) == 0) hSCurve_ChannelVCal_Trimed->SetBinContent(i + 1, j + 1, 0.00001);
       }
    }
#endif

    // Draw
    hSCurve_ChannelVCal_Trimed->Draw("col same");
    cSCurve_ChannelVCal_Trimed->Write();

    /*
     * SCurve VCal disp
     */

    // Canvas and graphs
    TCanvas* cSCurve_ChannelVCal_Disp(new TCanvas("cSCurve_ChannelVCal_Disp", "cSCurve_ChannelVCal_Disp", 800, 600));

    cSCurve_ChannelVCal_Disp->cd();
    cSCurve_ChannelVCal_Disp->SetGrid();

    // Axis
    dummyHisto = new TH2D("h10", ";Calibration pulse turn-on [VFAT2 units];# Channels", 20., 20., 50., 35, 0., 35.);
    dummyHisto->Draw();

    // Legend
    TLegend* lSCurve_ChannelVCal_Disp(new TLegend(37.5, 27.5, 50., 35., "", ""));
    lSCurve_ChannelVCal_Disp->SetTextSize(0.035);
    lSCurve_ChannelVCal_Disp->AddEntry(hSCurve_ChannelVCal_Trim0_Disp, "TrimDAC = 0", "fp");
    lSCurve_ChannelVCal_Disp->AddEntry(hSCurve_ChannelVCal_Trim1_Disp, "TrimDAC = 31", "fp");
    lSCurve_ChannelVCal_Disp->AddEntry(hSCurve_ChannelVCal_Trimed_Disp, "Optimised TrimDAC", "fp");

    // Data
    hSCurve_ChannelVCal_Trimed_Disp->Scale(0.35);

    // Style
    hSCurve_ChannelVCal_Trim0_Disp->SetLineColor(COLOR_1);
    hSCurve_ChannelVCal_Trim0_Disp->SetFillColor(COLOR_1);
    hSCurve_ChannelVCal_Trim0_Disp->SetFillStyle(3003);

    hSCurve_ChannelVCal_Trim1_Disp->SetLineColor(COLOR_2);
    hSCurve_ChannelVCal_Trim1_Disp->SetFillColor(COLOR_2);
    hSCurve_ChannelVCal_Trim1_Disp->SetFillStyle(3003);

    hSCurve_ChannelVCal_Trimed_Disp->SetLineColor(COLOR_3);
    hSCurve_ChannelVCal_Trimed_Disp->SetFillColor(COLOR_3);
    hSCurve_ChannelVCal_Trimed_Disp->SetFillStyle(3002);

    // Draw
    hSCurve_ChannelVCal_Trim0_Disp->Draw("same");
    hSCurve_ChannelVCal_Trim1_Disp->Draw("same");
    hSCurve_ChannelVCal_Trimed_Disp->Draw("same");
    lSCurve_ChannelVCal_Disp->Draw();
    cSCurve_ChannelVCal_Disp->Write();

    /*
     * Electron noise disparity
     */

    // Canvas and graphs
    TCanvas* cEnoise_Disp(new TCanvas("cEnoise_Disp", "cEnoise_Disp", 800, 600));

    cEnoise_Disp->cd();
    cEnoise_Disp->SetGrid();

    // Axis
    dummyHisto = new TH2D("h10", ";Channel;Noise [ENC]", 128., 0., 127., 10, 500., 700.);
    dummyHisto->Draw();

    // Legend
    TLegend* lEnoise_Disp(new TLegend(37.5, 27.5, 50., 35., "", ""));
    lEnoise_Disp->SetTextSize(0.035);
    lEnoise_Disp->AddEntry(gSCurve_ChannelVCal_Trim0_Sigma, "TrimDAC = 0", "fp");
    lEnoise_Disp->AddEntry(gSCurve_ChannelVCal_Trim1_Sigma, "TrimDAC = 31", "fp");
    lEnoise_Disp->AddEntry(gSCurve_ChannelVCal_Trimed_Sigma, "Optimised TrimDAC", "fp");

    // Data
    for (unsigned int i(0); i < gSCurve_ChannelVCal_Trim1_Sigma->GetN(); i++) {
        double x, y;
        gSCurve_ChannelVCal_Trim1_Sigma->GetPoint(i, x, y);
        gSCurve_ChannelVCal_Trim1_Sigma->SetPoint(i, x, y - 100.);
    }

    // Style
    gSCurve_ChannelVCal_Trim0_Sigma->SetMarkerStyle(22);
    gSCurve_ChannelVCal_Trim0_Sigma->SetMarkerColor(COLOR_1);
    gSCurve_ChannelVCal_Trim0_Sigma->SetMarkerSize(1.4);
    gSCurve_ChannelVCal_Trim0_Sigma->SetFillStyle(3003);
    gSCurve_ChannelVCal_Trim0_Sigma->SetFillColor(COLOR_1);

    gSCurve_ChannelVCal_Trim1_Sigma->SetMarkerStyle(23);
    gSCurve_ChannelVCal_Trim1_Sigma->SetMarkerColor(COLOR_10);
    gSCurve_ChannelVCal_Trim1_Sigma->SetMarkerSize(1.6);
    gSCurve_ChannelVCal_Trim1_Sigma->SetFillStyle(3003);
    gSCurve_ChannelVCal_Trim1_Sigma->SetFillColor(COLOR_10);

    gSCurve_ChannelVCal_Trimed_Sigma->SetMarkerStyle(20);
    gSCurve_ChannelVCal_Trimed_Sigma->SetMarkerColor(COLOR_3);
    gSCurve_ChannelVCal_Trimed_Sigma->SetMarkerSize(1.2);
    gSCurve_ChannelVCal_Trimed_Sigma->SetFillStyle(3003);
    gSCurve_ChannelVCal_Trimed_Sigma->SetFillColor(COLOR_3);

    // Draw
    // gSCurve_ChannelVCal_Trim0_Sigma->Draw("2 same");
    // gSCurve_ChannelVCal_Trim0_Sigma->Draw("p same");
    gSCurve_ChannelVCal_Trim1_Sigma->Draw("2 same");
    gSCurve_ChannelVCal_Trim1_Sigma->Draw("p same");
    // gSCurve_ChannelVCal_Trimed_Sigma->Draw("2 same");
    // gSCurve_ChannelVCal_Trimed_Sigma->Draw("p same");
    lEnoise_Disp->Draw();
    cEnoise_Disp->Write();

    /*
     * ADC Current
     */

    // Canvas and graphs
    TCanvas* cADC_Current(new TCanvas("cADC_Current", "cADC_Current", 800, 600));

    cADC_Current->cd();
    cADC_Current->SetGrid();

    // Axis
    dummyHisto = new TH2D("h11", ";Register value [VFAT2 units];ADC counts", 250., 0., 250., 400, 0., 400.);
    dummyHisto->Draw();

    TGaxis* aADC_Current(new TGaxis(250., 0., 250., 400., ADC_I_CONV(0.), ADC_I_CONV(400.) * 1.E6, 510, "+LS"));
    aADC_Current->SetTickLength(0.015);
    aADC_Current->SetNdivisions(11);
    aADC_Current->SetLabelFont(42);
    aADC_Current->SetLabelSize(0.04);
    aADC_Current->SetLabelOffset(0.01);
    aADC_Current->SetTitle("Current [uA]");
    aADC_Current->SetTitleSize(0.045);
    aADC_Current->SetTitleFont(42);
    aADC_Current->Draw();

    // Legend
    TLegend* lADC_Current(new TLegend(0., 300., 180., 400., "", ""));
    lADC_Current->SetTextSize(0.035);
    lADC_Current->SetNColumns(3);
    lADC_Current->AddEntry(gIPreampIn_ADC, "IPreampIn", "p");
    lADC_Current->AddEntry(gIPreampFeed_ADC, "IPreampFeed", "p");
    lADC_Current->AddEntry(gIPreampOut_ADC, "IPreampOut", "p");
    lADC_Current->AddEntry(gIShaper_ADC, "IShaper", "p");
    lADC_Current->AddEntry(gIShaperFeed_ADC, "IShaperFeed", "p");
    lADC_Current->AddEntry(gIComp_ADC, "IComp", "p");

    // Style
    gIComp_ADC->SetMarkerStyle(20);
    gIComp_ADC->SetMarkerColor(COLOR_1);
    gIComp_ADC->SetMarkerSize(0.8);

    gIPreampFeed_ADC->SetMarkerStyle(21);
    gIPreampFeed_ADC->SetMarkerColor(COLOR_2);
    gIPreampFeed_ADC->SetMarkerSize(0.8);

    gIPreampIn_ADC->SetMarkerStyle(20);
    gIPreampIn_ADC->SetMarkerColor(COLOR_3);
    gIPreampIn_ADC->SetMarkerSize(0.8);

    gIPreampOut_ADC->SetMarkerStyle(23);
    gIPreampOut_ADC->SetMarkerColor(COLOR_4);
    gIPreampOut_ADC->SetMarkerSize(1.);

    gIShaper_ADC->SetMarkerStyle(22);
    gIShaper_ADC->SetMarkerColor(COLOR_5);
    gIShaper_ADC->SetMarkerSize(1.);

    gIShaperFeed_ADC->SetMarkerStyle(23);
    gIShaperFeed_ADC->SetMarkerColor(COLOR_6);
    gIShaperFeed_ADC->SetMarkerSize(1.);

    // Draw
    gIComp_ADC->Draw("p x same");
    gIPreampFeed_ADC->Draw("p x same");
    gIPreampIn_ADC->Draw("p x same");
    gIPreampOut_ADC->Draw("p x same");
    gIShaper_ADC->Draw("p x same");
    gIShaperFeed_ADC->Draw("p x same");
    lADC_Current->Draw();
    cADC_Current->Write();

    /*
     * ADC Voltage
     */

    // Canvas and graphs
    TCanvas* cADC_Voltage(new TCanvas("cADC_Voltage", "cADC_Voltage", 800, 600));

    cADC_Voltage->cd();
    cADC_Voltage->SetGrid();

    // Axis
    dummyHisto = new TH2D("h12", ";Register value [VFAT2 units];ADC counts", 250., 0., 250., 350, 100., 450.);
    dummyHisto->Draw();

    TGaxis* aADC_Voltage(new TGaxis(250., 100., 250., 450., ADC_V_CONV(100.), ADC_V_CONV(450.), 510, "+LS"));
    aADC_Voltage->SetTickLength(0.015);
    aADC_Voltage->SetNdivisions(11);
    aADC_Voltage->SetLabelFont(42);
    aADC_Voltage->SetLabelSize(0.04);
    aADC_Voltage->SetLabelOffset(0.01);
    aADC_Voltage->SetTitle("Voltage [V]");
    aADC_Voltage->SetTitleSize(0.045);
    aADC_Voltage->SetTitleFont(42);
    aADC_Voltage->Draw();

    // Legend
    TLegend* lADC_Voltage(new TLegend(80., 375., 250., 450., "", ""));
    lADC_Voltage->SetTextSize(0.035);
    lADC_Voltage->SetNColumns(3);
    lADC_Voltage->AddEntry(gVThreshold1_ADC, "VThreshold1", "p");
    lADC_Voltage->AddEntry(gVThreshold2_ADC, "VThreshold2", "p");
    lADC_Voltage->AddEntry(gVCal_ADC, "VCal", "p");
    lADC_Voltage->AddEntry(gVCal_Bis_ADC, "VLow", "p");
    lADC_Voltage->AddEntry(gVBaseline_ADC, "VBaseline", "p");

    // Data
    for (unsigned int i(0); i < gVBaseline_ADC->GetN(); i++) gVBaseline_ADC->SetPoint(i, i, 265.88);

    // Style
    gVThreshold1_ADC->SetMarkerStyle(20);
    gVThreshold1_ADC->SetMarkerColor(COLOR_1);
    gVThreshold1_ADC->SetMarkerSize(0.8);

    gVThreshold2_ADC->SetMarkerStyle(21);
    gVThreshold2_ADC->SetMarkerColor(COLOR_2);
    gVThreshold2_ADC->SetMarkerSize(0.8);

    gVCal_ADC->SetMarkerStyle(20);
    gVCal_ADC->SetMarkerColor(COLOR_3);
    gVCal_ADC->SetMarkerSize(0.8);

    gVCal_Bis_ADC->SetMarkerStyle(23);
    gVCal_Bis_ADC->SetMarkerColor(COLOR_4);
    gVCal_Bis_ADC->SetMarkerSize(1.);

    gVBaseline_ADC->SetMarkerStyle(22);
    gVBaseline_ADC->SetMarkerColor(COLOR_5);
    gVBaseline_ADC->SetMarkerSize(1.);

    // Draw
    gVThreshold1_ADC->Draw("p x same");
    gVThreshold2_ADC->Draw("p x same");
    gVCal_ADC->Draw("p x same");
    gVCal_Bis_ADC->Draw("p x same");
    gVBaseline_ADC->Draw("p x same");
    lADC_Voltage->Draw();
    cADC_Voltage->Write();

    /*
     * VCal Charge
     */

    // Canvas and graphs
    TCanvas* cCal_Charge(new TCanvas("cCal_Charge", "cCal_Charge", 800, 600));

    cCal_Charge->cd();
    cCal_Charge->SetGrid();

    // Axis
    dummyHisto = new TH2D("h13", ";Calibration pulse height [VFAT2 units];Charge [fC]", 250., 0., 250., 12, -2., 18.);
    dummyHisto->Draw();

    // Data
    for (unsigned int i(0); i < gCal_Charge->GetN(); i++) {
        double x, y;
        gCal_Charge->GetPoint(i, x, y);
        gCal_Charge->SetPoint(i, x, y * 1.E15);
    }

    // Style
    gCal_Charge->SetMarkerStyle(20);
    gCal_Charge->SetMarkerColor(COLOR_1);
    gCal_Charge->SetMarkerSize(1.);

    // Draw
    gCal_Charge->Draw("p same");
    cCal_Charge->Write();

}

/* */

int main(int argc, char *argv[]) {

    /* Get the files */

    fEffvsHV = new TFile("../../results/eff_vs_hv_T25.root", "read");
    fEffvsThreshold = new TFile("../../results/eff_vs_threshold.root", "read");
    fEffvsRate = new TFile("../../results/eff_vs_rate.root", "read");
    fThresholdvsHv = new TFile("../../results/threshold_vs_hv.root", "read");

    fEffvsThreshold_tk137_mu25 = new TFile("../../results/doubleGEMAnalyzer/137_Muons_T25_800uA.root", "read");
    fEffvsThreshold_tk204_mu30 = new TFile("../../results/doubleGEMAnalyzer/204_Muons_T30_800uA.root", "read");
    fEffvsThreshold_tk205_mu40 = new TFile("../../results/doubleGEMAnalyzer/205_Muons_T40_800uA.root", "read");
    fEffvsThreshold_tk206_mu50 = new TFile("../../results/doubleGEMAnalyzer/206_Muons_T50_800uA.root", "read");

    fEffvsThreshold_tk172_pi25 = new TFile("../../results/doubleGEMAnalyzer/172_Pions_T25_800uA_Rate.root", "read");
    fEffvsThreshold_tk207_pi30 = new TFile("../../results/doubleGEMAnalyzer/207_Pions_T30_800uA.root", "read");
    fEffvsThreshold_tk87_pi50 = new TFile("../../results/doubleGEMAnalyzer/87_Pions_T50_800uA.root", "read");

    fEffvsRate_tk152 = new TFile("../../results/doubleGEMAnalyzer/152_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk154 = new TFile("../../results/doubleGEMAnalyzer/154_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk155 = new TFile("../../results/doubleGEMAnalyzer/155_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk157 = new TFile("../../results/doubleGEMAnalyzer/157_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk159 = new TFile("../../results/doubleGEMAnalyzer/159_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk160 = new TFile("../../results/doubleGEMAnalyzer/160_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk166 = new TFile("../../results/doubleGEMAnalyzer/166_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk167 = new TFile("../../results/doubleGEMAnalyzer/167_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk171 = new TFile("../../results/doubleGEMAnalyzer/171_Pions_T25_800uA_Rate.root", "read");
    fEffvsRate_tk172 = new TFile("../../results/doubleGEMAnalyzer/172_Pions_T25_800uA_Rate.root", "read");

    fCalibration = new TFile("../../results/calibration.root", "read");

    fLatency = new TFile("../../results/latency.root", "read");

    fOutputFile = new TFile("../../results/plot.root", "recreate");

    /* Default size */

    TStyle* sDefault(gROOT->GetStyle("Plain"));

    sDefault->SetLegendFont(42);

    sDefault->SetLabelFont(42, "xyz");
    sDefault->SetLabelSize(0.04, "xyz");
    sDefault->SetLabelOffset(0.01, "xyz");
    sDefault->SetLabelColor(kBlack, "xyz");

    sDefault->SetTitleFont(42, "xyz");
    sDefault->SetTitleSize(0.045, "xyz");
    sDefault->SetTitleOffset(1.1, "xyz");
    sDefault->SetTitleColor(kBlack, "xyz");

    sDefault->SetTickLength(0.02, "x");
    sDefault->SetTickLength(0.015, "yz");

    sDefault->SetNdivisions(13, "x");
    sDefault->SetNdivisions(10, "yz");

    sDefault->SetOptStat(0);

    sDefault->SetPadTopMargin(0.05);

    sDefault->cd();

    /* */

    Run("GEM0");
    Run("GEM1");
    GlobalRun();

    /* */

    fEffvsHV->Close();
    fEffvsThreshold->Close();
    fEffvsRate->Close();
    fThresholdvsHv->Close();
    fEffvsThreshold_tk137_mu25->Close();
    fEffvsThreshold_tk205_mu40->Close();
    fEffvsThreshold_tk206_mu50->Close();
    fOutputFile->Close();

    return 0;
}
