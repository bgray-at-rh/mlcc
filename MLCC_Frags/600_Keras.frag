
# Install Keras

RUN set -vx \
\
&& mkdir -p ~/.keras \
&& echo -e '\
{ \n\
    "image_data_format": "channels_last", \n\
    "epsilon": 1e-07, \n\
    "floatx": "float32", \n\
    "backend": "KERAS_BACKEND" \n\
} \n' \
> ~/.keras/keras.json \
\
&& if [ -f ~/.theanorc ]; then \
    sed -i 's/KERAS_BACKEND/theano/g' ~/.keras/keras.json; \
elif [ -f /tmp/select_cntk.sh ]; then \
    sed -i 's/KERAS_BACKEND/cntk/g' ~/.keras/keras.json; \
else \
    sed -i 's/KERAS_BACKEND/tensorflow/g' ~/.keras/keras.json; \
fi \
\
&& /usr/local/bin/pip3 -v install keras

