import { Platform } from "react-native";
import AsyncStorage, {
  AsyncStorageStatic,
} from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

class StorageWrapper {
  private static storage: AsyncStorageStatic | typeof SecureStore;

  static {
    if (Platform.OS === "web") {
      StorageWrapper.storage = AsyncStorage;
    } else {
      StorageWrapper.storage = SecureStore;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return await (StorageWrapper.storage as AsyncStorageStatic).getItem(key);
    } else {
      return await (StorageWrapper.storage as typeof SecureStore).getItemAsync(
        key
      );
    }
  }

  static async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      return await StorageWrapper.storage.setItem(key, value);
    } else {
      return await (StorageWrapper.storage as typeof SecureStore).setItemAsync(
        key,
        value
      );
    }
  }

  static async deleteItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      return await (StorageWrapper.storage as AsyncStorageStatic).removeItem(
        key
      );
    } else {
      return await (
        StorageWrapper.storage as typeof SecureStore
      ).deleteItemAsync(key);
    }
  }
}

export default StorageWrapper;
