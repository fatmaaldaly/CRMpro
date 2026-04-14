import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

// react node is anything that can be rendered in react, such as string, number, etc.
// used here for flexibility, so that we can pass in any type of value, such as a number, a string, or even a component.
// in our case we have total leads = number and conversion rate = formated string
type KpiCardProps = {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  subValue?: string;
};

const KpiCard = ({ label, value, icon, subValue }: KpiCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="space-y-1">
        
        {/* With tabular-nums, All digits have equal width */}
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        {subValue ? (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default KpiCard;