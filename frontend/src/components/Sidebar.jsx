import { NavLink, useNavigate } from 'react-router-dom';
import logo from '/logo.png';
import { useUser } from '../contexts/userProvider';
import { Person, Dashboard, AccountTree, TaskAlt, Logout, Group } from '@mui/icons-material';

const Sidebar = () => {
    const navigate = useNavigate();
    const { removeUser, user } = useUser();

    const appliedStyleLink_Active = 'desktop:bg-primary flex desktop:flex-row phone:flex-col items-center desktop:gap-4 transition ease-in desktop:p-4 font-bold phone:text-primary rounded-lg cursor-pointer desktop:text-white desktop:w-48';
    const appliedStyleLink_Inactive = 'desktop:p-2 flex desktop:flex-row phone:flex-col items-center desktop:gap-4 rounded-lg cursor-pointer text-gray-500 desktop:w-48';

    const adminMenuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        { name: 'Projects', path: 'projects', icon: <AccountTree /> },
        { name: 'Members', path: 'member-management', icon: <Group /> },    
        { name: 'Tasks', path: 'tasks', icon: <TaskAlt />},
    ];

    const teamMemberMenuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
        { name: 'Projects', path: 'projects', icon: <AccountTree /> },
        { name: 'Tasks', path: 'tasks', icon: <TaskAlt />},
        { name: 'Profile', path: 'profile', icon: <Person /> },
    ];

    const menuItems = user.role === 'ADMIN' ? adminMenuItems : teamMemberMenuItems;

    const LogOutHandler = () => {
        removeUser();
        navigate('/');
    }

    return (
        <main className="bg-secondary phone:rounded-t-xl w-full desktop:sticky phone:fixed phone:bottom-0 desktop:top-0 desktop:h-screen desktop:w-[20rem] phone:h-[4rem] flex desktop:flex-col phone:flex-row phone:items-center desktop:items-start max-w-full">
            <div className="flex phone:hidden desktop:inline items-center justify-center p-10 w-full">
                <img src={logo} className="w-full object-scale-down h-14" alt="Logo" />
            </div>
            <div className="w-full h-full flex items-center phone:justify-center desktop:justify-start desktop:pt-28 phone:gap-5 phone:text-xs desktop:text-[20px] desktop:flex-col desktop:gap-10">
                <ul className="flex desktop:flex-col items-center desktop:justify-center gap-8">
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            end
                            className={({ isActive }) => isActive ? appliedStyleLink_Active : appliedStyleLink_Inactive}
                        >   
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}
                </ul>
            </div>
            <div className="w-full phone:hidden desktop:flex desktop:flex-col desktop:items-center desktop:justify-end desktop:pb-10">
                <span 
                    onClick={LogOutHandler} 
                    className="cursor-pointer text-[20px] text-red-500 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                    <Logout />
                    Logout
                </span>
            </div>
        </main>
    );
};

export default Sidebar;
