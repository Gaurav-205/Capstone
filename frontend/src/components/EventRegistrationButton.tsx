import React from 'react';
import { Button, ButtonProps } from '@mui/material';
import { HowToReg as RegisterIcon } from '@mui/icons-material';

interface EventRegistrationButtonProps {
  registrationUrl?: string;
  buttonProps?: Partial<ButtonProps>;
  showIcon?: boolean;
  label?: string;
}

const EventRegistrationButton: React.FC<EventRegistrationButtonProps> = ({
  registrationUrl,
  buttonProps = {},
  showIcon = true,
  label = "Register"
}) => {
  if (!registrationUrl) return null;

  return (
    <Button
      variant="outlined"
      color="primary"
      size="small"
      href={registrationUrl}
      component="a"
      target="_blank"
      rel="noopener noreferrer"
      startIcon={showIcon ? <RegisterIcon /> : undefined}
      sx={{ 
        borderRadius: '8px', 
        textTransform: 'none',
        ...buttonProps?.sx 
      }}
      {...buttonProps}
    >
      {label}
    </Button>
  );
};

export default EventRegistrationButton; 