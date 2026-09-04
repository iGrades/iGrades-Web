import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAdminAuth } from "./hooks/useAdminAuth";
import {
  Box, Flex, Heading, Text, Button, Input, Stack,
  Badge, Grid, Table, Select, Center,
  Tabs, Avatar, Icon, Image, createListCollection
} from "@chakra-ui/react";
import { DancingLogoLoader } from "@/components/DancingLogoLoader";
import { toaster } from "@/components/ui/toaster";
import AdminManagementTab from "./AdminManagementTab";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from "recharts";
import {
  FiUsers, FiBookOpen, FiVideo, FiDollarSign, FiTrendingUp,
  FiUserCheck, FiArchive, FiGrid, FiRefreshCw,
  FiLogOut, FiMenu, FiX, FiShield, FiClock, FiLayers
} from "react-icons/fi";
import logo from "../assets/landing-page/logo.png";

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

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
}

// ─── Helpers & Design Constants ───────────────────────────────────────────────

const fmt = (date: string) =>
  new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const fmtTime = (date: Date) =>
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const CHART_COLORS = ["#94A3B8", "#2563EB", "#F59E0B", "#10B981", "#8B5CF6"];

const planConfig: Record<string, { bg: string; color: string; label: string }> = {
  basic: { bg: "#F1F5F9", color: "#475569", label: "Basic" },
  standard: { bg: "#EFF6FF", color: "#1D4ED8", label: "Standard" },
  premium: { bg: "#FEF3C7", color: "#D97706", label: "Premium" },
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

// ─── Premium KPI Card ─────────────────────────────────────────────────────────

const ModernKpiCard = ({
  label, value, sub, icon, trend, trendValue, accent = "#2563EB"
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
    borderRadius="1.25rem"
    p={5}
    position="relative"
    overflow="hidden"
    transition="all 0.25s ease"
    _hover={{ transform: "translateY(-3px)", boxShadow: "0 12px 24px -10px rgba(15, 23, 42, 0.08)" }}
    boxShadow="0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)"
    border="1px solid"
    borderColor="gray.100"
  >
    {/* Subtle top accent bar */}
    <Box position="absolute" top={0} left={0} right={0} h="3px" bg={accent} opacity={0.85} />

    <Flex justify="space-between" align="flex-start">
      <Box flex={1}>
        <Text fontSize="11px" fontWeight="700" letterSpacing="0.06em" color="gray.500" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="2.25rem" fontWeight="800" color="gray.900" lineHeight="1.1" mt={2} letterSpacing="-0.03em">
          {value}
        </Text>
        {sub && <Text fontSize="12px" color="gray.500" mt={1.5} fontWeight="500">{sub}</Text>}
        {trend && trendValue && (
          <Flex align="center" gap={1.5} mt={2.5}>
            <Badge
              bg={trend === "up" ? "emerald.50" : "rose.50"}
              color={trend === "up" ? "emerald.700" : "rose.700"}
              px={2}
              py={0.5}
              borderRadius="full"
              fontSize="11px"
              fontWeight="700"
            >
              {trend === "up" ? "↑" : "↓"} {trendValue}
            </Badge>
            <Text fontSize="11px" color="gray.400" fontWeight="500">vs last period</Text>
          </Flex>
        )}
      </Box>
      <Center
        w="44px"
        h="44px"
        borderRadius="1rem"
        bg={`${accent}12`}
        color={accent}
        flexShrink={0}
      >
        <Icon as={icon} boxSize={5} />
      </Center>
    </Flex>
  </Box>
);

// ─── Chart Container Card ──────────────────────────────────────────────────────

const ModernChartCard = ({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <Box
    bg="white"
    borderRadius="1.25rem"
    p={6}
    border="1px solid"
    borderColor="gray.100"
    boxShadow="0 1px 3px rgba(15, 23, 42, 0.03)"
  >
    <Flex justify="space-between" align="center" mb={5} flexWrap="wrap" gap={2}>
      <Box>
        <Text fontSize="15px" fontWeight="700" color="gray.900" letterSpacing="-0.01em">
          {title}
        </Text>
        {subtitle && <Text fontSize="12px" color="gray.500" mt={0.5}>{subtitle}</Text>}
      </Box>
      {action}
    </Flex>
    {children}
  </Box>
);

// ─── Stats Progress Row ────────────────────────────────────────────────────────

const StatsRow = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Box>
      <Flex justify="space-between" mb={1.5} align="center">
        <Text fontSize="12px" fontWeight="500" color="gray.600">{label}</Text>
        <Flex align="center" gap={2}>
          <Text fontSize="12px" fontWeight="700" color="gray.900">{value}</Text>
          <Text fontSize="11px" color="gray.400">({percentage}%)</Text>
        </Flex>
      </Flex>
      <Box h="7px" bg="gray.100" borderRadius="full" overflow="hidden">
        <Box w={`${percentage}%`} h="full" bg={color} borderRadius="full" transition="width 0.5s ease" />
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

  return (
    <Stack gap={6}>
      <Box>
        <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">Platform Overview</Heading>
        <Text fontSize="13px" color="gray.500" mt={1}>Key operational metrics, active user trends, and revenue generation</Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        <ModernKpiCard
          label="Total Students"
          value={students.length}
          icon={FiUsers}
          accent="#2563EB"
          trend="up"
          trendValue={`+${thisMonth(students)}`}
        />
        <ModernKpiCard
          label="Total Parents"
          value={parents.length}
          icon={FiUserCheck}
          accent="#8B5CF6"
          trend="up"
          trendValue={`+${thisMonth(parents)}`}
        />
        <ModernKpiCard
          label="Active Subscriptions"
          value={activeStudents}
          sub={`${students.length ? Math.round((activeStudents / students.length) * 100) : 0}% of student base`}
          icon={FiTrendingUp}
          accent="#10B981"
        />
        <ModernKpiCard
          label="Est. Monthly Revenue"
          value={`₦${(revenue / 1000).toFixed(0)}K`}
          sub={`Exact: ₦${revenue.toLocaleString()}`}
          icon={FiDollarSign}
          accent="#F59E0B"
        />
      </Grid>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        <ModernKpiCard
          label="Learning Content"
          value={resources.length}
          icon={FiArchive}
          accent="#06B6D4"
        />
        <ModernKpiCard
          label="Video Lessons"
          value={resources.filter((r) => r.type === "video").length}
          icon={FiVideo}
          accent="#3B82F6"
        />
        <ModernKpiCard
          label="PDF Materials"
          value={resources.filter((r) => r.type === "pdf").length}
          icon={FiBookOpen}
          accent="#EC4899"
        />
        <ModernKpiCard
          label="Linked Families"
          value={students.filter((s) => s.parent_id).length}
          icon={FiGrid}
          accent="#8B5CF6"
        />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1.6fr 1fr" }} gap={6}>
        <ModernChartCard title="Platform Registrations Trend" subtitle="Monthly acquisition of students vs parents">
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={combinedMonthly}>
              <defs>
                <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="parentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "12px",
                  border: "none",
                  color: "white",
                  fontSize: "12px",
                  boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)"
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="Students" stroke="#2563EB" strokeWidth={2.5} fill="url(#studentGradient)" />
              <Area type="monotone" dataKey="Parents" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#parentGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ModernChartCard>

        <ModernChartCard title="Subscription Distribution" subtitle="Active tier split and account status">
          <Stack gap={5}>
            <Box>
              <Text fontSize="12px" fontWeight="600" color="gray.500" mb={2}>TIER BREAKDOWN</Text>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie
                    data={planDist}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={62}
                    paddingAngle={4}
                  >
                    {planDist.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <Flex justify="center" gap={4} mt={2} flexWrap="wrap">
                {planDist.map((item, i) => (
                  <Flex align="center" gap={1.5} key={i}>
                    <Box w="8px" h="8px" borderRadius="full" bg={CHART_COLORS[i % CHART_COLORS.length]} />
                    <Text fontSize="11px" color="gray.600" fontWeight="500">{item.name} ({item.value})</Text>
                  </Flex>
                ))}
              </Flex>
            </Box>

            <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
              <Text fontSize="12px" fontWeight="600" color="gray.500" mb={3}>ACCOUNT HEALTH</Text>
              <Stack gap={3}>
                <StatsRow
                  label="Active Accounts"
                  value={activeStudents}
                  total={students.length}
                  color="#10B981"
                />
                <StatsRow
                  label="Inactive Accounts"
                  value={students.length - activeStudents}
                  total={students.length}
                  color="#EF4444"
                />
              </Stack>
            </Box>
          </Stack>
        </ModernChartCard>
      </Grid>

      <ModernChartCard title="Resource Distribution" subtitle="Content breakdown by medium">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={[
            { type: "Video Lessons", count: resources.filter(r => r.type === "video").length },
            { type: "PDF Materials", count: resources.filter(r => r.type === "pdf").length },
            { type: "Other Resources", count: resources.filter(r => r.type !== "video" && r.type !== "pdf").length },
          ]} barSize={44}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                borderRadius: "12px",
                border: "none",
                color: "white",
                fontSize: "12px"
              }}
            />
            <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
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
      <Box>
        <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">User Growth Analytics</Heading>
        <Text fontSize="13px" color="gray.500" mt={1}>Detailed registration velocity and parent-child relationship tracking</Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        <ModernKpiCard label="Total Students" value={students.length} icon={FiUsers} accent="#2563EB" />
        <ModernKpiCard label="Total Parents" value={parents.length} icon={FiUserCheck} accent="#8B5CF6" />
        <ModernKpiCard label="Child Accounts" value={childStudents} sub="Parent-managed accounts" icon={FiGrid} accent="#06B6D4" />
        <ModernKpiCard label="Linked Families" value={linkedStudents} sub="Students connected to parent" icon={FiTrendingUp} accent="#10B981" />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        <ModernChartCard title="Student Onboarding Rate">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={studentMonthly}>
              <defs>
                <linearGradient id="studentGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "white", borderRadius: "12px", border: "none" }} />
              <Area type="monotone" dataKey="Students" stroke="#2563EB" strokeWidth={2.5} fill="url(#studentGrowthGrad)" dot={{ r: 4, fill: "#2563EB" }} />
            </AreaChart>
          </ResponsiveContainer>
        </ModernChartCard>

        <ModernChartCard title="Parent Onboarding Rate">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={parentMonthly}>
              <defs>
                <linearGradient id="parentGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "white", borderRadius: "12px", border: "none" }} />
              <Area type="monotone" dataKey="Parents" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#parentGrowthGrad)" dot={{ r: 4, fill: "#8B5CF6" }} />
            </AreaChart>
          </ResponsiveContainer>
        </ModernChartCard>
      </Grid>

      <ModernChartCard title="Parent–Child Account Link Matrix">
        <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
          <Box textAlign="center" p={6} bg="emerald.50" borderRadius="1rem" border="1px solid" borderColor="emerald.100">
            <Text fontSize="2.5rem" fontWeight="800" color="emerald.700" lineHeight="1">{linkedStudents}</Text>
            <Text fontSize="13px" fontWeight="700" color="emerald.900" mt={2}>Linked Students</Text>
            <Text fontSize="11px" color="emerald.600" mt={1}>
              {students.length ? Math.round((linkedStudents / students.length) * 100) : 0}% of total student base
            </Text>
          </Box>
          <Box textAlign="center" p={6} bg="rose.50" borderRadius="1rem" border="1px solid" borderColor="rose.100">
            <Text fontSize="2.5rem" fontWeight="800" color="rose.700" lineHeight="1">{students.length - linkedStudents}</Text>
            <Text fontSize="13px" fontWeight="700" color="rose.900" mt={2}>Independent Students</Text>
            <Text fontSize="11px" color="rose.600" mt={1}>
              {students.length ? Math.round(((students.length - linkedStudents) / students.length) * 100) : 0}% unlinked accounts
            </Text>
          </Box>
          <Box textAlign="center" p={6} bg="amber.50" borderRadius="1rem" border="1px solid" borderColor="amber.100">
            <Text fontSize="2.5rem" fontWeight="800" color="amber.700" lineHeight="1">{unlinkedParents}</Text>
            <Text fontSize="13px" fontWeight="700" color="amber.900" mt={2}>Pending Parents</Text>
            <Text fontSize="11px" color="amber.600" mt={1}>
              {parents.length ? Math.round((unlinkedParents / parents.length) * 100) : 0}% without linked children
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

  const statuses = createListCollection({
    items: [
      { label: "All Statuses", value: "all" },
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  });

  return (
    <Stack gap={6}>
      <Box>
        <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">Subscriptions & Monetization</Heading>
        <Text fontSize="13px" color="gray.500" mt={1}>Revenue overview, plan distribution, and subscriber list</Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        <ModernKpiCard label="Basic (Free)" value={students.filter((s) => s.subscription === "basic").length} icon={FiUsers} accent="#64748B" />
        <ModernKpiCard label="Standard" value={students.filter((s) => s.subscription === "standard").length} sub="₦15,000 / term" icon={FiTrendingUp} accent="#2563EB" />
        <ModernKpiCard label="Premium" value={students.filter((s) => s.subscription === "premium").length} sub="₦25,000 / term" icon={FiDollarSign} accent="#F59E0B" />
        <ModernKpiCard label="Est. Revenue" value={`₦${(totalRevenue / 1000).toFixed(0)}K`} sub={`Exact: ₦${totalRevenue.toLocaleString()}`} icon={FiDollarSign} accent="#10B981" />
      </Grid>

      <Grid templateColumns={{ base: "1fr", lg: "1.2fr 1fr" }} gap={6}>
        <ModernChartCard title="Paid Subscribers Growth">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByMonth} barSize={38}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "#0F172A", color: "white", borderRadius: "12px", border: "none" }} />
              <Bar dataKey="Paid Users" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ModernChartCard>

        <ModernChartCard title="Tier Breakdown">
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
                  paddingAngle={4}
                >
                  {CHART_COLORS.slice(0, 3).map((color, i) => <Cell key={i} fill={color} stroke="none" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <Stack gap={2}>
              {[
                { name: "Basic", color: "#94A3B8", value: students.filter(s => s.subscription === "basic").length },
                { name: "Standard", color: "#2563EB", value: students.filter(s => s.subscription === "standard").length },
                { name: "Premium", color: "#F59E0B", value: students.filter(s => s.subscription === "premium").length },
              ].map(plan => (
                <Flex justify="space-between" key={plan.name} align="center">
                  <Flex align="center" gap={2}>
                    <Box w="8px" h="8px" borderRadius="full" bg={plan.color} />
                    <Text fontSize="12px" color="gray.600" fontWeight="500">{plan.name}</Text>
                  </Flex>
                  <Text fontSize="12px" fontWeight="700" color="gray.900">{plan.value}</Text>
                </Flex>
              ))}
            </Stack>
          </Stack>
        </ModernChartCard>
      </Grid>

      <ModernChartCard
        title="Subscription Status Directory"
        action={
          <Select.Root collection={statuses} value={[filter]} onValueChange={(e) => setFilter(e.value[0])} size="sm" w="180px">
            <Select.Trigger bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" fontSize="13px" px={3}>
              <Select.ValueText placeholder="Filter status" />
            </Select.Trigger>
            <Select.Content>
              {statuses.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        }
      >
        <Box borderRadius="0.75rem" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                {["Student", "Email", "Plan", "Status", "Payment Ref", "Joined"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="11px" fontWeight="700" color="gray.500" py={3.5} textTransform="uppercase" letterSpacing="0.05em">
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filtered.slice(0, 10).map((st) => {
                const plan = planConfig[st.subscription] || planConfig.basic;
                return (
                  <Table.Row key={st.id} _hover={{ bg: "blue.50/30" }} transition="background 0.15s">
                    <Table.Cell fontWeight="600" fontSize="13px" color="gray.900">{st.firstname} {st.lastname}</Table.Cell>
                    <Table.Cell fontSize="12px" color="gray.600">{st.email}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        bg={plan.bg}
                        color={plan.color}
                        borderRadius="full"
                        px={3}
                        py={0.5}
                        fontSize="10px"
                        fontWeight="700"
                      >
                        {plan.label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        bg={st.subscription_status === "active" ? "emerald.50" : "rose.50"}
                        color={st.subscription_status === "active" ? "emerald.700" : "rose.700"}
                        borderRadius="full"
                        px={3}
                        py={0.5}
                        fontSize="10px"
                        fontWeight="700"
                      >
                        {st.subscription_status || "inactive"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell fontSize="11px" fontFamily="mono" color="gray.500">{st.last_payment_ref || "—"}</Table.Cell>
                    <Table.Cell fontSize="11px" color="gray.500">{fmt(st.created_at)}</Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Box>
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

  const chartData = courses.slice(0, 10).map(([name, count]) => ({
    name: name.length > 25 ? name.slice(0, 22) + "..." : name,
    Enrollments: count
  }));

  return (
    <Stack gap={6}>
      <Box>
        <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">Course Engagement</Heading>
        <Text fontSize="13px" color="gray.500" mt={1}>Subject enrollments and academic subject popularity rankings</Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
        <ModernKpiCard label="Enrolled Students" value={enrolled.length} sub={`${students.length ? Math.round((enrolled.length / students.length) * 100) : 0}% active participation`} icon={FiUsers} accent="#2563EB" />
        <ModernKpiCard label="Unique Courses" value={courses.length} icon={FiBookOpen} accent="#8B5CF6" />
        <ModernKpiCard label="Avg Courses / Student" value={avgCourses} icon={FiTrendingUp} accent="#10B981" />
      </Grid>

      {chartData.length > 0 ? (
        <ModernChartCard title="Top Enrolled Subjects" subtitle="Total student course selections">
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData} layout="vertical" barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 12, fill: "#334155" }}
                width={150}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0F172A",
                  borderRadius: "12px",
                  border: "none",
                  color: "white",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="Enrollments" fill="#2563EB" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ModernChartCard>
      ) : (
        <Box textAlign="center" p={12} bg="white" borderRadius="1.25rem" border="1px solid" borderColor="gray.100">
          <Text color="gray.400" fontSize="13px">No course enrollments recorded yet</Text>
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

  const typeCollection = createListCollection({
    items: [
      { label: "All Types", value: "all" },
      ...types.map((t) => ({
        label: t.charAt(0).toUpperCase() + t.slice(1),
        value: t,
      })),
    ],
  });

  return (
    <Stack gap={6}>
      <Box>
        <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">Resource Library</Heading>
        <Text fontSize="13px" color="gray.500" mt={1}>Catalog of video lectures, PDF textbooks, and supplementary study materials</Text>
      </Box>

      <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
        <ModernKpiCard label="Total Resources" value={resources.length} icon={FiArchive} accent="#2563EB" />
        <ModernKpiCard label="Video Lessons" value={resources.filter((r) => r.type === "video").length} icon={FiVideo} accent="#06B6D4" />
        <ModernKpiCard label="PDF Documents" value={resources.filter((r) => r.type === "pdf").length} icon={FiBookOpen} accent="#F59E0B" />
        <ModernKpiCard label="Other Materials" value={resources.filter((r) => r.type !== "video" && r.type !== "pdf").length} icon={FiGrid} accent="#8B5CF6" />
      </Grid>

      <ModernChartCard title="Resource Management">
        <Stack gap={4}>
          <Flex gap={3} flexWrap="wrap">
            <Box position="relative" flex={1} maxW="320px">
              <Input
                placeholder="Search resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                fontSize="13px"
                pl={4}
                pr={4}
                h="38px"
                _focus={{ borderColor: "blue.500", boxShadow: "none" }}
              />
            </Box>

            <Select.Root collection={typeCollection} value={[typeFilter]} onValueChange={(e) => setTypeFilter(e.value[0])} size="sm" w="160px">
              <Select.Trigger bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" fontSize="13px" px={3} h="38px">
                <Select.ValueText placeholder="All Types" />
              </Select.Trigger>
              <Select.Content>
                {typeCollection.items.map((item) => (
                  <Select.Item key={item.value} item={item}>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>

          <Box borderRadius="0.75rem" border="1px solid" borderColor="gray.100" overflow="hidden">
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row bg="gray.50">
                  {["Resource Title", "Type", "Duration", "Class ID", "Uploaded"].map((h) => (
                    <Table.ColumnHeader key={h} fontSize="11px" fontWeight="700" color="gray.500" py={3.5} textTransform="uppercase" letterSpacing="0.05em">
                      {h}
                    </Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={5} textAlign="center" py={8}>
                      <Text fontSize="13px" color="gray.400">No matching content found</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  filtered.map((r) => (
                    <Table.Row key={r.id} _hover={{ bg: "blue.50/30" }} transition="background 0.15s">
                      <Table.Cell fontWeight="600" fontSize="13px" color="gray.900">
                        <Text truncate maxW="320px">{r.title}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          bg={r.type === "video" ? "cyan.50" : r.type === "pdf" ? "amber.50" : "gray.100"}
                          color={r.type === "video" ? "cyan.700" : r.type === "pdf" ? "amber.700" : "gray.700"}
                          borderRadius="full"
                          px={3}
                          py={0.5}
                          fontSize="10px"
                          fontWeight="700"
                        >
                          {r.type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell fontSize="12px" color="gray.500">{r.duration || "—"}</Table.Cell>
                      <Table.Cell fontSize="12px" color="gray.600">{r.class_id || "—"}</Table.Cell>
                      <Table.Cell fontSize="11px" color="gray.500">{fmt(r.created_at)}</Table.Cell>
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
    if (!window.confirm("Are you sure you want to delete this student account?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toaster.create({ title: "Error deleting student", type: "error", duration: 4000 });
    } else {
      toaster.create({ title: "Student deleted successfully", type: "success", duration: 3000 });
      onRefresh();
    }
  };

  const handleDeleteParent = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this parent account?")) return;
    const { error } = await supabase.from("parents").delete().eq("id", id);
    if (error) {
      toaster.create({ title: "Error deleting parent", type: "error", duration: 4000 });
    } else {
      toaster.create({ title: "Parent deleted successfully", type: "success", duration: 3000 });
      onRefresh();
    }
  };

  const handleToggleSubscription = async (student: Student) => {
    const newStatus = student.subscription_status === "active" ? "inactive" : "active";
    const { error } = await supabase.from("students").update({ subscription_status: newStatus }).eq("id", student.id);
    if (error) {
      toaster.create({ title: "Error updating status", type: "error", duration: 4000 });
    } else {
      toaster.create({ title: `Subscription status set to ${newStatus}`, type: "success", duration: 3000 });
      onRefresh();
    }
  };

  return (
    <Stack gap={6}>
      <Box>
        <Heading fontSize="1.5rem" fontWeight="800" letterSpacing="-0.02em" color="gray.900">User Account Management</Heading>
        <Text fontSize="13px" color="gray.500" mt={1}>Search accounts, suspend or activate student access, and manage parent records</Text>
      </Box>

      <Flex gap={4} flexWrap="wrap" align="center" justify="space-between">
        <Tabs.Root value={userType} onValueChange={(e) => setUserType(e.value as "students" | "parents")}>
          <Tabs.List bg="gray.100" borderRadius="full" p={1}>
            <Tabs.Trigger
              value="students"
              borderRadius="full"
              fontSize="13px"
              fontWeight="600"
              px={5}
              py={1.5}
              _selected={{ bg: "white", color: "blue.600", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              Students ({students.length})
            </Tabs.Trigger>
            <Tabs.Trigger
              value="parents"
              borderRadius="full"
              fontSize="13px"
              fontWeight="600"
              px={5}
              py={1.5}
              _selected={{ bg: "white", color: "purple.600", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
            >
              Parents ({parents.length})
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>

        <Input
          placeholder={`Search ${userType}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="280px"
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="lg"
          fontSize="13px"
          px={4}
          h="38px"
          _focus={{ borderColor: "blue.500", boxShadow: "none" }}
        />
      </Flex>

      {userType === "students" && (
        <Box borderRadius="0.75rem" border="1px solid" borderColor="gray.100" overflow="hidden" bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.03)">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                {["Student Name", "Email", "Class", "Plan", "Status", "Child?", "Joined", "Actions"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="11px" fontWeight="700" color="gray.500" py={3.5} textTransform="uppercase" letterSpacing="0.05em">
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredStudents.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={8} textAlign="center" py={8}>
                    <Text fontSize="13px" color="gray.400">No student records found</Text>
                  </Table.Cell>
                </Table.Row>
              ) : filteredStudents.map((st) => {
                const plan = planConfig[st.subscription] || planConfig.basic;
                return (
                  <Table.Row key={st.id} _hover={{ bg: "blue.50/20" }} transition="background 0.15s">
                    <Table.Cell py={3}>
                      <Flex align="center" gap={2.5}>
                        <Avatar.Root size="xs">
                          <Avatar.Fallback fontSize="11px" fontWeight="700" bg="blue.100" color="blue.700">
                            {st.firstname?.[0] || "S"}{st.lastname?.[0] || ""}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <Text fontSize="13px" fontWeight="600" color="gray.900">{st.firstname} {st.lastname}</Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell fontSize="12px" color="gray.600">{st.email}</Table.Cell>
                    <Table.Cell fontSize="13px" fontWeight="600" color="gray.800">{st.class || "N/A"}</Table.Cell>
                    <Table.Cell>
                      <Badge bg={plan.bg} color={plan.color} borderRadius="full" px={2.5} py={0.5} fontSize="10px" fontWeight="700">
                        {plan.label}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        bg={st.subscription_status === "active" ? "emerald.50" : "rose.50"}
                        color={st.subscription_status === "active" ? "emerald.700" : "rose.700"}
                        borderRadius="full"
                        px={2.5}
                        py={0.5}
                        fontSize="10px"
                        fontWeight="700"
                      >
                        {st.subscription_status || "inactive"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Badge bg={st.is_child ? "cyan.50" : "gray.100"} color={st.is_child ? "cyan.700" : "gray.500"} borderRadius="full" px={2} fontSize="10px">
                        {st.is_child ? "Yes" : "No"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell fontSize="11px" color="gray.500">{fmt(st.created_at)}</Table.Cell>
                    <Table.Cell>
                      <Flex gap={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          borderColor={st.subscription_status === "active" ? "rose.200" : "emerald.200"}
                          color={st.subscription_status === "active" ? "rose.600" : "emerald.600"}
                          _hover={{ bg: st.subscription_status === "active" ? "rose.50" : "emerald.50" }}
                          borderRadius="md"
                          onClick={() => handleToggleSubscription(st)}
                          fontSize="11px"
                          fontWeight="600"
                          h="26px"
                          px={2.5}
                        >
                          {st.subscription_status === "active" ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          color="rose.600"
                          _hover={{ bg: "rose.50" }}
                          borderRadius="md"
                          onClick={() => handleDeleteStudent(st.id)}
                          fontSize="11px"
                          fontWeight="600"
                          h="26px"
                          px={2}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </Box>
      )}

      {userType === "parents" && (
        <Box borderRadius="0.75rem" border="1px solid" borderColor="gray.100" overflow="hidden" bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.03)">
          <Table.Root size="sm">
            <Table.Header>
              <Table.Row bg="gray.50">
                {["Parent Name", "Email", "Phone", "Registered", "Actions"].map((h) => (
                  <Table.ColumnHeader key={h} fontSize="11px" fontWeight="700" color="gray.500" py={3.5} textTransform="uppercase" letterSpacing="0.05em">
                    {h}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredParents.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={5} textAlign="center" py={8}>
                    <Text fontSize="13px" color="gray.400">No parent records found</Text>
                  </Table.Cell>
                </Table.Row>
              ) : filteredParents.map((p) => (
                <Table.Row key={p.id} _hover={{ bg: "purple.50/20" }} transition="background 0.15s">
                  <Table.Cell py={3}>
                    <Flex align="center" gap={2.5}>
                      <Avatar.Root size="xs">
                        <Avatar.Fallback fontSize="11px" fontWeight="700" bg="purple.100" color="purple.700">
                          {p.firstname?.[0] || "P"}{p.lastname?.[0] || ""}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      <Text fontSize="13px" fontWeight="600" color="gray.900">{p.firstname} {p.lastname}</Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell fontSize="12px" color="gray.600">{p.email}</Table.Cell>
                  <Table.Cell fontSize="12px" color="gray.600">{p.phone || "—"}</Table.Cell>
                  <Table.Cell fontSize="11px" color="gray.500">{fmt(p.created_at)}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="rose.600"
                      _hover={{ bg: "rose.50" }}
                      borderRadius="md"
                      onClick={() => handleDeleteParent(p.id)}
                      fontSize="11px"
                      fontWeight="600"
                      h="26px"
                      px={2.5}
                    >
                      Delete Account
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

// ─── MAIN DASHBOARD CONTAINER ──────────────────────────────────────────────────

type TabKey = "overview" | "growth" | "subscriptions" | "courses" | "content" | "users" | "admins";

const AdminDashboard = () => {
  const { logoutAdmin, getAdmin } = useAdminAuth();
  const admin = getAdmin() as AdminUser | null;
  const [tab, setTab] = useState<TabKey>("overview");
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    const [{ data: sts }, { data: pts }, { data: res }] = await Promise.all([
      supabase.from("students").select("*").order("created_at", { ascending: false }),
      supabase.from("parents").select("*").order("created_at", { ascending: false }),
      supabase.from("resources").select("*").order("created_at", { ascending: false }),
    ]);
    setStudents((sts as Student[]) || []);
    setParents((pts as Parent[]) || []);
    setResources((res as Resource[]) || []);
    setLoading(false);
    setRefreshing(false);
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const navGroups: {
    group: string;
    items: { key: TabKey | "cms"; label: string; sub: string; icon: React.ElementType; path?: string }[];
  }[] = [
    {
      group: "Analytics & Operations",
      items: [
        { key: "overview", label: "Overview", sub: "Key metrics & activity", icon: FiGrid },
        { key: "growth", label: "User Growth", sub: "Registrations & velocity", icon: FiTrendingUp },
        { key: "subscriptions", label: "Subscriptions", sub: "Revenue & tier breakdown", icon: FiDollarSign },
      ],
    },
    {
      group: "Academics & Content",
      items: [
        { key: "courses", label: "Courses", sub: "Enrollment & subjects", icon: FiBookOpen },
        { key: "content", label: "Content Library", sub: "Videos & PDF files", icon: FiVideo },
        { key: "cms" as any, label: "CMS Workspace", sub: "Manage topics & quizzes", icon: FiLayers, path: "/admin/content-management" },
      ],
    },
    {
      group: "Administration",
      items: [
        { key: "users", label: "User Management", sub: "Students & parents", icon: FiUsers },
        ...(admin?.role === "super_admin"
          ? [{ key: "admins" as TabKey, label: "Admin Team", sub: "Manage administrators", icon: FiShield }]
          : []),
      ],
    },
  ];

  return (
    <Flex minH="100vh" bg="#F8FAFC" color="gray.800" fontFamily="system-ui, -apple-system, sans-serif">
      {/* Sidebar Desktop */}
      <Box
        w="280px"
        minH="100vh"
        bg="#0F172A"
        position="sticky"
        top={0}
        h="100vh"
        flexShrink={0}
        display={{ base: "none", lg: "flex" }}
        flexDirection="column"
        borderRight="1px solid"
        borderColor="slate.800"
      >
        {/* Logo Header */}
        <Box p={6} borderBottom="1px solid" borderColor="whiteAlpha.100">
          <Flex align="center" gap={3}>
            <Box filter="brightness(0) invert(1)" display="inline-block">
              <Image src={logo} alt="iGrades" h="28px" objectFit="contain" />
            </Box>
            <Badge bg="blue.500/20" color="blue.300" borderRadius="md" px={2} py={0.5} fontSize="9px" fontWeight="700" letterSpacing="0.05em">
              ADMIN
            </Badge>
          </Flex>

          {/* Admin Profile Summary */}
          <Box mt={5} p={3} bg="whiteAlpha.05" borderRadius="0.75rem" border="1px solid" borderColor="whiteAlpha.100">
            <Flex align="center" gap={3}>
              <Avatar.Root size="sm">
                <Avatar.Fallback bg="blue.600" color="white" fontWeight="700">
                  {admin?.name?.[0] || "A"}
                </Avatar.Fallback>
              </Avatar.Root>
              <Box flex={1} overflow="hidden">
                <Text fontSize="13px" fontWeight="700" color="white" truncate>{admin?.name || "Administrator"}</Text>
                <Text fontSize="11px" color="slate.400" truncate>{admin?.email}</Text>
              </Box>
            </Flex>
            <Flex justify="space-between" align="center" mt={2} pt={2} borderTop="1px solid" borderColor="whiteAlpha.100">
              <Badge
                bg={admin?.role === "super_admin" ? "amber.500/20" : "blue.500/20"}
                color={admin?.role === "super_admin" ? "amber.300" : "blue.300"}
                borderRadius="full"
                px={2}
                fontSize="9px"
                fontWeight="700"
              >
                {admin?.role === "super_admin" ? "Super Admin" : "Admin"}
              </Badge>
              <Text fontSize="10px" color="slate.500" fontFamily="mono">ID: #{admin?.id?.slice(0, 6)}</Text>
            </Flex>
          </Box>
        </Box>

        {/* Navigation Groups */}
        <Box flex={1} overflowY="auto" px={4} py={4}>
          <Stack gap={6}>
            {navGroups.map((group) => (
              <Box key={group.group}>
                <Text fontSize="10px" fontWeight="800" letterSpacing="0.08em" color="slate.500" textTransform="uppercase" mb={2} px={2}>
                  {group.group}
                </Text>
                <Stack gap={1}>
                  {group.items.map((item) => {
                    const isActive = tab === item.key;
                    return (
                      <Box
                        key={item.key}
                        px={3.5}
                        py={2.5}
                        borderRadius="0.75rem"
                        cursor="pointer"
                        bg={isActive ? "blue.600" : "transparent"}
                        color={isActive ? "white" : "slate.300"}
                        onClick={() => {
                          if (item.path) {
                            window.location.href = item.path;
                          } else {
                            setTab(item.key as TabKey);
                          }
                        }}
                        _hover={{ bg: isActive ? "blue.600" : "whiteAlpha.08", color: "white" }}
                        transition="all 0.15s ease"
                      >
                        <Flex align="center" gap={3}>
                          <Icon
                            as={item.icon}
                            boxSize={4}
                            color={isActive ? "white" : "slate.400"}
                          />
                          <Box flex={1}>
                            <Text fontSize="13px" fontWeight={isActive ? "700" : "500"} lineHeight="1.2">
                              {item.label}
                            </Text>
                            <Text fontSize="10px" color={isActive ? "blue.100" : "slate.500"} mt={0.5}>
                              {item.sub}
                            </Text>
                          </Box>
                        </Flex>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Sidebar Footer / Sign Out */}
        <Box p={4} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Button
            variant="ghost"
            size="sm"
            w="full"
            color="rose.300"
            _hover={{ bg: "rose.500/10", color: "rose.200" }}
            onClick={logoutAdmin}
            borderRadius="0.75rem"
            fontSize="12px"
            fontWeight="600"
            justifyContent="flex-start"
            gap={2.5}
            h="40px"
          >
            <Icon as={FiLogOut} boxSize={4} />
            Sign Out Admin Session
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Flex flex={1} direction="column" minW={0} overflowX="hidden">
        {/* Top Header Bar */}
        <Flex
          h="64px"
          bg="white"
          borderBottom="1px solid"
          borderColor="gray.200"
          align="center"
          justify="space-between"
          px={{ base: 4, md: 8 }}
          position="sticky"
          top={0}
          zIndex={10}
        >
          <Flex align="center" gap={3}>
            {/* Mobile Nav Toggle */}
            <Button
              display={{ base: "flex", lg: "none" }}
              variant="ghost"
              size="sm"
              p={2}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Icon as={mobileNavOpen ? FiX : FiMenu} boxSize={5} />
            </Button>

            <Flex align="center" gap={2}>
              <Text fontSize="12px" fontWeight="600" color="gray.400">Admin Portal</Text>
              <Text fontSize="12px" color="gray.300">/</Text>
              <Text fontSize="14px" fontWeight="800" color="gray.900" textTransform="capitalize">
                {tab === "overview" && "Platform Overview"}
                {tab === "growth" && "User Acquisition & Growth"}
                {tab === "subscriptions" && "Subscriptions & Revenue"}
                {tab === "courses" && "Course Engagement"}
                {tab === "content" && "Resource Library"}
                {tab === "users" && "User Accounts"}
                {tab === "admins" && "Admin Team"}
              </Text>
            </Flex>
          </Flex>

          <Flex align="center" gap={3}>
            <Flex align="center" gap={1.5} display={{ base: "none", md: "flex" }}>
              <Icon as={FiClock} color="gray.400" boxSize={3.5} />
              <Text fontSize="11px" color="gray.500" fontWeight="500">
                Updated {fmtTime(lastRefreshed)}
              </Text>
            </Flex>

            <Button
              size="xs"
              variant="outline"
              borderColor="gray.200"
              color="gray.700"
              _hover={{ bg: "gray.50" }}
              borderRadius="lg"
              onClick={fetchAll}
              loading={refreshing}
              h="32px"
              px={3}
              fontSize="12px"
              fontWeight="600"
            >
              <Icon as={FiRefreshCw} boxSize={3.5} mr={1.5} />
              Refresh Data
            </Button>
          </Flex>
        </Flex>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <Box
            display={{ base: "block", lg: "none" }}
            bg="#0F172A"
            p={4}
            borderBottom="1px solid"
            borderColor="slate.800"
          >
            <Stack gap={4}>
              {navGroups.map((group) => (
                <Box key={group.group}>
                  <Text fontSize="10px" fontWeight="800" color="slate.500" textTransform="uppercase" mb={2}>
                    {group.group}
                  </Text>
                  <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                    {group.items.map((item) => (
                      <Button
                        key={item.key}
                        size="sm"
                        variant={tab === item.key ? "solid" : "ghost"}
                        color={tab === item.key ? "white" : "slate.300"}
                        bg={tab === item.key ? "blue.600" : "transparent"}
                        justifyContent="flex-start"
                        onClick={() => {
                          if (item.path) {
                            window.location.href = item.path;
                          } else {
                            setTab(item.key as TabKey);
                            setMobileNavOpen(false);
                          }
                        }}
                        fontSize="12px"
                      >
                        <Icon as={item.icon} mr={2} />
                        {item.label}
                      </Button>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Main Body View */}
        <Box p={{ base: 4, md: 8 }} flex={1} maxW="1600px" w="full" mx="auto">
          {loading ? (
            <Center h="50vh">
              <DancingLogoLoader size="lg" text="Loading admin metrics & system data..." />
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
    </Flex>
  );
};

export default AdminDashboard;
