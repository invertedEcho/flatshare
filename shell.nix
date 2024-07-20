{ pkgs ? import <nixpkgs> { config = { allowUnfree = true; }; } }:

with pkgs;


let
  android-nixpkgs = callPackage (import (builtins.fetchGit {
    # TODO: Switch to non-fork when https://github.com/tadfisher/android-nixpkgs/pull/104 is merged
    url = "https://github.com/HPRIOR/android-nixpkgs.git";
  })) {
    channel = "stable";
  };

  android-sdk = android-nixpkgs.sdk (sdkPkgs: with sdkPkgs; [
    cmdline-tools-latest
    build-tools-30-0-3
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
    aapt
  ];

  GRADLE_OPTS="-Dorg.gradle.project.android.aapt2FromMavenOverride=${aapt}/bin/aapt2";
}
