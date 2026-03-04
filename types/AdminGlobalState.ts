import AdminDetails from "./AdminDetails";

interface AdminGlobalState {
  currentUser: AdminDetails | null;
  loading: boolean;
  login: (data: AdminDetails) => void;
}

export default AdminGlobalState;
