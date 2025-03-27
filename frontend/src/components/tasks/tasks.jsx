import { useEffect, useState } from 'react';
import './tasks.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { set } from 'date-fns';
import { Loading } from '../home/unloggedHome/home';
import { useNavigate } from 'react-router-dom';


const possibleStatus = [
    {title: 'Todo', id: 'Todo', color: 'var(--purple)'},
    {title: 'In Progress', id: 'In Progress', color: 'var(--primary)'},
    {title: 'Done', id: 'Done', color: 'var(--primary)'},
    {title: 'Approved', id: 'Approved', color: 'var(--secondary)'},
    {title: 'Overdue', id: 'Approved', color: 'var(--accent)'}
]


export function Tasks(){

    const [teams, setTeams] = useState();
    const [tasks, setTasks] = useState();
    const [teamTasks, setTeamTasks] = useState();
    const navigator = useNavigate();

    const {api, error} = useSiteDefinitions();

    useEffect(() => {
        async function getData() {
            try{
                const tasks = await api.data.post('/gettasksauthor');
                const teams = await api.data.get('/getteam');

                setTasks(tasks.data);
                setTeams(teams.data);
            }catch(err){
                error.change(err?.response?.data.error || err.message);
            }
        }
        getData();
    }, [])

    useEffect(() => {
        if (tasks){
            const object = {};
            tasks.forEach(task => {
                const id = task?.team?._id || 'none';
                if (!object[id]) object[id] = {
                    ['Todo']: 0,
                    ['In Progress']: 0,
                    ['Done']: 0,
                    ['Approved']: 0,
                    ['Overdue']: 0
                };

                const taskDate = new Date(task.deadline).getTime();
                const today = new Date().getTime();
                if (taskDate < today) object[id]['Overdue']++;
                object[id][task.status]++;
            });

            setTeamTasks(object);
        }
    }, [tasks, teams])

    
    return teamTasks && tasks && teams ? (
        <section className='tasks-container-tasks'>
            <h1>
                Tasks Overview
            </h1>

            <div className='overview-tasks-outer-flex'>
                <div className='overview-tasks-grid'>
                    <span className='title'>
                        Teams
                    </span>

                    <div 
                        className='label-container-overview'    
                        style={{backgroundColor: 'var(--purple)'}}
                    >
                        Todo
                    </div>

                    <div 
                        className='label-container-overview'    
                        style={{backgroundColor: 'var(--primary)'}}
                    >
                        In Progress
                    </div>

                    <div 
                        className='label-container-overview'    
                        style={{backgroundColor: 'var(--primary)'}}
                    >
                        Done
                    </div>

                    <div 
                        className='label-container-overview'    
                        style={{backgroundColor: 'var(--secondary)'}}
                    >
                        Approved
                    </div>

                    <div 
                        className='label-container-overview'    
                        style={{backgroundColor: 'var(--accent)'}}
                    >
                        Overdue
                    </div>
                </div>

                <br></br>

                {
                teamTasks['none'] ? 
                    <div className='overview-tasks-grid back'>
                        <span className='team' style={{color: 'var(--primary)'}}>
                            My Own Tasks
                        </span>


                        {possibleStatus.map(status => (
                            <span 
                                className='label-overview' 
                                style={{color: status.color}}
                            >    
                            {teamTasks['none'][status.title]}
                            </span>
                        ))}

                        <button 
                            className='redirect-button'
                            onClick={() => {
                                navigator('/teams/myOwn')
                            }}
                        >
                            <i className='material-icons'>
                                open_in_new
                            </i>
                        </button>
                    </div>
                    : 
                    null
                }

                {tasks?.length ? teams.map(team => {
                    if (!teamTasks[team._id]) return null;
                    return (
                        <div className='overview-tasks-grid back'>
                            <span className='team'>
                                {team.name}
                            </span>

                            {possibleStatus.map(status => (
                                <span 
                                    className='label-overview' 
                                    style={{color: status.color}}
                                >    
                                {teamTasks[team._id][status.title]}
                                </span>
                            ))}

                            <button 
                                className='redirect-button'
                                onClick={() => {
                                    navigator('/teams/' + team._id)
                                }}
                            >
                                <i className='material-icons'>
                                    open_in_new
                                </i>
                            </button>
                        </div>
                    )
                }) : 
                <div className='no-tasks-tasks'>
                    No Tasks Found
                </div>}

            </div>
        </section>
    ) : 
    <Loading/>
}
