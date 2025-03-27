import { useEffect, useState } from 'react';
import { useSiteDefinitions } from '../../../context/siteDefinitions';
import './loggedHome.css';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {Loading} from '../unloggedHome/home'


const status = [
    {title: 'Todo', id: 'Todo', color: 'var(--purple)'},
    {title: 'In Progress', id: 'In Progress', color: 'var(--primary)'},
    {title: 'Done', id: 'Done', color: 'var(--primary)'},
    {title: 'Approved', id: 'Approved', color: 'var(--secondary)'}
]


export function LoggedHome(){

    const {api, error, user} = useSiteDefinitions();
    const [teams, setTeams] = useState();
    const [tasks, setTasks] = useState();
    const [statusTasks, setStatusTasks] = useState();
    const [teamTasks, setTeamTasks] = useState();
    const [overdue, setOverdue] = useState();

    useEffect(() => {
        async function getData(){
            try{
                const tasks = await api.data.post('/gettasksauthor');
                const teams = await api.data.get('/getteam');
                
                //consider no team tasks as a team
                teams.data.splice(0, 0, {_id: 'none'});

                setTeams(teams.data);
                const statusTask = {};
                const teamsTask = {};
                const overdue = [];

                tasks.data.forEach(task => {
                    //status task hash map
                    if (!statusTask[task.status]) statusTask[task.status] = [];
                    statusTask[task.status].push(task);

                    //teams task hash map
                    if (!teamsTask[task?.team?._id || 'none']) teamsTask[task?.team?._id || 'none'] = [];
                    teamsTask[task?.team?._id || 'none'].push(task);

                    //overdue
                    const today = new Date();
                    const deadline = new Date(task.deadline);

                    if (today.getTime() > deadline.getTime() && task.status !== 'Approved') overdue.push(task);
                })

                setTasks(tasks.data);
                setStatusTasks(statusTask);
                setTeamTasks(teamsTask);
                setOverdue(overdue);
            }catch(err){
                error.change(err?.response?.data?.error || err.message);
            }
        }

        getData();
    }, []);

    

    return teamTasks && statusTasks && overdue ? (
        <div className='outer-logged-home-container'>
            <h3 className='title-message-logged' style={{fontSize: '35px'}}>
                Welcome back
            </h3>

            <h1 className='title-message-logged'>
                {user.data.username}!
            </h1>

            <span className='description-message-logged'>
                Organize, Collaborate, and Stay Productive.
            </span>

            <div className='main-information-home-logged'>
                <div className='border-rect teams-container-logged'>
                    <div className='section-header-logged'>
                        <span className='title-logged-section'>
                            <i className='material-icons'>
                                groups
                            </i>
                            My Teams
                        </span>
                        <Link to={'/teams'} className='link-teams'>
                            Manage
                            <i className='material-icons'>
                                open_in_new
                            </i>
                        </Link>
                    </div>

                    <div className='teams-logged-flex'>
                        {teams.map(team => {
                            return (
                                <CardTeam team={team} teamTasks={teamTasks}/>
                            )
                        })}
                    </div>
                </div>

                <TodaySection 
                    teams={teams}
                    tasks={tasks}
                    teamTasks={teamTasks}
                    statusTasks={statusTasks}
                    overdue={overdue}
                />
            </div>
        </div>
    ) : (
        <Loading />
    )
}


function TodaySection({ tasks, statusTasks, overdue}){

    const [currentStatus, setCurrentStatus] = useState('Todo');

    return (
        <div className='border-rect today-container-logged'>
            <div className='section-header-logged' style={{alignItems: 'start'}}>
                <span className='title-logged-section'>
                    <i className='material-icons'>
                        task_alt
                    </i>
                    My Tasks
                </span>
                <span to={'/teams'} className='date-teams'>
                    <span style={{fontSize: '24px'}}>
                        {format(new Date(), 'EEEE')}
                    </span>

                    <span>
                        {format(new Date(), 'LLLL, d')}
                    </span>
                </span>
            </div>

            <span style={{fontSize: '24px', marginTop: '5px'}}>
                tasks: {tasks.length}
            </span>

            <span style={{color: 'var(--accent)'}}>
                overdue: {overdue.length}
            </span>


            <div className='chart-outer-container'>
                <div className='info-chart-logged'>
                    {status.map(label => {

                        let cl;

                        if (label.title === currentStatus){
                            cl = {
                                backgroundColor: label.color,
                                color: 'white',
                                textDecoration: 'none'
                            }
                        }else{
                            cl = {
                                color: label.color,
                            }
                        }

                        return (
                            <div className='label-chart-container'>
                                <span className='label-chart' style={cl} onClick={() => setCurrentStatus(label.title)}>
                                    {label.title}
                                </span>

                                <span className='number-chart' style={{color: label.color}}>
                                    {statusTasks[label.title]?.length || 0} 
                                </span>
                            </div>
                        )
                    })}
                </div>

                <div className='chart-bar'>
                    {status.map((label) => {  
                        const r = ((statusTasks[label.title]?.length || 0) / tasks.length * 100).toFixed(0);

                        return (
                            <div className='item-chart' key={label.title} onClick={() => setCurrentStatus(label.title)}>
                                <div className='bar' style={{backgroundColor: label.color, height: `${r}%`}}>
                                    
                                </div>

                                <span style={{color: label.color, fontSize: '14px'}}>
                                    {r || '0'}%
                                </span>

                                {currentStatus === label.title ? <div className='current' style={{backgroundColor: label.color}}>
                                </div> : null}
                            </div>
                        )
                    })}
                </div>
            </div>


            <div className='tasks-chart-flex'>
                {statusTasks[currentStatus]?.length ? 
                statusTasks[currentStatus].map(task => {

                    return (
                        <div className='task-chart-card'>
                            <span style={{fontSize: '15px'}}>
                                {task.name}
                            </span>

                            <span style={{fontSize: '15px', textAlign: 'right'}}>
                                {format(new Date(task.deadline), 'LLLL, d')}
                            </span>
                        </div>
                    )
                }) :
                null}
            </div>
        </div>
    )
}



function CardTeam({team, teamTasks}){

    const [toggle, setToggle] = useState(false);
    const navigator = useNavigate();

    return (
        <div className={'team-card-outer-container ' + (toggle ? 'toggle' : '')}>
            <div className='team-card-inner-container'>
                <div className='up'>
                    <div className='title'>
                        <i className='material-icons toggle-button-team' onClick={() => setToggle(prev => !prev)}>
                            {toggle ? 'arrow_drop_down' : 'arrow_drop_up'}
                        </i>
                        <span style={{fontSize: '18px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                            <i className='material-icons'>
                                group
                            </i>
                            {team?.name || 'My Own Tasks'}
                        </span>
                    </div>
                    <i className='material-icons toggle-button-team' style={{fontSize: '22px', padding: '8px', boxSizing: 'border-box', cursor: 'pointer'}} onClick={() => navigator('/teams/' + team?._id || '')}>
                        open_in_new
                    </i>
                
                </div>


                {teamTasks[team._id]?.length ? 
                <div className='tasks-flex-logged'>
                    {teamTasks[team._id].map(task => {
                        const date = new Date(task.deadline);
                        if (task.status === 'Approved') return null;

                        return (
                            <div className='task-card-logged'>
                                <span style={{fontWeight: 'bold'}} className='name'>
                                    {task.name}
                                </span>

                                <span >
                                    {task.status}
                                </span>

                                <span>
                                    {format(date, 'HH:mm')}
                                </span>

                                <span style={{justifySelf: 'end'}}>
                                    {format(date, 'dd/LL/yyyy')}
                                </span>
                            </div>
                        )
                    })}
                </div> :
                <div className='no-tasks-logged'>
                    No tasks found
                </div>
                }
            </div>
        </div>
    )
}