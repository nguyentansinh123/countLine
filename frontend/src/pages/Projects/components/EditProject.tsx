import { Button, Card, Input, Select, DatePicker, Form, message, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

// Status options - matching backend and AddProject component
const statusOptions = [
  { value: 'Drafted', label: 'Drafted' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Finished', label: 'Finished' },
  { value: 'Cancelled', label: 'Cancelled' },
];

// Priority options - matching AddProject component
const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

// Interface for project data
interface ProjectData {
  projectId: string;
  projectName: string;
  projectStart: string;
  projectEnd?: string;
  status: string;
  teams?: string[];
  description?: string;
  priority?: string;
  budget?: number;
  tags?: string[];
}

function EditProject() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }
    
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log(`Fetching project with ID: ${projectId}`);
      
      const response = await axios.get(`${API_URL}/api/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      });

      if (response.data.success) {
        const projectData = response.data.data;
        console.log('Project data:', projectData);
        
        const startDate = projectData.projectStart ? moment(projectData.projectStart, 'DD/MM/YYYY') : null;
        const endDate = projectData.projectEnd ? moment(projectData.projectEnd, 'DD/MM/YYYY') : null;
        
        form.setFieldsValue({
          projectName: projectData.projectName,
          projectStart: startDate,
          projectEnd: endDate,
          status: projectData.status || 'Drafted',
          priority: projectData.priority || 'Medium',
          budget: projectData.budget,
          description: projectData.description,
        });
      } else {
        message.error('Failed to fetch project data');
        setError('Failed to fetch project data');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      message.error('Error loading project data');
      setError('Error loading project data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formattedStartDate = values.projectStart.format('DD/MM/YYYY');
      const formattedEndDate = values.projectEnd ? values.projectEnd.format('DD/MM/YYYY') : null;
      
      const updatedProject = {
        projectName: values.projectName,
        projectStart: formattedStartDate,
        projectEnd: formattedEndDate,
        status: values.status,
        priority: values.priority,
        budget: values.budget ? parseFloat(values.budget.toString()) : null,
        description: values.description,
      };

      console.log('Updating project:', updatedProject);
      
      const response = await axios.put(
        `${API_URL}/api/project/${projectId}`, 
        updatedProject, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        message.success('Project updated successfully');
        navigate('/projects');
      } else {
        message.error(response.data.message || 'Failed to update project');
      }
    } catch (err: any) {
      console.error('Error updating project:', err);
      
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error('Failed to update project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 40, width: '100%' }}>
      <Card
        title="Edit Project"
        style={{ width: '80%', maxWidth: '1000px', padding: '20px' }}
      >
        <Spin spinning={loading}>
          {error ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: 'red' }}>{error}</p>
              <Button 
                onClick={fetchProject}
                style={{ padding: '5px 10px', marginTop: '10px' }}
              >
                Try Again
              </Button>
              <Button 
                onClick={() => navigate('/projects')}
                style={{ marginLeft: '10px', marginTop: '10px' }}
              >
                Back to Projects
              </Button>
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
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
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Spin>
      </Card>
    </div>
  );
}

export default EditProject;
