{ pkgs ? import <nixpkgs> { config = { allowUnfree = true; }; } }:

with pkgs;


let
  android-nixpkgs = callPackage <android-nixpkgs> { };

  android-sdk = android-nixpkgs.sdk (sdkPkgs: with sdkPkgs; [
    cmdline-tools-latest
    build-tools-34-0-0
    platform-tools
    platforms-android-34
    emulator
    ndk-26-1-10909125
    cmake-3-22-1
  ]);

  nodejs = pkgs.nodejs_22;
  pnpm = pkgs.nodejs_22.pkgs.pnpm;
in
mkShell {
  buildInputs = [
    android-studio
    android-sdk
    nodejs
    pnpm
  ];

  shellHook = ''
    export GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=${android-sdk}/share/android-sdk/build-tools/34.0.0/aapt2";
  '';
}
