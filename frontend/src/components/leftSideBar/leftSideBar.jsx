import { Link } from 'react-router-dom';
import './leftSideBar.css';

import { useSiteDefinitions } from '../../context/siteDefinitions';



export function LeftSideBar(){

    let {theme} = useSiteDefinitions();
    theme = theme.data;

    const location = window.location.pathname;


    const links = [
        {
            label: 'Home', 
            cl: 'nav-label-left-main', 
            to: '/',
            icon: 'home',
            iconClass: 'material-icons icon-title-left-nav'
        },
        {
            label: 'Teams', 
            cl: 'link-left-nav', 
            to: '/teams/myOwn',
            icon: 'groups',
            iconClass: 'material-icons'
        },
        {
            label: 'Tasks', 
            cl: 'link-left-nav', 
            to: '/tasks',
            icon: 'task_alt',
            iconClass: 'material-icons'
        },
        {
            label: 'Calendar', 
            cl: 'link-left-nav', 
            to: '/calendar',
            icon: 'calendar_month',
            iconClass: 'material-icons'
        }
    ]

    const components = links.map((link, index) => {

        let cl = link.cl;
        if (location === link.to) cl += ' active';

        return (<Link key={index} className={cl} to={link.to}>
            <i className={link.iconClass || 'material-icons'}>{link.icon}</i>
            <span>{link.label}</span>
        </Link>)
    });

    return (
        <div className='left-sidebar-container-main'>
            {components}
        </div>
        
    )
} 