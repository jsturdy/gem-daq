CC=g++
CCFLAGS=`root-config --cflags` -c -Iincludes/ -O2 -std=c++11
LDFLAGS=`root-config --glibs` -O2 -std=c++11


all:
	mkdir -p tmp
	$(CC) $(CCFLAGS) kernel/*.cpp
	mv *.o tmp/
	$(CC) $(CCFLAGS) analyzer/*.cpp
	# $(CC) $(LDFLAGS) tmp/*.o singleGEMAnalyzer.o -o build/singleGEMAnalyzer
	# $(CC) $(LDFLAGS) tmp/*.o doubleGEMAnalyzer.o -o build/doubleGEMAnalyzer
	# $(CC) $(LDFLAGS) tmp/*.o effvsHVAnalyzer.o -o build/effvsHVAnalyzer
	# $(CC) $(LDFLAGS) tmp/*.o effvsThresholdAnalyzer.o -o build/effvsThresholdAnalyzer
	# $(CC) $(LDFLAGS) tmp/*.o effvsRateAnalyzer.o -o build/effvsRateAnalyzer
	# $(CC) $(LDFLAGS) tmp/*.o thresholdvsHVAnalyzer.o -o build/thresholdvsHVAnalyzer
	$(CC) $(LDFLAGS) tmp/*.o calibration.o -o build/calibration
	# $(CC) $(LDFLAGS) tmp/*.o latency.o -o build/latency
	$(CC) $(LDFLAGS) tmp/*.o plot.o -o build/plot
	$(CC) $(LDFLAGS) tmp/*.o compute.o -o build/compute
	rm -rf tmp *.o

clean:
	rm -rf tmp *.o
