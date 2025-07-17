**Description**

C++17 WebRTC echo client and server with libdatachannel.

**Prerequisites**

You need cmake and the development libraries with header files for either OpenSSL or GnuTLS. On Debian/Ubuntu, you can install them with either `$ apt install libssl-dev` or `$ apt install libgnutls28-dev`.

Additionally, be sure the submodules are updated with:

```sh
# fetch cpp-httplib locked in .git/index
git submodule update --init libdatachannel/deps/cpp-httplib
# fetch the newest libdatachannel
git submodule update --init --remote libdatachannel/deps/libdatachannel
# fetch cpp-httplib and libdatachannel deps (if there are any) locked in their .git/index
git submodule foreach --recursive git submodule update --init
```

For building on Windows vcpkg can be used to install the required dependencies:

`vcpkg install --triplet=x64-windows openssl zlib`

If cmake fails to find the vcpkg dependencies try passing the vcpkg include file (run `vcpkg integrate install` to print out the path):

`cmake -DCMAKE_TOOLCHAIN_FILE=C:/Tools/vcpkg/scripts/buildsystems/vcpkg.cmake -B build`

**Build**

`$ cmake -B build` for OpenSSL or `$ cmake -B build -DUSE_GNUTLS=1` for GnuTLS

`$ (cd build; make -j4)`

For Windows:

`msbuild build\webrtc-libdatachannel.sln`

**Usage**

Server: `$ build/server [PORT]`

Client: `$ build/client [URL]`

The server listens on port 8080 by default and the client uses the URL http://127.0.0.1:8080/offer by default.

