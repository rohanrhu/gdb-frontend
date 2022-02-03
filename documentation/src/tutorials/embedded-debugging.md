# Embedded Debugging with GDBFrontend

## Using `build_gdb.sh` to build latest GDB for ARM target with embedded-Python3

You can use `build_gdb.sh` to build your own GDB w/ Python3 support for ARM target. The script will also create a special command for using GDBFrontend on your own GDB build. (Like `gdbfrontend-gdb-11.2`.)

```bash
./build_gdb.sh --target=arm-none-eabi
```

Now you can use `gdbfrontend-gdb-{version}` command. Just like:

```bash
gdbfrontend-gdb-11.2
```

## or How to build GDB for ARM with embedded-Python3

**GDBFrontend needs GDB-embedded Python3.** Sometimes, you could not find a GDB build for ARM target (`arm-none-eabi`) with Python3 support on GDB. In this situation you can quickly build your own GDB with Python3 support and `arm-none-eabi` target.

### You may need some build-time dependencies
You must install GDB's build dependencies that are listed here: https://sourceware.org/gdb/onlinedocs/gdb/Requirements.html

If you have some missing build dependencies, `configure` script will say the missing library, just find it in your package management system and install.

**Please edit and update this article if you have an issue about build dependencies and you know how to install them.**

### Follow these steps

```bash
cd ~
wget https://ftp.gnu.org/gnu/gdb/gdb-11.1.tar.xz
tar zxvf gdb-11.1.tar.gz
mkdir gdb-11.1-build
cd gdb-11.1-build
../gdb-11.1/configure --with-python=/usr/bin/python3 --target=arm-none-eabi --enable-interwork --enable-multilib
make
```

As you see, you should pass your Python3 executable to configure script's `--with-python` paramter just like `--with-python=/usr/bin/python3`.

### Starting GDBFrontend with your GDB build

After build is successful, you should be able to run GDBFrontend like this:

```bash
gdbfrontend -g $(realpath ~/gdb-11.1-build/gdb/gdb) -G --data-directory=$(realpath ~/gdb-11.1-build/gdb/data-directory/)
```

It looks like this:

![image](https://user-images.githubusercontent.com/1125150/143163183-5a328373-9407-4d5c-9a27-b9f2127e1c23.png)
![image](https://user-images.githubusercontent.com/1125150/143163331-325eff33-16de-4a35-8ef1-3a4fad60892c.png)