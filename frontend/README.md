## frontend setup

- setup environment variables

```bash
# adjust the values as needed.
cp .env.example .env
```

- run it

```bash
flutter run
```

## Signing the android app

Create `key.properties` inside the `android/` folder.

Fill in your values:

```
storePassword=<password-from-keystore>
keyPassword=<password-from-keystore>
keyAlias=<key-alias>
storeFile=<keystore-file-location>
```
