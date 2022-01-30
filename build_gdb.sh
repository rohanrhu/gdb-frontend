#!/bin/bash


# Color codes for colored output
RED="\033[31m"
GREEN="\033[32m"
BLUE="\033[34m"
YELLOW="\033[33m"
RESET="\033[0m"
# Color codes end

# Aborts the script
abortScript() {
	echo -e "${YELLOW}Aborting the script...${RESET}"
	exit 2
}

# Informative echo on terminal
echoSelectedOs() {
	printGreenStars
	echo -e "${GREEN}Installing packages for ${BLUE}${OS}${GREEN}...${RESET}"
	printGreenStars
}

# Success indicator
dependencyInstallationSuccessfull() {
	printGreenStars
	echo -e "${GREEN}Dependencies installed.${RESET}"
	printGreenStars
}

# Failure indicator
dependencyInstallationFailed() {
	printRedStars
	echo -e "${RED}Error while installing dependencies!${RESET}"
	printRedStars
}

# Decorative stars
printGreenStars() {
	echo -e "${GREEN}*************************************************************************${RESET}"
}

printYellowStars() {
	echo -e "${YELLOW}*************************************************************************${RESET}"
}

printRedStars() {
	echo -e "${RED}*************************************************************************${RESET}"
}
##

# Check if the script ran with sudo privilages
if [ $EUID -ne 0 ]; then
	echo -e "${RED}This script needs root privilages in order to install dependencies!"
	echo -e "${BLUE}Try to run 'sudo ${0}'"
	abortScript
fi


if [ -f /etc/os-release ]; then	# Decide OS using /etc/os-release
	. /etc/os-release
	OS=$NAME

elif [ -f /etc/lsb-release ]; then	# Decide OS using /etc/lsb-release
	. /etc/lsb-release
 	OS=$DISTRIB_DESCRIPTION

else	# If couldn't find OS by reading the above two files, install for unknown OS
	OS="Unknown"

fi

# Check for internet connection
which ping > /dev/null

# Check for internet connection
if [ $? -eq 0 ]; then
	ping -c 2 "www.google.com" > /dev/null
	if [ $? -ne 0 ]; then
		printRedStars
		echo -e "${RED}You may not be connected to the internet."
		echo -e "${YELLOW}Please check your internet connection${RESET}"
		printRedStars
		abortScript
	fi
fi


# Install necessary dependencies for the host OS
case $OS in
	"Arch Linux") 		# Not tested for the freshly installed system
		echoSelectedOs	# To do: Test for fresh arch install
		echo
		sleep 1
		pacman -Sy
		pacman -q -S --needed --noconfirm zlib python mpfr xz guile expat\
			gcc make automake gmp wget
		echo
		
		if [[ $? -ne 0 ]]; then
			dependencyInstallationFailed
			abortScript
		else
			dependencyInstallationSuccessfull
		fi
		
		echo
		sleep 1
		;;
	
	"Ubuntu")
		echoSelectedOs
		echo
		sleep 1
		apt update
		apt install -q -y gcc g++ make libgmp10 libgmp-dev\
			expat libexpat1 libexpat1-dev guile-3.0 guile-3.0-dev\
			lzma lzma-dev libmpfr-dev python3 zlib1g-dev zlib1g\
			libpython3-dev ubuntu-make texi2html texinfo
		echo
		
		if [[ $? -ne 0 ]]; then
			dependencyInstallationFailed
			abortScript
		else
			dependencyInstallationSuccessfull
		fi

		echo
		sleep 1
		;;
	
	"Debian GNU/Linux")
		echoSelectedOs
		echo
		sleep 1
		apt update
		apt install -q -y wget tar xz-utils gcc g++ make libgmp-dev\
			libexpat1 libexpat1-dev guile-3.0 guile-3.0-dev guile-3.0-libs\
			texinfo lzma-dev liblzma5 libmpfr-dev libmpfr6 libmpfrc++-dev\
			python3 python3-distutils python3-dev zlib1g zlib1g-dev
		echo

		if [[ $? -ne 0 ]]; then
			dependencyInstallationFailed
			abortScript
		else
			dependencyInstallationSuccessfull
		fi

		echo
		sleep 1
		;;

	"Unknown")
		printYellowStars
		echo -e "${YELLOW}Installing for an ${RED}UNKNOWN${YELLOW} system..."
		echo -e "${BLUE}Some packages may be missing...${RESET}"
		printYellowStars
		echo
		sleep 3
		;;
esac

TARGET=$(echo $1 | sed 's/.*=//')
BASE_DIR=$(pwd)
DIR_NAME="gdb-11.2"
TAR_NAME="${DIR_NAME}.tar.xz" 
BUILD_DIR_NAME="${DIR_NAME}_build"
SOURCE_DIR="${DIR_NAME}_sources"

# Get sources from the GNU website
if [ ! -d $SOURCE_DIR ]; then
	mkdir $SOURCE_DIR
fi
cd $SOURCE_DIR

if [ ! -f ./${TAR_NAME} ]; then
	printGreenStars
	echo -e "${GREEN}Downloading sources from the web...${RESET}"
	printGreenStars
	echo
	sleep 1
	wget https://ftp.gnu.org/gnu/gdb/${TAR_NAME}
fi

if [ $? -ne 0 ]; then
	printRedStars
	echo "${RED}Unable to download sources from the web.${RESET}"
	printRedStars
	echo
	cd ..
	rm -rf $DIR_NAME_sources
	if [ -f $TAR_NAME ]; then
		rm $TAR_NAME
	fi
	abortScript
fi

printGreenStars
echo -e "${GREEN}Sources (${BLUE}${TAR_NAME}${GREEN}) downloaded successfully."
echo -e "Extracting the contents of the tar file...${RESET}"
printGreenStars
echo
sleep 1

if [ -d $DIR_NAME ]; then
	cd $DIR_NAME
	if [ -d $BUILD_DIR_NAME ]; then
		rm -rf $BUILD_DIR_NAME
	else
		mkdir ${BUILD_DIR_NAME}
		cd ${BUILD_DIR_NAME}
	fi
else
	tar -xvf $TAR_NAME
	if [[ $? -ne 0 ]]; then
		printRedStars
		echo -e "${RED}Unable to extract contents of tar file.${RESET}"
		printRedStars
		abortScript
	fi
	cd $DIR_NAME
fi

if [[ ! -d ${BUILD_DIR_NAME} ]]; then
	mkdir ${BUILD_DIR_NAME}
	cd ${BUILD_DIR_NAME}
else
	cd ${BUILD_DIR_NAME}
fi


printGreenStars
echo -e "${GREEN}Starting Makefile configuration...${RESET}"
printGreenStars
echo
sleep 1

# $1 means --target parameter for configure script
../configure --with-python=$(which python3) --enable-interwork --enable-multilib $1


if [[ $? -ne 0 ]]; then
	printRedStars
	echo -e "${RED}Makefile configuration failed."
	echo "Possible --target error${RESET}"
	printRedStars
	abortScript
fi
	
printGreenStars
echo -e "${GREEN}Makefile configuration completed."
echo -e "Starting to compile...${RESET}"
printGreenStars
echo

sleep 1
make -j $(nproc)	# Use all available cores for compilation


if [ $? -ne 0 ]; then
	printRedStars
	echo -e "${RED}Compilation failed.${RESET}"
	printRedStars
	echo
	abortScript
fi

printGreenStars
echo -e "${GREEN}Compilation successfull.${RESET}"
printGreenStars
echo

# Copy compiled gdb files into the /etc folder
if [[ $TARGET ]]; then
	cp -r ${BASE_DIR}/$SOURCE_DIR/${DIR_NAME}/${DIR_NAME}_build/gdb /etc/${DIR_NAME}_${TARGET}
else
	cp -r ${BASE_DIR}/$SOURCE_DIR/${DIR_NAME}/${DIR_NAME}_build/gdb /etc/${DIR_NAME}
fi


printGreenStars
if [[ $TARGET ]]; then
	echo -e "${GREEN}${DIR_NAME} is installed to the /etc/${DIR_NAME}_${TARGET}${RESET}"
else
	echo -e "${GREEN}${DIR_NAME} is installed to the /etc/${DIR_NAME}${RESET}"
fi
printGreenStars

printGreenStars
echo -e "${GREEN}Cleaning up the sources...${RESET}"
printGreenStars
cd $BASE_DIR
rm -rf --interactive=never ./$SOURCE_DIR

if [[ -f /usr/bin/gdbfrontend-${DIR_NAME} ]]; then
	rm -rf /usr/bin/gdbfrontend-${DIR_NAME}
fi

if [[ $TARGET ]]; then
	
	printf "#! /bin/bash\n" >> /usr/bin/gdbfrontend-${DIR_NAME}-${TARGET}
	printf "gdbfrontend -g /etc/${DIR_NAME}_${TARGET}/gdb -G --data-directory=/etc/${DIR_NAME}_${TARGET}/data-directory/" >> /usr/bin/gdbfrontend-${DIR_NAME}-${TARGET}
	chmod +x /usr/bin/gdbfrontend-${DIR_NAME}-${TARGET}
else
	printf "# !/bin/bash\n" >> /usr/bin/gdbfrontend-${DIR_NAME}
	printf "gdbfrontend -g /etc/${DIR_NAME}/gdb -G --data-directory=/etc/${DIR_NAME}/data-directory/" >> /usr/bin/gdbfrontend-${DIR_NAME}
	chmod +x /usr/bin/gdbfrontend-${DIR_NAME}
fi


printGreenStars
if [[ $TARGET ]]; then
	echo -e "${GREEN}Created gdbfrontend-${DIR_NAME}-${TARGET} script at /usr/bin..."
	echo -e "You can run gdbfrontend by calling gdbfrontend-${DIR_NAME}-${TARGET} from terminal...${RESET}"
else
	echo -e "${GREEN}Created gdbfrontend-${DIR_NAME} script at /usr/bin..."
	echo -e "You can run gdbfrontend by calling gdbfrontend-${DIR_NAME} from terminal...${RESET}"
fi
printGreenStars


printGreenStars
echo -e "${GREEN}Installation completed!${RESET}"
printGreenStars