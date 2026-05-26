import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box, Flex, Text, Button, Input, Stack,
  Badge, Grid, Table, Heading, Select,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Admin {
  id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin";
  created_at: string;
}

const fmt = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

// ─── Component ────────────────────────────────────────────────────────────────

const AdminManagementTab = ({ currentAdminId }: { currentAdminId: string }) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setAdmins(data as Admin[]);
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setCreating(true);

    try {
      // Get current session token to pass to the edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session.");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ name, email, password, role }),
        }
      );

      const result = await res.json();

      if (!res.ok || !result.success) {
        setFormError(result.error || "Failed to create admin.");
        return;
      }

      toaster.create({
        title: "Admin created",
        description: `${name} can now log in as ${role.replace("_", " ")}.`,
        type: "success",
        duration: 4000,
        closable: true,
      });

      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("admin");
      fetchAdmins();

    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (admin: Admin) => {
    if (admin.id === currentAdminId) {
      toaster.create({
        title: "Cannot delete yourself",
        type: "error",
        duration: 3000,
        closable: true,
      });
      return;
    }

    setDeleting(admin.id);

    // Delete from admins table — Supabase cascade will handle auth.users
    const { error } = await supabase
      .from("admins")
      .delete()
      .eq("id", admin.id);

    if (error) {
      toaster.create({
        title: "Error deleting admin",
        description: error.message,
        type: "error",
        duration: 4000,
        closable: true,
      });
    } else {
      toaster.create({
        title: "Admin removed",
        description: `${admin.name} has been removed.`,
        type: "success",
        duration: 3000,
        closable: true,
      });
      fetchAdmins();
    }

    setDeleting(null);
  };

  return (
    <Stack gap={8}>
      {/* Header */}
      <Box>
        <Heading fontSize="xl" fontWeight="semibold" color="on_backgroundColor">
          Admin Management
        </Heading>
        <Text fontSize="sm" color="fieldTextColor" mt={1}>
          Create and manage admin accounts. Only super admins can access this tab.
        </Text>
      </Box>

      {/* Create form */}
      <Box
        bg="white"
        border="1px solid"
        borderColor="lightGrey"
        borderTop="3px solid"
        borderTopColor="primaryColor"
        rounded="xl"
        p={6}
        shadow="sm"
      >
        <Text
          fontSize="xs"
          fontFamily="mono"
          letterSpacing="widest"
          color="fieldTextColor"
          textTransform="uppercase"
          mb={5}
        >
          Create New Admin
        </Text>

        <form onSubmit={handleCreate}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <Box>
              <Text fontSize="xs" color="fieldTextColor" mb={1} textTransform="uppercase" fontFamily="mono" letterSpacing="wider">
                Full Name
              </Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Jane Doe"
                bg="textFieldColor"
                border="1px solid"
                borderColor="lightGrey"
                rounded="lg"
                fontSize="sm"
                _focus={{ borderColor: "primaryColor", boxShadow: "none" }}
              />
            </Box>

            <Box>
              <Text fontSize="xs" color="fieldTextColor" mb={1} textTransform="uppercase" fontFamily="mono" letterSpacing="wider">
                Email Address
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jane@example.com"
                bg="textFieldColor"
                border="1px solid"
                borderColor="lightGrey"
                rounded="lg"
                fontSize="sm"
                _focus={{ borderColor: "primaryColor", boxShadow: "none" }}
              />
            </Box>

            <Box>
              <Text fontSize="xs" color="fieldTextColor" mb={1} textTransform="uppercase" fontFamily="mono" letterSpacing="wider">
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                bg="textFieldColor"
                border="1px solid"
                borderColor="lightGrey"
                rounded="lg"
                fontSize="sm"
                _focus={{ borderColor: "primaryColor", boxShadow: "none" }}
              />
            </Box>

            <Box>
              <Text fontSize="xs" color="fieldTextColor" mb={1} textTransform="uppercase" fontFamily="mono" letterSpacing="wider">
                Role
              </Text>
              <Select.Root
                value={[role]}
                onValueChange={(e) => setRole(e.value[0] as "admin" | "super_admin")}
                size="md"
              >
                <Select.Trigger
                  bg="textFieldColor"
                  border="1px solid"
                  borderColor="lightGrey"
                  rounded="lg"
                  fontSize="sm"
                >
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item item="admin">Admin</Select.Item>
                  <Select.Item item="super_admin">Super Admin</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Grid>

          {formError && (
            <Text fontSize="sm" color="errorColor" mt={3}>{formError}</Text>
          )}

          <Flex mt={5} justify="flex-end">
            <Button
              type="submit"
              bg="primaryColor"
              color="on_primaryColor"
              rounded="xl"
              px={6}
              loading={creating}
              loadingText="Creating..."
              _hover={{ opacity: 0.9 }}
              transition="all 0.2s"
            >
              Create Admin
            </Button>
          </Flex>
        </form>
      </Box>

      {/* Existing admins table */}
      <Box>
        <Text
          fontSize="xs"
          fontFamily="mono"
          letterSpacing="widest"
          color="fieldTextColor"
          textTransform="uppercase"
          mb={4}
        >
          All Admins ({admins.length})
        </Text>

        <Box
          bg="white"
          border="1px solid"
          borderColor="lightGrey"
          rounded="xl"
          shadow="sm"
          overflow="hidden"
        >
          <Table.Root size="sm" variant="line">
            <Table.Header>
              <Table.Row bg="textFieldColor">
                {["Name", "Email", "Role", "Created", "Actions"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="xs" color="fieldTextColor" py={3}>
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" py={8} color="fieldTextColor" fontSize="sm">
                    Loading...
                  </Table.Cell>
                </Table.Row>
              ) : admins.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" py={8} color="fieldTextColor" fontSize="sm">
                    No admins found.
                  </Table.Cell>
                </Table.Row>
              ) : admins.map((admin) => (
                <Table.Row key={admin.id} _hover={{ bg: "faithYellow" }} transition="background 0.15s">
                  <Table.Cell fontWeight="medium" color="on_backgroundColor" fontSize="sm">
                    <Flex align="center" gap={2}>
                      {admin.name}
                      {admin.id === currentAdminId && (
                        <Badge colorPalette="blue" variant="subtle" rounded="full" px={2} fontSize="10px">
                          You
                        </Badge>
                      )}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell fontSize="xs" color="fieldTextColor">{admin.email}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette={admin.role === "super_admin" ? "orange" : "blue"}
                      variant="subtle"
                      rounded="full"
                      px={3}
                    >
                      {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell fontSize="xs" fontFamily="mono" color="fieldTextColor">
                    {fmt(admin.created_at)}
                  </Table.Cell>
                  <Table.Cell>
                    {admin.id !== currentAdminId ? (
                      <Button
                        size="xs"
                        colorPalette="red"
                        variant="ghost"
                        rounded="lg"
                        loading={deleting === admin.id}
                        loadingText="Removing..."
                        onClick={() => handleDelete(admin)}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Text fontSize="xs" color="fieldTextColor">—</Text>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Box>
    </Stack>
  );
};

export default AdminManagementTab;