sDefault->SetLegendFont(42);

sDefault->SetLabelFont(42, "xyz");
sDefault->SetLabelSize(0.03, "xyz");
sDefault->SetLabelOffset(0.01, "xyz");
sDefault->SetLabelColor(kBlack, "xyz");

sDefault->SetTitleFont(42, "xyz");
sDefault->SetTitleSize(0.035, "xyz");
sDefault->SetTitleOffset(1.1, "xyz");
sDefault->SetTitleColor(kBlack, "xyz");

sDefault->SetTickLength(0.02, "x");
sDefault->SetTickLength(0.015, "yz");

sDefault->SetNdivisions(13, "x");
sDefault->SetNdivisions(10, "yz");



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
dummyHisto = new TH2D("h1", ";High Voltage [#muA];Counts [%]", 10, 695., 815., 10, 0., 1.);
dummyHisto->Draw();

TGaxis* aADC_Current(new TGaxis(250., 0., 250., 400., 0., ADC_I_CONV(400.) * 1.E6, 510, "+LS"));
aADC_Current->SetTickLength(0.015);
aADC_Current->SetNdivisions(11);
aADC_Current->SetLabelFont(42);
aADC_Current->SetLabelSize(0.035);
aADC_Current->SetLabelOffset(0.01);
aADC_Current->SetTitle("Current (uA)");
aADC_Current->SetTitleFont(42);
aADC_Current->Draw();


// Legend
TLegend* lEfficiency_HV(new TLegend(695., 0.8, 740., 1., "", ""));
lEfficiency_HV->SetTextSize(0.025);
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
gEfficiency_HV->SetMarkerColor(COLOR_RED);
gEfficiency_HV->SetMarkerSize(0.9);
gEfficiency_HV->SetFillStyle(3003);
gEfficiency_HV->SetFillColor(COLOR_RED);

hComputedEfficiency_HV->SetMarkerStyle(23);
hComputedEfficiency_HV->SetMarkerColor(COLOR_LIGHT_BLUE);
hComputedEfficiency_HV->SetMarkerSize(1.1);
hComputedEfficiency_HV->SetFillStyle(3003);
hComputedEfficiency_HV->SetFillColor(COLOR_LIGHT_BLUE);

gNoise_HV->SetMarkerStyle(20);
gNoise_HV->SetMarkerColor(COLOR_GREEN);
gNoise_HV->SetMarkerSize(0.7);
gNoise_HV->SetFillStyle(3003);
gNoise_HV->SetFillColor(COLOR_GREEN);

// Draw
gEfficiency_HV->Draw("2 same");
gEfficiency_HV->Draw("p same");
hComputedEfficiency_HV->Draw("2 same");
hComputedEfficiency_HV->Draw("p same");
gNoise_HV->Draw("2 same");
gNoise_HV->Draw("p same");
lEfficiency_HV->Draw();
cEfficiency_HV->Write();
