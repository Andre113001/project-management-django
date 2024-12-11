import { Button } from "@mantine/core"
import { Navbar } from "./Navbar"
import { ProjectList } from "./ProjectList"
import { TaskList } from "./TaskList"
import { useAuth } from "../context/AuthContext"


export const Dashboard = () => {
    const { user, isAuthenticated } = useAuth();
    return (
        <div>
        <h1>Welcome, {user?.username}!</h1>
        
        {/* Only project owners can create new projects */}
        {isAuthenticated && (
          <Button onClick={() => /* create project */}>
            Create Project
          </Button>
        )}
        
        {/* Projects are filtered by backend to show only accessible ones */}
        <ProjectList />
        
        {/* Tasks are filtered to show only assigned or owned */}
        <TaskList />
      </div>
    )
}