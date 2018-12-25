
# MLCC

The Machine Learning Container Creator (MLCC) is an experimental tool and a work-in-progress. MLCC facilitates running machine learning frameworks and applications in Red Hat Enterprise Linux environments by semi-automating the generation of dockerfiles which can be used to build container images with the required dependencies to run the machine learning software. Using containers to run ML applications and explore ML environments is a good idea because doing that can hide messy details and can help preserve your original OS instance from accidental corruption.

Your container host system must have a valid RHEL subscription, and you should enable these repos:
subscription-manager repos --enable="rhel-7-server-rpms" --enable="rhel-7-server-optional-rpms" --enable="rhel-7-server-extras-rpms" 

You can get a free RHEL developer subscription at https://developers.redhat.com/products/rhel/download

To install EPEL, do:  yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

To install NVIDIA's CUDA stack see:  https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html
Download NVIDIA's cuDNN. See: MLCC\_Repos/NVIDIA\_PKGS/README.txt


Some gtk packages are needed to build the MLCC GUI:  yum install gnome-devel-docs gtk+ gtk3-devel gtk3-devel-docs gtk+-devel gtk-doc libcanberra-gtk3

Compile MLCC with GUI:  gcc -std=gnu99 -g -Wall -o mlcc mlcc.c -DGUI `pkg-config --cflags gtk+-3.0` `pkg-config --libs gtk+-3.0`


Use mlcc via GUI:  mlcc -G

Use mlcc via interactive terminal menus:  mlcc -I

Use mlcc via "-i" interaface:  mlcc -i RHEL7.5,CUDA9.2,Pandas,TensorFlow,Keras


Use podman for building and running containers. See:  https://podman.io and the podman scripts.



# More MLCC info coming soon


