#!/usr/bin/env python2.7

import sys, os, random, time
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/kernel")
from ipbus import *
import matplotlib.pyplot as plt

glib = GLIB()

glib.set('ultra_reset', 1)

glib.set('ultra_mode', 0)
glib.set('ultra_mask', 0x0)
glib.set('ultra_min', 0)
glib.set('ultra_max', 50)
glib.set('ultra_step', 1)
glib.set('ultra_n', 10000)

print "Mode", glib.get('ultra_mode')
print "Mask", hex(glib.get('ultra_mask'))
print "Min", glib.get('ultra_min')
print "Max", glib.get('ultra_max')
print "Step", glib.get('ultra_step')
print "N", glib.get('ultra_n')


glib.set('ultra_toggle', 1)


while (glib.get('ultra_status') == 1): time.sleep(0.001)

data = glib.fifoRead('ultra_data0', 49)
x0 = []
y0 = []

for d in data:
    x0.append((d & 0xff000000) >> 24)
    y0.append(d & 0x00ffffff)

data = glib.fifoRead('ultra_data4',49)
x4 = []
y4 = []

for d in data:
    x4.append((d & 0xff000000) >> 24)
    y4.append(d & 0x00ffffff)

data = glib.fifoRead('ultra_data15', 49)
x15 = []
y15 = []

for d in data:
    x15.append((d & 0xff000000) >> 24)
    y15.append(d & 0x00ffffff)

data = glib.fifoRead('ultra_data19', 49)
x19 = []
y19 = []

for d in data:
    x19.append((d & 0xff000000) >> 24)
    y19.append(d & 0x00ffffff)

plt.plot(x0, y0)
plt.plot(x4, y4)
plt.plot(x15, y15)
plt.plot(x19, y19)
plt.show()
