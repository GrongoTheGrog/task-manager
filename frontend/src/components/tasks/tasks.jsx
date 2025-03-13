import { useEffect, useState } from 'react';
import './tasks.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { set } from 'date-fns';
import { Loading } from '../home/home';
import { Link } from 'react-router-dom';
import { remainingTime } from '../home/home';

export function Tasks(){

    
    return (
        <section className='tasks-container-tasks'>
            <h1>
                Tasks Overview
            </h1>

            <div className='overview-tasks-outer-flex'>
                
            </div>
        </section>
    )
}
