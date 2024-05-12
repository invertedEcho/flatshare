import * as React from "react";

import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { Dropdown } from "react-native-element-dropdown";
import { fetchWrapper } from "../utils/fetchWrapper";
import { AuthContext } from "../auth-context";
import StorageWrapper from "../utils/StorageWrapper";
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const registerFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string(),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

async function register({ username, password, email }: RegisterFormData) {
  try {
    await fetchWrapper.post("register", {
      username,
      password,
      email,
    });
  } catch {}
}

const defaultValues = {
  username: "",
  password: "",
};

export function RegisterScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Register">) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<RegisterFormData>({
    defaultValues,
    resolver: zodResolver(registerFormSchema),
  });

  const { mutate, data } = useMutation({
    mutationFn: ({ ...args }: RegisterFormData) =>
      register({
        username: args.username,
        password: args.password,
        email: args.email,
      }),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Succcessfully register" });
      resetForm({ ...defaultValues });
      navigation.navigate("Login");
    },
    onError: (err) => {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to register" });
    },
  });

  function onSubmit(data: RegisterFormData) {
    mutate({
      ...data,
    });
  }

  return (
    <SafeAreaView className="bg-slate-700 flex p-4 h-full">
      <View className="p-4 w-full bg-slate-900 rounded-lg h-full">
        <Text className="text-white">Username *</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              placeholder="Username"
              style={{ color: "white" }}
              onChangeText={onChange}
              value={value}
              className="p-4 text-white"
            />
          )}
          name="username"
        />
        {errors.username && (
          <Text className="text-red-300">Title is required</Text>
        )}
        <Text className="text-white">Password</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{
                color: "white",
              }}
              placeholder="Password"
              onChangeText={onChange}
              value={value}
              textContentType="password"
              className="p-4 text-white"
              secureTextEntry
            />
          )}
          name="password"
        />
        {errors.password && (
          <Text className="text-red-300">Password is required</Text>
        )}

        <Text className="text-white">Email</Text>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={{
                color: "white",
              }}
              placeholder="Email"
              onChangeText={onChange}
              value={value}
              textContentType="emailAddress"
              className="p-4 text-white"
            />
          )}
          name="email"
        />
        {errors.email && (
          <Text className="text-red-300">Email is required</Text>
        )}

        <Pressable
          // TODO: nativewind won't work here for some odd reason
          style={{
            backgroundColor: "white",
            padding: 10,
            borderRadius: 5,
          }}
          onPress={handleSubmit(onSubmit)}
        >
          <Text>Submit</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
