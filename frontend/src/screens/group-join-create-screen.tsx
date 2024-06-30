import { useMutation } from '@tanstack/react-query';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { AuthContext } from '../auth-context';
import { fetchWrapper } from '../utils/fetchWrapper';
import { z } from 'zod';
import Toast from 'react-native-toast-message';
import { queryKeys } from '../utils/queryKeys';
import { getDefinedValueOrThrow } from '../utils/assert';
import FormTextInput from '../components/form-text-input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRoute } from '@react-navigation/native';

export const groupInviteSchema = z.object({
  inviteCode: z.string().length(8),
});
type GroupInvite = z.infer<typeof groupInviteSchema>;

const groupCreateSchema = z.object({
  groupName: z.string(),
});
type GroupCreate = z.infer<typeof groupCreateSchema>;

async function joinGroupByCode(inviteCode: string, userId: number) {
  const response = await fetchWrapper.post('user-group/join', {
    body: JSON.stringify({
      inviteCode: inviteCode.toUpperCase(),
      userId,
    }),
  });
  const body = await response.json();
  const { success, groupId } = z
    .object({ success: z.boolean(), groupId: z.number().nullable() })
    .parse(body);
  if (!success) {
    throw new Error('Could not join group.');
  }
  return groupId;
}

async function joinGroupById(groupId: number, userId: number) {
  // TODO: ugly endpoint
  const response = await fetchWrapper.post('user-group/join-by-id', {
    body: JSON.stringify({
      groupId,
      userId,
    }),
  });
  const body = await response.json();
  const { success } = z
    .object({ success: z.boolean(), groupId: z.number().nullable() })
    .parse(body);
  if (!success) {
    throw new Error('Could not join group.');
  }
  return groupId;
}

async function createGroup({ groupName }: { groupName: string }) {
  const response = await fetchWrapper.post('user-group/create', {
    body: JSON.stringify({
      groupName,
    }),
  });
  const body = await response.json();
  const { id } = z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .parse(body);
  return id;
}

export function GroupJoinScreen() {
  const route = useRoute();

  React.useEffect(() => {
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        const { queryParams } = Linking.parse(url);
        const parsed = groupInviteSchema.parse(queryParams);
        setValue('inviteCode', parsed.inviteCode);
      }
    };
    const params = route.params;
    if (params !== undefined) {
      const parsed = groupInviteSchema.parse(params);
      setValue('inviteCode', parsed.inviteCode);
    } else {
      handleInitialURL();
    }
  });

  const { user, setUser } = React.useContext(AuthContext);
  const {
    control,
    handleSubmit: handleJoinSubmit,
    formState: { errors },
    setValue,
  } = useForm<GroupInvite>({
    resolver: zodResolver(groupInviteSchema),
  });
  const {
    control: groupCreateControl,
    handleSubmit: handleCreateSubmit,
    formState: { errors: groupCreateErrors },
  } = useForm<GroupCreate>({ resolver: zodResolver(groupCreateSchema) });

  const { userId } = getDefinedValueOrThrow(user);

  const { mutate: mutateJoinGroup } = useMutation({
    mutationKey: [queryKeys.groups],
    mutationFn: async (inviteCode: string) =>
      joinGroupByCode(inviteCode, userId),
    onSuccess: (groupId) => {
      const definedGroupId = getDefinedValueOrThrow(groupId);
      Toast.show({ type: 'success', text1: 'Joined group!' });
      setUser((prev) => ({
        userId,
        groupId: definedGroupId,
        email: getDefinedValueOrThrow(prev?.email),
      }));
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Could not join group. Invalid invite code?',
      });
    },
  });

  const { mutate: mutateCreateGroup, status } = useMutation({
    mutationKey: [queryKeys.groups],
    // TODO: lets not mix these, all functions like these should accept object instead of positional arguments
    mutationFn: async ({
      groupName,
      userId,
    }: {
      groupName: string;
      userId: number;
    }) => {
      try {
        const group = await createGroup({ groupName });
        if (group === undefined) {
          throw new Error('Failed to create group');
        }
        await joinGroupById(group, userId);
        setUser((prev) => ({
          userId,
          groupId: group,
          email: getDefinedValueOrThrow(prev?.email),
        }));
      } catch (error) {
        console.error({ error });
        throw new Error('you suck very bad');
      }
    },
  });

  function handleJoinGroup(data: GroupInvite) {
    mutateJoinGroup(data.inviteCode);
  }

  function handleCreateGroup(data: GroupCreate) {
    mutateCreateGroup({ groupName: data.groupName, userId });
  }

  return (
    <View className="p-2">
      <FormTextInput
        name="inviteCode"
        control={control}
        labelText="Join group"
        textInputProps={{
          placeholder: 'Enter a code',
        }}
        errors={errors}
      />
      <Pressable
        onPress={handleJoinSubmit(handleJoinGroup)}
        className="font-bold text-center bg-blue-300 flex rounded"
      >
        <Text className="p-2">Join Group</Text>
      </Pressable>
      <View
        style={{
          borderBottomColor: 'white',
          borderBottomWidth: 3,
          margin: 16,
        }}
      />
      <FormTextInput
        name="groupName"
        labelText="Create a new group"
        textInputProps={{
          placeholder: 'Enter a name',
        }}
        errors={groupCreateErrors}
        control={groupCreateControl}
      />
      <Pressable
        className="font-bold text-center bg-blue-300 flex rounded"
        onPress={handleCreateSubmit(handleCreateGroup)}
        disabled={status === 'pending'}
      >
        <Text className="p-2">Create Group</Text>
      </Pressable>
    </View>
  );
}
