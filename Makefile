
SHELL:=/bin/bash
HOSTNAME:=$(shell echo $${HOSTNAME%%\.*})


GUI-OPTS = -DGUI `pkg-config --cflags gtk+-3.0` `pkg-config --libs gtk+-3.0`


mlcc:
	gcc -std=gnu99 -g -Wall -o mlcc mlcc.c $(GUI-OPTS)

clean:
	rm -f mlcc

install-gui-prereqs:
	yum install gnome-devel-docs gtk+ gtk3-devel gtk3-devel-docs gtk+-devel gtk-doc libcanberra-gtk3

test: mlcc
	mkdir -p Test_Results
	nohup ./test.sh $(SUBSET) > Test_Results/$(HOSTNAME).nohup.out 2>&1 &

