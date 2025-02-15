import { useSiteDefinitions } from '../../context/siteDefinitions';
import './header.css';

export function Header(){

    const definitions = useSiteDefinitions();
    const user = definitions.user;

    return (
        <header>
            <div className='left-header'>
                <span className='header-title'>
                    Taskify
                </span>
            </div>
            
        </header>
    )
}

function rightHeaderUser(){
    return (
        <div className='right-header'>
            
        </div>
    )
}