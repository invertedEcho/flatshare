{
  description = "Flutter environment";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachSystem ["x86_64-linux"] (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in {
        devShell = with pkgs;
          mkShell {
            FLUTTER_ROOT = flutter;
            DART_ROOT = "${flutter}/bin/cache/dart-sdk";
            QT_QPA_PLATFORM = "wayland;xcb"; # emulator related: try using wayland, otherwise fall back to X
            buildInputs = [
              flutter
              gradle
              jdk21
              protobuf
              buf
              pandoc
              libsecret.dev
              gtk3.dev
              grpcurl
              glib
              pcre2
              pkg-config
            ];
            CMAKE_PREFIX_PATH = "${pkgs.lib.makeLibraryPath [libsecret.dev gtk3.dev]}";

            # we need shellHook here as $PWD is not available in the nix environment
            shellHook = ''
              # TODO: feels super hacky, i feel like flutter is messing up somewhere here
              # also probably breaks stuff when doing a release build
              # we could provide shell scripts for building release/debug for nix users that set the correct dir
              export CMAKE_INSTALL_PREFIX=$PWD/frontend/build/linux/x64/debug/bundle
            '';
          };
      }
    );
}
