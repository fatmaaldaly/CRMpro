import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

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
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        {subValue ? (
          <p className="text-xs text-muted-foreground">{subValue}</p>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default KpiCard;