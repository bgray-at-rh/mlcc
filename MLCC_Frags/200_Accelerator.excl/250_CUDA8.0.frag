
# Install CUDA 8.0 

RUN set -vx \
\
&& echo -e '\
exec > /etc/yum.repos.d/cuda.repo \n\
echo [cuda] \n\
echo name=cuda \n\
if [ -f /etc/fedora-release ]; then \n\
echo baseurl="http://developer.download.nvidia.com/compute/cuda/repos/fedora23/x86_64" \n\
else \n\
echo baseurl="http://developer.download.nvidia.com/compute/cuda/repos/rhel7/x86_64" \n\
fi \n\
echo enabled=1 \n\
echo gpgcheck=0 \n' \
>> /tmp/Make_CUDA_Repo.sh \
&& sh /tmp/Make_CUDA_Repo.sh \
\
&& /tmp/yum_install.sh cuda-8-0 \
\
&& echo -e '\
\n\
export CUDA_HOME=/usr/local/cuda \n\
export CUDA_PATH=/usr/local/cuda \n\
export PATH=/usr/local/cuda/bin:/usr/local/bin:/usr/bin:${PATH} \n\
export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH \n\
\n' \
>> ~/.bashrc

ENV \
CUDA_VERSION="8.0" \
CUDA_HOME="/usr/local/cuda" \
CUDA_PATH="/usr/local/cuda" \
PATH="/usr/local/cuda/bin:/usr/local/bin:/usr/bin:${PATH:+:${PATH}}" \
LD_LIBRARY_PATH="/usr/local/cuda/lib64:${LD_LIBRARY_PATH:+:${LD_LIBRARY_PATH}}"

INCLUDE Check_GCC_v5, NCCL, cuDNN

