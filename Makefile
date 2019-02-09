

GUI-OPTS = -DGUI `pkg-config --cflags gtk+-3.0` `pkg-config --libs gtk+-3.0`

# HOST_OS = `(. /etc/os-release; echo ${ID}${VERSION_ID})`
HOST_OS = RHEL7.6
GPU_VERSION = `readlink /usr/local/cuda | tr -d '-'`


mlcc:
	gcc -std=gnu99 -g -Wall -o mlcc mlcc.c $(GUI-OPTS)

clean:
	rm -f mlcc


install-gui-prereqs:
	yum install gnome-devel-docs gtk+ gtk3-devel gtk3-devel-docs gtk+-devel gtk-doc libcanberra-gtk3

examples: cutenkeras theanosagne cu_rpud_rstudio

cutenkeras: mlcc
	./mlcc -o cutenkeras_dockerfile -i $(HOST_OS),$(GPU_VERSION),Tensorflow,Keras 
	./podman_build_it.sh cutenkeras_dockerfile cutenkeras
# ./podman_run_it.sh cutenkeras

theanosagne: mlcc
	./mlcc -o theanosagne_dockerfile -i $(HOST_OS),$(GPU_VERSION),Lasagne,Theano
	./podman_build_it.sh theanosagne_dockerfile theanosagne
# ./podman_run_it.sh theanosagne
	
cu_rpud_rstudio: mlcc
	./mlcc -o cu_rpud_rstudio_dockerfile -i $(HOST_OS),$(GPU_VERSION),R-studio,rpud,VNC
	./podman_build_it.sh cu_rpud_rstudio_dockerfile cu_rpud_rstudio
# ./podman_run_it_with_vnc.sh cu_rpud_rstudio

