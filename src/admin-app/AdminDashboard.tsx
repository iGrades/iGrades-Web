import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAuth } from "./hooks/useAdminAuth";
import {
  Box, Flex, Heading, Text, Button, Input, Stack,
  Badge, Grid, Table, Select, Spinner, Center,
  Tabs, Avatar, Icon, Image
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import AdminManagementTab from "./Adminmanagementtab";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";
import { FiUsers, FiBookOpen, FiVideo, FiDollarSign, FiTrendingUp, FiUserCheck, FiArchive, FiGrid } from "react-icons/fi";
import logo from "@/assets/landing-page/logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Student {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  class: string;
  subscription: string;
  subscription_status: string;
  last_payment_ref?: string;
  registered_courses: unknown[];
  created_at: string;
  is_child: boolean;
  parent_id: string | null;
}

interface Parent {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  created_at: string;
  profile_image?: string;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
  duration?: string;
  created_at: string;
  subject_id?: string;
  class_id?: string;
  description?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const COLORS = ["#6b7280", "#206CE1", "#F18729", "#2DD4A5", "#AE3DD6"];

const planColors: Record<string, string> = {
  basic: "gray",
  standard: "blue",
  premium: "orange",
};

const buildMonthlyData = (items: { created_at: string }[], label: string) => {
  const map: Record<string, number> = {};
  items.forEach((item) => {
    const month = new Date(item.created_at).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    map[month] = (map[month] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => new Date("1 " + a[0]).getTime() - new Date("1 " + b[0]).getTime())
    .slice(-8)
    .map(([month, count]) => ({ month, [label]: count }));
};

// ─── Modern KPI Card ─────────────────────────────────────────────────────────

const ModernKpiCard = ({ 
  label, value, sub, icon, trend, trendValue, accent 
}: { 
  label: string; 
  value: string | number; 
  sub?: string; 
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  accent?: string;
}) => (
  <Box
    bg="white"
    borderRadius="2rem"
    p={6}
    position="relative"
    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    _hover={{ transform: "translateY(-4px)", boxShadow: "0 20px 25px -12px rgba(0,0,0,0.1)" }}
    boxShadow="0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)"
    border="1px solid rgba(0,0,0,0.04)"
  >
    <Flex justify="space-between" align="flex-start" mb={4}>
      <Box>
        <Text fontSize="11px" fontWeight="600" letterSpacing="0.05em" color="#6B7280" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="2.5rem" fontWeight="700" color="#111827" lineHeight="1.2" mt={2} letterSpacing="-0.02em">
          {value}
        </Text>
        {sub && <Text fontSize="12px" color="#6B7280" mt={1}>{sub}</Text>}
        {trend && trendValue && (
          <Flex align="center" gap={1} mt={2}>
            <Text fontSize="11px" color={trend === "up" ? "#10B981" : "#EF4444"} fontWeight="600">
              {trend === "up" ? "↑" : "↓"} {trendValue}
            </Text>
            <Text fontSize="10px" color="#9CA3AF">vs last month</Text>
          </Flex>
        )}
      </Box>
      <Box
        p={3}
        borderRadius="1.25rem"
        bg={`${accent || "#206CE1"}10`}
        color={accent || "#206CE1"}
      >
        <Icon as={icon} boxSize={5} />
      </Box>
    </Flex>
  </Box>
);

// ─── Modern Chart Card ────────────────────────────────────────────────────────

const ModernChartCard = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <Box
    bg="white"
    borderRadius="1.5rem"
    p={6}
    transition="all 0.2s"
    border="1px solid rgba(0,0,0,0.04)"
    boxShadow="0 1px 3px rgba(0,0,0,0.02)"
  >
    <Flex justify="space-between" align="center" mb={6}>
      <Text fontSize="13px" fontWeight="600" color="#374151" letterSpacing="-0.01em">
        {title}
      </Text>
      {action}
    </Flex>
    {children}
  </Box>
);

// ─── Stats Row Component ──────────────────────────────────────────────────────

const StatsRow = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <Box>
      <Flex justify="space-between" mb={2}>
        <Text fontSize="12px" color="#6B7280">{label}</Text>
        <Text fontSize="12px" fontWeight="600" color="#111827">{value}</Text>
      </Flex>
      <Box h="6px" bg={`${color}20`} borderRadius="full" overflow="hidden">
        <Box w={`${percentage}%`} h="full" bg={color} borderRadius="full" />
      </Box>
    </Box>
  );
};

// ─── 1. OVERVIEW TAB ─────────────────────────────────────────────────────────

const OverviewTab = ({ students, parents, resources }: { students: Student[]; parents: Parent[]; resources: Resource[] }) => {
  const now = new Date();
  const thisMonth = (items: { created_at: string }[]) =>
    items.filter((i) => {
      const d = new Date(i.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

  const activeStudents = students.filter((s) => s.subscription_status === "active").length;
  const revenue = students.filter((s) => s.subscription === "standard" && s.subscription_status === "active").length * 15000 +
    students.filter((s) => s.subscription === "premium" && s.subscription_status === "active").length * 25000;

  const studentMonthly = buildMonthlyData(students, "Students");
  const parentMonthly = buildMonthlyData(parents, "Parents");
  
  const combinedMonthly = studentMonthly.map((s) => ({
    month: s.month,
    Students: s.Students,
    Parents: parentMonthly.find((p) => p.month === s.month)?.Parents || 0,
  }));

  const planDist = [
    { name: "Basic", value: students.filter((s) => s.subscription === "basic").length },
    { name: "Standard", value: students.filter((s) => s.subscription === "standard").length },
    { name: "Premium", value: students.filter((s) => s.subscription === "premium").length },
  ];

  const activeDistribution = [
    { name: "Active", value: activeStudents, color: "#10B981" },
    { name: "Inactive", value: students.length - activeStudents, color: "#EF4444" },
  ];

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Heading fontSize="1.75rem" fontWeight="700" letterSpacing="-0.02em" color="#111827">Overview</Heading>
          <Text fontSize="13px" color="#6B7280" mt={1}>Key metrics and platform performance</Text>
        </Box>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5}>
        <ModernKpiCard 
          label="Total Students" 
          value={students.length} 
          icon={FiUsers} 
          accent="#206CE1"
          trend="up"
          trendValue={`+${thisMonth(students)}`}
        />
        <ModernKpiCard 
          label="Total Parents" 
          value={parents.length} 
          icon={FiUserCheck} 
          accent="#AE3DD6"
          trend="up"
          trendValue={`+${thisMonth(parents)}`}
        />
        <ModernKpiCard 
          label="Active Subscriptions" 
          value={activeStudents} 
          sub={`${Math.round((activeStudents / students.length) * 100)}% of total`}
          icon={FiTrendingUp} 
          accent="#10B981"
        />
        <ModernKpiCard 
          label="Monthly Revenue" 
          value={`₦${(revenue / 1000).toFixed(0)}K`} 
          sub={`₦${revenue.toLocaleString()}`}
          icon={FiDollarSign} 
          accent="#F18729"
        />
      </Grid>

      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5}>
        <ModernKpiCard 
          label="Total Content" 
          value={resources.length} 
          icon={FiArchive} 
          accent="#2DD4A5"
        />
        <ModernKpiCard 
          label="Videos" 
          value={resources.filter((r) => r.type === "video").length} 
          icon={FiVideo} 
          accent="#206CE1"
        />
        <ModernKpiCard 
          label="PDFs" 
          value={resources.filter((r) => r.type === "pdf").length} 
          icon={FiBookOpen} 
          accent="#F18729"
        />
        <ModernKpiCard 
          label="Linked Families" 
          value={students.filter((s) => s.parent_id).length} 
          icon={FiGrid} 
          accent="#AE3DD6"
        />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1.5fr 1fr" }} gap={6}>
        <ModernChartCard title="User Growth Trend">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={combinedMonthly}>
              <defs>
                <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#206CE1" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#206CE1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="parentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#AE3DD6" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#AE3DD6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                  padding: "8px 12px"
                }} 
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="Students" stroke="#206CE1" strokeWidth={2} fill="url(#studentGradient)" />
              <Area type="monotone" dataKey="Parents" stroke="#AE3DD6" strokeWidth={2} fill="url(#parentGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ModernChartCard>

        <ModernChartCard title="Subscription Health">
          <Stack gap={5}>
            <Box>
              <Flex justify="space-between" mb={3}>
                <Text fontSize="13px" fontWeight="500" color="#374151">Plan Distribution</Text>
              </Flex>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie 
                    data={planDist} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {planDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Flex justify="center" gap={4} mt={2}>
                {planDist.map((item, i) => (
                  <Flex align="center" gap={1.5} key={i}>
                    <Box w="8px" h="8px" borderRadius="full" bg={COLORS[i]} />
                    <Text fontSize="10px" color="#6B7280">{item.name}</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>
            
            <Box>
              <Flex justify="space-between" mb={3}>
                <Text fontSize="13px" fontWeight="500" color="#374151">Active Status</Text>
              </Flex>
              <Stack gap={2.5}>
                <StatsRow 
                  label="Active Subscriptions" 
                  value={activeStudents} 
                  total={students.length} 
                  color="#10B981" 
                />
                <StatsRow 
                  label="Inactive" 
                  value={students.length - activeStudents} 
                  total={students.length} 
                  color="#EF4444" 
                />
              </Stack>
            </Box>
          </Stack>
        </ModernChartCard>
      </Grid>

      <ModernChartCard title="Content Library">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={[
            { type: "Videos", count: resources.filter(r => r.type === "video").length },
            { type: "PDFs", count: resources.filter(r => r.type === "pdf").length },
            { type: "Other", count: resources.filter(r => r.type !== "video" && r.type !== "pdf").length },
          ]} barSize={48}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip 
              contentStyle={{ 
                borderRadius: "12px", 
                border: "none", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)" 
              }} 
            />
            <Bar dataKey="count" fill="#206CE1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ModernChartCard>
    </Stack>
  );
};

// ─── 2. USER GROWTH TAB ───────────────────────────────────────────────────────

const UserGrowthTab = ({ students, parents }: { students: Student[]; parents: Parent[] }) => {
  const studentMonthly = buildMonthlyData(students, "Students");
  const parentMonthly = buildMonthlyData(parents, "Parents");

  const childStudents = students.filter((s) => s.is_child).length;
  const linkedStudents = students.filter((s) => s.parent_id).length;
  const unlinkedParents = parents.filter((p) => !students.some((s) => s.parent_id === p.id)).length;

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Heading fontSize="1.75rem" fontWeight="700" letterSpacing="-0.02em" color="#111827">User Growth</Heading>
          <Text fontSize="13px" color="#6B7280" mt={1}>Registration trends and account linking analytics</Text>
        </Box>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5}>
        <ModernKpiCard label="Total Students" value={students.length} icon={FiUsers} accent="#206CE1" />
        <ModernKpiCard label="Total Parents" value={parents.length} icon={FiUserCheck} accent="#AE3DD6" />
        <ModernKpiCard label="Child Accounts" value={childStudents} sub="is_child = true" icon={FiGrid} accent="#2DD4A5" />
        <ModernKpiCard label="Linked Families" value={linkedStudents} sub="student has a parent" icon={FiTrendingUp} accent="#10B981" />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <ModernChartCard title="Student Registration Trend">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={studentMonthly}>
              <defs>
                <linearGradient id="studentGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#206CE1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#206CE1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="Students" stroke="#206CE1" strokeWidth={2.5} fill="url(#studentGrowthGradient)" dot={{ r: 4, fill: "#206CE1" }} />
            </AreaChart>
          </ResponsiveContainer>
        </ModernChartCard>

        <ModernChartCard title="Parent Registration Trend">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={parentMonthly}>
              <defs>
                <linearGradient id="parentGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#AE3DD6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#AE3DD6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="Parents" stroke="#AE3DD6" strokeWidth={2.5} fill="url(#parentGrowthGradient)" dot={{ r: 4, fill: "#AE3DD6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </ModernChartCard>
      </Grid>

      <ModernChartCard title="Parent–Child Account Linking Analysis">
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
          <Box textAlign="center" p={5} bg="#F9FAFB" borderRadius="1.5rem">
            <Text fontSize="2.5rem" fontWeight="800" color="#10B981" letterSpacing="-0.02em">{linkedStudents}</Text>
            <Text fontSize="12px" color="#6B7280" mt={2}>Students linked to a parent</Text>
            <Text fontSize="10px" color="#9CA3AF" mt={1}>
              {Math.round((linkedStudents / students.length) * 100)}% of students
            </Text>
          </Box>
          <Box textAlign="center" p={5} bg="#F9FAFB" borderRadius="1.5rem">
            <Text fontSize="2.5rem" fontWeight="800" color="#EF4444" letterSpacing="-0.02em">{students.length - linkedStudents}</Text>
            <Text fontSize="12px" color="#6B7280" mt={2}>Students with no parent link</Text>
            <Text fontSize="10px" color="#9CA3AF" mt={1}>
              {Math.round(((students.length - linkedStudents) / students.length) * 100)}% of students
            </Text>
          </Box>
          <Box textAlign="center" p={5} bg="#F9FAFB" borderRadius="1.5rem">
            <Text fontSize="2.5rem" fontWeight="800" color="#F18729" letterSpacing="-0.02em">{unlinkedParents}</Text>
            <Text fontSize="12px" color="#6B7280" mt={2}>Parents with no linked child</Text>
            <Text fontSize="10px" color="#9CA3AF" mt={1}>
              {Math.round((unlinkedParents / parents.length) * 100)}% of parents
            </Text>
          </Box>
        </Grid>
      </ModernChartCard>
    </Stack>
  );
};

// ─── 3. SUBSCRIPTIONS TAB ─────────────────────────────────────────────────────

const SubscriptionsTab = ({ students }: { students: Student[] }) => {
  const [filter, setFilter] = useState("all");
  const filtered = students.filter((s) => filter === "all" || s.subscription_status === filter);

  const activeStandard = students.filter((s) => s.subscription === "standard" && s.subscription_status === "active").length;
  const activePremium = students.filter((s) => s.subscription === "premium" && s.subscription_status === "active").length;
  const totalRevenue = activeStandard * 15000 + activePremium * 25000;

  const revenueByMonth = buildMonthlyData(
    students.filter((s) => s.subscription_status === "active" && s.subscription !== "basic"),
    "Paid Users"
  );

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Heading fontSize="1.75rem" fontWeight="700" letterSpacing="-0.02em" color="#111827">Subscriptions & Revenue</Heading>
          <Text fontSize="13px" color="#6B7280" mt={1}>Plan distribution, revenue tracking, and payment monitoring</Text>
        </Box>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5}>
        <ModernKpiCard label="Basic (Free)" value={students.filter((s) => s.subscription === "basic").length} icon={FiUsers} accent="#6B7280" />
        <ModernKpiCard label="Standard" value={students.filter((s) => s.subscription === "standard").length} sub="₦15,000/user" icon={FiTrendingUp} accent="#206CE1" />
        <ModernKpiCard label="Premium" value={students.filter((s) => s.subscription === "premium").length} sub="₦25,000/user" icon={FiDollarSign} accent="#F18729" />
        <ModernKpiCard label="Total Revenue" value={`₦${(totalRevenue / 1000).toFixed(0)}K`} sub={`₦${totalRevenue.toLocaleString()}`} icon={FiDollarSign} accent="#10B981" />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <ModernChartCard title="Paid User Growth">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByMonth} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="Paid Users" fill="#206CE1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ModernChartCard>

        <ModernChartCard title="Plan Distribution">
          <Stack gap={4}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Basic", value: students.filter((s) => s.subscription === "basic").length },
                    { name: "Standard", value: students.filter((s) => s.subscription === "standard").length },
                    { name: "Premium", value: students.filter((s) => s.subscription === "premium").length },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                >
                  {COLORS.slice(0, 3).map((color, i) => <Cell key={i} fill={color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Stack gap={2}>
              {[
                { name: "Basic", color: "#6B7280", value: students.filter(s => s.subscription === "basic").length },
                { name: "Standard", color: "#206CE1", value: students.filter(s => s.subscription === "standard").length },
                { name: "Premium", color: "#F18729", value: students.filter(s => s.subscription === "premium").length },
              ].map(plan => (
                <Flex justify="space-between" key={plan.name}>
                  <Flex align="center" gap={2}>
                    <Box w="8px" h="8px" borderRadius="full" bg={plan.color} />
                    <Text fontSize="12px" color="#6B7280">{plan.name}</Text>
                  </Flex>
                  <Text fontSize="12px" fontWeight="600" color="#111827">{plan.value}</Text>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </ModernChartCard>
      </Grid>

      <ModernChartCard title="Subscription Management">
        <Stack gap={4}>
          <Flex gap={3}>
            <Select.Root value={[filter]} onValueChange={(e) => setFilter(e.value[0])} size="sm" w="180px">
              <Select.Trigger bg="white" border="1px solid #E5E7EB" borderRadius="full" fontSize="13px">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                {["all", "active", "inactive"].map((s) => (
                  <Select.Item key={s} item={s}>
                    {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Box borderRadius="1.25rem" border="1px solid #F0F0F0" overflow="hidden">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="#F9FAFB">
                  {["Student", "Email", "Plan", "Status", "Payment Ref", "Joined"].map((h) => (
                    <Table.ColumnHeader key={h} fontSize="11px" fontWeight="600" color="#6B7280" py={3.5}>
                      {h}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.slice(0, 8).map((st) => (
                  <Table.Row key={st.id} _hover={{ bg: "#FAFAFF" }} transition="background 0.15s" borderBottom="1px solid #F3F4F6">
                    <Table.Cell fontWeight="500" fontSize="13px" color="#111827">{st.firstname} {st.lastname}</Table.Cell>
                    <Table.Cell fontSize="12px" color="#6B7280">{st.email}</Table.Cell>
                    <Table.Cell>
                      <Badge 
                        colorPalette={planColors[st.subscription] || "gray"} 
                        variant="subtle" 
                        borderRadius="full" 
                        px={3}
                        fontSize="10px"
                        fontWeight="500"
                      >
                        {st.subscription}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge 
                        colorPalette={st.subscription_status === "active" ? "green" : "red"} 
                        variant="subtle" 
                        borderRadius="full" 
                        px={3}
                        fontSize="10px"
                        fontWeight="500"
                      >
                        {st.subscription_status || "inactive"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell fontSize="11px" fontFamily="mono" color="#9CA3AF">{st.last_payment_ref || "—"}</Table.Cell>
                    <Table.Cell fontSize="11px" fontFamily="mono" color="#9CA3AF">{fmt(st.created_at)}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>
      </ModernChartCard>
    </Stack>
  );
};

// ─── 4. COURSES TAB ───────────────────────────────────────────────────────────

const CoursesTab = ({ students }: { students: Student[] }) => {
  const courseMap: Record<string, number> = {};
  students.forEach((st) => {
    if (Array.isArray(st.registered_courses)) {
      st.registered_courses.forEach((c: unknown) => {
        const name = typeof c === "string" ? c
          : typeof c === "object" && c !== null && "name" in c
          ? String((c as { name: unknown }).name)
          : "Unknown";
        courseMap[name] = (courseMap[name] || 0) + 1;
      });
    }
  });

  const courses = Object.entries(courseMap).sort((a, b) => b[1] - a[1]);
  const enrolled = students.filter((s) => Array.isArray(s.registered_courses) && s.registered_courses.length > 0);
  const avgCourses = enrolled.length
    ? (enrolled.reduce((acc, s) => acc + (s.registered_courses as unknown[]).length, 0) / enrolled.length).toFixed(1)
    : "0";

  const chartData = courses.slice(0, 8).map(([name, count]) => ({ name: name.length > 25 ? name.slice(0, 22) + "..." : name, Enrollments: count }));

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Heading fontSize="1.75rem" fontWeight="700" letterSpacing="-0.02em" color="#111827">Course Engagement</Heading>
          <Text fontSize="13px" color="#6B7280" mt={1}>Student enrollment patterns and course popularity</Text>
        </Box>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={5}>
        <ModernKpiCard label="Enrolled Students" value={enrolled.length} sub={`${Math.round((enrolled.length / students.length) * 100)}% of total`} icon={FiUsers} accent="#206CE1" />
        <ModernKpiCard label="Unique Courses" value={courses.length} icon={FiBookOpen} accent="#AE3DD6" />
        <ModernKpiCard label="Avg Courses / Student" value={avgCourses} icon={FiTrendingUp} accent="#10B981" />
      </Grid>

      {chartData.length > 0 ? (
        <ModernChartCard title="Most Popular Courses">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData} layout="vertical" barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 11, fill: "#6B7280" }} 
                width={140} 
                axisLine={false} 
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "none", 
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: "12px"
                }} 
              />
              <Bar dataKey="Enrollments" fill="#206CE1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ModernChartCard>
      ) : (
        <Box textAlign="center" p={12} bg="white" borderRadius="2rem" border="1px solid #F0F0F0">
          <Text color="#9CA3AF" fontSize="13px">No course enrollments recorded yet</Text>
        </Box>
      )}
    </Stack>
  );
};

// ─── 5. CONTENT TAB ───────────────────────────────────────────────────────────

const ContentTab = ({ resources }: { resources: Resource[] }) => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = resources.filter((r) => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || r.type === typeFilter;
    return matchSearch && matchType;
  });

  const types = [...new Set(resources.map((r) => r.type))];

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Heading fontSize="1.75rem" fontWeight="700" letterSpacing="-0.02em" color="#111827">Content Library</Heading>
          <Text fontSize="13px" color="#6B7280" mt={1}>Manage and organize all learning resources</Text>
        </Box>
      </Flex>

      <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={5}>
        <ModernKpiCard label="Total Resources" value={resources.length} icon={FiArchive} accent="#206CE1" />
        <ModernKpiCard label="Videos" value={resources.filter((r) => r.type === "video").length} icon={FiVideo} accent="#2DD4A5" />
        <ModernKpiCard label="PDFs" value={resources.filter((r) => r.type === "pdf").length} icon={FiBookOpen} accent="#F18729" />
        <ModernKpiCard label="Other Types" value={resources.filter((r) => r.type !== "video" && r.type !== "pdf").length} icon={FiGrid} accent="#AE3DD6" />
      </Grid>

      <ModernChartCard title="Content Management">
        <Stack gap={5}>
          <Flex gap={3} flexWrap="wrap">
            <Input
              placeholder="Search by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxW="260px"
              bg="white"
              border="1px solid #E5E7EB"
              borderRadius="full"
              fontSize="13px"
              px={4}
              py={2}
              _focus={{ borderColor: "#206CE1", boxShadow: "none" }}
            />
            <Select.Root value={[typeFilter]} onValueChange={(e) => setTypeFilter(e.value[0])} size="md" w="150px">
              <Select.Trigger bg="white" border="1px solid #E5E7EB" borderRadius="full" fontSize="13px">
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content>
                <Select.Item item="all">All Types</Select.Item>
                {types.map((t) => (
                  <Select.Item key={t} item={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Box borderRadius="1.25rem" border="1px solid #F0F0F0" overflow="hidden">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="#F9FAFB">
                  {["Title", "Type", "Duration", "Class", "Uploaded"].map((h) => (
                    <Table.ColumnHeader key={h} fontSize="11px" fontWeight="600" color="#6B7280" py={3.5}>
                      {h}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} textAlign="center" py={8}>
                      <Text fontSize="12px" color="#9CA3AF">No content found</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filtered.map((r) => (
                    <Table.Row key={r.id} _hover={{ bg: "#FAFAFF" }} transition="background 0.15s">
                      <Table.Cell fontWeight="500" fontSize="13px" color="#111827">
                        <Text truncate maxW="280px">{r.title}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={r.type === "video" ? "cyan" : r.type === "pdf" ? "orange" : "gray"}
                          variant="subtle"
                          borderRadius="full"
                          px={3}
                          fontSize="9px"
                          fontWeight="500"
                        >
                          {r.type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell fontSize="11px" fontFamily="mono" color="#9CA3AF">{r.duration || "—"}</Table.Cell>
                      <Table.Cell fontSize="12px" color="#6B7280">{r.class_id || "—"}</Table.Cell>
                      <Table.Cell fontSize="11px" fontFamily="mono" color="#9CA3AF">{fmt(r.created_at)}</Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table.Root>
          </Box>
        </Stack>
      </ModernChartCard>
    </Stack>
  );
};

// ─── 6. USER MANAGEMENT TAB ───────────────────────────────────────────────────

const UserManagementTab = ({ students, parents, onRefresh }: { students: Student[]; parents: Parent[]; onRefresh: () => void }) => {
  const [userType, setUserType] = useState<"students" | "parents">("students");
  const [search, setSearch] = useState("");

  const filteredStudents = students.filter((s) =>
    `${s.firstname} ${s.lastname} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredParents = parents.filter((p) =>
    `${p.firstname} ${p.lastname} ${p.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteStudent = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toaster.create({ title: "Error deleting student", type: "error", duration: 4000 });
    } else {
      toaster.create({ title: "Student deleted", type: "success", duration: 3000 });
      onRefresh();
    }
  };

  const handleDeleteParent = async (id: string) => {
    const { error } = await supabase.from("parents").delete().eq("id", id);
    if (error) {
      toaster.create({ title: "Error deleting parent", type: "error", duration: 4000 });
    } else {
      toaster.create({ title: "Parent deleted", type: "success", duration: 3000 });
      onRefresh();
    }
  };

  const handleToggleSubscription = async (student: Student) => {
    const newStatus = student.subscription_status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("students").update({ subscription_status: newStatus }).eq("id", student.id);
    if (error) {
      toaster.create({ title: "Error updating subscription", type: "error", duration: 4000 });
    } else {
      toaster.create({ title: `Subscription ${newStatus}`, type: "success", duration: 3000 });
      onRefresh();
    }
  };

  return (
    <Stack gap={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Box>
          <Heading fontSize="1.75rem" fontWeight="700" letterSpacing="-0.02em" color="#111827">User Management</Heading>
          <Text fontSize="13px" color="#6B7280" mt={1}>Manage students, parents, and account access</Text>
        </Box>
      </Flex>

      <Flex gap={4} flexWrap="wrap" align="center">
        <Tabs.Root value={userType} onValueChange={(e) => setUserType(e.value as "students" | "parents")}>
          <Tabs.List bg="#F3F4F6" borderRadius="full" p={1}>
            <Tabs.Trigger 
              value="students" 
              borderRadius="full" 
              fontSize="13px"
              px={6}
              _selected={{ bg: "white", shadow: "sm", fontWeight: "500" }}
            >
              Students ({students.length})
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="parents" 
              borderRadius="full" 
              fontSize="13px"
              px={6}
              _selected={{ bg: "white", shadow: "sm", fontWeight: "500" }}
            >
              Parents ({parents.length})
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        <Input
          placeholder={`Search ${userType}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="260px"
          bg="white"
          border="1px solid #E5E7EB"
          borderRadius="full"
          fontSize="13px"
          px={4}
          _focus={{ borderColor: "#206CE1", boxShadow: "none" }}
        />
      </Flex>

      {userType === "students" && (
        <Box borderRadius="1.5rem" border="1px solid #F0F0F0" overflow="hidden" bg="white">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="#F9FAFB">
                {["Student", "Email", "Class", "Plan", "Status", "Child?", "Joined", "Actions"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="11px" fontWeight="600" color="#6B7280" py={3.5}>
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredStudents.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={8} textAlign="center" py={8}>
                    <Text fontSize="12px" color="#9CA3AF">No students found</Text>
                  </Table.Cell>
                </Table.Row>
              ) : filteredStudents.map((st) => (
                <Table.Row key={st.id} _hover={{ bg: "#FAFAFF" }} transition="background 0.15s">
                  <Table.Cell>
                    <Flex align="center" gap={2.5}>
                      <Avatar.Root size="xs">
                        <Avatar.Fallback fontSize="11px" fontWeight="500" bg="#F3F4F6">
                          {st.firstname[0]}{st.lastname[0]}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Text fontSize="13px" fontWeight="500" color="#111827">{st.firstname} {st.lastname}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell fontSize="12px" color="#6B7280">{st.email}</Table.Cell>
                  <Table.Cell fontSize="13px" fontWeight="500" color="#111827">{st.class}</Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={planColors[st.subscription] || "gray"} variant="subtle" borderRadius="full" px={2.5} fontSize="10px" fontWeight="500">
                      {st.subscription}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette={st.subscription_status === "active" ? "green" : "red"} variant="subtle" borderRadius="full" px={2.5} fontSize="10px" fontWeight="500">
                      {st.subscription_status || "inactive"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Text fontSize="13px" color={st.is_child ? "#10B981" : "#9CA3AF"}>{st.is_child ? "✓" : "—"}</Text>
                  </Table.Cell>
                  <Table.Cell fontSize="11px" fontFamily="mono" color="#9CA3AF">{fmt(st.created_at)}</Table.Cell>
                  <Table.Cell>
                    <Flex gap={2}>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette={st.subscription_status === "active" ? "red" : "green"}
                        borderRadius="full"
                        onClick={() => handleToggleSubscription(st)}
                        fontSize="10px"
                        h="28px"
                        px={3}
                      >
                        {st.subscription_status === "active" ? "Suspend" : "Activate"}
                      </Button>
                      <Button
                        size="xs"
                        colorPalette="red"
                        variant="ghost"
                        borderRadius="full"
                        onClick={() => handleDeleteStudent(st.id)}
                        fontSize="10px"
                        h="28px"
                        px={3}
                      >
                        Delete
                      </Button>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {userType === "parents" && (
        <Box borderRadius="1.5rem" border="1px solid #F0F0F0" overflow="hidden" bg="white">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="#F9FAFB">
                {["Parent", "Email", "Phone", "Joined", "Actions"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="11px" fontWeight="600" color="#6B7280" py={3.5}>
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredParents.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" py={8}>
                    <Text fontSize="12px" color="#9CA3AF">No parents found</Text>
                  </Table.Cell>
                </Table.Row>
              ) : filteredParents.map((p) => (
                <Table.Row key={p.id} _hover={{ bg: "#FAFAFF" }} transition="background 0.15s">
                  <Table.Cell>
                    <Flex align="center" gap={2.5}>
                      <Avatar.Root size="xs">
                        <Avatar.Fallback fontSize="11px" fontWeight="500" bg="#F3F4F6">
                          {p.firstname[0]}{p.lastname[0]}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Text fontSize="13px" fontWeight="500" color="#111827">{p.firstname} {p.lastname}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell fontSize="12px" color="#6B7280">{p.email}</Table.Cell>
                  <Table.Cell fontSize="12px" fontFamily="mono" color="#6B7280">{p.phone}</Table.Cell>
                  <Table.Cell fontSize="11px" fontFamily="mono" color="#9CA3AF">{fmt(p.created_at)}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="xs"
                      colorPalette="red"
                      variant="ghost"
                      borderRadius="full"
                      onClick={() => handleDeleteParent(p.id)}
                      fontSize="10px"
                      h="28px"
                      px={3}
                    >
                      Delete
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </Stack>
  );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

type Tab = "overview" | "growth" | "subscriptions" | "courses" | "content" | "users" | "admins";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

const AdminDashboard = () => {
  const { logoutAdmin, getAdmin } = useAdminAuth();
  const admin = getAdmin() as AdminUser | null;
  const [tab, setTab] = useState<Tab>("overview");
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: sts }, { data: pts }, { data: res }] = await Promise.all([
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("parents").select("*").order("created_at", { ascending: false }),
      supabase.from("resources").select("*").order("created_at", { ascending: false }),
    ]);
    setStudents((sts as Student[]) || []);
    setParents((pts as Parent[]) || []);
    setResources((res as Resource[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const navItems: { key: Tab; label: string; sub: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", sub: "Platform snapshot", icon: FiGrid },
    { key: "growth", label: "User Growth", sub: "Registrations & linking", icon: FiTrendingUp },
    { key: "subscriptions", label: "Subscriptions", sub: "Revenue & plans", icon: FiDollarSign },
    { key: "courses", label: "Courses", sub: "Enrollment & engagement", icon: FiBookOpen },
    { key: "content", label: "Content", sub: "Videos & PDFs", icon: FiVideo },
    { key: "users", label: "User Management", sub: "Manage & take actions", icon: FiUsers },
    ...(admin?.role === "super_admin"
      ? [{ key: "admins" as Tab, label: "Admin Management", sub: "Create & manage admins", icon: FiUserCheck }]
      : []),
  ];

  return (
    <Flex minH="100vh" bg="#F8F9FC" fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif">
      {/* Modern Sidebar */}
      <Box
        w="280px"
        minH="100vh"
        bg="#111827"
        position="sticky"
        top={0}
        h="100vh"
        flexShrink={0}
        overflowY="auto"
      >
        <Box p={6} borderBottom="1px solid rgba(255,255,255,0.06)">
          <Flex align="center" gap={2} mb={5}>
            <Box px={5} pt={5} zIndex={1} mb={5} filter="brightness(0) invert(1)" display="inline-block">
              <Image src={logo} alt="iGrades" width="130px" />
            </Box>
          </Flex>
          <Box>
            <Text fontSize="13px" fontWeight="600" color="white">{admin?.name || "Administrator"}</Text>
            <Text fontSize="10px" color="rgba(255,255,255,0.5)" mt={1}>{admin?.email}</Text>
            {admin?.role === "super_admin" && (
              <Badge bg="rgba(241,135,41,0.15)" color="#F18729" borderRadius="full" px={2} mt={2} fontSize="9px" fontWeight="500">
                Super Admin
              </Badge>
            )}
          </Box>
        </Box>

        <Stack gap={1} p={4}>
          {navItems.map((item) => (
            <Box
              key={item.key}
              px={4}
              py={2.5}
              borderRadius="12px"
              cursor="pointer"
              bg={tab === item.key ? "rgba(255,255,255,0.08)" : "transparent"}
              onClick={() => setTab(item.key)}
              _hover={{ bg: "rgba(255,255,255,0.05)" }}
              transition="all 0.2s"
            >
              <Flex align="center" gap={3}>
                <Icon 
                  as={item.icon} 
                  boxSize={4} 
                  color={tab === item.key ? "#206CE1" : "rgba(255,255,255,0.5)"} 
                />
                <Box flex={1}>
                  <Text fontSize="13px" color={tab === item.key ? "white" : "rgba(255,255,255,0.7)"} fontWeight={tab === item.key ? "600" : "400"}>
                    {item.label}
                  </Text>
                  <Text fontSize="9px" color="rgba(255,255,255,0.3)" mt={0.5}>{item.sub}</Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Stack>

        <Box p={6} position="absolute" bottom={0} left={0} right={0}>
          <Button
            variant="outline"
            size="sm"
            w="full"
            color="rgba(255,255,255,0.7)"
            borderColor="rgba(255,255,255,0.15)"
            _hover={{ bg: "rgba(255,255,255,0.05)", color: "white", borderColor: "rgba(255,255,255,0.25)" }}
            onClick={logoutAdmin}
            borderRadius="full"
            fontSize="12px"
            py={5}
          >
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box flex={1} p={8} overflowY="auto">
        {loading ? (
          <Center h="60vh">
            <Stack align="center" gap={3}>
              <Spinner color="#206CE1" size="lg" thickness="3px" speed="0.65s" />
              <Text fontSize="13px" color="#9CA3AF" fontFamily="mono">Loading platform data...</Text>
            </Stack>
          </Center>
        ) : (
          <>
            {tab === "overview" && <OverviewTab students={students} parents={parents} resources={resources} />}
            {tab === "growth" && <UserGrowthTab students={students} parents={parents} />}
            {tab === "subscriptions" && <SubscriptionsTab students={students} />}
            {tab === "courses" && <CoursesTab students={students} />}
            {tab === "content" && <ContentTab resources={resources} />}
            {tab === "users" && <UserManagementTab students={students} parents={parents} onRefresh={fetchAll} />}
            {tab === "admins" && admin?.role === "super_admin" && <AdminManagementTab currentAdminId={admin.id} />}
          </>
        )}
      </Box>
    </Flex>
  );
};

export default AdminDashboard;