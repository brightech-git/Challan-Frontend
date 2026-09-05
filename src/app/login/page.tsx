"use client";

import { Box, Card, Center, Heading, Text } from "@chakra-ui/react";
import { DynamicForm, FieldConfig, FormValues } from "@/components/form";
import { useAuth } from "@/hooks";
import { ColorModeButton } from "@/components/ui/color-mode";

const loginFields: FieldConfig[] = [
  { name: "name", label: "Username", type: "text", required: true, colSpan: 1 },
  { name: "password", label: "Password", type: "password", required: true, colSpan: 1 },
];

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = async (values: FormValues) => {
    await login({
      name: String(values.name ?? ""),
      password: String(values.password ?? ""),
    });
  };

  return (
    <Center minH="100vh" bg="bg.subtle" px={4} position="relative">
      {/* <Box position="absolute" top={4} right={4}>
        <ColorModeButton />
      </Box> */}

      <Card.Root maxW="sm" w="full" boxShadow="lg">
        <Card.Body>
          <Box mb={6}>
            <Heading size="lg" mb={1} color="primary">
              Sign in
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              Enter your Challan account credentials.
            </Text>
          </Box>

          <DynamicForm
            fields={loginFields}
            columns={1}
            onSubmit={handleSubmit}
            isSubmitting={isLoggingIn}
            formError={loginError}
            submitLabel="Sign in"
          />
        </Card.Body>
      </Card.Root>
    </Center>
  );
}
