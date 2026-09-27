import React from "react";
import { Badge, Icon, Text } from "@chakra-ui/react";
import { LuLock } from "react-icons/lu";
import type { PlanTier } from "@/services/subscriptionEntitlements";

interface LockedBadgeProps {
  requiredPlan?: PlanTier;
  label?: string;
  size?: "xs" | "sm" | "md";
  variant?: "solid" | "subtle" | "outline";
}

export const LockedBadge: React.FC<LockedBadgeProps> = ({
  requiredPlan = "standard",
  label,
  size = "xs",
  variant = "subtle",
}) => {
  const isPremium = requiredPlan === "premium";
  const displayLabel = label || (isPremium ? "Premium" : "Standard");

  return (
    <Badge
      colorPalette="blue"
      variant={variant}
      size={size}
      px={2}
      py={0.5}
      borderRadius="full"
      display="inline-flex"
      alignItems="center"
      gap={1}
      fontWeight="medium"
    >
      <Icon as={LuLock} boxSize={size === "xs" ? 2.5 : 3} />
      <Text as="span">{displayLabel}</Text>
    </Badge>
  );
};
