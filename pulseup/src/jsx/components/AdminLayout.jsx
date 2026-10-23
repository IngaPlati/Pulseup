import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar.jsx';
import AdminHeader from './AdminHeader.jsx';
import '../../css/components/AdminLayout.css';

export default function AdminLayout(){
 return <div className="admin-layout"><AdminSidebar/><main className="admin-main"><AdminHeader/><Outlet/></main></div>;
}
