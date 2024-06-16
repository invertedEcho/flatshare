import * as React from "react";

import { Pressable, SafeAreaView, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { fetchWrapper } from "../utils/fetchWrapper";
import { RootStackParamList } from "../../App";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import FormTextInput from "../components/form-text-input";

const registerFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string(),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;

async function register({ username, password, email }: RegisterFormData) {
  await fetchWrapper.post("register", {
    username,
    password,
    email,
  });
}

export function RegisterScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Register">) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  const { mutate: registerMutation } = useMutation({
    mutationFn: ({ ...args }: RegisterFormData) =>
      register({
        username: args.username,
        password: args.password,
        email: args.email,
      }),
    onSuccess: () => {
      Toast.show({ type: "success", text1: "Succcessfully registered" });
      resetForm({ username: "", password: "", email: "" });
      navigation.navigate("Login");
    },
    onError: (err) => {
      console.error(err);
      Toast.show({ type: "error", text1: "Failed to register" });
    },
  });

  function onSubmit(data: RegisterFormData) {
    registerMutation({
      ...data,
    });
  }

  return (
    <View className=" bg-slate-900 p-4 flex-1 justify-between">
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
        <FormTextInput
          name="email"
          labelText="Email"
          textInputProps={{
            placeholder: "example@domain.com",
            textContentType: "emailAddress",
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
        <Text className="font-bold text-center ">Register</Text>
      </Pressable>
    </View>
  );
}
