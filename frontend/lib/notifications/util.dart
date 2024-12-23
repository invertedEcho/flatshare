import 'dart:io';

bool getIsSupportedPlatformFirebase() {
  return Platform.isAndroid || Platform.isIOS;
}
