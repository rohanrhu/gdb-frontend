# How to debug a Python C extension with GDBFrontend
Hi, in this tutorial, I'm going to show you how to debug a native C Python extension.

![Python C extension debugging with GDBFrontend](https://i.imgur.com/19ysWyY.png)

# Installing Python3 debug symbols
To debug Python3, you need debug symbols for it.

On Debian:

```bash
sudo apt install python3-dbg
```

I have no idea about other distros. Just search about **"Python debug symbols on DISTRO"**

# Build your extension with debug symbols
Just set `CFLAGS` environment variables:

```bash
CFLAGS="-O0 -g" python3 setup.py build
```

![](https://i.imgur.com/oUVbxtH.png)

# Let's debug!
First thing, we are going to start GDBFrontend:

```bash
gdbfrontend
```

![](https://i.imgur.com/eMmvGG7.png)

GDBFrontend will open a browser tab as a default behavior but if it doesn't happen, you can open the app URL:

```
http://127.0.0.1:5550/
```

**Optionally** you can run it as a Chrome/Chromium app:

```bash
chrome --app=http://127.0.0.1:5550/
```

![](https://i.imgur.com/4m8bvlt.png)

**Optionally** choose the Doki Theme xD

![](https://i.imgur.com/Uvx2pWh.png)

We just need to add split the terminal and start a Python3 interpeter on the right side.

![](https://i.imgur.com/8Tk9Mau.png)

To attach GDB to our Python3 process, we need PID of our Python PID.

```python
>>> import os
>>> os.getpid()
25524
```

And on GDB shell:

```
(gdb) attach 25524
```

At this point, GDB will immediately stop the process. Just click to continue button (the second button on top) or press **F6**.

Import your module on Python prompt and **unfocus from terminal**, now just press **Ctrl + P** shortcut and type a source name from your Python extension.

![](https://i.imgur.com/o8zjiev.png)

Congratulations! Now you can add a breakpoint to a function from your extension and use that function!

![](https://i.imgur.com/IqtFk7T.png)