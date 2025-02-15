import { Link } from 'react-router-dom';
import './leftSideBar.css';

import blackTask from '../../assets/tasks-black.svg';
import whiteTask from '../../assets/tasks-white.svg';
import whiteGroup from '../../assets/groups-white.svg';
import blackGroup from '../../assets/groups-black.svg';
import whiteStats from '../../assets/stats-white.svg';
import blackStats from '../../assets/stats-black.svg';
import blackHome from '../../assets/home-black.svg'
import whitekHome from '../../assets/home-white.svg'
import { useSiteDefinitions } from '../../context/siteDefinitions';



export function LeftSideBar(){

    let {theme} = useSiteDefinitions();
    theme = theme.data;

    const location = window.localStorage.path;


    const links = [
        {
            label: 'Home', 
            className: 'link-left-nav', 
            to: '/',
            icon: 'home',
            iconClass: 'material-icons icon-title-left-nav'
        },
        {
            label: 'Home', 
            className: 'link-left-nav', 
            to: '/',
            icon: 'home',
            iconClass: 'material-icons icon-title-left-nav'
        },
        {
            label: 'Home', 
            className: 'link-left-nav', 
            to: '/',
            icon: 'home',
            iconClass: 'material-icons icon-title-left-nav'
        },
        {
            label: 'Home', 
            className: 'link-left-nav', 
            to: '/',
            icon: 'home',
            iconClass: 'material-icons icon-title-left-nav'
        }
    ]

    const components = links.map((link, index) => (
        <Link key={index} className={link.className} to={link.to}>
          <span>{link.label}</span>
        </Link>
      ));

    console.log(components)

    return (
        <div className='left-sidebar-container-main'>
            {components}
        </div>
        
    )
} 