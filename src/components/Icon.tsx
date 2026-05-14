import React from 'react';
import * as Icons from 'lucide-react';

interface IconProps extends Icons.LucideProps {
  name: string;
}

export const Icon = ({ name, ...props }: IconProps) => {
  // @ts-ignore
  const LucideIcon = Icons[name];

  if (!LucideIcon) {
    return <Icons.HelpCircle {...props} />;
  }

  return <LucideIcon {...props} />;
};
