#!/usr/bin/env python2.7

import sys, os, random, time
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/kernel")
from ipbus import *
import matplotlib.pyplot as plt
from math import *
import time
import numpy

def median(lst):
    return numpy.median(numpy.array(lst))

glib = GLIB("137.138.115.185")

N = 1000

mean = 0.
mean2 = 0.
means = []

for j in range(0, N):

    start_time = time.time()
    glib.fifoRead("glib_cnt_stb_cnt", 1000)
    stop_time = time.time()
    t = stop_time - start_time

    mean += t
    mean2 += (t * t)
    means.append(t)

mean /= (1. * N)

print "Mean:", mean
print "RMS:", sqrt(mean2 / (1. * N) - mean * mean)
print "Median:", median(means)

plt.hist(means)
plt.show()
