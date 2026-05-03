import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Card,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { ChevronRight as ChevronRightIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import DashboardLayout from '../component/DashboardLayout';
import { useAuth } from "../context/AuthContext";

interface User {
    id: number;
    name: string;
    role: string;
    managerId: number | null;
    avatar: string;
}

// // Mock data pengguna dengan relasi manager
// const mockUsers: User[] = [
//     { id: 9, name: 'John Doe', role: 'Manager', managerId: null, avatar: '/avatars/avatar-1.png' },
//     { id: 1, name: 'John Doe', role: 'Manager', managerId: null, avatar: '/avatars/avatar-1.png' },
//     { id: 2, name: 'Jane Smith', role: 'Manager', managerId: 1, avatar: '/avatars/avatar-2.png' },
//     { id: 3, name: 'Peter Jones', role: 'Manager', managerId: 1, avatar: '/avatars/avatar-3.png' },
//     { id: 4, name: 'Sarah Miller', role: 'Staff', managerId: 2, avatar: '/avatars/avatar-4.png' },
//     { id: 5, name: 'Mike Brown', role: 'Staff', managerId: 2, avatar: '/avatars/avatar-5.png' },
//     { id: 6, name: 'Linda Davis', role: 'Staff', managerId: 3, avatar: '/avatars/avatar-6.png' },
//     { id: 7, name: 'Chris Wilson', role: 'Manager', managerId: 3, avatar: '/avatars/avatar-7.png' },
//     { id: 8, name: 'Emily White', role: 'Staff', managerId: 7, avatar: '/avatars/avatar-8.png' },
// ];

const getUser = async (token?: string): Promise<User[]> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch('http://localhost:3000/api/users/tree', {
        method: 'GET',
        headers,
    });
    if (!response.ok) {
        throw new Error('Failed to fetch user tree');
    }
    
    const data = await response.json();

    return data.map((u: any) => ({
        id: u.id,
        name: u.fullName || u.name || u.email,
        role: u.role,
        managerId: u.managerId || null,
        avatar: u.photoPath ? (u.photoPath.startsWith('/') ? `http://localhost:3000${u.photoPath}` : u.photoPath) : null,
    }));
}

interface UserNodeProps {
    user: User;
    allUsers: User[];
    level: number;
    onToggle: (userId: number) => void;
    expandedNodes: Record<number, boolean>;
}

const UserNode: React.FC<UserNodeProps> = ({ user, allUsers, level, onToggle, expandedNodes }) => {
    const children = allUsers.filter(u => u.managerId === user.id);
    const isExpanded = expandedNodes[user.id] ?? false;

    const handleToggle = () => {
        onToggle(user.id);
    };

    return (
        <Box sx={{ pl: level * 3, my: 1 }}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" p={2}>
                    <Avatar src={user.avatar} sx={{ width: 48, height: 48 }} />
                    <Box flexGrow={1} ml={2}>
                        <Typography variant="subtitle1" fontWeight={600}>{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{user.role}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                        Level {level + 1}
                    </Typography>
                    {children.length > 0 && (
                        <IconButton onClick={handleToggle} size="small">
                            {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    )}
                </Stack>
            </Card>
            {isExpanded && children.length > 0 && (
                <Box sx={{ pt: 1, borderLeft: '2px solid', borderColor: 'divider', ml: 3 }}>
                    {children.map(child => (
                        <UserNode
                            key={child.id}
                            user={child}
                            allUsers={allUsers}
                            level={level + 1}
                            onToggle={onToggle}
                            expandedNodes={expandedNodes}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default function UserTree() {
    const [users, setUsers] = useState<User[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
    const { token } = useAuth();

    useEffect(() => {
        // Only fetch when a token exists to avoid initial unauthorized requests
        if (!token) return;

        (async () => {
            try {
                const fetched = await getUser(token);
                setUsers(fetched);

                // open top-level node from fetched data
                const topLevelUser = fetched.find(u => u.managerId === null);
                if (topLevelUser) {
                    setExpandedNodes({ [topLevelUser.id]: true });
                }
            } catch (err) {
                console.error('Failed to fetch user tree', err);
            }
        })();
    }, [token]);

    const handleToggleNode = (userId: number) => {
        setExpandedNodes(prev => ({ ...prev, [userId]: !prev[userId] }));
    };

    const rootUsers = users.filter(user => user.managerId === null);

    return (
        <DashboardLayout currentPage="user-tree">
            <Box mb={3}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    User Tree
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visualize the organizational structure
                </Typography>
            </Box>
            
            <Box>
                {rootUsers.map(user => (
                    <UserNode
                        key={user.id}
                        user={user}
                        allUsers={users}
                        level={0}
                        onToggle={handleToggleNode}
                        expandedNodes={expandedNodes}
                    />
                ))}
            </Box>
        </DashboardLayout>
    );
}
