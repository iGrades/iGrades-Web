import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Box, Flex, Text, Button, Input, Stack,
  Badge, Grid, Table, Heading, Select, Avatar, createListCollection
} from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { toaster } from "@/components/ui/toaster";
import { FiUserPlus } from "react-icons/fi";

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

    } catch {
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

    if (!window.confirm(`Are you sure you want to remove ${admin.name} from admin team?`)) return;

    setDeleting(admin.id);

    // Delete from admins table
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

  const roleCollection = createListCollection({
    items: [
      { label: "Admin", value: "admin" },
      { label: "Super Admin", value: "super_admin" },
    ],
  });

  return (
    <Stack gap={6}>
      {/* Header */}
      <Box>
        <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">
          Admin Team Management
        </Heading>
        <Text fontSize="13px" color="gray.500" mt={1}>
          Provision new system administrators and manage elevated privileges. Restricted to Super Admins.
        </Text>
      </Box>

      {/* Create form card */}
      <Box
        bg="white"
        borderRadius="1.25rem"
        p={6}
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 1px 3px rgba(15,23,42,0.03)"
      >
        <Flex align="center" gap={2} mb={5}>
          <Box p={2} bg="blue.50" color="blue.600" borderRadius="lg">
            <FiUserPlus size={18} />
          </Box>
          <Box>
            <Text fontSize="15px" fontWeight="700" color="gray.900">
              Provision New Administrator
            </Text>
            <Text fontSize="12px" color="gray.500">
              New admin will receive credentials to access the admin portal
            </Text>
          </Box>
        </Flex>

        <form onSubmit={handleCreate}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
            <Box>
              <Text fontSize="11px" fontWeight="700" letterSpacing="0.05em" color="gray.600" textTransform="uppercase" mb={1.5}>
                Full Name
              </Text>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. Dr. Sarah Jenkins"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                fontSize="13px"
                h="40px"
                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              />
            </Box>

            <Box>
              <Text fontSize="11px" fontWeight="700" letterSpacing="0.05em" color="gray.600" textTransform="uppercase" mb={1.5}>
                Email Address
              </Text>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="sarah@igrades.org"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                fontSize="13px"
                h="40px"
                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              />
            </Box>

            <Box>
              <Text fontSize="11px" fontWeight="700" letterSpacing="0.05em" color="gray.600" textTransform="uppercase" mb={1.5}>
                Password
              </Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Min. 8 characters"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                fontSize="13px"
                h="40px"
                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              />
            </Box>

            <Box>
              <Text fontSize="11px" fontWeight="700" letterSpacing="0.05em" color="gray.600" textTransform="uppercase" mb={1.5}>
                Role Level
              </Text>
              <Select.Root
                collection={roleCollection}
                value={[role]}
                onValueChange={(e) => setRole(e.value[0] as "admin" | "super_admin")}
                size="sm"
              >
                <Select.Trigger
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  fontSize="13px"
                  h="40px"
                  px={3}
                >
                  <Select.ValueText />
                </Select.Trigger>
                <Select.Content>
                  {roleCollection.items.map((item) => (
                    <Select.Item key={item.value} item={item}>
                      {item.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </Box>
          </Grid>

          {formError && (
            <Box mt={3} p={3} bg="rose.50" border="1px solid" borderColor="rose.200" borderRadius="lg">
              <Text fontSize="12px" color="rose.700" fontWeight="600">{formError}</Text>
            </Box>
          )}

          <Flex mt={5} justify="flex-end">
            <Button
              type="submit"
              bg="blue.600"
              color="white"
              borderRadius="lg"
              px={6}
              h="40px"
              fontSize="13px"
              fontWeight="700"
              loading={creating}
              loadingText="Provisioning..."
              _hover={{ bg: "blue.500" }}
              transition="all 0.2s"
            >
              Create Administrator
            </Button>
          </Flex>
        </form>
      </Box>

      {/* Existing admins table */}
      <Box
        bg="white"
        borderRadius="1.25rem"
        p={6}
        border="1px solid"
        borderColor="gray.100"
        boxShadow="0 1px 3px rgba(15,23,42,0.03)"
      >
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="15px" fontWeight="700" color="gray.900">
            Active Admin Directory ({admins.length})
          </Text>
        </Flex>

        <Box borderRadius="0.75rem" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                {["Administrator", "Email Address", "Role Level", "Created Date", "Actions"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="11px" fontWeight="700" color="gray.500" py={3.5} textTransform="uppercase" letterSpacing="0.05em">
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {loading ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" py={8}>
                    <DancingLogoLoader size="sm" text="Loading admin directory..." minH="100px" />
                  </Table.Cell>
                </Table.Row>
              ) : admins.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" py={8} color="gray.400" fontSize="13px">
                    No administrators found.
                  </Table.Cell>
                </Table.Row>
              ) : admins.map((admin) => (
                <Table.Row key={admin.id} _hover={{ bg: "blue.50/20" }} transition="background 0.15s">
                  <Table.Cell py={3}>
                    <Flex align="center" gap={2.5}>
                      <Avatar.Root size="xs">
                        <Avatar.Fallback bg="blue.100" color="blue.700" fontWeight="700" fontSize="11px">
                          {admin.name?.[0] || "A"}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Box>
                        <Flex align="center" gap={2}>
                          <Text fontSize="13px" fontWeight="700" color="gray.900">{admin.name}</Text>
                          {admin.id === currentAdminId && (
                            <Badge bg="blue.50" color="blue.700" borderRadius="full" px={2} fontSize="9px" fontWeight="700">
                              Current You
                            </Badge>
                          )}
                        </Flex>
                      </Box>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell fontSize="12px" color="gray.600">{admin.email}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      bg={admin.role === "super_admin" ? "amber.50" : "blue.50"}
                      color={admin.role === "super_admin" ? "amber.700" : "blue.700"}
                      borderRadius="full"
                      px={3}
                      py={0.5}
                      fontSize="10px"
                      fontWeight="700"
                    >
                      {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell fontSize="11px" color="gray.500">
                    {fmt(admin.created_at)}
                  </Table.Cell>
                  <Table.Cell>
                    {admin.id !== currentAdminId ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        color="rose.600"
                        _hover={{ bg: "rose.50" }}
                        borderRadius="md"
                        loading={deleting === admin.id}
                        onClick={() => handleDelete(admin)}
                        fontSize="11px"
                        fontWeight="600"
                        h="26px"
                        px={2.5}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Text fontSize="11px" color="gray.400">—</Text>
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
