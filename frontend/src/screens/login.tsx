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
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

const loginFormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

async function login({ username, password }: LoginFormData) {
  const res = await fetchWrapper.post("login", {
    username,
    password,
  });
  const json = await res.json();
  console.debug({ token: json["access_token"] });
  return json["access_token"];
}

const defaultValues = {
  username: "",
  password: "",
};

export function LoginScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Login">) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<LoginFormData>({
    defaultValues,
    resolver: zodResolver(loginFormSchema),
  });

  const { isAuthorized, setIsAuthorized } = React.useContext(AuthContext);

  const { mutate, data } = useMutation({
    mutationFn: ({ ...args }: LoginFormData) =>
      login({
        username: args.username,
        password: args.password,
      }),
    onSuccess: (res) => {
      console.debug("success", res);
      Toast.show({ type: "success", text1: "Succcessfully logged in" });
      resetForm({ ...defaultValues });
      setIsAuthorized(true);
      StorageWrapper.setItem("jwt-token", res);
    },
    onError: (err) => {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to log in" });
      setIsAuthorized(false);
    },
  });

  function onSubmit(data: LoginFormData) {
    mutate({
      ...data,
    });
  }

  return (
    <SafeAreaView className="bg-slate-700 flex p-4 h-full">
      <View className="p-4 w-full bg-slate-900 rounded-lg h-full">
        <Text className="text-white">Username</Text>
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
