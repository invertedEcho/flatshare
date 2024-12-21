{
  description = "Flutter environment";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs";

    # pnpm 9.15.1
    nixpkgs-pnpm.url = "github:NixOS/nixpkgs/3f5c1fc2affdb6c70b44ca624b4710843b7e3059";

    # gradle v7.6.3
    nixpkgs-gradle.url = "github:NixOS/nixpkgs/68bb040a9617ec704cb453cc921f7516d5b36cae";
    # jdk19
    nixpkgs-jdk.url = "github:NixOS/nixpkgs/e05f1c6f3c9e9feb968d6080196bd4361be5c2c7";
  };

  outputs = {
    self,
    nixpkgs,
    nixpkgs-pnpm,
    nixpkgs-gradle,
    nixpkgs-jdk,
    flake-utils,
  }:
    flake-utils.lib.eachSystem ["x86_64-linux"] (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };
        pkgs-gradle = import nixpkgs-gradle {inherit system;};
        pkgs-jdk = import nixpkgs-jdk {inherit system;};
        pkgs-pnpm = import nixpkgs-pnpm {inherit system;};

        androidEnv = pkgs.androidenv.override {licenseAccepted = true;};

        androidComposition = androidEnv.composeAndroidPackages {
          buildToolsVersions = ["30.0.3" "34.0.0"];
          platformVersions = ["34"];
          abiVersions = ["x86_64"]; # emulator related: on an ARM machine, replace "x86_64" with
        };
        androidSdk = androidComposition.androidsdk;
      in {
        devShell = with pkgs;
          mkShell rec {
            ANDROID_SDK_ROOT = "${androidComposition.androidsdk}/libexec/android-sdk";
            GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${ANDROID_SDK_ROOT}/build-tools/34.0.0/aapt2";
            FLUTTER_ROOT = flutter;
            DART_ROOT = "${flutter}/bin/cache/dart-sdk";
            QT_QPA_PLATFORM = "wayland;xcb"; # emulator related: try using wayland, otherwise fall back to X
            buildInputs = [
              androidSdk
              flutter
              pkgs-gradle.gradle_7
              pkgs-jdk.jdk19
              protobuf
              buf
              pandoc
              libsecret.dev
              gtk3.dev
              grpcurl
              glib
              pcre2
              pkg-config
              firebase-tools
              pkgs-pnpm.pnpm
            ];
            CMAKE_PREFIX_PATH = "${pkgs.lib.makeLibraryPath [libsecret.dev gtk3.dev]}";

            # we need shellHook here as $PWD is not available in the nix environment
            shellHook = ''
              # TODO: feels super hacky, i feel like flutter is messing up somewhere here
              # also probably breaks stuff when doing a release build
              # we could provide shell scripts for building release/debug for nix users that set the correct dir
              export CMAKE_INSTALL_PREFIX=$PWD/frontend/build/linux/x64/debug/bundle
              export PATH="$PATH":"$HOME/.pub-cache/bin"
            '';
          };
      }
    );
}
