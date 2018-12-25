
# Set up PATH for using CPUs

RUN set -vx \
\
&& echo -e '\
export PATH=/usr/local/bin:/usr/bin:${PATH} \n\
\n' \
>> ~/.bashrc

ENV \
PATH="/usr/local/bin:/usr/bin:${PATH:+:${PATH}}"

