import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Avatar, List, Button, message } from 'antd';

const UserDetails: React.FC = () => {
  const { user_id } = useParams();
  const [user, setUser] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  console.log(documents);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/users/${user_id}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) setUser(data.data);
        else message.error('Failed to load user');
      } catch (err) {
        console.error(err);
        message.error('Something went wrong loading user');
      }
    };

    const fetchDocuments = async () => {
      try {
        const res = await fetch(
          `http://localhost:5001/api/users/${user_id}/documents`,
          {
            credentials: 'include',
          }
        );
        const data = await res.json();
        if (data.success) setDocuments(data.data);
        else message.error('Failed to load documents');
      } catch (err) {
        console.error(err);
        message.error('Something went wrong loading documents');
      }
    };

    fetchUser();
    fetchDocuments();
  }, [user_id]);

  if (!user) return <p>Loading...</p>;

  return (
    <Card
      style={{ maxWidth: 800, margin: 'auto', marginTop: 40, padding: 20 }}
      title="User Profile"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 30,
        }}
      >
        <Avatar size={100} src={user.profilePicture || undefined}>
          {!user.profilePicture && user.name?.[0]}
        </Avatar>
        <div>
          <h2>{user.name}</h2>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      </div>

      <h3>Uploaded Documents</h3>
      <List
        dataSource={documents}
        bordered
        renderItem={(doc) => (
          <List.Item
            actions={[
              <Button
                type="link"
                onClick={() =>
                  window.open(
                    `/viewdocument/${doc.documentType.replace(/\s/g, '')}/${doc.documentId}`,
                    '_blank'
                  )
                }
              >
                View
              </Button>,
            ]}
          >
            {doc.filename} — {doc.documentType}
          </List.Item>
        )}
      />
    </Card>
  );
};

export default UserDetails;
