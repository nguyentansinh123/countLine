import { Button, Card, List } from "antd";
import { UserOutlined } from "@ant-design/icons";
import Chart from "../../assets/chart.svg";
import { useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

const currentActivities = [
  {
    username: "John Wick",
    project: "White Knight",
    status: "Finished",
  },
  {
    username: "Alice Johnson",
    project: "Skyline",
    status: "In Progress",
  },
  {
    username: "Bob Williams",
    project: "Deep Blue",
    status: "Pending",
  },
  {
    username: "Sarah Connor",
    project: "Cybernet",
    status: "Finished",
  },
  {
    username: "John Wick",
    project: "White Knight",
    status: "Finished",
  },
  {
    username: "Alice Johnson",
    project: "Skyline",
    status: "In Progress",
  },
  {
    username: "Bob Williams",
    project: "Deep Blue",
    status: "Pending",
  },
  {
    username: "Sarah Connor",
    project: "Cybernet",
    status: "Finished",
  },
];

const Users = [
  {
    profilepic: <UserOutlined />,
    username: "David George",
    userRoles: ["admin"],
  },
  { profilepic: <UserOutlined />, username: "John Doe", userRoles: ["admin"] },
  { profilepic: <UserOutlined />, username: "Jane Smith", userRoles: ["user"] },
  {
    profilepic: <UserOutlined />,
    username: "Michael Brown",
    userRoles: ["user"],
  },
  {
    profilepic: <UserOutlined />,
    username: "Emily White",
    userRoles: ["admin", "user"],
  },
  { profilepic: <UserOutlined />, username: "Chris Lee", userRoles: ["user"] },
  {
    profilepic: <UserOutlined />,
    username: "Anna Green",
    userRoles: ["admin"],
  },
];

const Projects = {
  "Current Projects": 11,
  "Dismissed Projects": 12,
  "Past Projects": 42,
};
const Teams = {
  "Current Team": 11,
  "Dismissed Team": 12,
  "Past Team": 42,
};

const Documents = {
  IP: 11,
  NDA: 12,
  EC: 42,
};
function HomePage() {
  const navigate = useNavigate();
  return (
    <div>
      <div
        className="Statistics"
        style={{
          margin: "0px 40px 0px 40px",
          display: "flex",
          justifyContent: "center", // Centers the card horizontally
          alignItems: "center",
        }}
      >
        <Card
          variant="borderless"
          style={{
            width: "100%",
            maxWidth: 1300,
            height: 380,
            backgroundColor: "#151349",
            margin: "none",
            padding: "none",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
              margin: 0,
              padding: 0,
              gap: 50,
            }}
          >
            <div
              style={{
                minHeight: "30%",
                display: "flex",
                flexDirection: "column",
                alignContent: "flex-start",
                minWidth: 160,
                maxWidth: 330,
                width: 330,
                marginTop: 0,
                padding: 5,
              }}
            >
              <h1 style={{ marginTop: 0 }}>Documents</h1>
              <div style={{ maxHeight: 220, height: 220 }}>
                <img src={Chart}></img>
                {Object.entries(Documents).map(() => (
                  <div style={{ margin: 0 }}>
                    {/* need to create chart function
                     */}{" "}
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 5,
                    margin: "0px 0 0 20px",
                  }}
                >
                  {Object.entries(Documents).map(([key]) => (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        width: "100%",
                        flexDirection: "row",
                        alignContent: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          height: 10,
                          width: 10,
                          backgroundColor:
                            key === "IP"
                              ? "#52C41A"
                              : key === "NDA"
                              ? "#01B4D2"
                              : "#FD0000",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      ></div>
                      <span>{key}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: "#156CC9",
                  border: "none",
                  color: "white",
                  width: "100%",
                }}
              >
                manage Documents
              </Button>
            </div>

            <div
              style={{
                minHeight: "30%",
                display: "flex",
                flexDirection: "column",
                alignContent: "flex-start",
                minWidth: 100,
                maxWidth: 200,
                width: 200,
                marginTop: 0,
                padding: 5,
              }}
            >
              <h1 style={{ marginTop: 0, marginLeft: 10 }}>Teams</h1>
              <div style={{ maxHeight: 220, height: 220 }}>
                {Object.entries(Teams).map(([key, value]) => (
                  <div style={{ margin: 0 }}>
                    <h4 style={{ margin: 2, marginTop: 10, marginLeft: 20 }}>
                      {key}
                    </h4>
                    <div
                      style={{
                        margin: 2,
                        marginTop: 10,
                        marginLeft: 20,
                        color:
                          key === "Current Team"
                            ? "#01B4D2"
                            : key === "Dismissed Team"
                            ? "#FD0000"
                            : "#35B700",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: "#156CC9",
                  border: "none",
                  color: "white",
                  width: 200,
                }}
              >
                manage Teams
              </Button>
            </div>

            <div
              style={{
                minHeight: "30%",
                display: "flex",
                flexDirection: "column",
                alignContent: "flex-start",
                minWidth: 100,
                maxWidth: 200,
                width: 200,
                marginTop: 0,
                padding: 5,
              }}
            >
              <h1 style={{ marginTop: 0, marginLeft: 20 }}>Projects</h1>
              <div style={{ maxHeight: 220, height: 220 }}>
                {Object.entries(Projects).map(([key, value]) => (
                  <div style={{ margin: 0 }}>
                    <h4 style={{ margin: 2, marginTop: 10, marginLeft: 20 }}>
                      {key}
                    </h4>
                    <div
                      style={{
                        margin: 2,
                        marginTop: 10,
                        marginLeft: 20,
                        color:
                          key === "Current Projects"
                            ? "#01B4D2"
                            : key === "Dismissed Projects"
                            ? "#FD0000"
                            : "#35B700",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: "#156CC9",
                  border: "none",
                  color: "white",
                  width: 200,
                }}
              >
                manage Projects
              </Button>
            </div>
            <div
              style={{
                minHeight: "30%",
                display: "flex",
                flexDirection: "column",
                alignContent: "flex-start",
                minWidth: 150,
                maxWidth: 300,
                width: 300,
                marginTop: 0,
                padding: 5,
              }}
            >
              <h1 style={{ marginTop: 0 }}>Users</h1>
              <div
                style={{
                  maxHeight: 220,
                  height: 220,
                  overflowY: "auto",
                  paddingRight: 10,
                }}
              >
                <List
                  itemLayout="horizontal"
                  dataSource={Users}
                  renderItem={(item) => (
                    <List.Item
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <List.Item.Meta
                        avatar={item.profilepic}
                        title={
                          <strong style={{ color: "white" }}>
                            {item.username}
                          </strong>
                        }
                        description={
                          <span style={{ color: "white" }}>
                            {item.userRoles.join(", ")}
                          </span>
                        }
                        style={{ color: "white" }}
                      />
                    </List.Item>
                  )}
                />
              </div>
              <Button
                style={{
                  padding: 10,
                  margin: 10,
                  backgroundColor: "#156CC9",
                  border: "none",
                  color: "white",
                  width: 200,
                }}
              >
                manage Users
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div
        className="Activities"
        style={{
          margin: "0px 40px 0px 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            margin: 0,
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <h1 style={{ marginLeft: 20, marginBottom: 0 }}>Activities</h1>
          <a
            onClick={() => navigate("/activities")}
            style={{
              marginRight: 20,
              marginBottom: 0,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            View all Activities
          </a>
        </div>

        <Card
          style={{
            width: "100%",
            maxWidth: 1300,
            maxHeight: 320,
            border: "solid 1px",
            marginTop: 0,
          }}
        >
          <div
            style={{
              maxHeight: 280,
              overflowY: "auto",
              paddingRight: 10,
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={currentActivities}
              renderItem={(item) => (
                <List.Item
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <List.Item.Meta
                    title={<strong>{item.username}</strong>}
                    description={item.project}
                  />
                  <div
                    style={{
                      fontWeight: "bold",
                      textAlign: "right",
                      color:
                        item.status === "Finished"
                          ? "green"
                          : item.status === "In Progress"
                          ? "orange"
                          : "red",
                    }}
                  >
                    {item.status}
                  </div>
                </List.Item>
              )}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default HomePage;
