import { Button, Input, Select } from 'antd';
import React from 'react';

interface Privilege {
  value: string;
  label: string;
}

interface UserFormProps {
  name: string;
  mail: string;
  type: string;
  privileges?: string[] | null;
  privilegesData?: Privilege[];
  userId?: string;
  category: 'Client' | 'System';
  onNameChange: (value: string) => void;
  onMailChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPrivilegesChange?: (value: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  name,
  mail,
  type,
  privileges = [],
  privilegesData = [],
  userId,
  category,
  onNameChange,
  onMailChange,
  onTypeChange,
  onPrivilegesChange,
  onSave,
  onCancel,
}) => {
  return (
    <div
      style={{
        padding: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
      }}
    >
      <div>
        <h3>Name</h3>
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div>
        <h3>Mail</h3>
        <Input
          value={mail}
          onChange={(e) => onMailChange(e.target.value)}
          placeholder="Enter mail"
          type="email"
        />
      </div>
      <div>
        <h3>Role</h3>
        <Select
          placeholder="Select a role"
          value={type}
          onChange={onTypeChange}
          style={{ width: '100%' }}
          options={[
            { label: 'employee', value: 'employee' },
            { label: 'client', value: 'client' },
            { label: 'intern', value: 'intern' },
            { label: 'admin', value: 'admin' },
            { label: 'user', value: 'user' },
          ]}
        />
      </div>

      {/* Privileges - Only for System User */}

      <div>
        {category === 'System' && onPrivilegesChange && (
          <>
            <h3>Privileges</h3>
            <Select
              mode="multiple"
              value={privileges}
              onChange={onPrivilegesChange}
              placeholder="Select privileges"
              style={{ width: '100%' }}
            >
              {privilegesData.map((item) => (
                <Select.Option key={item.value} value={item.value}>
                  {item.label}
                </Select.Option>
              ))}
            </Select>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
        <Button
          onClick={onCancel}
          style={{ border: '1px solid #156CC9', color: '#156CC9', width: 200 }}
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          style={{ backgroundColor: '#156CC9', color: '#fff', width: 200 }}
        >
          {userId ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </div>
  );
};

export default UserForm;
