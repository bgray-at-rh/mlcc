
# Install VNC

RUN set -vx \
\
&& /tmp/yum_install.sh \
    dejavu-sans-fonts \
    dejavu-serif-fonts \
    metacity \
    tigervnc-server \
    xdotool \
    xterm \
\
&& mkdir -p /root/.vnc \
&& echo -e '\
unset SESSION_MANAGER \n\
unset DBUS_SESSION_BUS_ADDRESS \n\
if [ -x /etc/X11/xinit/xinitrc ]; then \n\
    exec /etc/X11/xinit/xinitrc \n\
fi \n\
if [ -f /etc/X11/xinit/xinitrc ]; then \n\
    exec sh /etc/X11/xinit/xinitrc \n\
fi \n\
[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources \n\
xsetroot -solid grey \n\
metacity & \n' \
> /root/.vnc/xstartup \
&& chmod -v +x /root/.vnc/xstartup \
&& echo 123456 | vncpasswd -f > /root/.vnc/passwd \
&& chmod -v 600 /root/.vnc/passwd

EXPOSE 5901

