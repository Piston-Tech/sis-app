import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export interface User {
    id: string;
    email: string;
    name: string;
    profile?: {
        avatar?: string;
        bio?: string;
        phone?: string;
    };
    createdAt: string;
}

export interface UpdateProfilePayload {
    name?: string;
    email?: string;
    profile?: {
        avatar?: string;
        bio?: string;
        phone?: string;
    };
}

class UserService {
    async getUsers(): Promise<User[]> {
        try {
            const response = await axios.get<User[]>(`${API_BASE_URL}/users`);
            return response.data;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async getUserById(userId: string): Promise<User> {
        try {
            const response = await axios.get<User>(`${API_BASE_URL}/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async updateProfile(userId: string, payload: UpdateProfilePayload): Promise<User> {
        try {
            const response = await axios.put<User>(
                `${API_BASE_URL}/users/${userId}`,
                payload
            );
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            await axios.delete(`${API_BASE_URL}/users/${userId}`);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}

export default new UserService();