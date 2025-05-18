import { Button, Card, Input, Select, DatePicker, Form, message, Spin } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { Moment } from 'moment';

const { Option } = Select;

// Status options
const statusOptions = [
  { value: 'Drafted', label: 'Drafted' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Finished', label: 'Finished' },
  { value: 'Cancelled', label: 'Cancelled' },
];

// Priority options
const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

// Define the project data interface
interface ProjectFormData {
  projectName: string;
  projectStart: Moment;
  projectEnd?: Moment;
  status?: string;
  teams?: string[];
  description?: string;
  priority?: string;
  budget?: number;
  tags?: string[];
}

// Define API response type
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

function AddProject() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  const handleSubmit = async (values: ProjectFormData) => {
    try {
      setLoading(true);
      
      // Format the date - backend expects DD/MM/YYYY
      const formattedStartDate = values.projectStart.format('DD/MM/YYYY');
      const formattedEndDate = values.projectEnd ? values.projectEnd.format('DD/MM/YYYY') : null;
      
      const projectData = {
        projectName: values.projectName,
        projectStart: formattedStartDate,
        projectEnd: formattedEndDate,
        status: values.status || 'Drafted',
        teams: values.teams || [],
        description: values.description || '',
        priority: values.priority || 'Medium',
        budget: values.budget ? parseFloat(values.budget.toString()) : null,
        tags: values.tags || []
      };

      const token = localStorage.getItem('token');
      
      const response = await axios.post<ApiResponse>(
        `${API_URL}/api/project`, 
        projectData, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        message.success('Project created successfully');
        navigate('/projects');
      } else {
        message.error(response.data.message || 'Failed to create project');
      }
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      if (error.response?.status === 404) {
        message.error('API endpoint not found. Please check your backend configuration.');
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to create project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 40, width: '100%' }}>
      <Card
        title="Add Project"
        style={{ width: '80%', maxWidth: '1000px', padding: '20px' }}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              status: 'Drafted',
              priority: 'Medium',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Form.Item
                name="projectName"
                label="Project Name"
                rules={[{ required: true, message: 'Please enter project name' }]}
              >
                <Input placeholder="Enter project name" />
              </Form.Item>

              <Form.Item
                name="projectStart"
                label="Start Date"
                rules={[{ required: true, message: 'Please select start date' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="projectEnd"
                label="End Date (Optional)"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="status"
                label="Project Status"
              >
                <Select placeholder="Select status">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="priority"
                label="Priority"
              >
                <Select placeholder="Select priority">
                  {priorityOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="budget"
                label="Budget (Optional)"
              >
                <Input type="number" prefix="$" placeholder="Enter budget amount" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                className="grid-span-2"
                style={{ gridColumn: "span 2" }}
              >
                <Input.TextArea rows={4} placeholder="Project description" />
              </Form.Item>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <Button 
                onClick={() => navigate('/projects')}
                style={{ borderColor: '#156CC9', color: '#156CC9' }}
              >
                Cancel
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: '#156CC9' }}
              >
                Create Project
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default AddProject;
