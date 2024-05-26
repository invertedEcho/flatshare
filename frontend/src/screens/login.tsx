import * as React from "react";

import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { fetchWrapper } from "../utils/fetchWrapper";
import { AuthContext } from "../auth-context";
import StorageWrapper from "../utils/StorageWrapper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import FormTextInput from "../components/form-text-input";

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
  return json["access_token"];
}

export function LoginScreen({}: NativeStackScreenProps<
  RootStackParamList,
  "Login"
>) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
    resetField,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
  });

  const { setIsAuthorized } = React.useContext(AuthContext);

  const { mutate } = useMutation({
    mutationFn: ({ ...args }: LoginFormData) =>
      login({
        username: args.username,
        password: args.password,
      }),
    onSuccess: (res) => {
      Toast.show({ type: "success", text1: "Succcessfully logged in" });
      resetForm({ password: "", username: "" });
      setIsAuthorized(true);
      console.log({ res });
      StorageWrapper.setItem("jwt-token", res);
    },
    onError: (err) => {
      console.error(err);
      resetField("password");
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
    <View className=" bg-slate-900 p-4   flex-1 justify-between">
      <View style={{ rowGap: 16 }}>
        <FormTextInput
          name="username"
          labelText="Username"
          textInputProps={{ placeholder: "Username" }}
          control={control}
          errors={errors}
          rules={{ required: true }}
        />
        <FormTextInput
          name="password"
          labelText="Password"
          textInputProps={{
            placeholder: "Password",
            secureTextEntry: true,
            textContentType: "password",
          }}
          control={control}
          errors={errors}
          rules={{ required: true }}
        />
      </View>
      <Pressable
        // TODO: nativewind won't work here for some odd reason
        style={({ pressed }) => ({
          backgroundColor: pressed ? "#24aeff" : "#24a0ed",
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 5,
        })}
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="font-bold text-center ">Submit</Text>
      </Pressable>
    </View>
  );
}
