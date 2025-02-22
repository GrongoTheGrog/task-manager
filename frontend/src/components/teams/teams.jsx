import { use, useEffect, useState } from 'react';
import './teams.css';
import { useSiteDefinitions } from '../../context/siteDefinitions';
import { Loading } from '../home/home';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { remainingTime } from '../home/home';


//utils
import { transformDay, transformMonth } from '../../utils/time';

export function Teams(){

    const definitions = useSiteDefinitions();
    const [tasks, setTasks] = useState();
    const [teamTasks, setTeamTasks] = useState([]);
    const [teams, setTeams] = useState();
    const [createedTeam, setCreatedTeam] = useState()
    const navigator = useNavigate();
    const params = useParams()



    const curTeam = teams?.find(team => team._id === params.team) || null; 

    useEffect(() => {
        const getData = async () => {
                try{
                    const tasks = await definitions.api.data.post('http://localhost:9000/gettasksauthor');
                    const teams = await definitions.api.data.get('http://localhost:9000/getteam');


                    setTasks(() => tasks.data);
                    setTeams(() => teams.data);

                    createedTeam && navigator('/teams/' + createedTeam?._id);

                }catch(err){
                    definitions.error.change(err?.data?.error || err.message);
                }
        }   
        getData();
    }, [createedTeam]);

    useEffect(() => {
        if (!tasks) return;

        const array = tasks?.filter(task => {
            if (curTeam) {
                return task?.team?._id === curTeam?._id;
            }else{
                return !task.team;
            }
        });
    

        setTeamTasks(() => array)
    }, [curTeam, tasks])

    return tasks && teams ?

        <section className='teams-main-container'>
            <TeamsNav teams={teams} create={setCreatedTeam} curTeam={curTeam}/>

            <OneTeam tasks={teamTasks} team={curTeam}/>
        </section> :

        <Loading/>
}






function TeamsNav({teams, create, curTeam}){

    const navigator = useNavigate();
    const params = useParams();


    const [creating, setCreating] = useState();
    const definitions = useSiteDefinitions();

    function click(value, path){
        return function() {
            navigator(path);
        }
    }

    async function submit(event){
        event.preventDefault();
        const data = new FormData(event.target);
        const name = data.get('name');
        const description = data.get('description');

        if (!name || !description) return definitions.error.change('Both name and description required.');

        try{
            const newTeam = await definitions.api.data.post('http://localhost:9000/createteam', 
                {name, 
                description}
            );


            create(() => newTeam.data);
            setCreating(() => false)
        }catch(err){
            definitions.error.change(err?.data?.error || err.message)
        }
    }



    return(
        <div className='teams-navbar-container'>
            {creating ? (
                <form className='create-task-form' onSubmit={submit}>
                    <labe>
                        Name:
                    </labe>

                    <input name='name' placeholder='e.g: backend team' autoFocus>
                    </input>

                    <labe>
                        Description:
                    </labe>

                    <textarea name='description' placeholder='e.g: backend managment' className='scrollbar'>
                    </textarea>


                    <div className='buttons'>

                        <button className='delete' onClick={() => setCreating(() => false)} type='button'>
                            <i className='material-icons'>
                                delete
                            </i>
                        </button>

                        <button className='create'>
                            <i className='material-icons'>
                                add
                            </i>
                        </button>
                    </div>
                </form>
            ) : (
                <div className='create-team-teams card-teams-nav' onClick={() => setCreating(() => true)}>
                    <i className='material-icons'>
                        add
                    </i>
                </div>

            )}

            <div className={`card-teams-nav ${!curTeam && 'active'}`} onClick={click(null, '/teams/myOwn')}>
                <span>
                    My own tasks
                </span>
            </div>

            {teams.map((team, index) => {

                const cl = team._id === curTeam?._id ? ' active' : ''


                return (
                    <div className={'card-teams-nav' + cl} onClick={click(team, `/teams/${team._id}`)} key={index}>
                        <span>{team.name}</span>
                    </div>
                )
            })}
        </div>
    )
}

export function OneTeam({tasks, team}){



    const todayTasks = [];
    const overdueTasks = [];
    const upcomingTasks = [];
    const today = new Date().getDate();
    const todayWeek = new Date().getDay();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();


    tasks.forEach(task => {
        const taskDate = new Date(task.deadline);
        if (taskDate.getDate() === today &&
            taskDate.getMonth() === month &&
            taskDate.getFullYear() === year    
        ) {
            todayTasks.push(task);
        };

        if (new Date(task.deadline).getTime() - new Date().getTime() <= 0){
            overdueTasks.push(task);
        }

        const diff = (new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24);
        console.log(diff)
        if (diff < 3 && diff > 0){
            upcomingTasks.push(task);
        } 
    });


    console.log(upcomingTasks)


    return (
        <div className='outer-mid-team-container'>
            <span className='title'>
                {team?.name || 'Your Own Tasks'}
                <Link className='link' to={`/createTasks/${team?._id || undefined}`}>
                    <i className='material-icons'>
                        add
                    </i>
                    create task
                </Link>
            </span>

            <div className='mid-team-main-information-container'>
                <div className='mid-div-section'>
                    <div className='info-today-display-team'>
                        <div className='today-day'>
                            <span className='today'>{transformDay(todayWeek)}</span>
                        </div>

                        <span>
                            {transformMonth(month)}, {today}
                        </span>

                        <span className='task'>
                            {todayTasks.length ? 
                            `You have ${todayTasks.length} tasks assigned for today.` :
                            "No tasks assigned for today."}
                        </span>

                        {overdueTasks.length ? <span className='task overdue'>
                            You have {overdueTasks.length} overdue tasks.
                        </span> : null}
                    </div>


                    <TaskSection mode='normal' tasks={todayTasks} title='Today'/> 
                


                </div>

                <div className='mid-div-section'>
                    <TaskSection mode='normal' tasks={upcomingTasks} title={'Upcoming tasks (3 days)'}/> 
                </div>

                <div className='mid-div-section'>
                    <TaskSection mode='overdue' tasks={overdueTasks} title={'Overdue tasks'}/> 
                </div>
            </div>


            aa
        </div>
    )
}


function TaskSection({mode, tasks, title}){
    //mode => 'overdue' || 'normal' || 'done';


    const color = mode === 'normal' ? 'var(--primary)' : mode === 'done' ? 'var(--secondary)' : 'var(--accent)'

    return(
        <div className='task-section scrollbar'>
            <span style={{color}}>{title}</span>

            {tasks.length ? <div className='tasks-section-inner-flex'>


            {tasks.map((task, index) => {
                const expired = new Date() - new Date(task.deadline) > 0 ? true : false;


                return (
                    <div className='inner-card-task-team' key={task._id}>
                        {expired ? 
                            <div className='expired'>Expired</div> :
                            null}

                        <span style={{fontSize: '20px', fontWeight: 'bold', color}}>
                            {task.name}
                        </span>
            
                        <span className='tasks-description-card'>
                            {task.description}
                        </span>
            
                        <div className='tags-container-tasks-home'>
                            {task.tags && task.tags.map((tag, index) => {
                                return <span className='tag-card-tasks-home' key={index}>{tag} </span>
                            })}
                        </div>
            
                        {task.deadline && <div className='dead-line-card-home'>
                            <strong>Deadline:</strong> {remainingTime(new Date(task.deadline).getTime() - new Date().getTime())}
                        </div>}
                    </div>
                )
            })}
            </div> : 
            <div className='no-task-container'>
                <span>No tasks</span>
            </div>
            }
        </div>  )
    
}
